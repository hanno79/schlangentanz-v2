/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R50 UI-Test für die sichtbare geheime Aufgabe des aktiven Spielers.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R50 Geheime Aufgabe des aktiven Spielers', () => {
  it('zeigt Name, Punkte und Bedingung der geheimen Aufgabe des aktiven Spielers an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const geheimeAufgabe = zustand.spieler[zustand.aktiverSpielerIndex].geheimeAufgabe

    expect(geheimeAufgabe).not.toBeNull()

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    expect(within(aktiverSpielerBereich).getByText(/Geheime Aufgabe:/)).toHaveTextContent(
      `${geheimeAufgabe?.name} (${geheimeAufgabe?.punkte} Punkte): ${geheimeAufgabe?.bedingung}`
    )
  })

  it('zeigt ohne geheime Aufgabe einen klaren Leerzustand an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    zustand.spieler[zustand.aktiverSpielerIndex] = {
      ...zustand.spieler[zustand.aktiverSpielerIndex],
      geheimeAufgabe: null,
    }

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    expect(within(aktiverSpielerBereich).getByText(/Geheime Aufgabe:/)).toHaveTextContent(
      'Geheime Aufgabe: keine'
    )
  })
})
