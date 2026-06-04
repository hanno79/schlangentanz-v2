/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F16 UI-Test für klar als Entwicklungsdaten ausgelagerte Debug-Informationen.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const DEBUG_TITEL = [
  'Debug: Phasenstatus',
  'Debug: Aktiver Spieler',
  'Debug: Spielerzustände',
  'Debug: Materialstatus',
  'Debug: Wertungsdetails',
]

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F16 Entwicklungsdaten-Debugbereiche', () => {
  it('kennzeichnet Debuggruppen als separate Entwicklungsdaten-Nebenbereiche, ohne alte Debuganker zu entfernen', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    for (const titel of DEBUG_TITEL) {
      const entwicklungsdaten = screen.getByRole('complementary', { name: `Entwicklungsdaten: ${titel}` })
      expect(entwicklungsdaten).toHaveClass('debug-gruppe-entwicklungsdaten')
      const badge = within(entwicklungsdaten).getByText('Entwicklungsdaten')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('debug-gruppe__badge')
      expect(within(entwicklungsdaten).getByText(titel)).toBeInTheDocument()
    }

    expect(screen.getAllByText(/^Debug:/)).toHaveLength(5)
  })
})
