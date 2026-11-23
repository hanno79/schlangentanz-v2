import { describe, expect, it } from 'vitest'
import type { Spielzustand } from '../../index'
import { legeAufgabenAus } from '../../testing/aufgaben'
import { erfuellt, neueSchlange, stellung } from '../aufgaben_c_hilfen'
import type { Zeile } from '../aufgaben_c_hilfen'
import type { Schlangenglied } from '../../testing/szenario'
import { aufgabenEreignisse, aufgabeId, namen } from '../aufgaben_hilfen'
import { einfuegen, handkarte } from '../legen_hilfen'
import { aktionen, durchlassen, folge, fuehreAus, zugBeenden } from '../zugablauf_hilfen'

/*
X2, Paket C: die Aufgaben, die Sonderkarten in den Schlangen zählen (A9 Nr. 7
„Fusionsexperte“, Nr. 8 „Schlangenbeschwörer“ und den Schlangenteil von Nr. 9
„Schlangenmeister“). A9 „Wichtig für Sonderkarten“: Andere Sonderkarten zählen
nur, wenn eine Aufgabe ausdrücklich Sonderkarten verlangt; diese drei verlangen
es. Eine Farbenfusion ist dabei eine Sonderkarte, die zwei Karten darunter sind
Farbkarten und zählen nicht einzeln (A9, A7.7). Wer eine Sonderkarte in die
Schlange gelegt hat, sagt der Kartentext nicht („Habe … in deinen Schlangen“);
es zählt, was in den eigenen Schlangen liegt.

Eine Farbe bekommen die Joker bei diesen Aufgaben nie: Es zählt nur, dass sie
Sonderkarten sind.
*/

const FUSION_ROT: Schlangenglied = { fusion: ['Rot', 'Rot'] }
const FUSION_BLAU: Schlangenglied = { fusion: ['Blau', 'Blau'] }

const FUSIONSEXPERTE: Zeile[] = [
  { fall: 'erfüllt: zwei Farbfusionen in einer Schlange', stellung: { eigene: [['Gelb', FUSION_ROT, 'Gelb', FUSION_BLAU]] }, erwartet: true },
  { fall: 'knapp nicht: eine Farbfusion und zwei blaue Karten, die keine Fusion sind', stellung: { eigene: [['Gelb', FUSION_ROT, 'Gelb', 'Blau', 'Blau']] }, erwartet: false },
  { fall: 'mit Regenbogenschlange: sie ist keine Farbfusion, auch neben einer', stellung: { eigene: [['Gelb', FUSION_ROT, 'Regenbogenschlange', 'Gelb']] }, erwartet: false },
  { fall: 'mit Farbenfusion: zwei Fusionen direkt nebeneinander zählen beide', stellung: { eigene: [[FUSION_ROT, FUSION_BLAU]] }, erwartet: true },
  { fall: 'mit Blockade dazwischen: die Blockade trennt keine Fusion von der Schlange', stellung: { eigene: [[FUSION_ROT, 'Schlangenblockade', FUSION_BLAU]] }, erwartet: true },
  { fall: 'über zwei Schlangen: je eine Fusion in jeder eigenen Schlange genügt nicht', stellung: { eigene: [[FUSION_ROT, 'Gelb'], [FUSION_BLAU, 'Gelb']] }, erwartet: false },
  { fall: 'die zweite Fusion liegt in der Schlange des Gegners: zählt nicht', stellung: { eigene: [[FUSION_ROT, 'Gelb']], gegner: [[FUSION_BLAU, 'Gelb']] }, erwartet: false },
  { fall: 'drei Fusionen in einer Schlange: mindestens 2', stellung: { eigene: [[FUSION_ROT, FUSION_BLAU, { fusion: ['Gelb', 'Gelb'] }]] }, erwartet: true },
  { fall: 'ohne Schlange', stellung: {}, erwartet: false },
]

const SCHLANGENBESCHWOERER: Zeile[] = [
  { fall: 'erfüllt: vier Sonderkarten in einer Schlange', stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Rot', 'Schlangenblockade', 'Rot', 'Regenbogenschlange', 'Schlangenblockade']] }, erwartet: true },
  { fall: 'knapp nicht: drei Sonderkarten', stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Rot', 'Schlangenblockade', 'Rot', 'Regenbogenschlange']] }, erwartet: false },
  { fall: 'mit Regenbogenschlange: vier Regenbogenschlangen zählen als vier Sonderkarten', stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange']] }, erwartet: true },
  { fall: 'mit Farbenfusion: die Fusion zählt als eine Sonderkarte, dazu drei weitere', stellung: { eigene: [[FUSION_ROT, 'Regenbogenschlange', 'Schlangenblockade', 'Regenbogenschlange']] }, erwartet: true },
  { fall: 'mit Farbenfusion: die zwei Karten darunter zählen nicht, eine Fusion und zwei weitere sind drei', stellung: { eigene: [[FUSION_ROT, 'Regenbogenschlange', 'Schlangenblockade', 'Gelb']] }, erwartet: false },
  { fall: 'mit Blockade dazwischen: Schlangenblockaden zählen als Sonderkarten', stellung: { eigene: [['Rot', 'Schlangenblockade', 'Rot', 'Schlangenblockade', 'Rot', 'Schlangenblockade', 'Regenbogenschlange']] }, erwartet: true },
  { fall: 'über zwei Schlangen: zwei und zwei zählen zusammen', stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Schlangenblockade'], ['Gelb', FUSION_BLAU, 'Regenbogenschlange']] }, erwartet: true },
  { fall: 'die Sonderkarten liegen in der Schlange des Gegners: zählen nicht', stellung: { eigene: [['Rot', 'Regenbogenschlange']], gegner: [['Gelb', 'Regenbogenschlange', 'Schlangenblockade', 'Regenbogenschlange']] }, erwartet: false },
]

const SCHLANGENMEISTER: Zeile[] = [
  {
    fall: 'erfüllt: Regenbogenschlange und Schlangenblockade in der Schlange, vier ausgespielt',
    stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Rot', 'Schlangenblockade']], ausgespielt: ['Regenbogenschlange', 'Farbenschutz', 'Verdoppler', 'Schlangenfrass'] },
    erwartet: true,
  },
  {
    fall: 'knapp nicht: zwei verschiedene in der Schlange, aber erst drei ausgespielt',
    stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Rot', 'Schlangenblockade']], ausgespielt: ['Regenbogenschlange', 'Farbenschutz', 'Verdoppler'] },
    erwartet: false,
  },
  {
    fall: 'knapp nicht: vier ausgespielt, aber nur zwei gleiche Sonderkarten in der Schlange',
    stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Rot', 'Regenbogenschlange']], ausgespielt: ['Regenbogenschlange', 'Regenbogenschlange', 'Verdoppler', 'Schlangenfrass'] },
    erwartet: false,
  },
  {
    fall: 'mit Regenbogenschlange und Farbenfusion: zwei verschiedene Sonderkarten',
    stellung: { eigene: [['Gelb', 'Regenbogenschlange', FUSION_ROT]], ausgespielt: ['Farbenfusion', 'Regenbogenschlange', 'Schlangengrube', 'Farbendieb'] },
    erwartet: true,
  },
  {
    fall: 'mit Blockade dazwischen: die Blockade ist eine der zwei Sonderkarten',
    stellung: { eigene: [['Rot', 'Schlangenblockade', 'Rot', FUSION_BLAU]], ausgespielt: ['Farbenfusion', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz'] },
    erwartet: true,
  },
  {
    fall: 'über zwei Schlangen: eine Sonderkarte in jeder eigenen Schlange',
    stellung: { eigene: [['Rot', 'Regenbogenschlange'], ['Gelb', 'Schlangenblockade']], ausgespielt: ['Regenbogenschlange', 'Verdoppler', 'Verdoppler', 'Schlangenfrass'] },
    erwartet: true,
  },
  {
    fall: 'die zweite Sonderkarte liegt beim Gegner: zählt nicht',
    stellung: { eigene: [['Rot', 'Regenbogenschlange']], gegner: [['Gelb', 'Schlangenblockade']], ausgespielt: ['Regenbogenschlange', 'Verdoppler', 'Verdoppler', 'Schlangenfrass'] },
    erwartet: false,
  },
  {
    fall: 'ausgespielt hat der Gegner, nicht der Spieler: zählt nicht',
    stellung: { eigene: [['Rot', 'Regenbogenschlange', 'Schlangenblockade']], ausgespielt: ['Verdoppler'], gegnerAusgespielt: ['Regenbogenschlange', 'Verdoppler', 'Schlangenfrass', 'Farbendieb'] },
    erwartet: false,
  },
]

function zustandAus(zeile: Zeile): Spielzustand {
  return stellung(zeile.stellung).zustand()
}

describe('A9 Nr. 7 „Fusionsexperte“: Habe eine Schlange mit mindestens 2 Farbfusionen', () => {
  it.each(FUSIONSEXPERTE)('A9 Nr. 7: $fall', (zeile) => {
    expect(erfuellt('Fusionsexperte', zustandAus(zeile)), `Fusionsexperte, ${zeile.fall}`).toBe(zeile.erwartet)
  })

  it('A9 Nr. 7: für den Gegner zählt seine eigene Schlange mit zwei Fusionen', () => {
    const zustand = stellung({ eigene: [[FUSION_ROT, 'Gelb']], gegner: [[FUSION_BLAU, 'Gelb', { fusion: ['Gelb', 'Gelb'] }]] }).zustand()
    expect(erfuellt('Fusionsexperte', zustand, 1), 'Fusionsexperte für KI-Gegner 1').toBe(true)
    expect(erfuellt('Fusionsexperte', zustand, 0), 'Fusionsexperte für Spieler 1').toBe(false)
  })
})

describe('A9 Nr. 8 „Schlangenbeschwörer“: Habe min. 4 Sonderkarten in deinen Schlangen', () => {
  it.each(SCHLANGENBESCHWOERER)('A9 Nr. 8: $fall', (zeile) => {
    expect(erfuellt('Schlangenbeschwörer', zustandAus(zeile)), `Schlangenbeschwörer, ${zeile.fall}`).toBe(zeile.erwartet)
  })
})

describe('A9 Nr. 9 „Schlangenmeister“: Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus', () => {
  it.each(SCHLANGENMEISTER)('A9 Nr. 9/D36: $fall', (zeile) => {
    expect(erfuellt('Schlangenmeister', zustandAus(zeile)), `Schlangenmeister, ${zeile.fall}`).toBe(zeile.erwartet)
  })
})

describe('A9/X1: die Aufgaben werden mit echten Zügen eingelöst, ohne Testbedingung', () => {
  it('A9 Nr. 7/A7.7: Spieler 1 legt die zweite Farbenfusion in seine Schlange und nimmt „Fusionsexperte“', () => {
    const start = stellung({ eigene: [['Gelb', FUSION_BLAU, 'Gelb', 'Rot', 'Rot']] })
      .hand(0, ['Farbenfusion', 'Blau', 'Gelb', 'Grün', 'Braun'])
      .aendere((zustand) => legeAufgabenAus(zustand, { offen: ['Fusionsexperte', 'Farbkombination', 'Lila Riese'], stapelOben: ['Gelber Schatz'] }))
      .zustand()
    expect(erfuellt('Fusionsexperte', start), 'vorher eine Fusion').toBe(false)
    const [rot1, rot2] = start.spieler[0].schlangen[0].karten.slice(3).map((karte) => karte.id)
    const fusion = aktionen(start, 'FusionLegen').find((aktion) => aktion.typ === 'FusionLegen' && aktion.kartenIds.join() === [rot1, rot2].join())
    expect(fusion, 'Farbenfusion auf Rot, Rot ist nicht aufgezählt').toBeDefined()
    const { zustand, ereignisse } = fuehreAus(start, fusion!)
    expect(aufgabenEreignisse(ereignisse)[0], 'A9: die Aufgabe geht an Spieler 1').toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Fusionsexperte') })
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Fusionsexperte'])
  })

  it('A9 Nr. 8: Spieler 1 legt die vierte Sonderkarte, eine Regenbogenschlange, in seine zweite Schlange', () => {
    const start = stellung({ eigene: [['Rot', 'Regenbogenschlange', 'Rot'], ['Gelb', 'Schlangenblockade', FUSION_BLAU]] })
      .hand(0, ['Regenbogenschlange', 'Blau', 'Gelb', 'Grün', 'Braun'])
      .aendere((zustand) => legeAufgabenAus(zustand, { offen: ['Schlangenbeschwörer', 'Farbkombination', 'Lila Riese'] }))
      .zustand()
    expect(erfuellt('Schlangenbeschwörer', start), 'vorher drei Sonderkarten').toBe(false)
    const schlangenId = start.spieler[0].schlangen[1].id
    const { zustand, ereignisse } = fuehreAus(start, einfuegen(start, 'RegenbogenschlangeLegen', handkarte(start, 0, 'Regenbogenschlange'), schlangenId, 1))
    expect(aufgabenEreignisse(ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Schlangenbeschwörer') })
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Schlangenbeschwörer'])
  })

  it('A9 Nr. 8: legt der Gegner eine Blockade in die Schlange von Spieler 1, hat dieser vier Sonderkarten und nimmt die Aufgabe zu Beginn seines Zuges (A9: am Zug)', () => {
    const start = stellung({ eigene: [['Rot', 'Regenbogenschlange', 'Rot', 'Regenbogenschlange', 'Rot', 'Regenbogenschlange']] })
      .hand(0, ['Blau', 'Blau', 'Gelb', 'Grün', 'Braun'])
      .hand(1, ['Schlangenblockade', 'Rot', 'Gelb', 'Grün', 'Braun'])
      .aendere((zustand) => legeAufgabenAus(zustand, { offen: ['Schlangenbeschwörer', 'Farbkombination', 'Lila Riese'] }))
      .zustand()
    const schlangenId = start.spieler[0].schlangen[0].id
    const blockade = (zustand: Spielzustand) => einfuegen(zustand, 'BlockadeLegen', handkarte(zustand, 1, 'Schlangenblockade'), schlangenId, 1)
    const nachBlockade = folge(start, neueSchlange, zugBeenden, blockade)
    expect(nachBlockade.zustand.schwebend, 'A6: Spieler 1 darf abwehren').not.toBeNull()
    const { zustand, ereignisse } = folge(nachBlockade.zustand, durchlassen, zugBeenden)
    expect(aufgabenEreignisse(nachBlockade.ereignisse), 'A9: KI-Gegner 1 ist am Zug und erfüllt nichts').toEqual([])
    expect(aufgabenEreignisse(ereignisse)[0], 'A9: eingelöst wird zu Beginn des Zuges von Spieler 1').toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Schlangenbeschwörer') })
    expect(zustand.zug.spielerIndex).toBe(0)
  })
})
