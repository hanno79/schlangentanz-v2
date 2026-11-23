// TEMPORÄR, Prüfer X2a: eigene Grenzfälle. Wird nicht committet.
import { expect, it } from 'vitest'
import { farbenpracht } from '../aufgaben/farbenpracht'
import { farbharmonie } from '../aufgaben/farbharmonie'
import { farbkombination } from '../aufgaben/farbkombination'
import { gelberSchatz } from '../aufgaben/gelberSchatz'
import { lilaRiese } from '../aufgaben/lilaRiese'
import { legeAufgabenAus } from '../testing/aufgaben'
import { aufgabenEreignisse, erste, legeAn, namen } from './aufgaben_hilfen'
import { mal, RS, stellung } from './farbmengen_hilfen'
import { fuehreAus, tischMitHaenden } from './zugablauf_hilfen'
import type { Schlangenglied } from '../testing/szenario'

const FF = (f: 'Blau' | 'Violett' | 'Gelb'): Schlangenglied => ({ fusion: [f, f] })

it('G1 Farbharmonie: Regenbogenschlange am Ende von Schlange 1 und zwei violette Karten am Anfang von Schlange 2 sind keine Gruppe', () => {
  const z = stellung([[...mal(3, 'Blau'), ...mal(3, 'Rot'), ...mal(3, 'Grün'), ...mal(3, 'Gelb'), ...mal(3, 'Braun'), RS], ['Violett', 'Violett']])
  expect(farbharmonie.istErfuellt(z, 0)).toBe(false)
  const z2 = stellung([[...mal(3, 'Blau'), ...mal(3, 'Rot'), ...mal(3, 'Grün'), ...mal(3, 'Gelb'), ...mal(3, 'Braun')], [RS, 'Violett', 'Violett']])
  expect(farbharmonie.istErfuellt(z2, 0)).toBe(true)
})

it('G2 reine Jokerreihen (Auslegung): fünf Joker ohne violette Karte erfüllen Lila Riese, fünf Joker Farbkombination, sechs Joker Gelber Schatz', () => {
  const fuenf = stellung([[RS, RS, FF('Blau'), RS, RS]])
  expect(lilaRiese.istErfuellt(fuenf, 0), 'Lila Riese aus 5 Jokern').toBe(true)
  expect(farbkombination.istErfuellt(fuenf, 0), 'Farbkombination aus 5 Jokern').toBe(true)
  const sechs = stellung([[RS, RS, FF('Blau'), FF('Violett'), RS, RS]])
  expect(gelberSchatz.istErfuellt(sechs, 0), 'Gelber Schatz aus 6 Jokern ohne gelbe Karte').toBe(true)
  const pracht = stellung([[...mal(2, 'Blau'), ...mal(2, 'Rot'), ...mal(2, 'Gelb'), ...mal(2, 'Violett'), ...mal(2, 'Braun'), RS, RS]])
  expect(farbenpracht.istErfuellt(pracht, 0), 'Farbenpracht mit zwei Regenbogenschlangen statt beider grünen Karten').toBe(true)
})

it('G3 Farbenpracht im Zug erfüllt und im selben Zug mit eigener Fusion zerstört: bleibt eingelöst', () => {
  const start = tischMitHaenden([['Grün', 'Farbenfusion', 'Rot', 'Gelb', 'Blau'], ['Rot', 'Gelb', 'Grün', 'Braun', 'Blau']], true)
    .schlange(0, ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb', 'Gelb', 'Violett', 'Violett', 'Braun', 'Braun', 'Grün'])
    .aendere((z) => legeAufgabenAus(z, { offen: ['Farbenpracht', 'Gelber Schatz', 'Lila Riese'], stapelOben: ['Farbharmonie', 'Farbkombination'] }))
    .zustand()
  const gelegt = legeAn(start, 'Grün')
  expect(namen(gelegt.zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbenpracht'])
  const gruene = gelegt.zustand.spieler[0].schlangen[0].karten.slice(-2).map((k) => k.id).join()
  const fusion = erste(gelegt.zustand, (a) => a.typ === 'FusionLegen' && a.kartenIds.join() === gruene)
  const danach = fuehreAus(gelegt.zustand, fusion)
  expect(farbenpracht.istErfuellt(danach.zustand, 0), 'Bedingung nach der Fusion').toBe(false)
  expect(namen(danach.zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbenpracht'])
  expect(aufgabenEreignisse(danach.ereignisse)).toEqual([])
})

it('G4 ohne Erweiterung: dieselbe Stellung löst keine Aufgabe aus und es gibt keine', () => {
  const start = tischMitHaenden([['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'], ['Rot', 'Gelb', 'Grün', 'Braun', 'Blau']], false)
    .schlange(0, mal(4, 'Blau'))
    .zustand()
  const { zustand, ereignisse } = legeAn(start, 'Blau')
  expect(aufgabenEreignisse(ereignisse)).toEqual([])
  expect(zustand.offeneAufgaben).toEqual([])
})
