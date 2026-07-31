/*
Author: Claude Code (G-3)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Zuordnung von Brettzielen zu Aktionen.

Der wichtigste Fall ist die Unterscheidung von links und rechts. Eine Schlange
[Blau, Rot] wird durch Anlegen links zu [Gelb, Blau, Rot], rechts zu
[Blau, Rot, Gelb] — verschiedene Farbgruppen, verschiedene Punkte. Das alte
Brett verlor diese Unterscheidung beim Ablegen auf den Schlangenkörper und nahm
die erste passende Aktion.
*/

import { describe, expect, it } from 'vitest'
import type { KarteAnlegenAktion, NeueSchlangeStartenAktion } from '../engine'
import { findeAnlegeAktion, findeStartAktion, schlangenMitZiel } from './brettziele'

const anlegen = (handkartenId: string, schlangenId: string, position: 'links' | 'rechts'): KarteAnlegenAktion => ({
  typ: 'KarteAnlegen',
  spielerId: 'spieler-1',
  handkartenId,
  schlangenId,
  position,
})

const starten = (handkartenId: string): NeueSchlangeStartenAktion => ({
  typ: 'NeueSchlangeStarten',
  spielerId: 'spieler-1',
  handkartenId,
})

describe('findeStartAktion', () => {
  it('findet die Startaktion zur gewählten Karte', () => {
    const aktionen = [starten('blau-01'), starten('rot-02')]
    expect(findeStartAktion(aktionen, 'rot-02')?.handkartenId).toBe('rot-02')
  })

  it('liefert null ohne Auswahl und für nicht startfähige Karten', () => {
    const aktionen = [starten('blau-01')]
    expect(findeStartAktion(aktionen, null)).toBeNull()
    expect(findeStartAktion(aktionen, 'gelb-09')).toBeNull()
  })
})

describe('findeAnlegeAktion', () => {
  const aktionen = [
    anlegen('blau-01', 'schlange-a', 'links'),
    anlegen('blau-01', 'schlange-a', 'rechts'),
    anlegen('blau-01', 'schlange-b', 'links'),
  ]

  it('unterscheidet links und rechts an derselben Schlange', () => {
    expect(findeAnlegeAktion(aktionen, 'blau-01', 'schlange-a', 'links')?.position).toBe('links')
    expect(findeAnlegeAktion(aktionen, 'blau-01', 'schlange-a', 'rechts')?.position).toBe('rechts')
  })

  it('liefert null, wenn genau diese Seite nicht legal ist', () => {
    // An schlange-b ist nur links legal — rechts darf nicht ersatzweise greifen.
    expect(findeAnlegeAktion(aktionen, 'blau-01', 'schlange-b', 'rechts')).toBeNull()
  })

  it('liefert null ohne Auswahl und für fremde Karten', () => {
    expect(findeAnlegeAktion(aktionen, null, 'schlange-a', 'links')).toBeNull()
    expect(findeAnlegeAktion(aktionen, 'rot-02', 'schlange-a', 'links')).toBeNull()
  })
})

describe('schlangenMitZiel', () => {
  it('nennt jede Schlange, an der die Karte irgendwo passt', () => {
    const aktionen = [
      anlegen('blau-01', 'schlange-a', 'links'),
      anlegen('blau-01', 'schlange-a', 'rechts'),
      anlegen('blau-01', 'schlange-b', 'links'),
      anlegen('rot-02', 'schlange-c', 'links'),
    ]
    expect([...schlangenMitZiel(aktionen, 'blau-01')].sort()).toEqual(['schlange-a', 'schlange-b'])
  })

  it('ist ohne Auswahl leer', () => {
    expect(schlangenMitZiel([anlegen('blau-01', 'schlange-a', 'links')], null).size).toBe(0)
  })
})
