import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { findeSzenario, SZENARIEN } from './szenarien'

/*
E8: Die Szenarien `farbendieb` und `farbendieb-abwehr` lassen sich am
Entwicklertisch so durchklicken, wie ihre Erwartung es sagt. Jeder Schritt hier
ist ein Knopf, den die Engine aufzählt.
*/

function erzeuge(name: string): Spielzustand {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

type Wahl = (aktion: SpielAktion, zustand: Spielzustand) => boolean

/** Stiehlt die Karte an `stelle` der ersten Schlange von `spieler` und legt sie an `position` der ersten eigenen Schlange oder in eine neue. */
const stiehl =
  (spieler: number, stelle: number, position: number | 'neu'): Wahl =>
  (aktion, zustand) =>
    aktion.typ === 'FarbendiebSpielen' &&
    aktion.quelle.karteId === zustand.spieler[spieler].schlangen[0].karten[stelle].id &&
    (position === 'neu' ? aktion.ziel.art === 'neueSchlange' : aktion.ziel.art === 'schlange' && aktion.ziel.position === position)
const abwehren: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null
const durchlassen: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null

function klicke(zustand: Spielzustand, ...wahlen: Wahl[]): { zustand: Spielzustand; ereignisse: Ereignis[] } {
  let jetzt = zustand
  const ereignisse: Ereignis[] = []
  for (const wahl of wahlen) {
    const aktion = ermittleAktionen(jetzt).find((angeboten) => wahl(angeboten, jetzt))
    if (aktion === undefined) throw new Error(`Testaufbau: kein passender Knopf unter ${JSON.stringify(ermittleAktionen(jetzt))}`)
    const schritt = anwendeAktion(jetzt, aktion)
    jetzt = schritt.zustand
    ereignisse.push(...schritt.ereignisse)
  }
  return { zustand: jetzt, ereignisse }
}

const farben = (zustand: Spielzustand, spieler: number) =>
  zustand.spieler[spieler].schlangen.map((schlange) => schlange.karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)))
const ablagen = (zustand: Spielzustand) => zustand.spieler.map((spieler) => spieler.ablagestapel.map((karte) => (karte.typ === 'Sonderkarte' ? karte.name : karte.farbe)))
const typen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)
const anzahl = (zustand: Spielzustand) => ermittleAktionen(zustand).filter((aktion) => aktion.typ === 'FarbendiebSpielen').length

describe('E8: Szenarien des Farbendiebs', () => {
  it('E8: die Szenarien des Tasks sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['farbendieb', 'farbendieb-abwehr']))
  })

  it('A7.1 Beispiel: farbendieb: sechs Knöpfe; Spieler 1 stiehlt das Gelb von KI-Gegner 1 ans Ende seiner Schlange und hat eine gelbe Dreiergruppe', () => {
    const start = erzeuge('farbendieb')
    expect(farben(start, 0)).toEqual([['Gelb', 'Gelb']])
    expect(farben(start, 1)).toEqual([['Blau', 'Gelb']])
    expect(anzahl(start), '2 Farbkarten beim Gegner × 3 Stellen der eigenen Schlange').toBe(6)
    const angesagt = klicke(start, stiehl(1, 1, 2))
    expect(typen(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(ermittleEntscheider(angesagt.zustand), 'D33: KI-Gegner 1 wird gefragt').toBe(1)
    expect(ermittleAktionen(angesagt.zustand)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
    const durch = klicke(angesagt.zustand, durchlassen)
    expect(typen(durch.ereignisse)).toEqual(['AnsageEntschieden'])
    expect(farben(durch.zustand, 0)).toEqual([['Gelb', 'Gelb', 'Gelb']])
    expect(farben(durch.zustand, 1)).toEqual([['Blau']])
    expect(ablagen(durch.zustand)).toEqual([['Farbendieb'], []])
    expect([...new Set(ermittleAktionen(durch.zustand).map((aktion) => aktion.typ))], 'A5/D12: danach noch eine Farbkarte oder Zug beenden').toEqual(['FarbkarteLegen', 'ZugBeenden'])
  })

  it('A7.1/A7.2: farbendieb-abwehr: KI-Gegner 1 wehrt ab; seine grüne Dreiergruppe bleibt, Farbendieb und Farbenschutz liegen je beim eigenen Spieler', () => {
    const start = erzeuge('farbendieb-abwehr')
    expect(start.spieler[0].schlangen, 'D17: Spieler 1 hat keine Schlange').toEqual([])
    expect(anzahl(start), 'vier Farbkarten bei den Gegnern, jede nur in eine neue Schlange').toBe(4)
    const angesagt = klicke(start, stiehl(1, 0, 'neu'))
    expect(ermittleAktionen(angesagt.zustand).map((aktion) => aktion.typ)).toEqual(['Reagieren', 'Reagieren'])
    const abwehr = klicke(angesagt.zustand, abwehren)
    expect(typen(abwehr.ereignisse)).toEqual(['Abgewehrt', 'AnsageEntschieden'])
    expect(farben(abwehr.zustand, 1)).toEqual([['Grün', 'Grün', 'Grün']])
    expect(abwehr.zustand.spieler[0].schlangen).toEqual([])
    expect(ablagen(abwehr.zustand)).toEqual([['Farbendieb'], ['Farbenschutz'], []])
    expect(abwehr.zustand.spieler[1].hand).toHaveLength(4)
  })

  it('D17/F4: farbendieb-abwehr: lässt KI-Gegner 1 durch, beginnt das Grün eine neue Schlange von Spieler 1', () => {
    const { zustand } = klicke(erzeuge('farbendieb-abwehr'), stiehl(1, 0, 'neu'), durchlassen)
    expect(farben(zustand, 0)).toEqual([['Grün']])
    expect(farben(zustand, 1)).toEqual([['Grün', 'Grün']])
  })

  it('E8 Grenzfall: farbendieb-abwehr: das Blau von KI-Gegner 2 ist seine letzte Karte; seine Schlange verschwindet', () => {
    const { zustand } = klicke(erzeuge('farbendieb-abwehr'), stiehl(2, 0, 'neu'), durchlassen)
    expect(farben(zustand, 0)).toEqual([['Blau']])
    expect(zustand.spieler[2].schlangen).toEqual([])
  })
})
