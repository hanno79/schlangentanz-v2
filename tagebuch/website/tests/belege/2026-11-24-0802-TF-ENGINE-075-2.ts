// TEMPORÄR, Prüfer X2a Iteration 2: eigene Grenzfälle zu Farbenpracht am Zugende. Wird nicht committet.
import { expect, it } from 'vitest'
import type { Ereignis, Spielzustand } from '../../index'
import { GRUNDAUSLAGE, legeAufgabenAus } from '../../testing/aufgaben'
import type { Kartenwahl, Schlangenglied } from '../../testing/szenario'
import { aufgabeId, aufgabenEreignisse, erste, legeAn, namen } from '../aufgaben_hilfen'
import { mal } from '../farbmengen_hilfen'
import { aktionen, fuehreAus, tischMitHaenden, zugBeenden } from '../zugablauf_hilfen'

const FAST: Schlangenglied[] = [...mal(2, 'Blau'), ...mal(2, 'Rot'), ...mal(2, 'Gelb'), ...mal(2, 'Violett'), ...mal(2, 'Braun'), 'Grün']
const AUSLAGE = { offen: ['Farbenpracht', 'Lila Riese', 'Gelber Schatz'], stapelOben: ['Farbkombination', 'Farbharmonie'], geheim: GRUNDAUSLAGE.geheim }
const typen = (e: Ereignis[]) => e.map((x) => x.typ)
const beenden = (z: Spielzustand) => fuehreAus(z, zugBeenden(z))

function tisch(hand0: Kartenwahl[], schlange0: Schlangenglied[] = FAST, schlange1?: Schlangenglied[], hand1: Kartenwahl[] = ['Rot', 'Gelb', 'Blau', 'Braun', 'Violett']) {
  const bau = tischMitHaenden([hand0, hand1], true).schlange(0, schlange0)
  if (schlange1 !== undefined) bau.schlange(1, schlange1)
  return bau.aendere((z) => legeAufgabenAus(z, AUSLAGE)).zustand()
}

it('I1 Überhand: Farbenpracht wird erst nach dem Abwerfen eingelöst, dort vor ZugBegonnen des Nächsten', () => {
  const start = tisch(['Grün', 'Rot', 'Gelb', 'Blau', 'Braun', 'Violett', 'Rot'])
  const gelegt = legeAn(start, 'Grün')
  const ende = beenden(gelegt.zustand)
  expect(typen(ende.ereignisse)).toContain('AbwerfenVerlangt')
  expect(aufgabenEreignisse(ende.ereignisse), 'beim Abwerfen-Verlangen noch nichts').toEqual([])
  const danach = fuehreAus(ende.zustand, aktionen(ende.zustand, 'UeberhandAbwerfen')[0])
  const t = typen(danach.ereignisse)
  expect(t).toContain('AufgabeErfuellt')
  expect(t.indexOf('AufgabeErfuellt')).toBeLessThan(t.indexOf('ZugBegonnen'))
  expect(namen(danach.zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbenpracht'])
})

it('I2 vom Gegner erfüllt, im eigenen Zug mit eigener Fusion zerstört: nicht eingelöst', () => {
  // Spieler 1 legt Grün in die Schlange von KI-Gegner 1 und beendet; KI-Gegner 1 fusioniert dann seine zwei blauen Karten.
  const start = tisch(['Grün', 'Rot', 'Gelb', 'Blau', 'Braun'], ['Gelb'], FAST, ['Farbenfusion', 'Rot', 'Gelb', 'Blau', 'Braun'])
  const gelegt = legeAn(start, 'Grün', 'schlange-2')
  const seinZug = beenden(gelegt.zustand)
  expect(aufgabenEreignisse(seinZug.ereignisse)).toEqual([])
  const blaue = seinZug.zustand.spieler[1].schlangen[0].karten.slice(0, 2).map((k) => k.id).join()
  const fusion = fuehreAus(seinZug.zustand, erste(seinZug.zustand, (a) => a.typ === 'FusionLegen' && a.kartenIds.join() === blaue))
  const ende = beenden(fusion.zustand)
  expect(aufgabenEreignisse([...fusion.ereignisse, ...ende.ereignisse])).toEqual([])
  expect(ende.zustand.spieler[1].erfuellteAufgaben).toEqual([])
})

it('I3 Verdoppler: erst im zweiten Zug erfüllt, am Ende des zweiten Zuges eingelöst', () => {
  const start = tisch(['Verdoppler', 'Grün', 'Rot', 'Gelb', 'Braun'])
  const verdoppelt = fuehreAus(start, erste(start, (a) => a.typ === 'VerdopplerSpielen'))
  const rot = legeAn(verdoppelt.zustand, 'Rot')
  const erster = beenden(rot.zustand)
  expect(aufgabenEreignisse(erster.ereignisse)).toEqual([])
  expect(erster.zustand.zug.teilzug).toBe(2)
  const gruen = legeAn(erster.zustand, 'Grün')
  expect(aufgabenEreignisse(gruen.ereignisse)).toEqual([])
  const zweiter = beenden(gruen.zustand)
  expect(aufgabenEreignisse(zweiter.ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbenpracht') })
  expect(zweiter.zustand.zug.spielerIndex).toBe(1)
})
