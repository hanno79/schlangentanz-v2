/*
Author: Claude Code (G-11)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Sonderkarten am Brett anspielen — Karte wählen, Ziel anklicken.

Farbkarten spielt man am Brett: Karte wählen, Startkreis oder Anlegeplatz
anklicken. Sonderkarten gingen bisher nur über die Aktionsliste — dort musste
man aus bis zu 45 Einträgen den heraussuchen, der den richtigen Gegner meint.
Zwei Wege für dieselbe Sache, und der unbequemere war der einzige.

Dieses Modul liefert die Umkehrung: Zu den legalen Aktionen einer gewählten
Sonderkarte und den bereits geklickten Zielen sagt es, **was jetzt anklickbar
ist** und **wann die Auswahl vollständig ist**.

Gebaut wird dabei keine Aktion. Die Engine enumeriert bereits jede legale
Kombination mit allen Zielen; hier wird gefiltert, nicht konstruiert. Alles
andere hieße, die Regeln ein zweites Mal zu schreiben.

Ziele je Karte, aus `legalActions.ts` abgelesen:

| Karte | Ziele in dieser Reihenfolge |
|---|---|
| Schlangengrube | ein Gegner |
| Schlangenblockade | eine gegnerische Schlange — **keine Einfügeposition** |
| Farbenschutz | eine eigene Schlange |
| Farbenfusion | eine Karte in einer eigenen Schlange |
| Farbendieb | eine gegnerische Farbkarte, dann ein Einfügeplatz bei sich |
| Schlangenfrass | eine eigene Karte **oder** zwei gegnerische |
*/

import { describe, expect, it } from 'vitest'
import type { SpielAktion } from '../engine'
import { ermittleZielangebot, zielSchluessel } from './sonderkartenziele'

const GRUBE: SpielAktion = {
  typ: 'SonderkarteSpielen',
  spielerId: 'ich',
  handkartenId: 'grube',
  zielSpielerId: 'gegner-a',
}
const GRUBE_B: SpielAktion = { ...GRUBE, zielSpielerId: 'gegner-b' }

const BLOCKADE: SpielAktion = {
  typ: 'SchlangenblockadeSpielen',
  spielerId: 'ich',
  handkartenId: 'blockade',
  zielSpielerId: 'gegner-a',
  zielSchlangenId: 's-a1',
}

const FRASS_EIGEN: SpielAktion = {
  typ: 'SchlangenfrassSpielen',
  spielerId: 'ich',
  handkartenId: 'frass',
  ziele: [{ spielerId: 'ich', schlangenId: 'meine-1', kartenId: 'k1' }],
}
const FRASS_ZWEI: SpielAktion = {
  typ: 'SchlangenfrassSpielen',
  spielerId: 'ich',
  handkartenId: 'frass',
  ziele: [
    { spielerId: 'gegner-a', schlangenId: 's-a1', kartenId: 'g1' },
    { spielerId: 'gegner-b', schlangenId: 's-b1', kartenId: 'g2' },
  ],
}

const DIEB: SpielAktion = {
  typ: 'FarbendiebSpielen',
  spielerId: 'ich',
  handkartenId: 'dieb',
  zielSpielerId: 'gegner-a',
  zielSchlangenId: 's-a1',
  zielKartenId: 'g1',
  eigeneSchlangenId: 'meine-1',
  einfügeIndex: 2,
}

describe('ermittleZielangebot', () => {
  it('bietet für die Schlangengrube jeden erlaubten Gegner an', () => {
    const angebot = ermittleZielangebot([GRUBE, GRUBE_B], [])

    expect(angebot.offeneZiele).toEqual([
      { art: 'gegnerPlakette', spielerId: 'gegner-a' },
      { art: 'gegnerPlakette', spielerId: 'gegner-b' },
    ])
    expect(angebot.fertig).toBeNull()
  })

  it('führt die Schlangengrube nach einem Klick aus', () => {
    const angebot = ermittleZielangebot([GRUBE, GRUBE_B], [{ art: 'gegnerPlakette', spielerId: 'gegner-b' }])

    expect(angebot.fertig).toBe(GRUBE_B)
    expect(angebot.offeneZiele).toEqual([])
  })

  it('zielt bei der Schlangenblockade auf die ganze gegnerische Schlange', () => {
    // Die Engine kennt für die Blockade keine Einfügeposition (legalActions.ts).
    const angebot = ermittleZielangebot([BLOCKADE], [])

    expect(angebot.offeneZiele).toEqual([{ art: 'gegnerSchlange', spielerId: 'gegner-a', schlangenId: 's-a1' }])
  })

  it('nimmt beim Schlangenfrass eine einzelne eigene Karte sofort an', () => {
    const angebot = ermittleZielangebot(
      [FRASS_EIGEN, FRASS_ZWEI],
      [{ art: 'karte', spielerId: 'ich', schlangenId: 'meine-1', kartenId: 'k1' }],
    )

    expect(angebot.fertig).toBe(FRASS_EIGEN)
  })

  it('verlangt beim Schlangenfrass gegen Gegner ein zweites Ziel', () => {
    const nachErstem = ermittleZielangebot(
      [FRASS_EIGEN, FRASS_ZWEI],
      [{ art: 'karte', spielerId: 'gegner-a', schlangenId: 's-a1', kartenId: 'g1' }],
    )

    expect(nachErstem.fertig).toBeNull()
    expect(nachErstem.offeneZiele).toEqual([
      { art: 'karte', spielerId: 'gegner-b', schlangenId: 's-b1', kartenId: 'g2' },
    ])
  })

  it('führt den Schlangenfrass nach dem zweiten gegnerischen Ziel aus', () => {
    const angebot = ermittleZielangebot(
      [FRASS_EIGEN, FRASS_ZWEI],
      [
        { art: 'karte', spielerId: 'gegner-a', schlangenId: 's-a1', kartenId: 'g1' },
        { art: 'karte', spielerId: 'gegner-b', schlangenId: 's-b1', kartenId: 'g2' },
      ],
    )

    expect(angebot.fertig).toBe(FRASS_ZWEI)
  })

  it('bietet beim Farbendieb erst die Beute, dann den Einfügeplatz', () => {
    const zuerst = ermittleZielangebot([DIEB], [])
    expect(zuerst.offeneZiele).toEqual([
      { art: 'karte', spielerId: 'gegner-a', schlangenId: 's-a1', kartenId: 'g1' },
    ])
    expect(zuerst.fertig).toBeNull()

    const danach = ermittleZielangebot([DIEB], [
      { art: 'karte', spielerId: 'gegner-a', schlangenId: 's-a1', kartenId: 'g1' },
    ])
    expect(danach.offeneZiele).toEqual([{ art: 'einfuegeplatz', schlangenId: 'meine-1', index: 2 }])
    expect(danach.fertig).toBeNull()
  })

  it('meldet nichts, wenn die bisherige Auswahl zu keiner Aktion passt', () => {
    const angebot = ermittleZielangebot([GRUBE], [{ art: 'gegnerPlakette', spielerId: 'unbekannt' }])

    expect(angebot.offeneZiele).toEqual([])
    expect(angebot.fertig).toBeNull()
  })

  it('nennt jedes Ziel höchstens einmal, auch wenn mehrere Aktionen darauf zeigen', () => {
    const zweiteMoeglichkeit: SpielAktion = { ...DIEB, einfügeIndex: 0 }
    const angebot = ermittleZielangebot([DIEB, zweiteMoeglichkeit], [])

    expect(angebot.offeneZiele).toHaveLength(1)
  })

  it('ignoriert Aktionen ohne Brettziel — die bleiben Sache der Aktionsliste', () => {
    const verdoppler: SpielAktion = { typ: 'VerdopplerSpielen', spielerId: 'ich', handkartenId: 'v' }

    const angebot = ermittleZielangebot([verdoppler], [])

    expect(angebot.offeneZiele).toEqual([])
    expect(angebot.fertig).toBeNull()
  })
})

describe('zielSchluessel', () => {
  it('unterscheidet zwei Karten derselben Schlange', () => {
    const a = zielSchluessel({ art: 'karte', spielerId: 'ich', schlangenId: 's', kartenId: 'k1' })
    const b = zielSchluessel({ art: 'karte', spielerId: 'ich', schlangenId: 's', kartenId: 'k2' })

    expect(a).not.toBe(b)
  })

  it('gibt für dasselbe Ziel denselben Schlüssel', () => {
    const ziel = { art: 'einfuegeplatz', schlangenId: 's', index: 3 } as const

    expect(zielSchluessel(ziel)).toBe(zielSchluessel({ ...ziel }))
  })
})
