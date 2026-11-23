import { describe, expect, it } from 'vitest'
import { deserialisiere, serialisiere } from '../../index'
import type { SpielAktion, Spielzustand } from '../../index'
import { legeAufgabenAus } from '../../testing/aufgaben'
import type { Kartenwahl, Schlangenglied } from '../../testing/szenario'
import { erfuellt, stellung } from '../aufgaben_c_hilfen'
import type { Zeile } from '../aufgaben_c_hilfen'
import { aufgabenEreignisse, aufgabeId, namen } from '../aufgaben_hilfen'
import { einfuegen, handkarte } from '../legen_hilfen'
import { aktionen, aktionFuer, FUENF, folge, fuehreAus, grubeAuf, reaktion, tischMitHaenden, typen, zugBeenden } from '../zugablauf_hilfen'

/*
X2, Paket C: was ein Spieler an Sonderkarten ausgespielt hat, für A9 Nr. 9
„Schlangenmeister“ („… und spiele min. 4 aus“) und Nr. 10 „Schlangenrepertoire“
(„Spiele min. 5 versch. Arten von Sonderkarten aus“). D36 (G3): Als ausgespielt
zählt jede Sonderkarte, die der Spieler aus der Hand gespielt hat, auch ein
Farbenschutz zur Abwehr, eine wirkungslos abgelegte und eine abgewehrte (der
Schlangenkorb ist noch nicht spielbar, X6). Gezählt wird nur mit Erweiterung
(D34); ohne sie gibt es keine Aufgaben, und die Partie darf sich nicht ändern.
*/

const ausgespielt = (zustand: Spielzustand, spieler = 0) => zustand.spieler[spieler].ausgespielteSonderkarten

/** Zwei Spieler mit diesen Händen; Spieler 1 hat die Schlange Rot, Rot und ist am Zug. */
function tisch(hand0: Kartenwahl[], hand1: Kartenwahl[] = FUENF, erweiterung = true): Spielzustand {
  return tischMitHaenden([hand0, hand1], erweiterung).schlange(0, ['Rot', 'Rot']).zustand()
}

/** Die erste aufgezählte Aktion dieses Typs mit dieser Handkarte. */
function mit(typ: SpielAktion['typ'], name: string, spieler = 0) {
  return (zustand: Spielzustand) => aktionFuer(zustand, typ, handkarte(zustand, spieler, name))
}

describe('D36/A9: was als ausgespielt zählt', () => {
  it('D36: eine Sonderkarte mit Wirkung im eigenen Zug zählt, eine Farbkarte nicht', () => {
    const { zustand } = folge(tisch(['Regenbogenschlange', 'Blau', 'Gelb', 'Grün', 'Braun']), mit('RegenbogenschlangeLegen', 'Regenbogenschlange'), mit('FarbkarteLegen', 'Blau'))
    expect(ausgespielt(zustand), 'D36: ausgespielteSonderkarten nach Regenbogenschlange und Blau').toEqual(['Regenbogenschlange'])
  })

  it('D36/D25: ein wirkungslos abgelegter Farbenschutz zählt als ausgespielt', () => {
    const { zustand } = folge(tisch(['Farbenschutz', 'Blau', 'Gelb', 'Grün', 'Braun']), mit('SonderkarteWirkungslosAblegen', 'Farbenschutz'))
    expect(ausgespielt(zustand)).toEqual(['Farbenschutz'])
  })

  it('D36/A6: eine abgewehrte Schlangengrube zählt für den Angreifer, der Farbenschutz zur Abwehr für den Verteidiger', () => {
    const start = tisch(['Schlangengrube', 'Blau', 'Gelb', 'Grün', 'Braun'], ['Farbenschutz', 'Rot', 'Gelb', 'Grün', 'Braun'])
    const angesagt = fuehreAus(start, grubeAuf(start, 1)).zustand
    expect(ausgespielt(angesagt), 'D36: gezählt wird beim Ausspielen, schon während die Karte angesagt ist').toEqual(['Schlangengrube'])
    const { zustand } = fuehreAus(angesagt, reaktion(angesagt, true))
    expect(ausgespielt(zustand, 0), 'D36: Spieler 1, abgewehrte Grube').toEqual(['Schlangengrube'])
    expect(ausgespielt(zustand, 1), 'D36: KI-Gegner 1, Farbenschutz zur Abwehr ausserhalb seines Zuges').toEqual(['Farbenschutz'])
  })

  it('D36: eine durchgelassene Sonderkarte zählt genau einmal; wer durchlässt, spielt nichts aus', () => {
    const start = tisch(['Schlangengrube', 'Blau', 'Gelb', 'Grün', 'Braun'], ['Farbenschutz', 'Rot', 'Gelb', 'Grün', 'Braun'])
    const { zustand } = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, false))
    expect(ausgespielt(zustand, 0)).toEqual(['Schlangengrube'])
    expect(ausgespielt(zustand, 1)).toEqual([])
  })

  it('D36/A7.8: der Verdoppler zählt, und im zweiten Zug zählt die nächste Sonderkarte dazu', () => {
    const start = tischMitHaenden([['Verdoppler', 'Blau', 'Gelb', 'Grün', 'Braun'], FUENF], true)
      .schlange(0, ['Rot', 'Rot'])
      .stapelOben(['Schlangenblockade'])
      .zustand()
    const zweiter = folge(start, mit('VerdopplerSpielen', 'Verdoppler'), zugBeenden).zustand
    expect(zweiter.zug.teilzug, 'A7.8: zweiter Zug').toBe(2)
    const schlangenId = zweiter.spieler[0].schlangen[0].id
    const { zustand } = fuehreAus(zweiter, einfuegen(zweiter, 'BlockadeLegen', handkarte(zweiter, 0, 'Schlangenblockade'), schlangenId, 1))
    expect(ausgespielt(zustand)).toEqual(['Verdoppler', 'Schlangenblockade'])
  })

  it('A5/D36: überzählige Karten am Zugende abwerfen ist kein Ausspielen', () => {
    const start = tisch(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün', 'Farbenschutz', 'Schlangenblockade'])
    const amEnde = folge(start, mit('FarbkarteLegen', 'Blau'), zugBeenden).zustand
    expect(typen(amEnde)).toEqual(['UeberhandAbwerfen'])
    const abwerfen = aktionen(amEnde, 'UeberhandAbwerfen').find((aktion) => aktion.typ === 'UeberhandAbwerfen' && aktion.karteIds.includes(handkarte(amEnde, 0, 'Farbenschutz')))!
    const { zustand } = fuehreAus(amEnde, abwerfen)
    expect(zustand.spieler[0].ablagestapel.some((karte) => karte.typ === 'Sonderkarte'), 'Testaufbau: eine Sonderkarte ist abgeworfen').toBe(true)
    expect(ausgespielt(zustand)).toEqual([])
  })

  it('D34: ohne Erweiterung wird nichts gezählt; die Partie bleibt dieselbe', () => {
    const start = tisch(['Schlangengrube', 'Blau', 'Gelb', 'Grün', 'Braun'], ['Farbenschutz', 'Rot', 'Gelb', 'Grün', 'Braun'], false)
    const { zustand } = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, true), mit('FarbkarteLegen', 'Blau'))
    expect(ausgespielt(zustand, 0), 'D34: Spieler 1 ohne Erweiterung').toEqual([])
    expect(ausgespielt(zustand, 1), 'D34: KI-Gegner 1 ohne Erweiterung').toEqual([])
  })

  it('A9: Speichern und Laden erhält, was jeder ausgespielt hat', () => {
    const start = tisch(['Schlangengrube', 'Blau', 'Gelb', 'Grün', 'Braun'], ['Farbenschutz', 'Rot', 'Gelb', 'Grün', 'Braun'])
    const { zustand } = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, true))
    const geladen = deserialisiere(serialisiere(zustand))
    expect(ausgespielt(geladen, 0)).toEqual(['Schlangengrube'])
    expect(ausgespielt(geladen, 1)).toEqual(['Farbenschutz'])
  })
})

const FUSION: Schlangenglied = { fusion: ['Gelb', 'Gelb'] }
const ARTEN_VIER = ['Regenbogenschlange', 'Schlangenfrass', 'Farbendieb', 'Verdoppler'] as const

const SCHLANGENREPERTOIRE: Zeile[] = [
  { fall: 'erfüllt: fünf verschiedene Arten ausgespielt', stellung: { ausgespielt: [...ARTEN_VIER, 'Schlangengrube'] }, erwartet: true },
  { fall: 'knapp nicht: sechs Karten, aber nur vier Arten', stellung: { ausgespielt: [...ARTEN_VIER, 'Verdoppler', 'Farbendieb'] }, erwartet: false },
  { fall: 'mit Regenbogenschlange: ausgespielt ist sie eine Art wie jede andere', stellung: { ausgespielt: ['Farbenschutz', 'Schlangenfrass', 'Farbendieb', 'Verdoppler', 'Regenbogenschlange'] }, erwartet: true },
  { fall: 'mit Farbenfusion und Schlangenhäutung: beide sind eigene Arten', stellung: { ausgespielt: ['Farbenfusion', 'Schlangenhäutung', 'Farbendieb', 'Verdoppler', 'Farbenschutz'] }, erwartet: true },
  {
    // „Blockade dazwischen“ ist für diese Aufgabe sinnlos, sie liest keine Reihe. Gezeigt wird, dass eine Sonderkarte in der Schlange nicht ausgespielt ist.
    fall: 'mit Blockade dazwischen: fünf Arten liegen in der Schlange, ausgespielt sind nur vier',
    stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Schlangenblockade', FUSION, 'Rot']], ausgespielt: ['Regenbogenschlange', 'Farbenfusion', 'Verdoppler', 'Farbendieb'] },
    erwartet: false,
  },
  {
    // „Über zwei Schlangen“ ist sinnlos, die Aufgabe liest keine Schlange; gezeigt wird, dass beide Schlangen nichts beitragen.
    fall: 'über zwei Schlangen: was in zwei Schlangen liegt, zählt nicht dazu',
    stellung: { eigene: [['Rot', 'Regenbogenschlange'], ['Gelb', 'Schlangenblockade']], ausgespielt: ['Schlangenfrass', 'Farbendieb', 'Verdoppler', 'Farbenschutz'] },
    erwartet: false,
  },
  { fall: 'die fünfte Art hat der Gegner ausgespielt: zählt nicht', stellung: { ausgespielt: [...ARTEN_VIER], gegnerAusgespielt: ['Schlangengrube'] }, erwartet: false },
  { fall: 'nichts ausgespielt', stellung: {}, erwartet: false },
]

describe('A9 Nr. 10 „Schlangenrepertoire“: Spiele min. 5 versch. Arten von Sonderkarten aus', () => {
  it.each(SCHLANGENREPERTOIRE)('A9 Nr. 10/D36: $fall', (zeile) => {
    expect(erfuellt('Schlangenrepertoire', stellung(zeile.stellung).zustand()), `Schlangenrepertoire, ${zeile.fall}`).toBe(zeile.erwartet)
  })
})

describe('A9/X1: Schlangenmeister und Schlangenrepertoire mit echten Zügen', () => {
  it('A9 Nr. 10/D36: die fünfte Art ist ein Farbenschutz zur Abwehr; eingelöst wird zu Beginn des eigenen Zuges', () => {
    const start = tischMitHaenden([['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Blau'], ['Schlangengrube', 'Rot', 'Gelb', 'Grün', 'Braun']], true)
      .schlange(0, ['Rot', 'Rot'])
      .amZug(1)
      .aendere((zustand) => {
        zustand.spieler[0].ausgespielteSonderkarten = [...ARTEN_VIER]
        legeAufgabenAus(zustand, { offen: ['Schlangenrepertoire', 'Farbkombination', 'Lila Riese'] })
      })
      .zustand()
    const abgewehrt = folge(start, (jetzt) => grubeAuf(jetzt, 0), (jetzt) => reaktion(jetzt, true))
    expect(ausgespielt(abgewehrt.zustand), 'D36: der Farbenschutz zählt').toEqual([...ARTEN_VIER, 'Farbenschutz'])
    expect(aufgabenEreignisse(abgewehrt.ereignisse), 'A9: Spieler 1 ist nicht am Zug').toEqual([])
    const zuge = folge(abgewehrt.zustand, mit('FarbkarteLegen', 'Rot', 1), zugBeenden)
    expect(aufgabenEreignisse(zuge.ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Schlangenrepertoire') })
  })

  it('A9 Nr. 9/D36: die vierte ausgespielte Karte ist eine abgewehrte Schlangengrube; die Aufgabe kommt, sobald die Ansage entschieden ist', () => {
    const start = tischMitHaenden([['Schlangengrube', 'Blau', 'Gelb', 'Grün', 'Braun'], ['Farbenschutz', 'Rot', 'Gelb', 'Grün', 'Braun']], true)
      .schlange(0, ['Rot', 'Regenbogenschlange', 'Rot', 'Schlangenblockade', 'Rot'])
      .aendere((zustand) => {
        zustand.spieler[0].ausgespielteSonderkarten = ['Regenbogenschlange', 'Verdoppler', 'Farbenschutz']
        legeAufgabenAus(zustand, { offen: ['Schlangenmeister', 'Farbkombination', 'Lila Riese'] })
      })
      .zustand()
    expect(erfuellt('Schlangenmeister', start), 'vorher drei ausgespielt').toBe(false)
    const angesagt = fuehreAus(start, grubeAuf(start, 1))
    expect(aufgabenEreignisse(angesagt.ereignisse), 'X1: eine angesagte Karte ist nicht aufgelöst').toEqual([])
    const { zustand, ereignisse } = fuehreAus(angesagt.zustand, reaktion(angesagt.zustand, true))
    expect(aufgabenEreignisse(ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Schlangenmeister') })
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Schlangenmeister'])
  })
})
