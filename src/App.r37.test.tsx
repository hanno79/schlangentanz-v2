/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R37 UI-Tests für sichtbare Kartenarten-Zähler im aktuellen Zug.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const basisZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

describe('R37 UI-Kartenarten-Zähler', () => {
  it('zeigt vorhandene Engine-Zähler für gespielte Farbkarten und Sonderkarten an', () => {
    render(<App initialZustand={{ ...basisZustand, zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 1 } }} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText('Gespielte Kartenarten: 1 Farbkarten, 1 Sonderkarten')).toBeInTheDocument()
  })

  it('aktualisiert die Kartenarten-Zähler nach einer Engine-Aktion', () => {
    render(<App initialZustand={basisZustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText('Gespielte Kartenarten: 0 Farbkarten, 0 Sonderkarten')).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(within(bereich).getByText('Gespielte Kartenarten: 1 Farbkarten, 0 Sonderkarten')).toBeInTheDocument()
  })
})
