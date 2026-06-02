/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R60 UI-Test für unmittelbares Aktionsfeedback im aktiven Spielerbereich.
*/
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R60 UI-Aktionsfeedback', () => {
  it('zeigt nach einer Aktion das zuletzt ausgeführte Feedback im aktiven Spielerbereich an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    expect(within(aktiverSpielerBereich).queryByText(/zuletzt ausgeführt:/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /Neue Schlange starten mit Karte/i })[0])

    expect(within(aktiverSpielerBereich).getByText(/zuletzt ausgeführt: Neue Schlange starten mit Karte/i)).toBeInTheDocument()
  })
})
