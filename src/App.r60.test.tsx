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
    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    expect(within(aktiverSpielerBereich).queryByText(/zuletzt ausgeführt:/i)).not.toBeInTheDocument()

    const button = within(aktionenBereich).getAllByRole('button')[0]
    const buttonText = button.textContent?.trim() ?? ''
    fireEvent.click(button)

    expect(
      within(aktiverSpielerBereich).getByText(new RegExp(`zuletzt ausgeführt: ${buttonText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')),
    ).toBeInTheDocument()
  })
})
