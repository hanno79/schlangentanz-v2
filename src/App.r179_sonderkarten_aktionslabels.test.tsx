/*
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R179 zeigt enumerierte Sonderkarten-Aktionen mit konkreten Spielerlabels statt Fallback-Text.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { FarbkarteInfo, SonderkarteInfo } from './engine'

const farbkarte = (id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo => ({
  typ: 'Farbkarte',
  id,
  farbe,
  punkte,
})

const sonderkarte = (id: string, name: string): SonderkarteInfo => ({
  typ: 'Sonderkarte',
  id,
  name,
})

describe('R179 Sonderkarten-Aktionslabels', () => {
  it('benennt Farbenfusion und Schlangenfrass als konkrete spielbare Aktionen', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const farbenfusion = sonderkarte('farbenfusion-r179', 'Farbenfusion')
    const schlangenfrass = sonderkarte('schlangenfrass-r179', 'Schlangenfrass')

    zustand.spieler[0].hand = [farbenfusion, schlangenfrass]
    zustand.spieler[0].schlangen = [
      {
        id: 'eigene-schlange-r179',
        zustand: 'aktiv',
        karten: [
          farbkarte('blau-r179-a', 'Blau', 1),
          farbkarte('blau-r179-b', 'Blau', 1),
        ],
      },
    ]
    zustand.spieler[1].schlangen = [
      {
        id: 'gegner-schlange-r179',
        zustand: 'aktiv',
        karten: [farbkarte('rot-r179-ziel', 'Rot', 1)],
      },
    ]

    render(<App initialZustand={zustand} />)

    const aktionen = within(screen.getByRole('region', { name: 'Aktionen' }))
    expect(aktionen.getByRole('button', {
      name: 'Farbenfusion mit Karte farbenfusion-r179 auf Schlange eigene-schlange-r179 bei Karte blau-r179-a spielen',
    })).toBeVisible()
    expect(aktionen.getByRole('button', {
      name: 'Schlangenfrass mit Karte schlangenfrass-r179: Karte blau-r179-a aus Schlange eigene-schlange-r179 entfernen',
    })).toBeVisible()
    expect(aktionen.queryByRole('button', { name: 'Unbekannte Aktion' })).toBeNull()
  })
})
