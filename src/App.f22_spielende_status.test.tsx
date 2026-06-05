/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F22 UI-Test für die sichtbare Spielende-Kennzeichnung im Spielstatus.
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

describe('F22 Spielende-Statusanzeige', () => {
  it('zeigt im Spielstatus eine sichtbare Spielende-Kennzeichnung an', () => {
    render(<App initialZustand={zustandImSpielende()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })

    expect(within(spielstatus).getByText(/Spielende erreicht\.?/i)).toBeInTheDocument()
    expect(within(spielstatus).getByText(/Spielphase: Beendet/i)).toBeInTheDocument()
  })

  it('zeigt die Spielende-Kennzeichnung im Normalspiel nicht an', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999)
    render(<App initialZustand={zustand} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })

    expect(within(spielstatus).queryByText(/Spielende erreicht\.?/i)).toBeNull()
  })
})
