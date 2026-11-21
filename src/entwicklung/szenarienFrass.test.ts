import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider } from '../engine'
import type { Ereignis, SchlangenfrassSpielenAktion, SpielAktion, Spielkarte, Spielzustand } from '../engine'
import { findeSzenario, SZENARIEN } from './szenarien'

/*
E6: Die Szenarien `frass-eigen`, `frass-zwei-spieler` und `frass-fusion` lassen
sich am Entwicklertisch so durchklicken, wie ihre Erwartung es sagt. Jeder
Schritt hier ist ein Knopf, den die Engine aufzählt.
*/

function erzeuge(name: string): Spielzustand {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

type Wahl = (aktion: SpielAktion) => boolean

function istFrass(aktion: SpielAktion): aktion is SchlangenfrassSpielenAktion {
  return aktion.typ === 'SchlangenfrassSpielen'
}

/** Der Knopf mit dieser Option, der genau diese Karten frisst. */
const frass = (option: SchlangenfrassSpielenAktion['option'], ...karteIds: string[]): Wahl => (aktion) =>
  istFrass(aktion) && aktion.option === option && aktion.ziele.map((ziel) => ziel.karteId).sort().join(',') === [...karteIds].sort().join(',')
const abwehren: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null
const durchlassen: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null

function klicke(zustand: Spielzustand, ...wahlen: Wahl[]): { zustand: Spielzustand; ereignisse: Ereignis[] } {
  let jetzt = zustand
  const ereignisse: Ereignis[] = []
  for (const wahl of wahlen) {
    const aktion = ermittleAktionen(jetzt).find(wahl)
    if (aktion === undefined) throw new Error(`Testaufbau: kein passender Knopf unter ${JSON.stringify(ermittleAktionen(jetzt))}`)
    const schritt = anwendeAktion(jetzt, aktion)
    jetzt = schritt.zustand
    ereignisse.push(...schritt.ereignisse)
  }
  return { zustand: jetzt, ereignisse }
}

const ereignistypen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)
const ids = (zustand: Spielzustand, spieler: number) => zustand.spieler[spieler].schlangen[0].karten.map((karte) => karte.id)
const name = (karte: Spielkarte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)
const namen = (zustand: Spielzustand, spieler: number) => zustand.spieler[spieler].schlangen[0].karten.map(name)
const ablagenamen = (zustand: Spielzustand, spieler: number) => zustand.spieler[spieler].ablagestapel.map(name)
const optionen = (zustand: Spielzustand) => ermittleAktionen(zustand).filter(istFrass).map((aktion) => aktion.option)

describe('E6: Szenarien des Schlangenfrass', () => {
  it('E6: die Szenarien des Tasks sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['frass-eigen', 'frass-zwei-spieler', 'frass-fusion']))
  })

  it('A7.4 a)/b): frass-eigen: vier Knöpfe a), einer b); b) frisst die Blockade, niemand wird gefragt, die Dreierreihe steht', () => {
    const start = erzeuge('frass-eigen')
    expect(optionen(start)).toEqual(['eigeneKarte', 'eigeneKarte', 'eigeneKarte', 'eigeneKarte', 'eigeneBlockade'])
    const blockade = ids(start, 0)[2]
    const { zustand, ereignisse } = klicke(start, frass('eigeneBlockade', blockade))
    expect(ereignistypen(ereignisse)).toEqual(['KartenVersetzt', 'KarteGespielt'])
    expect(namen(zustand, 0)).toEqual(['Rot', 'Rot', 'Rot'])
    expect(ablagenamen(zustand, 0)).toEqual(['Schlangenfrass', 'Schlangenblockade'])
    expect([...new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))]).toEqual(['FarbkarteLegen', 'ZugBeenden'])
  })

  it('A6 Beispiel 2: frass-zwei-spieler: 15 Paare; Blau und Gelb fragt erst KI-Gegner 1, dann KI-Gegner 2; KI-Gegner 1 wehrt ab, nur die Gelb wird gefressen', () => {
    const start = erzeuge('frass-zwei-spieler')
    expect(optionen(start)).toEqual(Array(15).fill('gegnerischeKarten'))
    const blau = ids(start, 1)[0]
    const gelb = ids(start, 2)[0]
    const angesagt = klicke(start, frass('gegnerischeKarten', blau, gelb))
    expect(ereignistypen(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(ermittleAktionen(angesagt.zustand).map((aktion) => aktion.typ)).toEqual(['Reagieren', 'Reagieren'])
    const nachEins = klicke(angesagt.zustand, abwehren)
    expect(ermittleEntscheider(nachEins.zustand)).toBe(2)
    expect(ermittleAktionen(nachEins.zustand), 'D33: KI-Gegner 2 ohne Farbenschutz kann nur durchlassen').toEqual([
      { typ: 'Reagieren', spielerId: 'spieler-3', farbenschutzId: null },
    ])
    expect(ids(nachEins.zustand, 2), 'A6: bis alle entschieden haben, liegt alles noch').toContain(gelb)
    const { zustand, ereignisse } = klicke(nachEins.zustand, durchlassen)
    expect(ereignisse).toContainEqual(expect.objectContaining({ typ: 'AnsageEntschieden', abgewehrt: [1], ohneWirkung: false }))
    expect(namen(zustand, 1)).toEqual(['Blau', 'Blau', 'Blau'])
    expect(namen(zustand, 2)).toEqual(['Gelb', 'Gelb'])
    expect(ablagenamen(zustand, 0)).toEqual(['Schlangenfrass', 'Gelb'])
    expect(ablagenamen(zustand, 1)).toEqual(['Farbenschutz'])
  })

  it('D15: frass-zwei-spieler: zwei Blau fragen nur KI-Gegner 1; sein Farbenschutz schützt beide', () => {
    const start = erzeuge('frass-zwei-spieler')
    const [erste, zweite] = ids(start, 1)
    const angesagt = klicke(start, frass('gegnerischeKarten', erste, zweite))
    expect(angesagt.ereignisse).toContainEqual(expect.objectContaining({ typ: 'KarteAngesagt', betroffene: [1] }))
    const { zustand } = klicke(angesagt.zustand, abwehren)
    expect(namen(zustand, 1)).toEqual(['Blau', 'Blau', 'Blau'])
    expect(zustand.schwebend).toBeNull()
  })

  it('A7.4/A7.7: frass-fusion: a) auf die eigene Fusion legt Gelb, Gelb frei; c) auf Rot und die gegnerische Fusion legt Grün, Grün frei', () => {
    const start = erzeuge('frass-fusion')
    expect(optionen(start)).toEqual(['eigeneKarte', 'eigeneKarte', 'eigeneKarte', 'gegnerischeKarten', 'gegnerischeKarten', 'gegnerischeKarten'])
    const eigen = klicke(start, frass('eigeneKarte', ids(start, 0)[1]))
    expect(ereignistypen(eigen.ereignisse)).toEqual(['KartenVersetzt', 'KarteGespielt'])
    expect(namen(eigen.zustand, 0)).toEqual(['Blau', 'Gelb', 'Gelb', 'Blau'])
    expect(eigen.zustand.spieler[0].schlangen[0].fusionen).toEqual([])
    expect(ablagenamen(eigen.zustand, 0)).toEqual(['Schlangenfrass', 'Farbenfusion'])

    const [rot, , fusion] = ids(start, 1)
    const fremd = klicke(start, frass('gegnerischeKarten', rot, fusion), durchlassen)
    expect(ereignistypen(fremd.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt', 'KartenVersetzt', 'AnsageEntschieden'])
    expect(namen(fremd.zustand, 1)).toEqual(['Rot', 'Grün', 'Grün'])
    expect(ablagenamen(fremd.zustand, 0)).toEqual(['Schlangenfrass', 'Rot', 'Farbenfusion'])
  })
})
