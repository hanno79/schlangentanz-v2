/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R125 UI-Test für spielerfreundliche Punktestand-Copy im Bereich Aktiver Spieler.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R125 spielerfreundliche Punktestand-Copy für aktiven Spieler', () => {
  it('benennt die aktuelle Wertung als verständlichen Punktestand', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpieler = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Aktiver Spieler' })

    expect(within(aktiverSpieler).getByText(/Aktueller Punktestand:\s+0 Punkte/)).toBeVisible()
    expect(within(aktiverSpieler).queryByText(/^Aktuelle Wertung:/)).not.toBeInTheDocument()
  })
})
