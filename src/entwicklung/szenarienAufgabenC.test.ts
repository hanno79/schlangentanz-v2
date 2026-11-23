import { describe, expect, it } from 'vitest'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { AUFGABENNAMEN } from '../engine/aufgabenKarten'
import { findeSzenario, SZENARIEN } from './szenarien'
import { abwehren, klicke } from './szenarienTesthilfe'

/*
X2, Paket C: je Aufgabe ein Szenario am Entwicklertisch, in dem sie mit echten
Karten eingelöst wird, ohne Testbedingung (A9 Nr. 7 bis 10 und 12). Die Tests
klicken die Knöpfe, die die Erwartung des Szenarios nennt.
*/

const NAMEN = ['aufgabe-fusionsexperte', 'aufgabe-schlangenbeschwoerer', 'aufgabe-schlangenmeister', 'aufgabe-schlangenrepertoire', 'aufgabe-schlangentanz']

function lade(name: string): Spielzustand {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Testaufbau: Das Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

/** Die Namen der Aufgaben, die in diesen Ereignissen eingelöst werden, mit Spieler. */
function eingeloest(ereignisse: Ereignis[]): string[] {
  return ereignisse.flatMap((ereignis) => (ereignis.typ === 'AufgabeErfuellt' ? [`${AUFGABENNAMEN.get(ereignis.aufgabeId)} (Spieler ${ereignis.spielerIndex + 1})`] : []))
}

const handkarteVon = (zustand: Spielzustand, aktion: SpielAktion) => ('karteId' in aktion ? zustand.spieler[0].hand.find((karte) => karte.id === aktion.karteId) : undefined)
const sonderkarte = (typ: SpielAktion['typ'], name: string) => (aktion: SpielAktion, zustand: Spielzustand) => {
  const karte = handkarteVon(zustand, aktion)
  return aktion.typ === typ && karte?.typ === 'Sonderkarte' && karte.name === name
}

describe('X2 Paket C: Szenarien am Entwicklertisch', () => {
  it('X2: je Aufgabe ein Szenario, keines mit Testbedingung', () => {
    expect(SZENARIEN.filter((szenario) => NAMEN.includes(szenario.name)).map((szenario) => szenario.name)).toEqual(NAMEN)
    for (const name of NAMEN) expect(findeSzenario(name)?.testbedingungen, `${name}: ohne Testbedingung`).toBeUndefined()
  })

  it('A9 Nr. 7/A7.7: aufgabe-fusionsexperte: die Farbenfusion auf Rot, Rot ist die zweite Fusion der Schlange', () => {
    const start = lade('aufgabe-fusionsexperte')
    const rot = start.spieler[0].schlangen[0].karten.slice(3).map((karte) => karte.id).join()
    const { ereignisse } = klicke(start, (aktion) => aktion.typ === 'FusionLegen' && aktion.kartenIds.join() === rot)
    expect(eingeloest(ereignisse)).toEqual(['Fusionsexperte (Spieler 1)'])
  })

  it('A9 Nr. 8: aufgabe-schlangenbeschwoerer: die Regenbogenschlange ist die vierte Sonderkarte in den eigenen Schlangen', () => {
    const { ereignisse } = klicke(lade('aufgabe-schlangenbeschwoerer'), sonderkarte('RegenbogenschlangeLegen', 'Regenbogenschlange'))
    expect(eingeloest(ereignisse)).toEqual(['Schlangenbeschwörer (Spieler 1)'])
  })

  it('A9 Nr. 9/D36: aufgabe-schlangenmeister: die abgewehrte Schlangengrube ist die vierte ausgespielte Sonderkarte', () => {
    const angesagt = klicke(lade('aufgabe-schlangenmeister'), sonderkarte('SchlangengrubeSpielen', 'Schlangengrube'))
    expect(eingeloest(angesagt.ereignisse), 'X1: angesagt ist nicht aufgelöst').toEqual([])
    const { ereignisse } = klicke(angesagt.zustand, abwehren)
    expect(eingeloest(ereignisse)).toEqual(['Schlangenmeister (Spieler 1)'])
  })

  it('A9 Nr. 10/D36: aufgabe-schlangenrepertoire: der wirkungslos abgelegte Farbenschutz ist die fünfte Art', () => {
    const { zustand, ereignisse } = klicke(lade('aufgabe-schlangenrepertoire'), sonderkarte('SonderkarteWirkungslosAblegen', 'Farbenschutz'))
    expect(eingeloest(ereignisse)).toEqual(['Schlangenrepertoire (Spieler 1)'])
    expect(zustand.spieler[0].ausgespielteSonderkarten).toEqual(['Regenbogenschlange', 'Schlangenfrass', 'Farbendieb', 'Verdoppler', 'Farbenschutz'])
  })

  it('A9 Nr. 12/D37: aufgabe-schlangentanz: das Beispiel der Website, zwei neue Dreiergruppen aus einer Häutung', () => {
    const start = lade('aufgabe-schlangentanz')
    const karten = start.spieler[0].schlangen[0].karten
    const ziel = [6, 9, 7, 8, 10].map((stelle) => karten[stelle].id).join()
    const { zustand, ereignisse } = klicke(start, (aktion) => aktion.typ === 'SchlangenhaeutungSpielen' && aktion.neueReihenfolge.join() === ziel)
    expect(zustand.spieler[0].schlangenhaeutungDreiergruppen).toBe(2)
    expect(eingeloest(ereignisse)).toEqual(['Schlangentanz (Spieler 1)'])
  })
})
