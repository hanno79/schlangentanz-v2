import { describe, expect, it } from 'vitest'
import { berechneEndwertung } from '../../index'
import type { Ereignis, Spielzustand } from '../../index'
import { GRUNDAUSLAGE, legeAufgabenAus } from '../../testing/aufgaben'
import type { Aufgabenauslage } from '../../testing/aufgaben'
import type { Kartenwahl, Schlangenglied } from '../../testing/szenario'
import { aufgabeId, aufgabenEreignisse, erste, legeAn, namen } from '../aufgaben_hilfen'
import { mal } from '../farbmengen_hilfen'
import { fuehreAus, tischMitHaenden, zugBeenden } from '../zugablauf_hilfen'
import type { Schritt } from '../zugablauf_hilfen'

/*
X2a Iteration 2, Entscheid des Autors vom 23.11.2026: „Farbenpracht“ (A9 Nr. 1,
„Habe am Ende des Spiels oder Zugs …“) wird nur am Ende des eigenen Zuges
geprüft, nicht nach jeder Aktion und nicht zu Zugbeginn. Das Ende des letzten
eigenen Zuges in der Schlussrunde ist das Ende des Spiels für diesen Spieler.
Das gilt für die offene wie für die geheime Farbenpracht. Wer sie mitten im Zug
erfüllt und im selben Zug wieder zerstört, bekommt sie nicht. Nach einem
Verdoppler ist der erste Zug beendet (A7.8), also auch dort geprüft. Wer
aussetzt, spielt keinen Zug und hat kein Zugende. Eine beim Zugende aufgedeckte
Aufgabe wird nach ihrem eigenen Zeitpunkt geprüft (D5): eine, die nach jeder
Aktion gilt, sofort.
*/

/** Von jeder Farbe zwei Karten, nur die zweite grüne fehlt. */
const FAST: Schlangenglied[] = [...mal(2, 'Blau'), ...mal(2, 'Rot'), ...mal(2, 'Gelb'), ...mal(2, 'Violett'), ...mal(2, 'Braun'), 'Grün']

const AUSLAGE: Aufgabenauslage = {
  offen: ['Farbenpracht', 'Lila Riese', 'Gelber Schatz'],
  stapelOben: ['Farbkombination', 'Farbharmonie'],
  geheim: GRUNDAUSLAGE.geheim,
}

interface Aufbau {
  schlange?: Schlangenglied[]
  gegnerSchlange?: Schlangenglied[]
  hand0?: Kartenwahl[]
  hand1?: Kartenwahl[]
  auslage?: Aufgabenauslage
}

/** Zwei Spieler mit Erweiterung, Spieler 1 am Zug mit `schlange` (`schlange-1`). */
function tisch({ schlange = FAST, gegnerSchlange, hand0 = ['Grün', 'Rot', 'Gelb', 'Blau', 'Braun'], hand1 = ['Rot', 'Gelb', 'Blau', 'Braun', 'Violett'], auslage = AUSLAGE }: Aufbau = {}) {
  const bau = tischMitHaenden([hand0, hand1], true).schlange(0, schlange)
  if (gegnerSchlange !== undefined) bau.schlange(1, gegnerSchlange)
  return bau.aendere((zustand) => legeAufgabenAus(zustand, auslage))
}

const beenden = (zustand: Spielzustand): Schritt => fuehreAus(zustand, zugBeenden(zustand))
const erfuellt = (ereignisse: Ereignis[]) => ereignisse.filter((ereignis) => ereignis.typ === 'AufgabeErfuellt')
const typen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)

describe('A9 Farbenpracht, Entscheid des Autors 23.11.2026: geprüft wird am Ende des eigenen Zuges', () => {
  it('A9: die zweite grüne Karte erfüllt die Bedingung, eingelöst wird aber erst beim „Zug beenden“, vor dem Zug des Nächsten', () => {
    const gelegt = legeAn(tisch().zustand(), 'Grün')
    expect(aufgabenEreignisse(gelegt.ereignisse), 'mitten im Zug: kein Einlösen').toEqual([])
    expect(namen(gelegt.zustand.offeneAufgaben)).toContain('Farbenpracht')
    const { zustand, ereignisse } = beenden(gelegt.zustand)
    expect(erfuellt(ereignisse)).toEqual([{ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbenpracht') }])
    expect(typen(ereignisse).indexOf('AufgabeErfuellt'), 'vor ZugBegonnen des Nächsten').toBeLessThan(typen(ereignisse).indexOf('ZugBegonnen'))
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbenpracht'])
    expect(zustand.zug.spielerIndex).toBe(1)
  })

  it('A9: im selben Zug erfüllt und mit einer eigenen Farbenfusion auf Blau-Blau wieder zerstört: Spieler 1 bekommt Farbenpracht nicht', () => {
    const start = tisch({ hand0: ['Grün', 'Farbenfusion', 'Rot', 'Gelb', 'Braun'] }).zustand()
    const gelegt = legeAn(start, 'Grün')
    const blaue = gelegt.zustand.spieler[0].schlangen[0].karten.slice(0, 2).map((karte) => karte.id).join()
    const fusion = fuehreAus(gelegt.zustand, erste(gelegt.zustand, (aktion) => aktion.typ === 'FusionLegen' && aktion.kartenIds.join() === blaue))
    const { zustand, ereignisse } = beenden(fusion.zustand)
    expect(aufgabenEreignisse([...gelegt.ereignisse, ...fusion.ereignisse, ...ereignisse])).toEqual([])
    expect(zustand.spieler[0].erfuellteAufgaben).toEqual([])
    expect(namen(zustand.offeneAufgaben)).toContain('Farbenpracht')
  })

  it('A7.8: mit Verdoppler endet der erste Zug beim „Zug beenden“; dort wird Farbenpracht eingelöst, vor dem zweiten Zug', () => {
    const start = tisch({ hand0: ['Verdoppler', 'Grün', 'Rot', 'Gelb', 'Braun'] }).zustand()
    const verdoppelt = fuehreAus(start, erste(start, (aktion) => aktion.typ === 'VerdopplerSpielen'))
    const gelegt = legeAn(verdoppelt.zustand, 'Grün')
    expect(aufgabenEreignisse(gelegt.ereignisse)).toEqual([])
    const { zustand, ereignisse } = beenden(gelegt.zustand)
    expect(erfuellt(ereignisse)).toEqual([{ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbenpracht') }])
    expect(ereignisse.at(-1), 'danach beginnt der zweite Zug').toEqual({ typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 })
    expect(zustand.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
  })

  it('D35: die geheime Farbenpracht zählt erst am Zugende, still', () => {
    const start = tisch({ auslage: { offen: ['Lila Riese', 'Gelber Schatz', 'Farbharmonie'], stapelOben: ['Farbkombination'], geheim: [[0, 'Farbenpracht']] } }).zustand()
    const gelegt = legeAn(start, 'Grün')
    expect(gelegt.zustand.spieler[0].geheimeAufgabeErfuellt, 'mitten im Zug').toBe(false)
    const { zustand, ereignisse } = beenden(gelegt.zustand)
    expect(zustand.spieler[0].geheimeAufgabeErfuellt, 'am Zugende').toBe(true)
    expect(aufgabenEreignisse(ereignisse)).toEqual([])
  })

  it('A9/A10: der letzte eigene Zug in der Schlussrunde: Farbenpracht wird beim „Zug beenden“ eingelöst, dann endet die Partie', () => {
    const start = tisch().schlussrunde(1).amZug(0).zustand()
    const { zustand, ereignisse } = beenden(legeAn(start, 'Grün').zustand)
    expect(typen(ereignisse).filter((typ) => typ === 'AufgabeErfuellt' || typ === 'PartieBeendet')).toEqual(['AufgabeErfuellt', 'PartieBeendet'])
    expect(berechneEndwertung(zustand).spieler[0].aufgaben?.map((aufgabe) => aufgabe.name)).toEqual(['Farbenpracht'])
  })

  it('A9: erfüllt ein Gegnerzug die Bedingung, wird Farbenpracht nicht zu Zugbeginn eingelöst, sondern am Ende des eigenen Zuges', () => {
    const start = tisch({ schlange: ['Gelb'], gegnerSchlange: FAST }).zustand()
    const gelegt = legeAn(start, 'Grün', 'schlange-2')
    const begonnen = beenden(gelegt.zustand)
    expect(begonnen.zustand.zug.spielerIndex).toBe(1)
    expect(aufgabenEreignisse(begonnen.ereignisse), 'zu Beginn des Zuges von KI-Gegner 1').toEqual([])
    const gespielt = fuehreAus(begonnen.zustand, erste(begonnen.zustand, (aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-1'))
    expect(aufgabenEreignisse(gespielt.ereignisse)).toEqual([])
    const { zustand, ereignisse } = beenden(gespielt.zustand)
    expect(erfuellt(ereignisse)).toEqual([{ typ: 'AufgabeErfuellt', spielerIndex: 1, aufgabeId: aufgabeId('Farbenpracht') }])
    expect(namen(zustand.spieler[1].erfuellteAufgaben)).toEqual(['Farbenpracht'])
  })

  it('A7.6: wer aussetzt, spielt keinen Zug und hat kein Zugende; Farbenpracht wird für ihn dann nicht eingelöst', () => {
    const start = tisch({ schlange: ['Gelb'], gegnerSchlange: FAST }).grube(0, 1).zustand()
    const gelegt = legeAn(start, 'Grün', 'schlange-2')
    const { zustand, ereignisse } = beenden(gelegt.zustand)
    expect(typen(ereignisse)).toContain('Ausgesetzt')
    expect(zustand.zug.spielerIndex, 'nach dem Aussetzen ist wieder Spieler 1 dran').toBe(0)
    expect(aufgabenEreignisse(ereignisse)).toEqual([])
    expect(zustand.spieler[1].erfuellteAufgaben).toEqual([])
  })
})

describe('D5: Kette mit Aufgaben verschiedener Prüfzeitpunkte', () => {
  it('D5: am Zugende eingelöst, wird die aufgedeckte Farbkombination sofort mitgeprüft und eingelöst', () => {
    const start = tisch({ schlange: ['Blau', ...FAST.slice(0, 2), ...mal(2, 'Blau'), ...FAST.slice(2)] }).zustand()
    const { ereignisse } = beenden(legeAn(start, 'Grün').zustand)
    expect(aufgabenEreignisse(ereignisse).map((ereignis) => [ereignis.typ, 'aufgabeId' in ereignis ? ereignis.aufgabeId : ''])).toEqual([
      ['AufgabeErfuellt', aufgabeId('Farbenpracht')],
      ['AufgabeAufgedeckt', aufgabeId('Farbkombination')],
      ['AufgabeErfuellt', aufgabeId('Farbkombination')],
      ['AufgabeAufgedeckt', aufgabeId('Farbharmonie')],
    ])
  })

  it('D5: mitten im Zug aufgedeckt, wird Farbenpracht nicht sofort eingelöst, obwohl die Bedingung gilt, sondern am Zugende', () => {
    const auslage: Aufgabenauslage = { offen: ['Farbkombination', 'Lila Riese', 'Gelber Schatz'], stapelOben: ['Farbenpracht', 'Farbharmonie'], geheim: GRUNDAUSLAGE.geheim }
    const start = tisch({ schlange: [...mal(2, 'Blau'), ...FAST, 'Grün'], hand0: ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'], auslage }).zustand()
    const gelegt = legeAn(start, 'Blau')
    expect(aufgabenEreignisse(gelegt.ereignisse).map((ereignis) => ereignis.typ)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(gelegt.zustand.offeneAufgaben)).toEqual(['Farbenpracht', 'Lila Riese', 'Gelber Schatz'])
    const { zustand } = beenden(gelegt.zustand)
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination', 'Farbenpracht'])
  })
})
