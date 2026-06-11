/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R131 UI-Test für spielerfreundliche Endrunden-Copy im Spielstatus ohne rohe Spieler-IDs.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandImEndspurt(): Spielzustand {
  const zustand = erstelleSpielzustand(3, () => 0.999999)

  return {
    ...zustand,
    spielphase: 'Endspurt',
    zugphase: 'Nachziehphase',
    endrunde: {
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [2, 0],
    },
  }
}

describe('R131 spielerfreundliche Endrunden-Copy', () => {
  it('nennt Auslöser und verbleibende Spieler mit Namen statt roher Spieler-IDs', () => {
    render(<App initialZustand={zustandImEndspurt()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const text = spielstatus.textContent ?? ''

    expect(within(spielstatus).getByText(/Endrunde ausgelöst durch: Spieler 2/i)).toBeInTheDocument()
    expect(within(spielstatus).getByText(/Verbleibende Endrunde: Spieler 3, Spieler 1/i)).toBeInTheDocument()
    expect(text).not.toMatch(/\bspieler-\d\b/i)
  })
})
