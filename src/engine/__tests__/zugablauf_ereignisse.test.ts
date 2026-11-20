import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen } from '../index'
import type { Aktionstyp, Ereignis, Spielzustand } from '../index'
import { erstellePartie } from '../state'
import { baukasten } from '../testing/szenario'
import type { Kartenwahl } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'
import { aktionen, fuehreAus, spieleZug, zugBeenden } from './zugablauf_hilfen'

/*
E2, Kriterium 11 (Iteration 2): Die Oberfläche muss aus dem Zustand vorher und
den Ereignissen einer Aktion alles nachvollziehen können, was sie zeigt, ohne
zwei Zustände zu vergleichen. Der Test rechnet die sichtbare Lage aus der
alten Lage und den Ereignissen nach und vergleicht sie mit der Lage des neuen
Zustands: Handgrössen, Ablagestapel (alle einsehbar, D28), Stapelgrösse,
Schlangen, wer am Zug ist, in welchem Teilzug (A7.8) und in welchem
Abschnitt, ausliegende Gruben, Partiephase und Auslöser (A5, A6, A7.6, A10).
*/

interface Lage {
  haende: number[]
  ablagestapel: string[][]
  stapel: number
  schlangen: Record<string, { besitzer: number; karten: string[] }>
  /** `null` nach Spielende: dann ist niemand mehr am Zug (A10). */
  amZug: number | null
  /** A7.8: 2 im zweiten Zug nach einem Verdoppler; `null` nach Spielende. */
  teilzug: number | null
  abschnitt: string | null
  gruben: { karteId: string; vor: number; von: number }[]
  partiephase: string
  ausloeser: number | null
}

function lageVon(zustand: Spielzustand): Lage {
  const schlangen: Lage['schlangen'] = {}
  zustand.spieler.forEach((spieler, besitzer) => {
    for (const schlange of spieler.schlangen) schlangen[schlange.id] = { besitzer, karten: schlange.karten.map((karte) => karte.id) }
  })
  const beendet = zustand.partiephase === 'Beendet'
  return {
    haende: zustand.spieler.map((spieler) => spieler.hand.length),
    ablagestapel: zustand.spieler.map((spieler) => spieler.ablagestapel.map((karte) => karte.id)),
    stapel: zustand.nachziehstapel.length,
    schlangen,
    amZug: beendet ? null : zustand.zug.spielerIndex,
    teilzug: beendet ? null : zustand.zug.teilzug,
    abschnitt: beendet ? null : zustand.zug.abschnitt,
    gruben: zustand.ausliegendeGruben.map((grube) => ({ karteId: grube.karte.id, vor: grube.vor, von: grube.gespieltVon })),
    partiephase: zustand.partiephase,
    ausloeser: zustand.schlussrundeAusloeser,
  }
}

/** Was die Oberfläche aus den Ereignissen allein ableitet. */
function spieleNach(alt: Lage, ereignisse: Ereignis[]): Lage {
  const lage: Lage = structuredClone(alt)
  for (const ereignis of ereignisse) {
    switch (ereignis.typ) {
      case 'KarteGespielt': {
        lage.haende[ereignis.spielerIndex] -= 1
        const { nach } = ereignis
        if (nach.ort === 'Ablagestapel') lage.ablagestapel[nach.spielerIndex].push(ereignis.karteId)
        else if (nach.ort === 'Schlange') {
          lage.schlangen[nach.schlangenId] ??= { besitzer: nach.spielerIndex, karten: [] }
          lage.schlangen[nach.schlangenId].karten.splice(nach.position, 0, ereignis.karteId)
        } else throw new Error(`Testaufbau: Ort ${nach.ort} kommt in E2 nicht vor`)
        break
      }
      case 'KartenGezogen':
        lage.haende[ereignis.spielerIndex] += ereignis.anzahl
        lage.stapel -= ereignis.anzahl
        break
      case 'AbwerfenVerlangt':
        lage.abschnitt = 'Abwerfen'
        break
      case 'KartenAbgeworfen':
        lage.haende[ereignis.spielerIndex] -= ereignis.karteIds.length
        lage.ablagestapel[ereignis.spielerIndex].push(...ereignis.karteIds)
        break
      case 'ZugBegonnen':
        lage.amZug = ereignis.spielerIndex
        lage.teilzug = ereignis.teilzug
        lage.abschnitt = 'Ausspielen'
        break
      case 'Ausgesetzt':
        lage.gruben = lage.gruben.filter((grube) => grube.karteId !== ereignis.karteId)
        lage.ablagestapel[ereignis.ablagestapelVon].push(ereignis.karteId)
        break
      case 'SchlussrundeBegonnen':
        lage.partiephase = 'Schlussrunde'
        lage.ausloeser = ereignis.ausloeser
        break
      case 'PartieBeendet':
        lage.partiephase = 'Beendet'
        lage.amZug = null
        lage.teilzug = null
        lage.abschnitt = null
        break
      case 'Abgewehrt':
        throw new Error('Testaufbau: Abwehr gibt es erst mit E4')
    }
  }
  return lage
}

/**
 * B2: Ereignisse gehen an die Oberfläche aller Spieler. Jede Karte, die ein
 * Ereignis nennt, muss danach offen liegen; liegt sie auf einer Hand, verriete
 * das Ereignis eine Handkarte.
 */
function verrateneHandkarten(zustand: Spielzustand, ereignisse: Ereignis[]): string[] {
  const aufHand = new Set(zustand.spieler.flatMap((spieler) => spieler.hand.map((karte) => karte.id)))
  const genannt = ereignisse.flatMap((ereignis) => [
    ...('karteId' in ereignis ? [ereignis.karteId] : []),
    ...('karteIds' in ereignis ? ereignis.karteIds : []),
  ])
  return genannt.filter((id) => aufHand.has(id))
}

/**
 * Spielt mit fester Saat zufällig unter den aufgezählten Aktionen und prüft jeden
 * Schritt. Ist `bevorzugt` angeboten, wird diese Aktion gewählt. Liefert die Zahl
 * der Schritte und der zweiten Züge (A7.8).
 */
function pruefePartie(start: Spielzustand, saat: number, bevorzugt?: Aktionstyp): { schritte: number; zweiteZuege: number } {
  const wahl = erzeugeZufall(saat)
  let zustand = start
  let schritte = 0
  let zweiteZuege = 0
  while (zustand.partiephase !== 'Beendet') {
    if (schritte > 2000) throw new Error(`Saat ${saat}: Die Partie endet nicht nach 2000 Schritten.`)
    const angeboten = ermittleAktionen(zustand)
    const aktion = angeboten.find((angebot) => angebot.typ === bevorzugt) ?? angeboten[Math.floor(wahl() * angeboten.length)]
    const { zustand: neu, ereignisse } = anwendeAktion(zustand, aktion)
    expect(spieleNach(lageVon(zustand), ereignisse), `Saat ${saat}, Schritt ${schritte}: ${JSON.stringify(aktion)}`).toEqual(lageVon(neu))
    expect(verrateneHandkarten(neu, ereignisse), `Saat ${saat}, Schritt ${schritte}: Ereignis nennt eine Handkarte`).toEqual([])
    zweiteZuege += ereignisse.filter((ereignis) => ereignis.typ === 'ZugBegonnen' && ereignis.teilzug === 2).length
    zustand = neu
    schritte += 1
  }
  return { schritte, zweiteZuege }
}

const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot']

describe('A5/A6/A7.6/A10: Ereignisse erklären jede sichtbare Änderung (Kriterium 11)', () => {
  it.each([
    [2, 1],
    [3, 2],
    [4, 3],
    [2, 4],
  ])('A10: Zufallspartie mit %i Spielern (Saat %i): jeder Schritt lässt sich aus den Ereignissen nachrechnen', (spielerzahl, saat) => {
    const start = erstellePartie({ spielerzahl, erweiterung: saat % 2 === 0, zufall: erzeugeZufall(saat) })
    expect(pruefePartie(start, saat).schritte).toBeGreaterThan(40)
  })

  it('A7.6/D14/D21: Aussetzen mit zwei Gruben verschiedener Spieler, Überhand und Schlussrunde lassen sich nachrechnen', () => {
    const acht: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün', 'Farbenschutz', 'Blau']
    const start = baukasten({ spielerzahl: 3, erweiterung: false })
      .hand(0, acht)
      .hand(1, ['Blau', 'Rot'])
      .hand(2, FUENF)
      .grube(2, 1)
      .grube(0, 1)
      .stapelBehalten(6)
      .zustand()
    expect(pruefePartie(start, 7).schritte).toBeGreaterThan(5)
  })

  it('A7.8/A10: Verdoppler, auch wenn der Stapel zwischen den beiden Zügen leer wird, lassen sich nachrechnen', () => {
    const start = baukasten({ spielerzahl: 3, erweiterung: false })
      .hand(0, ['Verdoppler', 'Blau', 'Rot', 'Verdoppler', 'Gelb'])
      .hand(1, ['Verdoppler', 'Rot', 'Gelb', 'Blau', 'Grün'])
      .hand(2, ['Verdoppler', 'Gelb', 'Blau', 'Rot', 'Braun'])
      .stapelBehalten(3)
      .zustand()
    const { schritte, zweiteZuege } = pruefePartie(start, 8, 'VerdopplerSpielen')
    expect(schritte).toBeGreaterThan(5)
    expect(zweiteZuege).toBeGreaterThanOrEqual(3)
  })
})

describe('A7.6/D14: Ausgesetzt nennt die Grube und den Ablagestapel', () => {
  it('A7.6/A6: bei zwei Gruben verschiedener Spieler nennt das Ereignis, welche Grube auf welchen Ablagestapel geht', () => {
    let zustand = baukasten({ spielerzahl: 3, erweiterung: false }).hand(0, FUENF).hand(1, FUENF).hand(2, FUENF).grube(2, 1).grube(0, 1).zustand()
    const [vonDrei, vonEins] = zustand.ausliegendeGruben.map((grube) => grube.karte.id)
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    const { zustand: nach, ereignisse } = fuehreAus(zustand, zugBeenden(zustand))
    expect(ereignisse).toContainEqual({ typ: 'Ausgesetzt', spielerIndex: 1, karteId: vonDrei, ablagestapelVon: 2 })
    expect(nach.spieler[2].ablagestapel.map((karte) => karte.id)).toEqual([vonDrei])
    expect(nach.ausliegendeGruben.map((grube) => grube.karte.id)).toEqual([vonEins])
  })
})

describe('A5/B2: einzelne Ereignisse', () => {
  it('A5: der Beginn des Abwerfens hat ein eigenes Ereignis mit der Zahl der überzähligen Karten', () => {
    let zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .hand(0, ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün', 'Blau'])
      .hand(1, FUENF)
      .zustand()
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    expect(fuehreAus(zustand, zugBeenden(zustand)).ereignisse).toEqual([{ typ: 'AbwerfenVerlangt', spielerIndex: 0, anzahl: 1 }])
  })

  it('B2: KartenGezogen nennt nur Spieler und Anzahl, keine Karte', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, FUENF).hand(1, ['Blau']).zustand()
    const gezogen = spieleZug(zustand).ereignisse.filter((ereignis) => ereignis.typ === 'KartenGezogen')
    expect(gezogen.length).toBe(2)
    for (const ereignis of gezogen) expect(Object.keys(ereignis).sort()).toEqual(['anzahl', 'spielerIndex', 'typ'])
  })

  it('A10: nach Spielende ist niemand am Zug, auch nicht der Auslöser', () => {
    let zustand = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, FUENF).hand(1, FUENF).schlussrunde(0).amZug(1).zustand()
    zustand = spieleZug(zustand).zustand
    expect(zustand.partiephase).toBe('Beendet')
    expect(zustand.zug.spielerIndex).toBe(1)
  })
})
