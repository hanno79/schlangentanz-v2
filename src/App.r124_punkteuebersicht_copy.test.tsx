/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R124 UI-Test für spielerfreundliche Punkteübersicht-Copy in den Entwicklungsdaten.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const SPIELERFREUNDLICHE_PUNKTE_LABELS = [
  /Punktestand von spieler-1: 0 Punkte/,
  /Punktequellen von spieler-1: Farbgruppen 0 Punkte, Aufgaben 0 Punkte/,
]

const VERALTETE_PUNKTE_LABELS = [
  'Wertung spieler-1:',
  'Punkteaufteilung spieler-1:',
]

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R124 spielerfreundliche Punkteübersicht-Copy', () => {
  it('ersetzt technische Wertungs-Labels durch verständliche Punkteinformationen', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const punkteuebersicht = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Punkteübersicht' })

    for (const label of SPIELERFREUNDLICHE_PUNKTE_LABELS) {
      expect(within(punkteuebersicht).getByText(label)).toBeVisible()
    }

    for (const label of VERALTETE_PUNKTE_LABELS) {
      expect(within(punkteuebersicht).queryByText(new RegExp(`^${label}`))).not.toBeInTheDocument()
    }
  })
})
