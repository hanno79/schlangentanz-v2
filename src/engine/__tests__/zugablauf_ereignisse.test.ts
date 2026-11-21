import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen } from '../index'
import type { Aktionstyp, Ereignis, Kartenort, SpielAktion, Spielzustand } from '../index'
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

Seit E4 auch die angesagte Karte, die schwebt, bis die Betroffenen entschieden
haben (A6), wer gerade gefragt ist (D33: jeder Betroffene, deshalb ohne
Geheimnis, B2), die Abwehr (A7.2) und die Grube ohne Wirkung (D29).
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
  /** Die angesagte Karte, die noch schwebt (A6). */
  schwebend: string | null
  /** Wer über die schwebende Karte gerade entscheidet (A6, D33). */
  gefragt: number | null
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
    schwebend: zustand.schwebend?.karte.id ?? null,
    gefragt: zustand.schwebend?.ausstehend[0] ?? null,
  }
}

/** Legt eine Karte dorthin, wo ein Ereignis sie hinlegt. */
function lege(lage: Lage, karteId: string, nach: Kartenort, von: number): void {
  if (nach.ort === 'Ablagestapel') lage.ablagestapel[nach.spielerIndex].push(karteId)
  else if (nach.ort === 'Schlange') {
    lage.schlangen[nach.schlangenId] ??= { besitzer: nach.spielerIndex, karten: [] }
    lage.schlangen[nach.schlangenId].karten.splice(nach.position, 0, karteId)
  } else if (nach.ort === 'VorSpieler') lage.gruben.push({ karteId, vor: nach.spielerIndex, von })
  else throw new Error(`Testaufbau: Ort ${nach.ort} kommt bis E4 nicht vor`)
}

/** Was die Oberfläche aus den Ereignissen allein ableitet. */
function spieleNach(alt: Lage, ereignisse: Ereignis[]): Lage {
  const lage: Lage = structuredClone(alt)
  for (const ereignis of ereignisse) {
    switch (ereignis.typ) {
      case 'KarteGespielt':
        lage.haende[ereignis.spielerIndex] -= 1
        lege(lage, ereignis.karteId, ereignis.nach, ereignis.spielerIndex)
        break
      case 'KarteAngesagt':
        lage.haende[ereignis.spielerIndex] -= 1
        lage.schwebend = ereignis.karteId
        break
      case 'Abgewehrt':
        lage.haende[ereignis.spielerIndex] -= 1
        lage.ablagestapel[ereignis.spielerIndex].push(ereignis.karteId)
        break
      case 'AbwehrGefragt':
        lage.gefragt = ereignis.spielerIndex
        break
      case 'AnsageEntschieden':
        lage.schwebend = null
        lage.gefragt = null
        lege(lage, ereignis.karteId, ereignis.nach, ereignis.spielerIndex)
        break
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
      case 'GrubeOhneWirkung':
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
  return [...texteIn(ereignisse)].filter((text) => aufHand.has(text))
}

/** Jeder Text, der irgendwo in einem Ereignis steht, auch tief in einer angesagten Aktion. */
function texteIn(wert: unknown, gesammelt = new Set<string>()): Set<string> {
  if (typeof wert === 'string') gesammelt.add(wert)
  else if (typeof wert === 'object' && wert !== null) for (const eintrag of Object.values(wert)) texteIn(eintrag, gesammelt)
  return gesammelt
}

/** Ein Aktionstyp, oder bei „Reagieren“ die Abwehr mit Farbenschutz. */
function istBevorzugt(aktion: SpielAktion, bevorzugt: readonly (Aktionstyp | 'Abwehren')[]): boolean {
  if (aktion.typ === 'Reagieren') return bevorzugt.includes('Abwehren') && aktion.farbenschutzId !== null
  return bevorzugt.includes(aktion.typ)
}

/**
 * Spielt mit fester Saat zufällig unter den aufgezählten Aktionen und prüft jeden
 * Schritt. Ist eine Aktion aus `bevorzugt` angeboten, wird sie gewählt. Liefert
 * die Zahl der Schritte und wie oft jedes Ereignis vorkam.
 */
function pruefePartie(start: Spielzustand, saat: number, bevorzugt: readonly (Aktionstyp | 'Abwehren')[] = []): { schritte: number; anzahl: Partial<Record<Ereignis['typ'] | 'ZweiterZug', number>> } {
  const wahl = erzeugeZufall(saat)
  let zustand = start
  let schritte = 0
  const anzahl: Partial<Record<Ereignis['typ'] | 'ZweiterZug', number>> = {}
  while (zustand.partiephase !== 'Beendet') {
    if (schritte > 2000) throw new Error(`Saat ${saat}: Die Partie endet nicht nach 2000 Schritten.`)
    const angeboten = ermittleAktionen(zustand)
    const aktion = angeboten.find((angebot) => istBevorzugt(angebot, bevorzugt)) ?? angeboten[Math.floor(wahl() * angeboten.length)]
    const { zustand: neu, ereignisse } = anwendeAktion(zustand, aktion)
    expect(spieleNach(lageVon(zustand), ereignisse), `Saat ${saat}, Schritt ${schritte}: ${JSON.stringify(aktion)}`).toEqual(lageVon(neu))
    expect(verrateneHandkarten(neu, ereignisse), `Saat ${saat}, Schritt ${schritte}: Ereignis nennt eine Handkarte`).toEqual([])
    for (const ereignis of ereignisse) {
      const art = ereignis.typ === 'ZugBegonnen' && ereignis.teilzug === 2 ? 'ZweiterZug' : ereignis.typ
      anzahl[art] = (anzahl[art] ?? 0) + 1
    }
    zustand = neu
    schritte += 1
  }
  return { schritte, anzahl }
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
    const { schritte, anzahl } = pruefePartie(start, 8, ['VerdopplerSpielen'])
    expect(schritte).toBeGreaterThan(5)
    expect(anzahl.ZweiterZug).toBeGreaterThanOrEqual(3)
  })

  it('A6/A7.2/A7.6/D29: Ansage, Abwehr, Grube vor einem Spieler und Grube ohne Wirkung lassen sich nachrechnen', () => {
    const start = baukasten({ spielerzahl: 3, erweiterung: false })
      .hand(0, ['Schlangengrube', 'Schlangengrube', 'Farbenschutz', 'Blau', 'Rot'])
      .hand(1, ['Schlangengrube', 'Farbenschutz', 'Farbenschutz', 'Gelb', 'Blau'])
      .hand(2, ['Violett', 'Rot', 'Gelb', 'Blau', 'Rot'])
      .stapelBehalten(8)
      .zustand()
    const { anzahl } = pruefePartie(start, 9, ['SchlangengrubeSpielen', 'Abwehren'])
    expect(anzahl.KarteAngesagt, 'A6: die Gruben sind angesagt').toBeGreaterThanOrEqual(2)
    expect(anzahl.Abgewehrt, 'A7.2: wer Farbenschutz hält, wehrt ab').toBeGreaterThanOrEqual(1)
    expect((anzahl.Ausgesetzt ?? 0) + (anzahl.GrubeOhneWirkung ?? 0), 'A7.6/D29: nicht abgewehrte Gruben gehen weg').toBeGreaterThanOrEqual(1)
  })

  it('A6/A7.6: Zufallspartien mit echter Grube und echtem Farbenschutz lassen sich nachrechnen', () => {
    const anzahl = { KarteAngesagt: 0, Abgewehrt: 0, Ausgesetzt: 0 }
    for (const saat of [31, 32, 33, 34, 35, 36]) {
      const start = erstellePartie({ spielerzahl: 2 + (saat % 3), erweiterung: saat % 2 === 0, zufall: erzeugeZufall(saat) })
      const ergebnis = pruefePartie(start, saat, ['SchlangengrubeSpielen'])
      for (const art of ['KarteAngesagt', 'Abgewehrt', 'Ausgesetzt'] as const) anzahl[art] += ergebnis.anzahl[art] ?? 0
    }
    expect(anzahl.KarteAngesagt).toBeGreaterThanOrEqual(10)
    expect(anzahl.Abgewehrt).toBeGreaterThan(0)
    expect(anzahl.Ausgesetzt).toBeGreaterThan(0)
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
