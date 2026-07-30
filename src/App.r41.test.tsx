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
    const bereich = screen.getByRole('region', { name: 'Aktionen' })

    // ÄNDERUNG [30.07.2026]: AP-3 — die fünf gleichen blauen Handkarten erzeugen fünf
    // wirkungsgleiche Engine-Aktionen, die die Anzeige zu einer zusammenfasst. Gezählt
    // wird deshalb, was der Spieler tatsächlich zur Auswahl hat.
    expect(within(bereich).getByText('Spielbare Aktionen: 1')).toBeInTheDocument()
    expect(within(bereich).getAllByRole('button', { name: /neue schlange starten mit/i })).toHaveLength(1)
    expect(within(bereich).getByText('5 gleichwertige Karten')).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit wasserwirbel/i }))

    expect(within(bereich).getByText('Spielbare Aktionen: 0')).toBeInTheDocument()
    expect(within(bereich).getByText('Keine weiteren Aktionen.')).toBeInTheDocument()
    expect(within(bereich).getByRole('button', { name: /ausspielphase beenden/i })).toBeInTheDocument()
  })
})
