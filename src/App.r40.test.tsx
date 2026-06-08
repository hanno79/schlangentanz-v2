/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R40 UI-Tests für offene Aufgaben mit Punkten.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

function zustandMitOffenenAufgaben(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const offeneAufgaben = aufgabenPool.slice(0, 2)
  if (offeneAufgaben.length !== 2) throw new Error('Testsetup erwartet mindestens zwei offene Aufgabenkarten.')

  return {
    ...zustand,
    offeneAufgaben,
  }
}

describe('R40 UI-offene Aufgabenpunkte', () => {
  it('zeigt alle offenen Engine-Aufgaben mit Namen und Punkten an', () => {
    const zustand = zustandMitOffenenAufgaben()
    const erwarteterText = `Aktuelle Aufgaben: ${zustand.offeneAufgaben
      .map(aufgabe => `${aufgabe.name} (${aufgabe.punkte} Punkte)`)
      .join(', ')}`

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(erwarteterText)).toBeInTheDocument()
    expect(within(bereich).getByText(/Aufgabenziele:/)).toHaveTextContent(
      'Farbenpracht (8 Punkte): Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.'
    )
  })

  it('zeigt offene Aufgaben als keine an, wenn die Engine-Liste leer ist', () => {
    const zustand = { ...zustandMitOffenenAufgaben(), offeneAufgaben: [] }

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText('Aktuelle Aufgaben: keine')).toBeInTheDocument()
    expect(within(bereich).getByText('Aufgabenziele: keine')).toBeInTheDocument()
  })
})
