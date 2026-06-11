/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R128 UI-Test für spielerfreundliche Scoreboard-Copy ohne rohe Spieler-IDs.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

function scoreboardText(): string {
  render(<App />)

  const wertung = screen.getByRole('region', { name: 'Wertung' })
  const scoreboard = within(wertung).getByRole('region', { name: 'Scoreboard' })

  return scoreboard.textContent ?? ''
}

describe('R128 Scoreboard-Copy', () => {
  it('zeigt Spielernamen im Scoreboard ohne rohe Spieler-IDs', () => {
    const text = scoreboardText()

    expect(text).toContain('Spieler 1')
    expect(text).toContain('Spieler 2')
    expect(text).toContain('Gesamt:')
    expect(text).toContain('Farbgruppen:')
    expect(text).toContain('Aufgaben:')
    expect(text).not.toMatch(/\bspieler-\d\b/)
    expect(text).not.toMatch(/Spieler \d \(spieler-\d\)/)
  })
})
