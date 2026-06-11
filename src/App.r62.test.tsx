/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R62 UI-Test für die sichtbaren Phasenregeln im Aktionsbereich.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

function zustandImSpielende(): Spielzustand {
  return {
    ...erstelleSpielzustand(2, () => 0.999999),
    zugphase: 'Spielende',
    spielphase: 'Beendet',
  }
}

describe('R62 UI-Phasenregeln', () => {
  it('zeigt im Zugabschluss die aktuelle Phasenregel passend zur Überhand-Situation', () => {
    render(<App initialZustand={zustandMitUeberhand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktionenBereich).getByText('Phasenregeln')).toBeInTheDocument()
    expect(
      within(aktionenBereich).getByText(/Zugabschluss: Zuerst überzählige Karten abwerfen, dann Zug beenden\./i),
    ).toBeInTheDocument()
  })

  it('zeigt im Spielende die nicht mehr erreichbaren Phasenregeln trotzdem an', () => {
    render(<App initialZustand={zustandImSpielende()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktionenBereich).getByText(/Spielende: Keine weiteren Aktionen\./i)).toBeInTheDocument()
  })
})
