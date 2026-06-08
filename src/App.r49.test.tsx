/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R49 UI-Test für erklärbare offene Aufgaben inklusive Bedingungen.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R49 Offene Aufgaben-Details', () => {
  it('zeigt zu offenen Aufgaben neben Name und Punkten auch die Bedingung an', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const materialBereich = screen.getByRole('region', { name: 'Material und Aufgaben' })

    expect(within(materialBereich).getByText(/Offene Aufgaben:/)).toHaveTextContent(
      'Farbkombination (5 Punkte)'
    )
    expect(within(materialBereich).getByText(/Aufgabenziele:/)).toHaveTextContent(
      'Farbkombination (5 Punkte): Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.'
    )
    expect(within(materialBereich).getByText(/Aufgabenziele:/)).toHaveTextContent(
      'Farbvielfalt (9 Punkte): Bilde eine Kette aus je einer Karte aller 6 Farben.'
    )
    expect(within(materialBereich).getByText(/Aufgabenziele:/)).toHaveTextContent(
      'Farbwechsler (6 Punkte): Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen.'
    )
  })
})
