// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { FARBEN, erstelleSpielkarten } from '../deck'
import { ermittleAktionen, pruefeAktion } from '../index'
import type { Farbe, SpielAktion, Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import type { Kartenwahl } from '../testing/szenario'
import { haeutungen } from './schlangenhaeutung_hilfen'

/*
E11, Kriterium 4: die Zahl der erlaubten Aktionen, neu gemessen und begrenzt.

Viele Aktionen erzeugt vor allem die Schlangenhäutung (A7.9): Je Abschnitt von
3 bis 5 Farbkarten zählt die Engine jede neue Farbfolge einmal auf, und jede
Häutung auf der Hand bekommt ihre eigenen Aktionen. Ein Lauf aus L Farbkarten
hat L − 4 Abschnitte zu 5, L − 3 zu 4 und L − 2 zu 3 Karten mit höchstens 119,
23 und 5 neuen Farbfolgen, ab L = 4 zusammen höchstens 147 · L − 555. Mehr als 78
Farbkarten gibt es nicht (A1), und jede Sonderkarte im Lauf kostet einen
Abschnitt; am meisten bringt deshalb eine Schlange aus allen 78 Farbkarten,
in der jeder Abschnitt fünf verschiedene Farben hat: 10'911 je Häutung.

Danach kommt der Schlangenfrass c) mit jedem Paar gegnerischer Karten
(A7.4), auch Regenbogenschlangen, aber keine Schlangenblockaden. Die vier
Regenbogenschlangen hinter der bunten Folge unterbrechen keinen Abschnitt;
mit ihnen liegen 82 Karten beim Gegner, 3'321 Paare je Schlangenfrass. Eine
Farbenfusion bringt nichts dazu, weil sie zwei Farbkarten aus dem Lauf nimmt,
ein Farbendieb weniger als ein Schlangenfrass. Der ungünstigste Tisch, den
diese Überlegung findet (bewiesen ist das Maximum nicht), hat drei Häutungen
und zwei Schlangenfrass auf der Hand und diese Schlange beim Gegner. In
Zufallspartien bleibt es weit darunter, höchstens bei
`HOECHSTE_AKTIONSZAHL_IM_DAUERLAUF` (`dauerlauf_pruefer.ts`).
*/

/** A1: wie viele Farbkarten jeder Farbe es gibt, aus dem Material. */
const VORRAT = Object.fromEntries(
  FARBEN.map((farbe) => [farbe, erstelleSpielkarten(false).filter((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe).length]),
) as Readonly<Record<Farbe, number>>

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

/** Die Schranke je Häutung für einen Lauf aus `laenge` Farbkarten; ein Lauf unter 3 Karten hat keinen Abschnitt. */
function schranke(laenge: number): number {
  return Math.max(0, laenge - 4) * 119 + Math.max(0, laenge - 3) * 23 + Math.max(0, laenge - 2) * 5
}

/** Alle 78 Farbkarten in einer bunten Schlange von `besitzer`, dahinter `danach`; auf der Hand von Spieler 1 die genannten Karten. */
function tisch(besitzer: number, hand: Kartenwahl[], danach: Kartenwahl[] = []): Spielzustand {
  return baukasten({ spielerzahl: 4, erweiterung: true }).schlange(besitzer, [...bunteFolge(78), ...danach]).hand(0, hand).zustand()
}

function zaehleTypen(aktionen: readonly SpielAktion[]): Record<string, number> {
  const typen: Record<string, number> = {}
  for (const aktion of aktionen) typen[aktion.typ] = (typen[aktion.typ] ?? 0) + 1
  return typen
}

const HAEUTUNGEN: Kartenwahl[] = ['Schlangenhäutung', 'Schlangenhäutung', 'Schlangenhäutung']

describe('E11 Kriterium 4: die Zahl der erlaubten Aktionen ist gemessen und begrenzt (A7.9, A7.4, A7.1)', () => {
  const folge = bunteFolge(78)
  // Die bunte Schlange beim Spieler selbst, auf der Hand drei Häutungen, ein Farbendieb und ein Schlangenfrass.
  const eigene = tisch(0, [...HAEUTUNGEN, 'Farbendieb', 'Schlangenfrass'])
  const eigeneHaeutungen = haeutungen(eigene)

  it('A7.9: die Schranke 147 · L − 555 je Häutung; die bunte Schlange aus allen 78 Farbkarten erreicht sie', () => {
    expect([0, 1, 2, 3, 4].map(schranke), 'kurze Läufe: kein Abschnitt unter 3 Karten, dann 5 und 5 · 2 + 23').toEqual([0, 0, 0, 5, 33])
    expect(haeutungenErwartet(['Blau', 'Rot', 'Gelb']), 'haeutungenErwartet: drei verschiedene Farben').toBe(schranke(3))
    expect(schranke(5), 'fünf Karten: 3 · 5 + 2 · 23 + 119').toBe(180)
    expect(haeutungenErwartet(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun']), 'haeutungenErwartet: fünf verschiedene Farben').toBe(180)
    expect(schranke(78), 'schranke: für den längsten möglichen Lauf').toBe(10_911)
    expect(haeutungenErwartet(folge), 'haeutungenErwartet: jeder Abschnitt der bunten Folge hat nur verschiedene Farben').toBe(schranke(78))
  })

  it('A7.9/D26: je Häutung auf der Hand so viele Aktionen, wie die Abschnitte neue Farbfolgen haben; nachgerechnet ohne die Engine', () => {
    for (const karte of eigene.spieler[0].hand.filter((eintrag) => eintrag.typ === 'Sonderkarte' && eintrag.name === 'Schlangenhäutung')) {
      expect(eigeneHaeutungen.filter((aktion) => aktion.karteId === karte.id).length, `ermittleAktionen: Häutungen mit ${karte.id}`).toBe(haeutungenErwartet(folge))
    }
    // Schlangenfrass a) frisst jede der 78 eigenen Karten; der Farbendieb findet keine gegnerische Farbkarte und ist nur wirkungslos ablegbar (D13).
    // X5: Die Risiko-Karte bietet Aktion 1 und 4 und Aktion 3 je Farbkarte der eigenen Schlange an (A8.2); ohne Farbkarte auf der Hand kein Aktion 2 (D52).
    expect(zaehleTypen(ermittleAktionen(eigene))).toEqual({ SchlangenhaeutungSpielen: 32_733, SchlangenfrassSpielen: 78, SonderkarteWirkungslosAblegen: 1, RisikoKarteSpielen: 80 })
  })

  it('A7.9: gleichwertige Aktionen: die drei Häutungen unterscheiden sich nur in der Karte; je Karte führen 10911 Aktionen zu 7127 verschiedenen Schlangen', () => {
    const ohneKarte = new Set(eigeneHaeutungen.map((aktion) => aktion.neueReihenfolge.join(',')))
    expect(ohneKarte.size, 'verschiedene Häutungen ohne Rücksicht auf die gespielte Karte').toBe(10_911)
    const [schlange] = eigene.spieler[0].schlangen
    const ids = schlange.karten.map((karte) => karte.id)
    const stelle = new Map(ids.map((id, index) => [id, index]))
    const farbeVon = new Map(schlange.karten.map((karte) => [karte.id, karte.typ === 'Farbkarte' ? karte.farbe : karte.name]))
    const endlagen = new Set(
      [...ohneKarte].map((eintrag) => {
        const neu = eintrag.split(',')
        const danach = ids.slice()
        danach.splice(Math.min(...neu.map((id) => stelle.get(id)!)), neu.length, ...neu)
        return danach.map((id) => farbeVon.get(id)).join(',')
      }),
    )
    expect(endlagen.size, 'verschiedene Farbfolgen der Schlange nach der Häutung').toBe(7_127)
  })

  it('E11: der ungünstigste Tisch: drei Häutungen und zwei Schlangenfrass, beim Gegner die bunte Schlange mit vier Regenbogenschlangen dahinter; 39377 Aktionen, jede erlaubt', () => {
    const regenbogen: Kartenwahl[] = ['Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange']
    const zustand = tisch(1, [...HAEUTUNGEN, 'Schlangenfrass', 'Schlangenfrass'], regenbogen)
    const aktionen = ermittleAktionen(zustand)
    // Schlangenfrass c): jedes Paar aus den 82 gegnerischen Karten (A7.4); a) und b) gibt es ohne eigene Schlange nicht.
    // X5: ohne eigene Schlange und ohne Farbkarte auf der Hand nur Risiko-Aktion 1 und 4 (A8.2, D52).
    expect(zaehleTypen(aktionen)).toEqual({ SchlangenhaeutungSpielen: 3 * 10_911, SchlangenfrassSpielen: 2 * ((82 * 81) / 2), RisikoKarteSpielen: 2 })
    expect(aktionen.length).toBe(39_377)
    expect(aktionen.filter((aktion) => !pruefeAktion(zustand, aktion).erlaubt), 'aufgezählt, aber abgelehnt').toEqual([])
    // Ohne die Regenbogenschlangen sind es weniger.
    expect(ermittleAktionen(tisch(1, [...HAEUTUNGEN, 'Schlangenfrass', 'Schlangenfrass'])).length).toBe(38_741)
  })
})
