import { describe, expect, it } from 'vitest'
import type { SpielAktion, Spielzustand } from '../engine'
import { findeSzenario } from './szenarien'
import { erzeuge, klicke } from './szenarienTesthilfe'
import type { Wahl } from './szenarienTesthilfe'

/*
X2, Paket B: Je Aufgabe ein Szenario am Entwicklertisch, in dem Spieler 1 sie
mit echten Karten einlöst, ohne Testbedingung (A9, X1). Die Tests klicken, was
die Erwartung des Szenarios beschreibt, und daneben eine Karte, die die Aufgabe
nicht erfüllt.
*/

const NAMEN = ['aufgabe-farbvielfalt', 'aufgabe-vielfaltskoenig', 'aufgabe-farbwechsler', 'aufgabe-schlangenbaendiger', 'aufgabe-symmetriemeister']

const namen = (aufgaben: { name: string }[]) => aufgaben.map((aufgabe) => aufgabe.name)

/** Spieler 1 legt seine Farbkarte dieser Farbe an den Anfang oder ans Ende der Schlange. */
const farbkarte = (farbe: string, schlangenId: string, seite: 'anfang' | 'ende') => (aktion: SpielAktion, zustand: Spielzustand) => {
  if (aktion.typ !== 'FarbkarteLegen' || aktion.ziel.art !== 'schlange' || aktion.ziel.schlangenId !== schlangenId || aktion.ziel.seite !== seite) return false
  const karte = zustand.spieler[0].hand.find((handkarte) => handkarte.id === aktion.karteId)
  return karte?.typ === 'Farbkarte' && karte.farbe === farbe
}

/** Spieler 1 legt seine Regenbogenschlange an diese Lücke der Schlange. */
const regenbogenschlange = (schlangenId: string, position: number) => (aktion: SpielAktion) =>
  aktion.typ === 'RegenbogenschlangeLegen' && aktion.schlangenId === schlangenId && aktion.position === position

/** Nach den Klicks: Was Spieler 1 erfüllt hat und welche Aufgaben-Ereignisse kamen. */
function nach(name: string, ...wahlen: Wahl[]) {
  const start = erzeuge(name)
  expect(start.spieler[0].erfuellteAufgaben, `${name}: vorher ist nichts erfüllt`).toEqual([])
  const { zustand, ereignisse } = klicke(start, ...wahlen)
  return {
    erfuellt: namen(zustand.spieler[0].erfuellteAufgaben),
    ereignisse: ereignisse.map((ereignis) => ereignis.typ),
    offen: namen(zustand.offeneAufgaben),
  }
}

describe('X2/A9: Szenarien zu Farbvielfalt, Vielfaltskönig, Farbwechsler, Schlangenbändiger und Symmetriemeister', () => {
  it('X2: je Aufgabe ein Szenario, keines mit Testbedingung', () => {
    for (const name of NAMEN) {
      const szenario = findeSzenario(name)
      expect(szenario, `Szenario ${name} fehlt`).toBeDefined()
      expect(szenario!.testbedingungen, `${name}: echte Karten, keine Testbedingung`).toBeUndefined()
    }
  })

  it('A9/A7.3: aufgabe-farbvielfalt: die Regenbogenschlange ans Ende löst Farbvielfalt ein (sie zählt als Violett)', () => {
    const { erfuellt, ereignisse, offen } = nach('aufgabe-farbvielfalt', regenbogenschlange('schlange-1', 5))
    expect(erfuellt).toEqual(['Farbvielfalt'])
    expect(ereignisse).toEqual(['KarteGespielt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(offen).toEqual(['Gelber Schatz', 'Fusionsexperte', 'Schlangentanz'])
  })

  it('A9: aufgabe-farbvielfalt: Blau ans Ende erfüllt nichts', () => {
    expect(nach('aufgabe-farbvielfalt', farbkarte('Blau', 'schlange-1', 'ende')).erfuellt).toEqual([])
  })

  it('A9/D38: aufgabe-vielfaltskoenig: Gelb an die zweite Schlange löst Vielfaltskönig ein', () => {
    const { erfuellt, ereignisse } = nach('aufgabe-vielfaltskoenig', farbkarte('Gelb', 'schlange-2', 'ende'))
    expect(erfuellt).toEqual(['Vielfaltskönig'])
    expect(ereignisse).toEqual(['KarteGespielt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
  })

  it('A9/A7.7: aufgabe-vielfaltskoenig: Violett an die zweite Schlange erfüllt nichts (die roten Karten unter der Fusion zählen nicht)', () => {
    expect(nach('aufgabe-vielfaltskoenig', farbkarte('Violett', 'schlange-2', 'ende')).erfuellt).toEqual([])
  })

  it('A9: aufgabe-farbwechsler: Grün ans Ende löst Farbwechsler ein (Blau-Blau, Rot, Gelb-Gelb, Grün)', () => {
    const { erfuellt, ereignisse } = nach('aufgabe-farbwechsler', farbkarte('Grün', 'schlange-1', 'ende'))
    expect(erfuellt).toEqual(['Farbwechsler'])
    expect(ereignisse).toEqual(['KarteGespielt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
  })

  it('A9: aufgabe-farbwechsler: Blau ans Ende erfüllt nichts (Blau, Rot, Gelb, Blau)', () => {
    expect(nach('aufgabe-farbwechsler', farbkarte('Blau', 'schlange-1', 'ende')).erfuellt).toEqual([])
  })

  it('A9/D40: aufgabe-schlangenbaendiger: Grün ans Ende löst Schlangenbändiger ein (A9 Beispiel)', () => {
    const { erfuellt, ereignisse } = nach('aufgabe-schlangenbaendiger', farbkarte('Grün', 'schlange-1', 'ende'))
    expect(erfuellt).toEqual(['Schlangenbändiger'])
    expect(ereignisse).toEqual(['KarteGespielt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
  })

  it('A9/D40: aufgabe-schlangenbaendiger: Rot ans Ende erfüllt nichts', () => {
    expect(nach('aufgabe-schlangenbaendiger', farbkarte('Rot', 'schlange-1', 'ende')).erfuellt).toEqual([])
  })

  it('A9/D39: aufgabe-symmetriemeister: Blau ans Ende löst Symmetriemeister ein (A9 Beispiel)', () => {
    const { erfuellt, ereignisse } = nach('aufgabe-symmetriemeister', farbkarte('Blau', 'schlange-1', 'ende'))
    expect(erfuellt).toEqual(['Symmetriemeister'])
    expect(ereignisse).toEqual(['KarteGespielt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
  })

  it('A9/D39: aufgabe-symmetriemeister: Blau an den Anfang erfüllt nichts', () => {
    expect(nach('aufgabe-symmetriemeister', farbkarte('Blau', 'schlange-1', 'anfang')).erfuellt).toEqual([])
  })
})
