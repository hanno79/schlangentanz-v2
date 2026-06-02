/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R64 UI-Test für die sichtbare Legale-Aktionen-Liste im Phasenregeln-Bereich.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandOhneLegaleAktionen(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)

  return {
    ...zustand,
    spielphase: 'Beendet',
    zugphase: 'Spielende',
    endrunde: {
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [],
    },
  }
}

describe('R64 UI-Phasenregeln und legale Aktionen', () => {
  it('zeigt in der Phasenregeln-Region auch den leeren Aktionszustand sichtbar an', () => {
    render(<App initialZustand={zustandOhneLegaleAktionen()} />)

    const phasenregeln = screen.getByRole('region', { name: 'Phasenregeln' })

    expect(within(phasenregeln).getByText('Legale Aktionen dieser Phase')).toBeInTheDocument()
    expect(within(phasenregeln).getByText('Aktuell keine legalen Aktionen in dieser Phase.')).toBeInTheDocument()
  })
})
