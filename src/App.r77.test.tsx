/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: R77 UI-Test für die visuelle Handkartenleiste im Bereich des aktiven Spielers.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

describe('R77 Handkartenleiste', () => {
  it('zeigt die Hand des aktiven Spielers als visuelle Kartenliste mit allen Karten an', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999)
    const hand = zustand.spieler[0].hand

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const handBereich = within(aktiverSpielerBereich).getByRole('region', { name: 'Handkarten' })

    const karten = within(handBereich).getAllByRole('listitem')
    expect(karten).toHaveLength(hand.length)
    expect(within(karten[0]).getByText(hand[0].id)).toBeInTheDocument()
    expect(
      within(karten[0]).getByText(
        hand[0].typ === 'Farbkarte'
          ? new RegExp(`Farbkarte ${hand[0].farbe}`, 'i')
          : new RegExp(`Sonderkarte ${hand[0].name}`, 'i'),
      ),
    ).toBeInTheDocument()
  })
})
