/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R35 UI-Tests für die Spieler-Schlangenübersicht in Schlangentanz v2.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R35 UI-Spieler-Schlangenübersicht', () => {
  it('zeigt für alle Engine-Spieler eine Schlangenübersicht an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getAllByText(/schlangen von spieler-/i)).toHaveLength(zustand.spieler.length)
    for (const spieler of zustand.spieler) {
      expect(within(bereich).getByText(`Schlangen von ${spieler.id}: keine`)).toBeInTheDocument()
    }
  })

  it('aktualisiert die Schlangenanzeige nach einer Engine-Aktion', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText('Schlangen von spieler-1: keine')).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(
      within(bereich).getByText('Schlangen von spieler-1: schlange-spieler-1-1 (blau-01)'),
    ).toBeInTheDocument()
    expect(within(bereich).getByText('Schlangen von spieler-2: keine')).toBeInTheDocument()
  })
})
