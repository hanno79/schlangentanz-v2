import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider } from '../engine'
import type { Ereignis, FusionLegenAktion, SpielAktion, Spielkarte, Spielzustand } from '../engine'
import { SZENARIEN } from './szenarien'
import { abwehren, durchlassen, erzeuge, klicke, waehle } from './szenarienTesthilfe'

/*
E7: Die Szenarien `fusion-eigen` und `fusion-beim-gegner` lassen sich am
Entwicklertisch so durchklicken, wie ihre Erwartung es sagt. Jeder Schritt hier
ist ein Knopf, den die Engine aufzählt, in der Reihenfolge der Knöpfe.
*/

const fusion = (aktion: SpielAktion): aktion is FusionLegenAktion => aktion.typ === 'FusionLegen'
/** Klickt den `nummer`-ten aufgezählten Fusionsknopf (ab 1). */
const legeFusion = (zustand: Spielzustand, nummer: number) => anwendeAktion(zustand, waehle(zustand, fusion, nummer))

const typen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)
const art = (karte: Spielkarte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)
const schlange = (zustand: Spielzustand, spieler: number) => zustand.spieler[spieler].schlangen[0]
const punkte = (zustand: Spielzustand, spieler: number) => berechneEndwertung(zustand).spieler[spieler].gruppenPunkte

describe('E7: Szenarien der Farbenfusion', () => {
  it('E7: die Szenarien des Tasks sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['fusion-eigen', 'fusion-beim-gegner']))
  })

  it('A7.7/D25: fusion-eigen: zwei Ziele je Fusion, kein wirkungsloses Ablegen; auf die Gelben wirkt sie sofort, danach keine zweite', () => {
    const start = erzeuge('fusion-eigen')
    const knoepfe = ermittleAktionen(start).filter(fusion)
    expect(knoepfe.map((aktion) => aktion.kartenIds.map((id) => id.replace(/-\d+$/, '')))).toEqual([
      ['blau', 'blau'],
      ['gelb', 'gelb'],
      ['blau', 'blau'],
      ['gelb', 'gelb'],
    ])
    expect(ermittleAktionen(start).filter((aktion) => aktion.typ === 'SonderkarteWirkungslosAblegen')).toEqual([])
    const { zustand, ereignisse } = legeFusion(start, 2)
    expect(typen(ereignisse)).toEqual(['KartenVersetzt', 'KarteGespielt'])
    expect(ereignisse[1]).toMatchObject({ nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 2 } })
    expect(schlange(zustand, 0).karten.map(art)).toEqual(['Blau', 'Blau', 'Farbenfusion'])
    expect(schlange(zustand, 0).fusionen[0].unter.map(art)).toEqual(['Gelb', 'Gelb'])
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect([...new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))]).toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(punkte(zustand, 0)).toBe(4)
  })

  it('D10/A7.2: fusion-beim-gegner: KI-Gegner 1 wehrt ab, seine Dreiergruppe bleibt, die Fusion liegt bei Spieler 1', () => {
    const start = erzeuge('fusion-beim-gegner')
    expect(ermittleAktionen(start).filter(fusion).map((aktion) => aktion.schlangenId)).toEqual([
      'schlange-1',
      'schlange-1',
      'schlange-2',
    ])
    expect(punkte(start, 1)).toBe(3)
    const angesagt = legeFusion(start, 1)
    expect(typen(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(angesagt.ereignisse[0]).toMatchObject({ betroffene: [1] })
    expect(ermittleEntscheider(angesagt.zustand)).toBe(1)
    const abwehr = klicke(angesagt.zustand, abwehren)
    expect(typen(abwehr.ereignisse)).toEqual(['Abgewehrt', 'AnsageEntschieden'])
    expect(schlange(abwehr.zustand, 1).karten.map(art)).toEqual(['Rot', 'Rot', 'Rot'])
    expect(abwehr.zustand.spieler.map((spieler) => spieler.ablagestapel.map(art))).toEqual([['Farbenfusion'], ['Farbenschutz'], []])
    expect(punkte(abwehr.zustand, 1)).toBe(3)
  })

  it('D9/D30: fusion-beim-gegner: durchgelassen liegt die Fusion auf zwei Roten, die Dreiergruppe bringt nichts mehr', () => {
    const angesagt = legeFusion(erzeuge('fusion-beim-gegner'), 1)
    const durch = klicke(angesagt.zustand, durchlassen)
    expect(typen(durch.ereignisse)).toEqual(['KartenVersetzt', 'AnsageEntschieden'])
    expect(durch.ereignisse[1]).toMatchObject({ ohneWirkung: false, nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 0 } })
    expect(schlange(durch.zustand, 1).karten.map(art)).toEqual(['Farbenfusion', 'Rot'])
    expect(schlange(durch.zustand, 1).fusionen[0].unter.map(art)).toEqual(['Rot', 'Rot'])
    expect(punkte(durch.zustand, 1)).toBe(0)
  })

  it('D33: fusion-beim-gegner: auf die Gelben von KI-Gegner 2 wird nur er gefragt und kann ohne Farbenschutz nur durchlassen', () => {
    const angesagt = legeFusion(erzeuge('fusion-beim-gegner'), 3)
    expect(angesagt.ereignisse[0]).toMatchObject({ betroffene: [2] })
    expect(ermittleAktionen(angesagt.zustand)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-3', farbenschutzId: null }])
    const durch = klicke(angesagt.zustand, durchlassen)
    expect(schlange(durch.zustand, 2).karten.map(art)).toEqual(['Farbenfusion', 'Blau'])
  })
})
