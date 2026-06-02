/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R63 UI-Test für die sichtbare Endrunden-Kennzeichnung im Spielstatus.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandMitEndrunde(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)

  return {
    ...zustand,
    spielphase: 'Endspurt',
    endrunde: {
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [0],
    },
  }
}

describe('R63 UI-Endrunde', () => {
  it('zeigt eine aktive Endrunde im Spielstatus sichtbar an', () => {
    render(<App initialZustand={zustandMitEndrunde()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })

    expect(within(spielstatus).getByText(/Endrunde aktiv: ja/i)).toBeInTheDocument()
    expect(within(spielstatus).getByText(/Endrunde ausgelöst durch: spieler-2/i)).toBeInTheDocument()
    expect(within(spielstatus).getByText(/Verbleibende Endrunde: spieler-1/i)).toBeInTheDocument()
  })

  it('zeigt bei beendetem Spiel keine aktive Endrunde mehr an', () => {
    const zustand = zustandMitEndrunde()
    render(
      <App
        initialZustand={{
          ...zustand,
          spielphase: 'Beendet',
          zugphase: 'Spielende',
          endrunde: { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [] },
        }}
      />,
    )

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })

    expect(within(spielstatus).queryByText(/Endrunde aktiv: ja/i)).toBeNull()
    expect(within(spielstatus).getByText(/Verbleibende Endrunde: keine/i)).toBeInTheDocument()
  })
})
