import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen } from '../index'
import type { Ereignis, FusionLegenAktion, Spielzustand } from '../index'
import { erstellePartie } from '../state'
import type { Schlangenglied } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'
import { gruppen, jokerfarben } from './wertung_hilfe'
import { aktionen, folge, FUENF, fuehreAus, MIT_SCHUTZ, reaktion, tischMitHaenden, verletzteInvarianten } from './zugablauf_hilfen'

/*
E7, Kriterium 2 über das echte Spielen: Eine gespielte Farbenfusion zählt als
eine Karte beliebiger Farbe, belegt einen Platz in der Gruppe und bringt die
Punkte beider Karten darunter (A7.7, A11, D30). Die Wertung selbst prüfen
schon `wertung_farbgruppen.test.ts` und `wertung_joker_kombinatorik.test.ts`
an Schlangen aus dem Baukasten; hier entsteht jede Fusion durch eine
aufgezählte Aktion. Dazu der Nachrechentest des Plans E2 für die Schlangen: Aus
der alten Lage und den Ereignissen lässt sich ablesen, welche zwei Karten unter
der Fusion liegen, ohne zwei Zustände zu vergleichen.
*/

/** Spieler 1 hält eine Farbenfusion und hat genau diese Schlange; Spieler 2 hält `gegner` und hat `gegnerSchlange`, falls genannt. */
function tisch(glieder: Schlangenglied[], gegnerSchlange?: Schlangenglied[], gegner = FUENF): Spielzustand {
  const bau = tischMitHaenden([['Farbenfusion', 'Blau', 'Rot', 'Gelb', 'Grün'], gegner])
  if (glieder.length > 0) bau.schlange(0, glieder)
  if (gegnerSchlange !== undefined) bau.schlange(1, gegnerSchlange)
  return bau.zustand()
}

/** Spielt die aufgezählte Fusion auf die Karten an den Stellen `links` und `links + 1` der ersten Schlange von `besitzer`; beim Gegner lässt er durch oder wehrt ab. */
function fusioniere(zustand: Spielzustand, besitzer: number, links: number, abwehren = false): Spielzustand {
  const schlange = zustand.spieler[besitzer].schlangen[0]
  const erwartet = [schlange.karten[links].id, schlange.karten[links + 1].id].join()
  const aktion = (aktionen(zustand, 'FusionLegen') as FusionLegenAktion[]).find((eintrag) => eintrag.schlangenId === schlange.id && eintrag.kartenIds.join() === erwartet)
  expect(aktion, `FusionLegen auf ${erwartet} ist nicht aufgezählt`).toBeDefined()
  if (besitzer === 0) return fuehreAus(zustand, aktion!).zustand
  return folge(zustand, () => aktion!, (jetzt) => reaktion(jetzt, abwehren)).zustand
}

function wertung(zustand: Spielzustand, spieler = 0) {
  return berechneEndwertung(zustand).spieler[spieler]
}

describe('A7.7/A11: die gespielte Fusion in der Wertung (Kriterium 2)', () => {
  it('A7.7 Beispiel 1: Blau-Blau-Gelb-Gelb, die Fusion auf die beiden gelben gilt als Karte beliebiger Farbe, hier Blau', () => {
    const vorher = tisch(['Blau', 'Blau', 'Gelb', 'Gelb'])
    expect(wertung(vorher).gruppenPunkte).toBe(0)
    const nachher = wertung(fusioniere(vorher, 0, 2))
    expect(jokerfarben(nachher)).toEqual(['Blau'])
    expect(gruppen(nachher)).toEqual(['Blau×3=4'])
  })

  it('A7.7 Beispiel 2: Blau-Blau-Gelb-Gelb-Rot-Rot, nach der Fusion auf die gelben eine Dreiergruppe mit 4 Punkten', () => {
    const nachher = wertung(fusioniere(tisch(['Blau', 'Blau', 'Gelb', 'Gelb', 'Rot', 'Rot']), 0, 2))
    expect(nachher.gruppenPunkte).toBe(4)
    expect(nachher.schlangen[0].gruppen).toHaveLength(1)
  })

  it('A11 Beispiel 2: Fusion auf das dritte und vierte Blau vor Violett-Violett ergibt 6 Punkte, die Fusion zählt als Violett', () => {
    const vorher = tisch(['Blau', 'Blau', 'Blau', 'Blau', 'Violett', 'Violett'])
    expect(gruppen(wertung(vorher))).toEqual(['Blau×4=4'])
    const nachher = wertung(fusioniere(vorher, 0, 2))
    expect(jokerfarben(nachher)).toEqual(['Violett'])
    expect(gruppen(nachher), 'A11: die fusionierten blauen Karten zählen nicht mehr als blaue Gruppe').toEqual(['Violett×3=6'])
  })

  it('D30: die Fusion bringt die Summe der beiden Karten darunter, nicht den Wert einer Karte der Gruppenfarbe', () => {
    const nachher = wertung(fusioniere(tisch(['Violett', 'Violett', 'Grün', 'Grün']), 0, 2))
    expect(gruppen(nachher)).toEqual(['Violett×3=10'])
  })

  it('D30: eine Fusion über zwei roten Karten allein ist keine Dreiergruppe; sie braucht zwei weitere', () => {
    const vorher = tisch(['Rot', 'Rot', 'Rot', 'Rot'])
    expect(wertung(vorher).gruppenPunkte).toBe(4)
    const nachher = fusioniere(vorher, 0, 0)
    expect(gruppen(wertung(nachher))).toEqual(['Rot×3=4'])
    expect(wertung(fusioniere(tisch(['Grün', 'Grün']), 0, 0)).gruppenPunkte).toBe(0)
  })

  it('A11: eine Fusion unterbricht die längste Farbkette, die Punkte der Gruppe bleiben', () => {
    const nachher = wertung(fusioniere(tisch(['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb']), 0, 1))
    expect(nachher.kette?.laenge).toBe(0)
    expect(nachher.gruppenPunkte).toBe(5)
  })
})

describe('E7 Grenzfall: die Fusion zerstört eine gegnerische Dreiergruppe', () => {
  it('D9/D30: auf zwei Karten einer gegnerischen Dreiergruppe gelegt, bringt die Gruppe dem Gegner nichts mehr', () => {
    const vorher = tisch([], ['Rot', 'Rot', 'Rot'])
    expect(wertung(vorher, 1).gruppenPunkte).toBe(3)
    const nachher = fusioniere(vorher, 1, 0)
    expect(wertung(nachher, 1).gruppenPunkte).toBe(0)
    expect(wertung(nachher, 1).kette?.laenge).toBe(0)
  })

  it('A7.2: wehrt der Gegner ab, behält er seine Dreiergruppe', () => {
    const nachher = fusioniere(tisch([], ['Rot', 'Rot', 'Rot'], MIT_SCHUTZ), 1, 0, true)
    expect(wertung(nachher, 1).gruppenPunkte).toBe(3)
  })
})

/**
 * Was die Oberfläche von den Schlangen zeigt: Karten von vorn nach hinten und
 * die Karten unter jeder Fusion; dazu, welche Aktion gerade angesagt ist (A6).
 */
interface Schlangenlage {
  schlangen: Record<string, { besitzer: number; karten: string[]; unter: Record<string, string[]> }>
  angesagt: string | null
}

function lageVon(zustand: Spielzustand): Schlangenlage {
  const lage: Schlangenlage = { schlangen: {}, angesagt: zustand.schwebend?.aktion.typ ?? null }
  zustand.spieler.forEach((spieler, besitzer) => {
    for (const schlange of spieler.schlangen) {
      const unter = Object.fromEntries(schlange.fusionen.map((fusion) => [fusion.karteId, fusion.unter.map((karte) => karte.id)]))
      lage.schlangen[schlange.id] = { besitzer, karten: schlange.karten.map((karte) => karte.id), unter }
    }
  })
  return lage
}

/**
 * Rechnet die Schlangen aus der alten Lage und den Ereignissen nach. Eine Fusion
 * liegt an der Stelle, die `nach` nennt, auf den beiden Karten, die vorher dort
 * und rechts daneben lagen (A7.7); jede andere Karte wird an dieser Stelle
 * eingefügt. Welche Aktion angesagt ist, sagt `KarteAngesagt`, oft einen
 * Schritt vor der Entscheidung.
 */
function spieleNach(alt: Schlangenlage, ereignisse: Ereignis[]): Schlangenlage {
  const lage = structuredClone(alt)
  for (const ereignis of ereignisse) {
    if (ereignis.typ === 'KarteAngesagt') lage.angesagt = ereignis.ansage.typ
    if (ereignis.typ !== 'KarteGespielt' && ereignis.typ !== 'AnsageEntschieden') continue
    const typ = ereignis.typ === 'KarteGespielt' ? ereignis.aktion : lage.angesagt
    if (ereignis.typ === 'AnsageEntschieden') lage.angesagt = null
    const { nach, karteId } = ereignis
    if (nach.ort !== 'Schlange') continue
    const schlange = (lage.schlangen[nach.schlangenId] ??= { besitzer: nach.spielerIndex, karten: [], unter: {} })
    if (typ === 'FusionLegen') schlange.unter[karteId] = schlange.karten.splice(nach.position, 2, karteId)
    else schlange.karten.splice(nach.position, 0, karteId)
  }
  return lage
}

/** Jeder Text in einem Ereignis, auch tief in einer angesagten Aktion (B2). */
function texteIn(wert: unknown, gesammelt = new Set<string>()): Set<string> {
  if (typeof wert === 'string') gesammelt.add(wert)
  else if (typeof wert === 'object' && wert !== null) for (const eintrag of Object.values(wert)) texteIn(eintrag, gesammelt)
  return gesammelt
}

describe('E2-Muster: die Fusion lässt sich aus den Ereignissen nachrechnen', () => {
  it('A7.7/D9/A6: in Zufallspartien mit bevorzugter Fusion stimmen die nachgerechneten Schlangen mit dem Zustand überein, keine Handkarte wird genannt', () => {
    const anzahl = { eigen: 0, beimGegner: 0, abgewehrt: 0 }
    for (const saat of [41, 42, 43, 44, 45, 46]) {
      const wahl = erzeugeZufall(saat)
      let zustand = erstellePartie({ spielerzahl: 2 + (saat % 3), erweiterung: saat % 2 === 0, zufall: erzeugeZufall(saat) })
      for (let schritt = 0; zustand.partiephase !== 'Beendet'; schritt += 1) {
        if (schritt > 2000) throw new Error(`Saat ${saat}: Die Partie endet nicht nach 2000 Schritten.`)
        const angeboten = ermittleAktionen(zustand)
        const fusionen = angeboten.filter((aktion) => aktion.typ === 'FusionLegen')
        const auswahl = fusionen.length > 0 ? fusionen : angeboten
        const aktion = auswahl[Math.floor(wahl() * auswahl.length)]
        const { zustand: neu, ereignisse } = anwendeAktion(zustand, aktion)
        const nachricht = `Saat ${saat}, Schritt ${schritt}: ${JSON.stringify(aktion)}`
        expect(spieleNach(lageVon(zustand), ereignisse), nachricht).toEqual(lageVon(neu))
        const aufHand = new Set(neu.spieler.flatMap((spieler) => spieler.hand.map((karte) => karte.id)))
        expect([...texteIn(ereignisse)].filter((text) => aufHand.has(text)), `${nachricht}: B2, ein Ereignis nennt eine Handkarte`).toEqual([])
        expect(verletzteInvarianten(neu), nachricht).toEqual([])
        if (aktion.typ === 'FusionLegen') {
          const eigen = zustand.spieler.find((spieler) => spieler.id === aktion.spielerId)!.schlangen.some((schlange) => schlange.id === aktion.schlangenId)
          if (eigen) anzahl.eigen += 1
          else anzahl.beimGegner += 1
        }
        anzahl.abgewehrt += ereignisse.filter((ereignis) => ereignis.typ === 'Abgewehrt').length
        zustand = neu
      }
    }
    expect(anzahl.eigen, 'Fusionen in eigene Schlangen').toBeGreaterThanOrEqual(5)
    expect(anzahl.beimGegner, 'D9: Fusionen in gegnerische Schlangen').toBeGreaterThanOrEqual(5)
    expect(anzahl.abgewehrt, 'D10: mindestens eine Abwehr').toBeGreaterThan(0)
  })
})
