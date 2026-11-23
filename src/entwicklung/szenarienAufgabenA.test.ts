import { describe, expect, it } from 'vitest'
import { berechneEndwertung } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { findeSzenario, SZENARIEN } from './szenarien'
import { klicke } from './szenarienTesthilfe'

/*
X2 Paket A: Je Aufgabe ein Szenario am Entwicklertisch, in dem sie mit echten
Karten eingelöst wird, ohne Testbedingung. Die Tests klicken, was die Erwartung
des Szenarios beschreibt.
*/

const NAMEN = ['aufgabe-farbenpracht', 'aufgabe-farbharmonie', 'aufgabe-farbkombination', 'aufgabe-gelber-schatz', 'aufgabe-lila-riese', 'aufgabe-joker-zwei-farben']

function lade(name: string): Spielzustand {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Testaufbau: Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

const namen = (aufgaben: { name: string }[]) => aufgaben.map((aufgabe) => aufgabe.name)
const aufgabenTypen = (ereignisse: Ereignis[]) => ereignisse.filter((ereignis) => ereignis.typ.startsWith('Aufgabe')).map((ereignis) => ereignis.typ)

/** Spieler 1 legt die Farbkarte dieser Farbe an diese Seite der Schlange. */
const farbkarte = (farbe: string, schlangenId: string, seite: 'anfang' | 'ende' = 'ende') => (aktion: SpielAktion, zustand: Spielzustand) => {
  if (aktion.typ !== 'FarbkarteLegen' || aktion.ziel.art !== 'schlange' || aktion.ziel.schlangenId !== schlangenId || aktion.ziel.seite !== seite) return false
  const karte = zustand.spieler[0].hand.find((handkarte) => handkarte.id === aktion.karteId)
  return karte?.typ === 'Farbkarte' && karte.farbe === farbe
}

/** Spieler 1 legt seine Regenbogenschlange an diese Stelle der Schlange. */
const regenbogen = (schlangenId: string, position: number) => (aktion: SpielAktion) =>
  aktion.typ === 'RegenbogenschlangeLegen' && aktion.schlangenId === schlangenId && aktion.position === position

describe('X2 Paket A: Szenarien je Aufgabe, eingelöst mit echten Karten', () => {
  it('X2/A9: die sechs Szenarien sind da, keines setzt eine Testbedingung', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(NAMEN))
    for (const name of NAMEN) expect(findeSzenario(name)!.testbedingungen, name).toBeUndefined()
  })

  it('A9/D38: aufgabe-farbenpracht: die zweite grüne Karte in der zweiten Schlange löst Farbenpracht ein; Rot dort löst nichts ein', () => {
    const start = lade('aufgabe-farbenpracht')
    expect(aufgabenTypen(klicke(start, farbkarte('Rot', 'schlange-2')).ereignisse)).toEqual([])
    const { zustand, ereignisse } = klicke(start, farbkarte('Grün', 'schlange-2'))
    expect(aufgabenTypen(ereignisse)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbenpracht'])
    expect(namen(zustand.offeneAufgaben)).toEqual(['Gelber Schatz', 'Farbkombination', 'Lila Riese'])
  })

  it('A9/A7.3: aufgabe-farbharmonie: die Regenbogenschlange am Ende der zweiten Schlange vervollständigt die violette Gruppe und löst Farbharmonie ein', () => {
    const start = lade('aufgabe-farbharmonie')
    expect(aufgabenTypen(klicke(start, regenbogen('schlange-2', 0)).ereignisse), 'am Anfang vervollständigt sie nichts').toEqual([])
    const { zustand, ereignisse } = klicke(start, regenbogen('schlange-2', 8))
    expect(aufgabenTypen(ereignisse)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbharmonie'])
    expect(namen(zustand.offeneAufgaben)).toEqual(['Gelber Schatz', 'Farbkombination', 'Lila Riese'])
  })

  it('A9 Beispiel: aufgabe-farbkombination: die fünfte blaue Karte löst Farbkombination für Spieler 1 ein; KI-Gegner 1 mit vier roten bekommt sie nicht', () => {
    const { zustand, ereignisse } = klicke(lade('aufgabe-farbkombination'), farbkarte('Blau', 'schlange-1', 'anfang'), (aktion) => aktion.typ === 'ZugBeenden')
    expect(aufgabenTypen(ereignisse)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
    expect(zustand.spieler[1].erfuellteAufgaben).toEqual([])
    expect(zustand.zug.spielerIndex).toBe(1)
  })

  it('A9/A7.3: aufgabe-gelber-schatz: die Regenbogenschlange zwischen Gelb und Violett löst Gelber Schatz ein; in der Wertung zählt sie als Violett', () => {
    const { zustand, ereignisse } = klicke(lade('aufgabe-gelber-schatz'), regenbogen('schlange-1', 5))
    expect(aufgabenTypen(ereignisse)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Gelber Schatz'])
    const wertung = berechneEndwertung(zustand).spieler[0]
    expect(wertung.schlangen[0].joker.map((joker) => joker.farbe)).toEqual(['Violett'])
    expect(wertung.aufgabenPunkte).toBe(5)
  })

  it('A9/D3 (C14): aufgabe-lila-riese: bei vier violetten Karten geschieht nichts, die fünfte löst Lila Riese ein', () => {
    const start = lade('aufgabe-lila-riese')
    expect(aufgabenTypen(klicke(start, farbkarte('Blau', 'schlange-1', 'anfang')).ereignisse)).toEqual([])
    const { zustand, ereignisse } = klicke(start, farbkarte('Violett', 'schlange-1'))
    expect(aufgabenTypen(ereignisse)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Lila Riese'])
  })

  it('A9/A7.3: aufgabe-joker-zwei-farben: eine Regenbogenschlange löst Gelber Schatz (als Gelb) und Lila Riese (als Violett) in einer Aktion ein', () => {
    const { zustand, ereignisse } = klicke(lade('aufgabe-joker-zwei-farben'), regenbogen('schlange-1', 5))
    expect(aufgabenTypen(ereignisse)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Gelber Schatz', 'Lila Riese'])
    expect(namen(zustand.offeneAufgaben)).toEqual(['Farbenpracht', 'Fusionsexperte', 'Farbharmonie'])
  })
})
