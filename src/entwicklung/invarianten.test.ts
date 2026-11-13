import { describe, expect, it } from 'vitest'
import { pruefeInvarianten as engineInvarianten } from '../engine'
import type { Spielzustand } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { starteEntwicklerPartie } from './partie'

function verletzte(zustand: Spielzustand): string[] {
  return pruefeInvarianten(zustand)
    .filter((invariante) => invariante.verletzt)
    .map((invariante) => invariante.name)
}

describe('E1: Invarianten am Entwicklertisch', () => {
  it('E1: der Tisch zeigt die Invarianten der Engine und dazu Wertung sowie Speichern und Laden', () => {
    const zustand = starteEntwicklerPartie(1, 2, true)
    expect(pruefeInvarianten(zustand).map((befund) => befund.name)).toEqual([
      ...engineInvarianten(zustand).map((befund) => befund.name),
      'Die Wertung lässt sich berechnen',
      'Der Spielstand übersteht Speichern und Laden unverändert',
    ])
    expect(verletzte(zustand)).toEqual([])
  })

  it('P0.4: eine doppelt liegende Spielkarte wird mit Id gemeldet', () => {
    const zustand = starteEntwicklerPartie(1, 2, false)
    const karte = zustand.spieler[0].hand[0]
    zustand.spieler[1].hand.push(karte)
    expect(verletzte(zustand)).toContain('Jede Spielkarte liegt genau einmal an genau einem Ort')
    const befund = pruefeInvarianten(zustand).find((i) => i.name === 'Der Spielstand übersteht Speichern und Laden unverändert')
    expect(befund?.verletzt).toBe(true)
    expect(befund?.detail).toContain('Die Engine wirft')
  })

  it('P0.4: ein Zustand, an dem die Wertung scheitert, wird gemeldet statt zu werfen', () => {
    const zustand = starteEntwicklerPartie(1, 2, false)
    // Eine Farbenfusion ohne die zwei Karten darunter, aus denen die Wertung ihre Punkte liest.
    zustand.spieler[0].schlangen = [
      { id: 'kaputt', karten: [{ typ: 'Sonderkarte', id: 'farbenfusion-01', name: 'Farbenfusion' }], fusionen: [] },
    ]
    const wertung = pruefeInvarianten(zustand).find((i) => i.name === 'Die Wertung lässt sich berechnen')
    expect(wertung?.verletzt).toBe(true)
    expect(wertung?.detail).toContain('Die Engine wirft')
  })
})
