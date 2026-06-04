/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F7 UI-Test für offene Aufgaben als lesbare Aufgabenkarten im Materialbereich.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('F7 Aufgabenkarten', () => {
  it('zeigt offene Aufgaben zusätzlich als einzelne Aufgabenkarten mit Name, Punkten und Bedingung', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const materialBereich = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const aufgabenkarten = within(materialBereich).getByRole('region', { name: 'Aufgabenkarten' })
    const karten = within(aufgabenkarten).getAllByRole('listitem')

    expect(within(aufgabenkarten).getByRole('heading', { name: 'Aufgabenkarten' })).toBeInTheDocument()
    expect(karten).toHaveLength(3)
    expect(karten[0]).toHaveClass('aufgabenkarte')
    expect(karten[0]).toHaveTextContent('Farbkombination')
    expect(karten[0]).toHaveTextContent('5 Punkte')
    expect(karten[0]).toHaveTextContent('Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.')
    expect(within(materialBereich).getByText(/Offene Aufgaben:/)).toBeInTheDocument()
    expect(within(materialBereich).getByText(/Offene Aufgaben-Details:/)).toBeInTheDocument()
  })
})
