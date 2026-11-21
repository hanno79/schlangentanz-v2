import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { findeSzenario, SZENARIEN } from './szenarien'

/*
E4: Die Szenarien `schlangengrube`, `abwehr-schlangengrube` und `doppelangriff`
lassen sich am Entwicklertisch so durchklicken, wie ihre Erwartung es sagt.
Jeder Schritt hier ist ein Knopf, den die Engine aufzählt.
*/

function erzeuge(name: string): Spielzustand {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

type Wahl = (aktion: SpielAktion) => boolean

const grubeAuf = (zielSpielerId: string): Wahl => (aktion) => aktion.typ === 'SchlangengrubeSpielen' && aktion.zielSpielerId === zielSpielerId
const abwehren: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null
const durchlassen: Wahl = (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null
const farbkarte: Wahl = (aktion) => aktion.typ === 'FarbkarteLegen'
const beenden: Wahl = (aktion) => aktion.typ === 'ZugBeenden'

/** Klickt nacheinander die erste aufgezählte Aktion, die zur Wahl passt, und sammelt die Ereignisse. */
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

describe('E4: Szenarien der Abwehr und der Schlangengrube', () => {
  it('E4: die Szenarien des Tasks sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['schlangengrube', 'abwehr-schlangengrube', 'doppelangriff']))
  })

  it('A7.6/D33: schlangengrube: zwei Ziele; KI-Gegner 1 ohne Farbenschutz wird gefragt und kann nur durchlassen, setzt dann aus, die Grube geht an Spieler 1', () => {
    const start = erzeuge('schlangengrube')
    expect(ermittleAktionen(start).filter((aktion) => aktion.typ === 'SchlangengrubeSpielen')).toHaveLength(2)
    const angesagt = klicke(start, grubeAuf('spieler-2'))
    expect(ereignistypen(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(ermittleEntscheider(angesagt.zustand), 'D33: auch ohne Farbenschutz wird KI-Gegner 1 gefragt').toBe(1)
    expect(ermittleAktionen(angesagt.zustand)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
    const durch = klicke(angesagt.zustand, durchlassen)
    expect(ereignistypen(durch.ereignisse)).toEqual(['AnsageEntschieden'])
    expect(durch.zustand.ausliegendeGruben).toMatchObject([{ gespieltVon: 0, vor: 1 }])
    const ende = klicke(durch.zustand, farbkarte, beenden)
    expect(ereignistypen(ende.ereignisse)).toEqual(['KarteGespielt', 'KartenGezogen', 'Ausgesetzt', 'ZugBegonnen'])
    expect(ende.zustand.zug.spielerIndex).toBe(2)
    expect(ende.zustand.spieler[0].ablagestapel.map((karte) => karte.id)).toEqual([durch.zustand.ausliegendeGruben[0].karte.id])
  })

  it('A7.6 Beispiel 2: abwehr-schlangengrube: KI-Gegner 1 wehrt ab, beide Karten liegen auf ihren Ablagestapeln, er spielt normal und füllt dann auf', () => {
    const start = erzeuge('abwehr-schlangengrube')
    const angesagt = klicke(start, grubeAuf('spieler-2'))
    expect(ermittleEntscheider(angesagt.zustand), 'A6: KI-Gegner 1 entscheidet').toBe(1)
    expect(ermittleAktionen(angesagt.zustand).map((aktion) => aktion.typ)).toEqual(['Reagieren', 'Reagieren'])
    const abwehr = klicke(angesagt.zustand, abwehren)
    expect(ereignistypen(abwehr.ereignisse)).toEqual(['Abgewehrt', 'AnsageEntschieden'])
    expect(abwehr.zustand.spieler[1].hand).toHaveLength(4)
    expect(abwehr.zustand.spieler.map((spieler) => spieler.ablagestapel.map((karte) => karte.typ === 'Sonderkarte' && karte.name))).toEqual([
      ['Schlangengrube'],
      ['Farbenschutz'],
      [],
    ])
    const ende = klicke(abwehr.zustand, farbkarte, beenden)
    expect(ende.ereignisse).toContainEqual({ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 })
    expect(ende.ereignisse).toContainEqual({ typ: 'KartenGezogen', spielerIndex: 1, anzahl: 1 })
    expect(ereignistypen(ende.ereignisse)).not.toContain('Ausgesetzt')
  })

  it('A6: doppelangriff: KI-Gegner 2 wehrt die erste Grube ab, zieht nicht nach und kann die zweite derselben Runde nicht abwehren', () => {
    const start = erzeuge('doppelangriff')
    const erster = klicke(start, grubeAuf('spieler-3'), abwehren, farbkarte, beenden)
    expect(erster.zustand.spieler[2].hand).toHaveLength(4)
    expect(erster.zustand.zug.spielerIndex).toBe(1)
    const zweiter = klicke(erster.zustand, grubeAuf('spieler-3'))
    expect(ermittleAktionen(zweiter.zustand), 'A6, D33: ohne Farbenschutz kann KI-Gegner 2 nur durchlassen').toEqual([
      { typ: 'Reagieren', spielerId: 'spieler-3', farbenschutzId: null },
    ])
    const ende = klicke(zweiter.zustand, durchlassen, farbkarte, beenden)
    expect(ende.ereignisse).toContainEqual(expect.objectContaining({ typ: 'Ausgesetzt', spielerIndex: 2, ablagestapelVon: 1 }))
    expect(ende.zustand.spieler[2].hand, 'D18: kein Auffüllen beim Aussetzen').toHaveLength(4)
    expect(ende.zustand.zug.spielerIndex).toBe(0)
  })
})
