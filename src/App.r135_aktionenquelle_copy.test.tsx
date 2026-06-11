/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R135 UI-Test für spielerfreundliche Herkunfts-Copy im Aktionenbereich.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R135 Aktionenquelle-Copy', () => {
  it('zeigt im Aktionenbereich keinen internen Engine-Funktionsnamen als Spielerhinweis', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })

    expect(within(weitereAktionen).getByText('Spielregeln prüfen jede Aktion vor dem Ausführen.')).toBeVisible()
    expect(within(weitereAktionen).queryByText(/engine\.ermittleLegaleAktionen/i)).not.toBeInTheDocument()
    expect(within(weitereAktionen).queryByText(/^Quelle:/i)).not.toBeInTheDocument()
  })
})
