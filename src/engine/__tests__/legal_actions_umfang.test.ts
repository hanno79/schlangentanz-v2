import { describe, expect, it } from 'vitest'
import { ermittleAktionen, pruefeAktion } from '../index'
import type { Farbe, SchlangenhaeutungSpielenAktion, SpielAktion, Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import type { Kartenwahl } from '../testing/szenario'
import { HOECHSTE_AKTIONSZAHL_IM_DAUERLAUF } from './dauerlauf_pruefer'

/*
E11, Kriterium 4: die Zahl der erlaubten Aktionen, neu gemessen und begrenzt.

Viele Aktionen erzeugt vor allem die Schlangenhäutung (A7.9): Je Abschnitt von
3 bis 5 Farbkarten zählt die Engine jede neue Farbfolge einmal auf, und jede
Häutung auf der Hand bekommt ihre eigenen Aktionen. Ein Lauf aus L Farbkarten
hat L − 4 Abschnitte zu 5, L − 3 zu 4 und L − 2 zu 3 Karten mit höchstens 119,
23 und 5 neuen Farbfolgen, zusammen höchstens 147 · L − 555. Mehr als 78
Farbkarten gibt es nicht (A1), und jede Sonderkarte im Lauf kostet einen
Abschnitt; am meisten bringt deshalb eine Schlange aus allen 78 Farbkarten,
in der jeder Abschnitt fünf verschiedene Farben hat: 10'911 je Häutung.

Danach kommt der Schlangenfrass c) mit jedem Paar gegnerischer Karten
(A7.4): Bei 78 Karten in gegnerischen Schlangen sind das 3'003 je Karte. Der
ungünstigste Tisch hat also drei Häutungen und zwei Schlangenfrass auf der
Hand und die Schlange aus allen Farbkarten beim Gegner. In Zufallspartien
bleibt es weit darunter; das misst der Dauerlauf (`dauerlauf_pruefer.ts`).
*/

const VORRAT: Readonly<Record<Farbe, number>> = { Blau: 15, Rot: 15, Gelb: 15, Violett: 12, Braun: 12, Grün: 9 }

/** Die Farbkarten in einer Folge, in der möglichst keine Farbe unter den vier vorigen liegt: je mehr Farben im Abschnitt, desto mehr Farbfolgen. */
function bunteFolge(anzahl: number): Farbe[] {
  const vorrat = { ...VORRAT }
  const folge: Farbe[] = []
  for (let stelle = 0; stelle < anzahl; stelle += 1) {
    const vorige = folge.slice(-4)
    const verfuegbar = (Object.keys(vorrat) as Farbe[]).filter((farbe) => vorrat[farbe] > 0).sort((links, rechts) => vorrat[rechts] - vorrat[links])
    const farbe = verfuegbar.find((kandidat) => !vorige.includes(kandidat)) ?? verfuegbar[0]
    vorrat[farbe] -= 1
    folge.push(farbe)
  }
  return folge
}

function fakultaet(zahl: number): number {
  return zahl <= 1 ? 1 : zahl * fakultaet(zahl - 1)
}

/** A7.9, D26: Wie viele neue Farbfolgen ein Abschnitt hat: alle verschiedenen Anordnungen seiner Farben ohne die bisherige. */
function neueFarbfolgen(abschnitt: readonly Farbe[]): number {
  const anzahl = new Map<Farbe, number>()
  for (const farbe of abschnitt) anzahl.set(farbe, (anzahl.get(farbe) ?? 0) + 1)
  return fakultaet(abschnitt.length) / [...anzahl.values()].reduce((produkt, zahl) => produkt * fakultaet(zahl), 1) - 1
}

/** Die Häutungen einer Karte in einer Folge von Farbkarten ohne Sonderkarte, nachgerechnet ohne die Engine. */
function haeutungenErwartet(folge: readonly Farbe[]): number {
  let summe = 0
  for (let von = 0; von < folge.length; von += 1) {
    for (let laenge = 3; laenge <= 5 && von + laenge <= folge.length; laenge += 1) summe += neueFarbfolgen(folge.slice(von, von + laenge))
  }
  return summe
}

/** Die Schranke je Häutung für einen Lauf aus `laenge` Farbkarten. */
function schranke(laenge: number): number {
  return (laenge - 4) * 119 + (laenge - 3) * 23 + (laenge - 2) * 5
}

/** Alle 78 Farbkarten in einer bunten Schlange von `besitzer`, auf der Hand von Spieler 1 die genannten Karten. */
function tisch(besitzer: number, hand: Kartenwahl[]): Spielzustand {
  return baukasten({ spielerzahl: 4, erweiterung: true }).schlange(besitzer, bunteFolge(78)).hand(0, hand).zustand()
}

function zaehleTypen(aktionen: readonly SpielAktion[]): Record<string, number> {
  const typen: Record<string, number> = {}
  for (const aktion of aktionen) typen[aktion.typ] = (typen[aktion.typ] ?? 0) + 1
  return typen
}

const HAEUTUNGEN: Kartenwahl[] = ['Schlangenhäutung', 'Schlangenhäutung', 'Schlangenhäutung']

describe('E11 Kriterium 4: die Zahl der erlaubten Aktionen ist gemessen und begrenzt (A7.9, A7.4, A7.1)', () => {
  const folge = bunteFolge(78)

  it('A7.9: die Schranke 147 · L − 555 je Häutung; die bunte Schlange aus allen 78 Farbkarten erreicht sie', () => {
    expect(schranke(5), 'fünf Karten: 3 · 5 + 2 · 23 + 119').toBe(180)
    expect(schranke(78), 'schranke: für den längsten möglichen Lauf').toBe(147 * 78 - 555)
    expect(haeutungenErwartet(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun']), 'haeutungenErwartet: fünf verschiedene Farben').toBe(180)
    expect(haeutungenErwartet(folge), 'haeutungenErwartet: jeder Abschnitt der bunten Folge hat nur verschiedene Farben').toBe(schranke(78))
    expect(schranke(78)).toBe(10_911)
  })

  it('A7.9/D26: je Häutung auf der Hand so viele Aktionen, wie die Abschnitte neue Farbfolgen haben; nachgerechnet ohne die Engine', () => {
    const zustand = tisch(0, [...HAEUTUNGEN, 'Farbendieb', 'Schlangenfrass'])
    const haeutungen = ermittleAktionen(zustand).filter((aktion): aktion is SchlangenhaeutungSpielenAktion => aktion.typ === 'SchlangenhaeutungSpielen')
    for (const karte of zustand.spieler[0].hand.filter((eintrag) => eintrag.typ === 'Sonderkarte' && eintrag.name === 'Schlangenhäutung')) {
      expect(haeutungen.filter((aktion) => aktion.karteId === karte.id).length, `ermittleAktionen: Häutungen mit ${karte.id}`).toBe(haeutungenErwartet(folge))
    }
    expect(haeutungen.length).toBe(32_733)
  })

  it('A7.9: gleichwertige Aktionen: die drei Häutungen unterscheiden sich nur in der Karte; je Karte führen 10911 Aktionen zu 7127 verschiedenen Schlangen', () => {
    const zustand = tisch(0, HAEUTUNGEN)
    const haeutungen = ermittleAktionen(zustand).filter((aktion): aktion is SchlangenhaeutungSpielenAktion => aktion.typ === 'SchlangenhaeutungSpielen')
    const ohneKarte = new Set(haeutungen.map((aktion) => aktion.neueReihenfolge.join(',')))
    expect(ohneKarte.size, 'verschiedene Häutungen ohne Rücksicht auf die gespielte Karte').toBe(10_911)
    const [schlange] = zustand.spieler[0].schlangen
    const farbeVon = new Map(schlange.karten.map((karte) => [karte.id, karte.typ === 'Farbkarte' ? karte.farbe : karte.name]))
    const endlagen = new Set(
      [...ohneKarte].map((eintrag) => {
        const ids = schlange.karten.map((karte) => karte.id)
        const neu = eintrag.split(',')
        ids.splice(Math.min(...neu.map((id) => ids.indexOf(id))), neu.length, ...neu)
        return ids.map((id) => farbeVon.get(id)).join(',')
      }),
    )
    expect(endlagen.size, 'verschiedene Farbfolgen der Schlange nach der Häutung').toBe(7_127)
  })

  it('E11: der ungünstigste Tisch: drei Häutungen und zwei Schlangenfrass, die bunte Schlange beim Gegner; 38739 Aktionen, jede erlaubt', () => {
    const zustand = tisch(1, [...HAEUTUNGEN, 'Schlangenfrass', 'Schlangenfrass'])
    const aktionen = ermittleAktionen(zustand)
    // Schlangenfrass c): jedes Paar aus den 78 gegnerischen Karten (A7.4); a) und b) gibt es ohne eigene Schlange nicht.
    expect(zaehleTypen(aktionen)).toEqual({ SchlangenhaeutungSpielen: 3 * 10_911, SchlangenfrassSpielen: 2 * ((78 * 77) / 2) })
    expect(aktionen.length).toBe(38_739)
    expect(aktionen.filter((aktion) => !pruefeAktion(zustand, aktion).erlaubt), 'aufgezählt, aber abgelehnt').toEqual([])
  })

  it('E11: mit der Schlange beim Spieler selbst sind es weniger: Schlangenfrass a) frisst nur eine eigene Karte, der Farbendieb hat kein Ziel', () => {
    const zustand = tisch(0, [...HAEUTUNGEN, 'Farbendieb', 'Schlangenfrass'])
    expect(zaehleTypen(ermittleAktionen(zustand))).toEqual({ SchlangenhaeutungSpielen: 32_733, SchlangenfrassSpielen: 78, SonderkarteWirkungslosAblegen: 1 })
  })

  it('E11: die Schranke für Zufallspartien liegt weit unter dem ungünstigsten Tisch', () => {
    expect(HOECHSTE_AKTIONSZAHL_IM_DAUERLAUF).toBeLessThan(38_739 / 4)
  })
})
