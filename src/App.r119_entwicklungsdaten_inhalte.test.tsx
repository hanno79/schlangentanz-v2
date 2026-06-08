/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R119 UI-Test für spielerfreundliche Entwicklungsdaten-Inhalte ohne interne Demo- und Detail-Copy.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const INTERNE_ENTWICKLUNGSDATEN_BEGRIFFE = [
  /Engine-Demo:/,
  /Aktiver Spieler-Details:/,
  /Offene Aufgaben-Details:/,
  /Wertungsdetails spieler-1:/,
]

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R119 spielerfreundliche Entwicklungsdaten-Inhalte', () => {
  it('ersetzt interne Demo- und Detail-Labels durch verständliche Spielbegriffe', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const phasenstatus = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Phasenstatus' })
    expect(within(phasenstatus).getByText(/Aktueller Spielschritt:/)).toBeVisible()

    const aktiverSpieler = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Aktiver Spieler' })
    expect(within(aktiverSpieler).getByText(/Spielerprofil:/)).toBeVisible()

    const materialstatus = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Materialstatus' })
    expect(within(materialstatus).getByText(/Aufgabenziele:/)).toBeVisible()

    const wertung = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Wertungsdetails' })
    expect(within(wertung).getByText(/Punkteaufteilung spieler-1:/)).toBeVisible()

    const entwicklungsdatenText = screen
      .getAllByRole('complementary', { name: /^Entwicklungsdaten:/ })
      .map((bereich) => bereich.textContent ?? '')
      .join('\n')

    for (const internerBegriff of INTERNE_ENTWICKLUNGSDATEN_BEGRIFFE) {
      expect(entwicklungsdatenText).not.toMatch(internerBegriff)
    }
  })
})
