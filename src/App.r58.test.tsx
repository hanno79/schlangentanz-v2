/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R58 UI-Test für die Live-Region im Bereich des aktiven Spielers.
*/

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R58 UI-Live-Region für den aktiven Spieler', () => {
  it('markiert den aktiven Spielerbereich als polite Live-Region', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })

    expect(aktiverSpielerBereich).toHaveAttribute('aria-live', 'polite')
  })
})
