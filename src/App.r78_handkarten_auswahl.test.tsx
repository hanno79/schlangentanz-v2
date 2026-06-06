/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: R78 UI-Test für die auswählbare Handkartenleiste im Bereich des aktiven Spielers.
Änderung v1.0: Klick auf eine Handkarte markiert sie als ausgewählt und zeigt die Auswahl im Spieltisch an.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

describe('R78 Handkarten-Auswahl', () => {
  it('markiert eine angeklickte Handkarte als ausgewählt und zeigt die Auswahl an', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999)
    const hand = zustand.spieler[0].hand

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const handBereich = within(aktiverSpielerBereich).getByRole('region', { name: 'Handkarten' })
    const ersteKarte = within(handBereich).getByRole('button', { name: new RegExp(hand[0].id) })

    fireEvent.click(ersteKarte)

    expect(ersteKarte).toHaveAttribute('aria-pressed', 'true')
    const erwarteteDetails = hand[0].typ === 'Farbkarte'
      ? `Farbkarte ${hand[0].farbe} · ${hand[0].punkte} Punkte`
      : `Sonderkarte ${hand[0].name}`

    expect(within(aktiverSpielerBereich).getByRole('region', { name: `Ausgewählte Handkarte: ${hand[0].id}` })).toHaveTextContent(
      `Ausgewählte Handkarte: ${hand[0].id}`,
    )
    expect(within(aktiverSpielerBereich).getByRole('region', { name: `Ausgewählte Handkarte: ${hand[0].id}` })).toHaveTextContent(
      erwarteteDetails,
    )
  })

  it('hebt die Auswahl bei erneutem Klick auf dieselbe Handkarte wieder auf', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999)
    const hand = zustand.spieler[0].hand

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const handBereich = within(aktiverSpielerBereich).getByRole('region', { name: 'Handkarten' })
    const ersteKarte = within(handBereich).getByRole('button', { name: new RegExp(hand[0].id) })

    fireEvent.click(ersteKarte)
    fireEvent.click(ersteKarte)

    expect(ersteKarte).toHaveAttribute('aria-pressed', 'false')
    expect(within(aktiverSpielerBereich).queryByRole('region', { name: /Ausgewählte Handkarte/i })).toBeNull()
  })
})
