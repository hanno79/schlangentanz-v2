/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R48 UI-Tests für übersichtlich gruppierte Debug- und State-Anzeigen.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const BEREICHE = [
  'Spielstatus',
  'Aktiver Spieler',
  'Spielerübersicht',
  'Material und Aufgaben',
  'Wertung',
  'Aktionen',
]

describe('R48 UI-Übersichtsbereiche', () => {
  it('gliedert die bestehenden Engine- und Debug-Anzeigen in semantische Bereiche', () => {
    render(<App />)
    const dashboard = screen.getByRole('region', { name: /legale aktionen/i })

    for (const bereich of BEREICHE) {
      expect(within(dashboard).getByRole('region', { name: bereich })).toBeInTheDocument()
      expect(within(dashboard).getByRole('heading', { name: bereich })).toBeInTheDocument()
    }

    expect(within(screen.getByRole('region', { name: 'Spielstatus' })).getByText(/Zugphase:/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Aktiver Spieler' })).getByText(/Handkarten:/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Spielerübersicht' })).getByText(/Spielerübersicht spieler-1:/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Material und Aufgaben' })).getByText(/Ablagestapel:/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Wertung' })).getByText(/Wertung spieler-1:/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Aktionen' })).getByText(/Legale Aktionen:/)).toBeInTheDocument()
  })
})
