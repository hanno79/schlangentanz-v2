import { describe, expect, it } from 'vitest'
import { berechneEndwertung } from '../../index'
import type { Spielzustand } from '../../index'
import { gelberSchatz } from '../../aufgaben/gelberSchatz'
import { lilaRiese } from '../../aufgaben/lilaRiese'
import { legeAufgabenAus } from '../../testing/aufgaben'
import type { Aufgabenauslage } from '../../testing/aufgaben'
import type { Kartenwahl, Schlangenglied } from '../../testing/szenario'
import { aufgabeId, aufgabenEreignisse, erste, legeAn, namen } from '../aufgaben_hilfen'
import { mal } from '../farbmengen_hilfen'
import { einfuegen, handkarte, lege } from '../legen_hilfen'
import { durchlassen, ereignisseVom, fuehreAus, FUENF, tischMitHaenden, zugBeenden } from '../zugablauf_hilfen'

/*
X2 Paket A im Zugablauf: Die Aufgaben Farbkombination, Gelber Schatz und Lila
Riese werden mit echten Karten eingelöst, ohne Testbedingung. Geprüft wird, was
nur im Ablauf sichtbar ist: das Beispiel aus A9, ein Joker, der in derselben
Aktion für zwei Aufgaben verschiedene Farben hat (Kriterium 1), und eine
erfüllte Aufgabe, die erfüllt bleibt, wenn der Joker später anders zählt oder die
Bedingung wieder verloren geht (Kriterium 4, A7.3, D35).
*/

/** Nur Aufgaben aus Paket A liegen offen und oben auf dem Stapel, damit keine andere Aufgabe mitspielt. */
const AUSLAGE: Aufgabenauslage = {
  offen: ['Gelber Schatz', 'Lila Riese', 'Farbharmonie'],
  stapelOben: ['Farbenpracht', 'Fusionsexperte'],
}

/** Wie `AUSLAGE`, aber Farbkombination liegt offen, Lila Riese oben auf dem Stapel. */
const MIT_FARBKOMBINATION: Aufgabenauslage = {
  offen: ['Farbkombination', 'Gelber Schatz', 'Farbharmonie'],
  stapelOben: ['Lila Riese', 'Farbenpracht'],
}

/** Zwei Spieler mit Erweiterung; Spieler 1 ist am Zug, hat die Schlange `schlange` (`schlange-1`) und hält `hand0`. */
function tisch(schlange: Schlangenglied[], hand0: Kartenwahl[], hand1: Kartenwahl[] = FUENF, auslage: Aufgabenauslage = AUSLAGE): Spielzustand {
  return tischMitHaenden([hand0, hand1], true)
    .schlange(0, schlange)
    .aendere((zustand) => legeAufgabenAus(zustand, auslage))
    .zustand()
}

/** Spieler 1 beendet den Zug; KI-Gegner 1 legt seine Schlangenblockade an diese Stelle von `schlange-1`, Spieler 1 lässt sie durch. */
function gegnerBlockiert(zustand: Spielzustand, position: number): Spielzustand {
  const amZug = fuehreAus(zustand, zugBeenden(zustand)).zustand
  const angesagt = fuehreAus(amZug, einfuegen(amZug, 'BlockadeLegen', handkarte(amZug, 1, 'Schlangenblockade'), 'schlange-1', position)).zustand
  return fuehreAus(angesagt, durchlassen(angesagt)).zustand
}

const MIT_RS: Kartenwahl[] = ['Regenbogenschlange', 'Blau', 'Rot', 'Grün', 'Braun']

describe('A9 Beispiel: wer am Zug ist und die Bedingung zuerst erfüllt, bekommt die Aufgabe', () => {
  it('A9 Beispiel: Spieler 1 hat eine Vierergruppe blauer Karten und legt die fünfte an; er bekommt Farbkombination, obwohl KI-Gegner 1 mit vier roten Karten kurz davor war', () => {
    const start = tischMitHaenden([FUENF, ['Rot', 'Gelb', 'Grün', 'Braun', 'Violett']], true)
      .schlange(0, mal(4, 'Blau'))
      .schlange(1, mal(4, 'Rot'))
      .aendere((zustand) => legeAufgabenAus(zustand, MIT_FARBKOMBINATION))
      .zustand()
    const { zustand, ereignisse } = legeAn(start, 'Blau')
    expect(aufgabenEreignisse(ereignisse)[0], 'A9: AufgabeErfuellt für Spieler 1').toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbkombination') })
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
    expect(zustand.spieler[1].erfuellteAufgaben).toEqual([])
  })
})

describe('A9 Kriterium 1: derselbe Joker hat bei zwei Aufgaben verschiedene Farben', () => {
  it('A9/A7.3: eine Regenbogenschlange zwischen fünf gelben und vier violetten Karten löst in einer Aktion Gelber Schatz (als Gelb) und Lila Riese (als Violett) ein', () => {
    const start = tisch([...mal(5, 'Gelb'), ...mal(4, 'Violett')], MIT_RS)
    expect(aufgabenEreignisse(legeAn(start, 'Blau').ereignisse), 'vorher: fünf gelbe und vier violette Karten erfüllen keine der beiden').toEqual([])
    const { zustand, ereignisse } = lege(start, 'RegenbogenschlangeLegen', 'Regenbogenschlange', 'schlange-1', 5)
    expect(ereignisseVom(ereignisse, 'AufgabeErfuellt')).toEqual(
      ['Gelber Schatz', 'Lila Riese'].map((name) => ({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId(name) })),
    )
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Gelber Schatz', 'Lila Riese'])
    expect(namen(zustand.offeneAufgaben), 'A9: die nachgerückten Aufgaben sind nicht erfüllt').toEqual(['Farbenpracht', 'Fusionsexperte', 'Farbharmonie'])
  })

  it('A9/A7.7: eine Farbenfusion, im Zug auf zwei rote Karten gelegt, zählt für Farbkombination als fünfte blaue Karte; die roten Karten darunter zählen nicht', () => {
    const start = tisch([...mal(4, 'Blau'), 'Rot', 'Rot'], ['Farbenfusion', 'Gelb', 'Rot', 'Grün', 'Braun'], FUENF, MIT_FARBKOMBINATION)
    const rote = start.spieler[0].schlangen[0].karten.slice(4).map((karte) => karte.id)
    const fusion = erste(start, (aktion) => aktion.typ === 'FusionLegen' && aktion.kartenIds.join() === rote.join())
    const { zustand, ereignisse } = fuehreAus(start, fusion)
    expect(aufgabenEreignisse(ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbkombination') })
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
  })
})

describe('A9 Kriterium 4: eine erfüllte Aufgabe bleibt erfüllt, auch wenn der Joker später anders zählt', () => {
  it('A9/A7.3/A11: Gelber Schatz, erfüllt mit der Regenbogenschlange als Gelb, zählt in der Wertung, obwohl sie dort als Violett zählt', () => {
    const start = tisch([...mal(5, 'Gelb'), 'Violett', 'Violett'], MIT_RS)
    const { zustand } = lege(start, 'RegenbogenschlangeLegen', 'Regenbogenschlange', 'schlange-1', 5)
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Gelber Schatz'])
    const wertung = berechneEndwertung(zustand).spieler[0]
    expect(wertung.schlangen[0].joker, 'A11: in der Wertung bringt die Regenbogenschlange als Violett mehr (5 + 2 × 2 statt 5)').toEqual([
      { karteId: handkarte(start, 0, 'Regenbogenschlange'), art: 'Regenbogenschlange', farbe: 'Violett' },
    ])
    expect(wertung.aufgaben, 'A9: die Aufgabe zählt trotzdem mit ihren 5 Punkten').toEqual([{ aufgabeId: aufgabeId('Gelber Schatz'), name: 'Gelber Schatz', punkte: 5, geheim: false }])
  })

  it('A9: legt KI-Gegner 1 danach eine Blockade in die gelbe Gruppe, gilt die Bedingung nicht mehr, Gelber Schatz bleibt aber bei Spieler 1', () => {
    const start = tisch(mal(5, 'Gelb'), MIT_RS, ['Schlangenblockade', 'Rot', 'Gelb', 'Grün', 'Braun'])
    const gelegt = lege(start, 'RegenbogenschlangeLegen', 'Regenbogenschlange', 'schlange-1', 5)
    expect(namen(gelegt.zustand.spieler[0].erfuellteAufgaben)).toEqual(['Gelber Schatz'])
    const zustand = gegnerBlockiert(gelegt.zustand, 3)
    expect(gelberSchatz.istErfuellt(zustand, 0), 'gelberSchatz.istErfuellt nach der Blockade').toBe(false)
    expect(namen(zustand.spieler[0].erfuellteAufgaben), 'A9: die Aufgabe bleibt bei Spieler 1').toEqual(['Gelber Schatz'])
    expect(namen(zustand.offeneAufgaben)).not.toContain('Gelber Schatz')
  })

  it('A9/D35: die geheime Aufgabe Lila Riese, mit einer Regenbogenschlange erfüllt, bleibt erfüllt, wenn KI-Gegner 1 die Reihe mit einer Blockade unterbricht', () => {
    const auslage: Aufgabenauslage = { offen: ['Gelber Schatz', 'Farbharmonie', 'Farbenpracht'], stapelOben: ['Fusionsexperte'], geheim: [[0, 'Lila Riese']] }
    const start = tisch(mal(4, 'Violett'), MIT_RS, ['Schlangenblockade', 'Rot', 'Gelb', 'Grün', 'Braun'], auslage)
    const gelegt = lege(start, 'RegenbogenschlangeLegen', 'Regenbogenschlange', 'schlange-1', 4)
    expect(aufgabenEreignisse(gelegt.ereignisse), 'D35: die geheime Aufgabe zählt still, ohne Ereignis').toEqual([])
    expect(gelegt.zustand.spieler[0].geheimeAufgabeErfuellt).toBe(true)
    const zustand = gegnerBlockiert(gelegt.zustand, 2)
    expect(lilaRiese.istErfuellt(zustand, 0), 'lilaRiese.istErfuellt nach der Blockade').toBe(false)
    expect(zustand.spieler[0].geheimeAufgabeErfuellt, 'D35: einmal erfüllt, bleibt sie erfüllt').toBe(true)
  })
})
