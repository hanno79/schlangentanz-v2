/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F23 UI-Test für den sichtbaren Spielende-Hinweis im Wertungsbereich.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandImSpielende(): Spielzustand {
  return {
    ...erstelleSpielzustand(2, () => 0.999999),
    spielphase: 'Beendet',
    zugphase: 'Spielende',
  }
}

describe('F23 Wertungsbereich im Spielende', () => {
  it('zeigt im Wertungsbereich einen sichtbaren Spielende-Hinweis an', () => {
    render(<App initialZustand={zustandImSpielende()} />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })

    expect(within(wertung).getByText(/Spielende erreicht\.?/i)).toBeInTheDocument()
  })

  it('zeigt den Spielende-Hinweis im Normalspiel nicht an', () => {
    render(<App initialZustand={erstelleSpielzustand(2, () => 0.999999)} />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })

    expect(within(wertung).queryByText(/Spielende erreicht\.?/i)).toBeNull()
  })
})
