import { describe, expect, it } from 'vitest'
import { ermittleEntscheider, werteSchlangen } from '../index'
import type { Spielzustand } from '../index'
import type { Kartenwahl } from '../testing/szenario'
import { alleLuecken, einfuegen, handkarte, luecken, mitEingefuegt, schlangenKarten } from './legen_hilfen'
import {
  ablage,
  aktionen,
  durchlassen,
  ereignisseVom,
  farbkarte,
  fuehreAus,
  FUENF,
  grund,
  hand,
  MIT_SCHUTZ,
  reaktion,
  tischMitHaenden as tisch,
  typen,
  verletzteInvarianten as verletzt,
  zugBeenden,
} from './zugablauf_hilfen'

/*
E5, Schlangenblockade (A5, A6 Beispiel 1, A7.2, A7.5, D9, D10, D16, D33): Sie
kommt an jede Stelle jeder bestehenden Schlange, auch an die Enden und in die
eigene. In eine fremde Schlange gelegt, ist sie abwehrbar; abgewehrt geht sie
wirkungslos auf den Ablagestapel dessen, der sie gespielt hat, und lässt sich
nicht auf ein anderes Ziel lenken.
*/

const BLOCKADE = 'Schlangenblockade'
const MIT_BLOCKADE: Kartenwahl[] = [BLOCKADE, 'Blau', 'Rot', 'Gelb', 'Grün']

function legeBlockade(zustand: Spielzustand, schlangenId: string, position: number) {
  return fuehreAus(zustand, einfuegen(zustand, 'BlockadeLegen', handkarte(zustand, 0, BLOCKADE), schlangenId, position))
}

describe('E5 Kriterium 3, A7.5/D9: an jede Stelle jeder Schlange', () => {
  it('A7.5/D9: aufgezählt ist jede Lücke 0 bis Länge jeder Schlange am Tisch, auch die Enden und die eigene', () => {
    const zustand = tisch([MIT_BLOCKADE, FUENF, FUENF]).schlange(0, ['Blau']).schlange(2, ['Rot', 'Rot', 'Rot']).zustand()
    expect(luecken(zustand, 'BlockadeLegen', handkarte(zustand, 0, BLOCKADE))).toEqual(alleLuecken(zustand, ['schlange-1', 'schlange-2']))
  })

  it.each([0, 1, 2])('A7.5: in die eigene Schlange an Stelle %i, ohne Rückfrage, auch wenn der Gegner Farbenschutz hält', (position) => {
    const start = tisch([MIT_BLOCKADE, MIT_SCHUTZ]).schlange(0, ['Blau', 'Rot']).zustand()
    const blockade = handkarte(start, 0, BLOCKADE)
    const { zustand, ereignisse } = legeBlockade(start, 'schlange-1', position)
    expect(schlangenKarten(zustand, 0)).toEqual(mitEingefuegt(schlangenKarten(start, 0), position, blockade))
    expect(ereignisse).toEqual([
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: blockade, aktion: 'BlockadeLegen', nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position } },
    ])
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(verletzt(zustand)).toEqual([])
  })

  it('A7.5 Beispiel: zwischen die erste und die zweite rote Karte des Gegners: Rot – Blockade – Rot – Rot zählt keine Punkte mehr', () => {
    const start = tisch([MIT_BLOCKADE, FUENF]).schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    expect(werteSchlangen(start.spieler[1].schlangen, false).gruppenPunkte).toBe(3)
    const angesagt = legeBlockade(start, 'schlange-1', 1).zustand
    const { zustand, ereignisse } = fuehreAus(angesagt, durchlassen(angesagt))
    expect(zustand.spieler[1].schlangen[0].karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name))).toEqual(['Rot', BLOCKADE, 'Rot', 'Rot'])
    expect(ereignisse).toEqual([
      expect.objectContaining({ typ: 'AnsageEntschieden', ohneWirkung: false, nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 1 } }),
    ])
    expect(werteSchlangen(zustand.spieler[1].schlangen, false).gruppenPunkte).toBe(0)
    expect(verletzt(zustand)).toEqual([])
  })

  it('A7.5: die Blockade bleibt liegen, auch nach dem Ende des Zuges', () => {
    const start = tisch([MIT_BLOCKADE, FUENF]).schlange(0, ['Blau', 'Blau']).zustand()
    const blockade = handkarte(start, 0, BLOCKADE)
    const gelegt = legeBlockade(start, 'schlange-1', 1).zustand
    const naechster = fuehreAus(gelegt, zugBeenden(gelegt)).zustand
    expect(naechster.zug.spielerIndex).toBe(1)
    expect(schlangenKarten(naechster, 0)[1]).toBe(blockade)
  })

  it('A7.5/U12: eine Stelle ausserhalb der Schlange wird mit Grund abgelehnt', () => {
    const zustand = tisch([MIT_BLOCKADE, FUENF]).schlange(1, ['Blau']).zustand()
    const blockade = handkarte(zustand, 0, BLOCKADE)
    expect(grund(zustand, { typ: 'BlockadeLegen', spielerId: 'spieler-1', karteId: blockade, schlangenId: 'schlange-1', position: 2 })).toMatch(
      /Stelle 2 gibt es in schlange-1 nicht: erlaubt sind 0 bis 1 \(A7\.5\)/,
    )
  })
})

describe('E5 Grenzfall, D16: ohne Schlange am Tisch', () => {
  it('D16/D13: die Blockade hat kein Ziel und lässt sich nur wirkungslos ablegen', () => {
    const zustand = tisch([MIT_BLOCKADE, FUENF]).zustand()
    const blockade = handkarte(zustand, 0, BLOCKADE)
    expect(aktionen(zustand, 'BlockadeLegen')).toEqual([])
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen')).toEqual([{ typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: blockade }])
    expect(grund(zustand, { typ: 'BlockadeLegen', spielerId: 'spieler-1', karteId: blockade, schlangenId: 'schlange-1', position: 0 })).toMatch(
      /Die Schlange schlange-1 gibt es nicht.*bestehende Schlange \(D16\)/,
    )
  })
})

describe('E5 Kriterium 3, A6 Beispiel 1/A7.2: Schlangenblockade und Farbenschutz', () => {
  /** Spieler A (Index 0) mit zwei Blockaden, B (1) mit Farbenschutz und einer Schlange, C (2) mit einer Schlange. */
  function beispiel1(): Spielzustand {
    return tisch([[BLOCKADE, BLOCKADE, 'Blau', 'Rot', 'Gelb'], MIT_SCHUTZ, FUENF]).schlange(1, ['Rot', 'Rot']).schlange(2, ['Gelb']).zustand()
  }

  it('A6 Beispiel 1, Schritte 1 bis 3: A sagt die Blockade auf die Schlange von B an, B wehrt ab; beide Karten auf dem Ablagestapel ihres Spielers, keine Wirkung', () => {
    const start = beispiel1()
    const blockade = handkarte(start, 0, BLOCKADE)
    const schutz = handkarte(start, 1, 'Farbenschutz')
    const angesagt = legeBlockade(start, 'schlange-1', 0)
    expect(angesagt.ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(ereignisseVom(angesagt.ereignisse, 'KarteAngesagt')[0].betroffene, 'A6: nur B ist betroffen').toEqual([1])
    const { zustand, ereignisse } = fuehreAus(angesagt.zustand, reaktion(angesagt.zustand, true))
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')).toEqual([
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: blockade, abgewehrt: [1], ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0 } },
    ])
    expect(ablage(zustand, 0)).toEqual([blockade])
    expect(ablage(zustand, 1)).toEqual([schutz])
    expect(schlangenKarten(zustand, 1), 'A7.2: die Schlange von B bleibt unberührt').toEqual(schlangenKarten(start, 1))
    expect(verletzt(zustand)).toEqual([])
  })

  it('A6 Beispiel 1, Schritt 3: A darf die Blockade nicht gegen einen anderen Spieler richten, auch nicht mit seiner zweiten Blockade', () => {
    const start = beispiel1()
    const blockade = handkarte(start, 0, BLOCKADE)
    const angesagt = legeBlockade(start, 'schlange-1', 0).zustand
    const abgewehrt = fuehreAus(angesagt, reaktion(angesagt, true)).zustand
    expect(typen(abgewehrt)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
    expect(grund(abgewehrt, { typ: 'BlockadeLegen', spielerId: 'spieler-1', karteId: blockade, schlangenId: 'schlange-2', position: 0 })).toMatch(
      new RegExp(`${blockade} liegt nicht auf der Hand von Spieler 1`),
    )
    const zweite = handkarte(abgewehrt, 0, BLOCKADE)
    expect(grund(abgewehrt, { typ: 'BlockadeLegen', spielerId: 'spieler-1', karteId: zweite, schlangenId: 'schlange-2', position: 0 })).toMatch(
      /schon eine Sonderkarte gespielt.*\(A5, D12\)/,
    )
  })

  it('A6 Beispiel 1, Schritt 4: A füllt am Ende seines Zuges auf, B erst zu Beginn seines nächsten Zuges', () => {
    const start = beispiel1()
    const angesagt = legeBlockade(start, 'schlange-1', 0).zustand
    const abgewehrt = fuehreAus(angesagt, reaktion(angesagt, true)).zustand
    expect(hand(abgewehrt, 1), 'A6: B zieht nach der Abwehr nicht nach').toHaveLength(4)
    const nachA = fuehreAus(abgewehrt, zugBeenden(abgewehrt))
    expect(nachA.ereignisse, 'A6: A füllt beim Beenden auf, B erst, wenn sein Zug beginnt').toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
      { typ: 'KartenGezogen', spielerIndex: 1, anzahl: 1 },
    ])
    expect(hand(nachA.zustand, 1)).toHaveLength(5)
  })

  it('A7.2 Beispiel: B spielt die Blockade gegen A, A wehrt ab: die Blockade auf den Ablagestapel von B, A bleibt unberührt', () => {
    const start = tisch([MIT_SCHUTZ, MIT_BLOCKADE]).schlange(0, ['Blau', 'Blau']).amZug(1).zustand()
    const blockade = handkarte(start, 1, BLOCKADE)
    const angesagt = fuehreAus(start, einfuegen(start, 'BlockadeLegen', blockade, 'schlange-1', 1)).zustand
    expect(ermittleEntscheider(angesagt)).toBe(0)
    const { zustand } = fuehreAus(angesagt, reaktion(angesagt, true))
    expect(ablage(zustand, 1)).toEqual([blockade])
    expect(schlangenKarten(zustand, 0)).toEqual(schlangenKarten(start, 0))
    expect(ermittleEntscheider(zustand)).toBe(1)
  })

  it('D33: ein Gegner ohne Farbenschutz wird gefragt und kann nur durchlassen; danach liegt die Blockade in seiner Schlange', () => {
    const start = tisch([MIT_BLOCKADE, FUENF]).schlange(1, ['Rot']).zustand()
    const blockade = handkarte(start, 0, BLOCKADE)
    const angesagt = legeBlockade(start, 'schlange-1', 1).zustand
    expect(aktionen(angesagt)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
    const { zustand } = fuehreAus(angesagt, durchlassen(angesagt))
    expect(schlangenKarten(zustand, 1)).toEqual([...schlangenKarten(start, 1), blockade])
    expect(fuehreAus(zustand, farbkarte(zustand)).zustand.schwebend).toBeNull()
  })
})
