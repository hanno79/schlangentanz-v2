/*
Author: rahn
Datum: 08.06.2026
Version: 2.0
Beschreibung: F16 UI-Test für klar als Entwicklungsdaten ausgelagerte Debug-Informationen.
Änderung R118: Titel-Array und Accessible-Names ohne "Debug:"-Präfix; keine sichtbaren "Debug:"-Texte mehr.
Änderung R120: Titel-Array nutzt spielerfreundliche Summary-Titel statt technischer Statusdetails.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const DEBUG_TITEL = [
  'Spielphase',
  'Aktiver Spieler',
  'Spielerstatus',
  'Karten und Aufgaben',
  'Punkteübersicht',
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
      const badge = within(entwicklungsdaten).getByText('Entwicklungsdaten:')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('debug-gruppe__badge')
      expect(within(entwicklungsdaten).getByText(titel)).toBeInTheDocument()
    }

    expect(screen.queryAllByText(/^Debug:/)).toHaveLength(0)
  })
})
