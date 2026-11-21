import { describe, expect, it } from 'vitest'
import { ermittleEntscheider, werteSchlangen } from '../index'
import type { Spielzustand } from '../index'
import type { Kartenwahl } from '../testing/szenario'
import { alleLuecken, einfuegen, handkarte, lege, luecken, mitEingefuegt, schlangenKarten, schlangenNamen } from './legen_hilfen'
import {
  ablage,
  aktionen,
  durchlassen,
  fuehreAus,
  FUENF,
  grund,
  hand,
  MIT_SCHUTZ,
  reaktion,
  tischMitHaenden as tisch,
  typen,
  verletzteInvarianten as verletzt,
} from './zugablauf_hilfen'

/*
E5, Regenbogenschlange (A5, A7.3, D9, D10, D16, D33): Sie ist die Sonderkarte
des Zuges und kommt an jede Stelle jeder bestehenden Schlange, auch einer
gegnerischen. Eine neue Schlange beginnt sie nicht. Legt ein Gegner sie in meine
Schlange, werde ich gefragt und kann mit Farbenschutz abwehren. Was sie in der
Wertung zählt, prüft E10 (`wertung_*.test.ts`); hier steht nur, dass das Legen
die Beispiele der Website herstellt.
*/

const RS = 'Regenbogenschlange'
const MIT_RS: Kartenwahl[] = [RS, 'Blau', 'Rot', 'Gelb', 'Grün']

function legeRs(zustand: Spielzustand, schlangenId: string, position: number) {
  return lege(zustand, 'RegenbogenschlangeLegen', RS, schlangenId, position)
}

describe('E5 Kriterium 2, A7.3/D9: an jede Stelle jeder Schlange', () => {
  it('A5/A7.3/D9: aufgezählt ist jede Lücke 0 bis Länge jeder Schlange am Tisch, eigene und gegnerische', () => {
    const zustand = tisch([MIT_RS, FUENF, FUENF]).schlange(0, ['Blau', 'Rot']).schlange(1, ['Gelb']).schlange(2, ['Grün', 'Braun', 'Violett']).zustand()
    expect(luecken(zustand, 'RegenbogenschlangeLegen', handkarte(zustand, 0, RS))).toEqual(alleLuecken(zustand, ['schlange-1', 'schlange-2', 'schlange-3']))
  })

  it.each([
    ['am Anfang', 0],
    ['in der Mitte', 1],
    ['am Ende', 2],
  ])('A7.3: in der eigenen Schlange %s (Stelle %i): dort liegt sie, niemand wird gefragt', (_wo, position) => {
    const start = tisch([MIT_RS, MIT_SCHUTZ]).schlange(0, ['Blau', 'Rot']).zustand()
    const rs = handkarte(start, 0, RS)
    const { zustand, ereignisse } = legeRs(start, 'schlange-1', position)
    expect(schlangenKarten(zustand, 0)).toEqual(mitEingefuegt(schlangenKarten(start, 0), position, rs))
    expect(ereignisse, 'A6: in der eigenen Schlange trifft sie keinen Mitspieler, auch keinen mit Farbenschutz').toEqual([
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: rs, aktion: 'RegenbogenschlangeLegen', nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position } },
    ])
    expect(zustand.schwebend).toBeNull()
    expect(verletzt(zustand)).toEqual([])
  })

  it('A7.3 Beispiel 1: an Blau-Blau angelegt ergibt sie Blau-Blau-Regenbogenschlange, eine Dreiergruppe mit 2 Punkten', () => {
    const start = tisch([MIT_RS, FUENF]).schlange(0, ['Blau', 'Blau']).zustand()
    const { zustand } = legeRs(start, 'schlange-1', 2)
    expect(werteSchlangen(zustand.spieler[0].schlangen, false).gruppenPunkte).toBe(2)
  })

  it('A7.3 Beispiel 3: zwischen Rot-Rot und Braun-Braun gelegt ergibt sie 4 Punkte (zwei braune Karten zu je 2)', () => {
    const start = tisch([MIT_RS, FUENF]).schlange(0, ['Rot', 'Rot', 'Braun', 'Braun']).zustand()
    const { zustand } = legeRs(start, 'schlange-1', 2)
    expect(schlangenNamen(zustand, 0)).toEqual(['Rot', 'Rot', RS, 'Braun', 'Braun'])
    expect(werteSchlangen(zustand.spieler[0].schlangen, false).gruppenPunkte).toBe(4)
  })

  it('A7.3/A7.7: neben einer Farbenfusion: zwischen die fusionierten Karten kommt sie nicht, die Fusion bleibt eine Einheit', () => {
    const start = tisch([MIT_RS, FUENF]).schlange(0, ['Blau', { fusion: ['Gelb', 'Gelb'] }]).zustand()
    expect(luecken(start, 'RegenbogenschlangeLegen', handkarte(start, 0, RS))).toEqual(['schlange-1 0', 'schlange-1 1', 'schlange-1 2'])
    const { zustand } = legeRs(start, 'schlange-1', 1)
    expect(zustand.spieler[0].schlangen[0].fusionen).toEqual(start.spieler[0].schlangen[0].fusionen)
    expect(verletzt(zustand)).toEqual([])
  })

  it('A7.3/D31: drei Joker nebeneinander: die dritte Regenbogenschlange darf neben zwei andere', () => {
    const start = tisch([MIT_RS, FUENF]).schlange(0, ['Blau', RS, RS, 'Gelb']).zustand()
    const rs = handkarte(start, 0, RS)
    const { zustand } = legeRs(start, 'schlange-1', 3)
    expect(schlangenNamen(zustand, 0)).toEqual(['Blau', RS, RS, RS, 'Gelb'])
    expect(schlangenKarten(zustand, 0)[3]).toBe(rs)
    expect(verletzt(zustand)).toEqual([])
  })

  it('A7.3/U12: eine Stelle ausserhalb der Schlange oder eine unbekannte Schlange wird mit Grund abgelehnt', () => {
    const zustand = tisch([MIT_RS, FUENF]).schlange(0, ['Blau', 'Rot']).zustand()
    const rs = handkarte(zustand, 0, RS)
    const aktion = { typ: 'RegenbogenschlangeLegen', spielerId: 'spieler-1', karteId: rs, schlangenId: 'schlange-1', position: 3 } as const
    expect(grund(zustand, aktion)).toMatch(/Stelle 3 gibt es in schlange-1 nicht: erlaubt sind 0 bis 2 \(A7\.3\)/)
    expect(grund(zustand, { ...aktion, schlangenId: 'schlange-7', position: 0 })).toMatch(/Die Schlange schlange-7 gibt es nicht/)
  })
})

describe('E5 Kriterium 2, D16: die Regenbogenschlange beginnt keine Schlange', () => {
  it('D16/D13: ohne Schlange am Tisch hat sie kein Ziel und lässt sich nur wirkungslos ablegen', () => {
    const zustand = tisch([MIT_RS, FUENF]).zustand()
    const rs = handkarte(zustand, 0, RS)
    expect(aktionen(zustand, 'RegenbogenschlangeLegen')).toEqual([])
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen')).toEqual([{ typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: rs }])
    expect(grund(zustand, { typ: 'RegenbogenschlangeLegen', spielerId: 'spieler-1', karteId: rs, schlangenId: 'schlange-1', position: 0 })).toMatch(
      /Die Schlange schlange-1 gibt es nicht.*bestehende Schlange \(D16\)/,
    )
  })

  it('D16/D9: hat nur der Gegner eine Schlange, geht sie nur dorthin; eine eigene Schlange entsteht nicht', () => {
    const start = tisch([MIT_RS, FUENF]).schlange(1, ['Gelb']).zustand()
    expect(luecken(start, 'RegenbogenschlangeLegen', handkarte(start, 0, RS))).toEqual(['schlange-1 0', 'schlange-1 1'])
    expect(aktionen(start, 'SonderkarteWirkungslosAblegen'), 'D25: mit möglichem Ziel kein wirkungsloses Ablegen').toEqual([])
    const angesagt = legeRs(start, 'schlange-1', 1).zustand
    const nach = fuehreAus(angesagt, durchlassen(angesagt)).zustand
    expect(nach.spieler[0].schlangen).toEqual([])
    expect(nach.spieler[1].schlangen[0].karten).toHaveLength(2)
  })
})

describe('E5 Kriterium 2, A5/D12: die Sonderkarte des Zuges', () => {
  it('A7.3/D12: nach der Regenbogenschlange keine weitere Sonderkarte, eine Farbkarte schon', () => {
    const start = tisch([[RS, 'Schlangenblockade', 'Blau'], FUENF]).schlange(0, ['Rot']).zustand()
    const { zustand } = legeRs(start, 'schlange-1', 1)
    expect(typen(zustand)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
  })

  it('A5: erst die Farbkarte, dann die Regenbogenschlange', () => {
    const start = tisch([[RS, 'Blau'], FUENF]).schlange(0, ['Rot']).zustand()
    const blau = handkarte(start, 0, 'Blau')
    const nachFarbkarte = fuehreAus(start, aktionen(start, 'FarbkarteLegen').find((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.karteId === blau && aktion.ziel.art === 'schlange')!).zustand
    expect(typen(nachFarbkarte)).toEqual(['RegenbogenschlangeLegen', 'ZugBeenden'])
    expect(legeRs(nachFarbkarte, 'schlange-1', 1).zustand.zug).toMatchObject({ gespielteFarbkarten: 1, gespielteSonderkarten: 1 })
  })
})

describe('E5 Kriterium 2, D10/A6: in der Schlange eines Gegners abwehrbar', () => {
  it('D10/A7.2: der Gegner wehrt ab: keine Wirkung, die Regenbogenschlange auf dem Ablagestapel des Spielers, der Farbenschutz auf seinem', () => {
    const start = tisch([MIT_RS, MIT_SCHUTZ]).schlange(1, ['Gelb', 'Gelb']).zustand()
    const rs = handkarte(start, 0, RS)
    const schutz = handkarte(start, 1, 'Farbenschutz')
    const angesagt = legeRs(start, 'schlange-1', 2)
    expect(angesagt.ereignisse).toEqual([
      { typ: 'KarteAngesagt', spielerIndex: 0, karteId: rs, ansage: einfuegen(start, 'RegenbogenschlangeLegen', rs, 'schlange-1', 2), betroffene: [1] },
      { typ: 'AbwehrGefragt', spielerIndex: 1, karteId: rs },
    ])
    expect(schlangenKarten(angesagt.zustand, 1), 'A6: vor der Entscheidung wirkt sie nicht').toEqual(schlangenKarten(start, 1))
    const { zustand, ereignisse } = fuehreAus(angesagt.zustand, reaktion(angesagt.zustand, true))
    expect(ereignisse).toEqual([
      { typ: 'Abgewehrt', spielerIndex: 1, karteId: schutz, gegen: rs },
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: rs, abgewehrt: [1], ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
    expect(schlangenKarten(zustand, 1)).toEqual(schlangenKarten(start, 1))
    expect(ablage(zustand, 0)).toEqual([rs])
    expect(ablage(zustand, 1)).toEqual([schutz])
    expect(typen(zustand), 'A6: die Sonderkarte des Zuges ist verbraucht').toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(verletzt(zustand)).toEqual([])
  })

  it('D9/D33: lässt der Gegner durch, liegt sie in seiner Schlange und nützt ihm (Gelb-Gelb-Regenbogenschlange: 2 Punkte für ihn)', () => {
    const start = tisch([MIT_RS, MIT_SCHUTZ]).schlange(1, ['Gelb', 'Gelb']).zustand()
    const rs = handkarte(start, 0, RS)
    const angesagt = legeRs(start, 'schlange-1', 2).zustand
    const { zustand, ereignisse } = fuehreAus(angesagt, durchlassen(angesagt))
    expect(ereignisse).toEqual([
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: rs, abgewehrt: [], ohneWirkung: false, nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 2 } },
    ])
    expect(schlangenKarten(zustand, 1)).toEqual([...schlangenKarten(start, 1), rs])
    expect(werteSchlangen(zustand.spieler[1].schlangen, false).gruppenPunkte).toBe(2)
    expect(ablage(zustand, 0)).toEqual([])
    expect(verletzt(zustand)).toEqual([])
  })

  it('D33: auch ein Gegner ohne Farbenschutz wird gefragt und kann nur durchlassen', () => {
    const start = tisch([MIT_RS, FUENF]).schlange(1, ['Gelb']).zustand()
    const angesagt = legeRs(start, 'schlange-1', 0).zustand
    expect(ermittleEntscheider(angesagt)).toBe(1)
    expect(aktionen(angesagt)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
  })

  it('A6/D10: bei drei Spielern ist nur der Besitzer der Schlange betroffen, nicht der andere Mitspieler', () => {
    const start = tisch([MIT_RS, MIT_SCHUTZ, MIT_SCHUTZ]).schlange(1, ['Blau']).schlange(2, ['Gelb']).zustand()
    const { ereignisse, zustand } = legeRs(start, 'schlange-2', 1)
    expect(ereignisse[0]).toMatchObject({ typ: 'KarteAngesagt', betroffene: [2] })
    expect(ermittleEntscheider(zustand)).toBe(2)
    expect(hand(zustand, 1)).toEqual(hand(start, 1))
  })
})
