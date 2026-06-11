/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R130 UI-Test für spielerfreundliche Punkteübersicht-Copy mit Spielernamen statt roher Spieler-IDs.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R130 spielerfreundliche Punkteübersicht mit Spielernamen', () => {
  it('zeigt Punktestand und Punktequellen mit Spielernamen statt roher Spieler-IDs', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const punkteuebersicht = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Punkteübersicht' })
    const text = punkteuebersicht.textContent ?? ''

    expect(within(punkteuebersicht).getByText('Punktestand von Spieler 1: 0 Punkte')).toBeVisible()
    expect(within(punkteuebersicht).getByText('Punktequellen von Spieler 1: Farbgruppen 0 Punkte, Aufgaben 0 Punkte')).toBeVisible()
    expect(within(punkteuebersicht).getByText('Punktestand von Spieler 2: 0 Punkte')).toBeVisible()
    expect(within(punkteuebersicht).getByText('Punktequellen von Spieler 2: Farbgruppen 0 Punkte, Aufgaben 0 Punkte')).toBeVisible()
    expect(text).not.toMatch(/Punktestand von spieler-\d/)
    expect(text).not.toMatch(/Punktequellen von spieler-\d/)
  })
})
