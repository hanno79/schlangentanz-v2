/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F21 UI-Test für die sichtbare Endspurt-Statusanzeige mit deaktiviertem Nachziehen.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandImEndspurt(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)

  return {
    ...zustand,
    spielphase: 'Endspurt',
    zugphase: 'Nachziehphase',
    endrunde: {
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [0],
    },
  }
}

describe('F21 Endspurt-Statusanzeige', () => {
  it('zeigt im Spielstatus den deaktivierten Nachziehmodus und die restlichen No-Draw-Züge an', () => {
    render(<App initialZustand={zustandImEndspurt()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })

    expect(within(spielstatus).getByText(/Nachziehen in der Endrunde: aus/i)).toBeInTheDocument()
    expect(
      within(spielstatus).getByText(/Verbleibende Züge ohne Nachziehen: 1/i),
    ).toBeInTheDocument()
    expect(
      within(spielstatus).getByText(/Verbleibende Endrunde: Spieler 1/i),
    ).toBeInTheDocument()
  })

  it('zeigt im Normalspiel keinen Endspurt-No-Draw-Hinweis an', () => {
    render(<App initialZustand={erstelleSpielzustand(2, () => 0.999999)} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })

    expect(within(spielstatus).queryByText(/Nachziehen in der Endrunde: aus/i)).toBeNull()
    expect(within(spielstatus).queryByText(/Verbleibende Züge ohne Nachziehen:/i)).toBeNull()
  })
})
