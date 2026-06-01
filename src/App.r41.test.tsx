/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R41 UI-Tests für sichtbare Anzahl legaler Engine-Aktionen.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R41 UI-Anzahl legaler Aktionen', () => {
  it('zeigt die Anzahl der legalen Engine-Aktionen an und aktualisiert sie nach einer Aktion', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText('Legale Aktionen: 5')).toBeInTheDocument()
    expect(within(bereich).getAllByRole('button', { name: /neue schlange starten mit karte/i })).toHaveLength(5)

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(within(bereich).getByText('Legale Aktionen: 0')).toBeInTheDocument()
    expect(within(bereich).getByText('Keine weiteren legalen Aktionen.')).toBeInTheDocument()
    expect(within(bereich).getByRole('button', { name: /ausspielphase beenden/i })).toBeInTheDocument()
  })
})
