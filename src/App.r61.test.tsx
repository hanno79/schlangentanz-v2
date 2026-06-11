/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R61 UI-Test für Überhand-Hinweis und Pflicht-Abwurf im Zugabschluss.
*/
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandMitUeberhand(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  const zusatzkarten = zustand.nachziehstapel.slice(0, 6)

  return {
    ...zustand,
    zugphase: 'Zugabschluss',
    spielphase: 'Normal',
    spieler: zustand.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [...spieler.hand, ...zusatzkarten],
          }
        : spieler,
    ),
    nachziehstapel: zustand.nachziehstapel.slice(6),
  }
}

describe('R61 UI-Überhand-Hinweis', () => {
  it('zeigt im Zugabschluss einen Überhand-Hinweis und verlangt Kartenabwurf vor Zugende', () => {
    render(<App initialZustand={zustandMitUeberhand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: /aktiver spieler/i })
    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktiverSpielerBereich).getByText(/Überzählige Karten: 1 über dem Limit von 10/i)).toBeInTheDocument()
    expect(
      screen.getAllByText(/Nächster Pflichtschritt: Überzählige Karten abwerfen/i)[0],
    ).toBeInTheDocument()

    fireEvent.click(within(aktionenBereich).getByRole('button', { name: /überzählige karten abwerfen/i }))

    expect(within(aktiverSpielerBereich).queryByText(/Überzählige Karten:/i)).not.toBeInTheDocument()
    expect(
      screen.getAllByText(/Nächster Pflichtschritt: Zug beenden/i)[0],
    ).toBeInTheDocument()
    expect(within(aktionenBereich).getByRole('button', { name: /zug beenden/i })).toBeInTheDocument()
  })
})
