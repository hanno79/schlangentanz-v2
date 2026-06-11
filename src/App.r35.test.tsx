/*
Author: rahn
Datum: 01.06.2026
Version: 1.1
Beschreibung: R35 UI-Tests für die Spieler-Schlangenübersicht in Schlangentanz v2.
              v1.1: Angepasst an R127 spielerfreundliche Copy (Name statt ID).
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R35 UI-Spieler-Schlangenübersicht', () => {
  it('zeigt für alle Engine-Spieler eine Schlangenübersicht an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: 'Spielerübersicht' })

    for (const spieler of zustand.spieler) {
      expect(within(bereich).getAllByText(new RegExp(`^${spieler.name}:`))).toHaveLength(1)
    }
  })

  it('aktualisiert die Schlangenanzeige nach einer Engine-Aktion', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    // Vorher: Spieler 1 hat 0 Schlangen
    expect(within(bereich).getByText(/Spieler 1: 5 Handkarten, 0 Schlangen/)).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    // Nachher: Spieler 1 hat 1 Schlange
    expect(within(bereich).getByText(/Spieler 1: 4 Handkarten, 1 Schlange/)).toBeInTheDocument()
    // Schlange 1 von Spieler 1 sichtbar
    expect(within(bereich).getByText(/Schlange 1 von Spieler 1: spielbereit/)).toBeInTheDocument()
  })
})
