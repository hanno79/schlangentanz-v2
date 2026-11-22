import { afterEach, describe, expect, it } from 'vitest'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { entferneTestbedingungen } from '../engine/testing/testaufgaben'
import { findeSzenario, SZENARIEN } from './szenarien'
import { durchlassen, erzeuge as lade, klicke } from './szenarienTesthilfe'

/*
X1: Die Szenarien zum Aufgabenrahmen lassen sich am Entwicklertisch so
durchklicken, wie ihre Erwartung es sagt. Wie der Tisch setzen die Tests vor dem
Erzeugen die Testbedingungen des Szenarios.
*/

afterEach(() => {
  entferneTestbedingungen()
})

const namen = (aufgaben: { name: string }[]) => aufgaben.map((aufgabe) => aufgabe.name)
const aufgaben = (ereignisse: Ereignis[]) => ereignisse.filter((ereignis) => ereignis.typ.startsWith('Aufgabe')).map((ereignis) => ereignis.typ)

/** Spieler 1 legt die Farbkarte dieser Farbe ans Ende der Schlange. */
const anlegen = (farbe: string, schlangenId: string) => (aktion: SpielAktion, zustand: Spielzustand) => {
  if (aktion.typ !== 'FarbkarteLegen' || aktion.ziel.art !== 'schlange' || aktion.ziel.schlangenId !== schlangenId || aktion.ziel.seite !== 'ende') return false
  const karte = zustand.spieler[0].hand.find((handkarte) => handkarte.id === aktion.karteId)
  return karte?.typ === 'Farbkarte' && karte.farbe === farbe
}
const beenden = (aktion: SpielAktion) => aktion.typ === 'ZugBeenden'
const grube = (aktion: SpielAktion) => aktion.typ === 'SchlangengrubeSpielen'

describe('X1: Szenarien zum Aufgabenrahmen', () => {
  it('X1: die Szenarien sind da, jedes mit Testbedingungen', () => {
    const vorhanden = SZENARIEN.filter((szenario) => szenario.name.startsWith('aufgaben-'))
    expect(vorhanden.map((szenario) => szenario.name)).toEqual(['aufgaben-einloesen', 'aufgaben-stapel-leer', 'aufgaben-abwehr', 'aufgaben-gegnerzug'])
    for (const szenario of vorhanden) expect(Object.keys(szenario.testbedingungen ?? {}), szenario.name).not.toEqual([])
  })

  it('A9/D5/D35: aufgaben-einloesen: Blau an schlange-1 löst Farbkombination und den aufgedeckten Gelber Schatz ein; die geheime Aufgabe zählt still', () => {
    const start = lade('aufgaben-einloesen')
    expect(start.spieler[0].erfuellteAufgaben).toEqual([])
    const { zustand, ereignisse } = klicke(start, anlegen('Blau', 'schlange-1'))
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteGespielt', 'AufgabeErfuellt', 'AufgabeAufgedeckt', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.offeneAufgaben)).toEqual(['Farbvielfalt', 'Fusionsexperte', 'Lila Riese'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination', 'Gelber Schatz'])
    expect(zustand.aufgabenStapel).toHaveLength(start.aufgabenStapel.length - 2)
    expect(zustand.spieler[0].geheimeAufgabeErfuellt).toBe(true)
    expect(zustand.zug.spielerIndex).toBe(0)
  })

  it('A9: aufgaben-stapel-leer: der zweite Platz bleibt leer', () => {
    const { zustand, ereignisse } = klicke(lade('aufgaben-stapel-leer'), anlegen('Blau', 'schlange-1'))
    expect(aufgaben(ereignisse)).toEqual(['AufgabeErfuellt', 'AufgabeAufgedeckt', 'AufgabeErfuellt', 'AufgabenstapelLeer'])
    expect(namen(zustand.offeneAufgaben)).toEqual(['Gelber Schatz', 'Fusionsexperte'])
    expect(zustand.aufgabenStapel).toEqual([])
  })

  it('A6/A9: aufgaben-abwehr: erst nach der Entscheidung von KI-Gegner 1 wird eingelöst, und zwar für Spieler 1', () => {
    const angesagt = klicke(lade('aufgaben-abwehr'), grube)
    expect(angesagt.ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    const { zustand, ereignisse } = klicke(angesagt.zustand, durchlassen)
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['AnsageEntschieden', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
  })

  it('A9/D35: aufgaben-gegnerzug: KI-Gegner 1 löst erst zu Beginn seines Zuges ein, auch die geheime Aufgabe', () => {
    const gelegt = klicke(lade('aufgaben-gegnerzug'), anlegen('Gelb', 'schlange-2'))
    expect(aufgaben(gelegt.ereignisse)).toEqual([])
    expect(gelegt.zustand.spieler[1].geheimeAufgabeErfuellt).toBe(false)
    const { zustand, ereignisse } = klicke(gelegt.zustand, beenden)
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenGezogen', 'ZugBegonnen', 'AufgabeErfuellt', 'AufgabeAufgedeckt'])
    expect(ereignisse[2]).toMatchObject({ spielerIndex: 1 })
    expect(zustand.spieler[1].geheimeAufgabeErfuellt).toBe(true)
  })

  it('X1: ohne die Testbedingungen geschieht in denselben Szenarien nichts: Die Aufgaben sind Platzhalter', () => {
    const szenario = findeSzenario('aufgaben-einloesen')!
    const { zustand, ereignisse } = klicke(szenario.erzeuge(), anlegen('Blau', 'schlange-1'))
    expect(aufgaben(ereignisse)).toEqual([])
    expect(zustand.spieler[0].geheimeAufgabeErfuellt).toBe(false)
  })
})
