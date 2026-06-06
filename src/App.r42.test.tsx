/*
Author: rahn
Datum: 01.06.2026
Version: 1.1
Beschreibung: R42 UI-Test für sichtbare Handkarten im Spieltisch und ihre Aktualisierung nach einer Engine-Aktion.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R42 UI-Handkarten im Spieltisch', () => {
  it('zeigt die sichtbaren Handkarten an und aktualisiert sie nach einer Engine-Aktion', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const aktion = ermittleLegaleAktionen(zustand).find(a => a.typ === 'NeueSchlangeStarten' && a.handkartenId === 'blau-01')
    if (!aktion) throw new Error('Testsetup erwartet blau-01 als legale Startaktion.')

    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(within(handBereich).getByText(/blau-01/i)).toBeInTheDocument()
    expect(within(handBereich).getByText(/blau-03/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(within(handBereich).queryByText(/blau-01/i)).toBeNull()
    expect(within(handBereich).getByText(/blau-03/i)).toBeInTheDocument()
  })
})
