/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R39 UI-Tests für sichtbare erfüllte Aufgaben je Spieler.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

function zustandMitErfuelltenAufgaben(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const [ersteAufgabe, zweiteAufgabe] = aufgabenPool
  if (!ersteAufgabe || !zweiteAufgabe) throw new Error('Testsetup erwartet mindestens zwei Aufgabenkarten.')

  return {
    ...zustand,
    spieler: zustand.spieler.map((s, i) => ({
      ...s,
      erfuellteAufgaben: i === 0 ? [ersteAufgabe, zweiteAufgabe] : [],
    })),
  }
}

describe('R39 UI-erfüllte Aufgaben', () => {
  it('zeigt für alle Engine-Spieler erfüllte Aufgaben oder keine an', () => {
    const zustand = zustandMitErfuelltenAufgaben()
    const aufgaben = zustand.spieler[0]!.erfuellteAufgaben

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getAllByText(/— erfüllte Aufgaben:/)).toHaveLength(zustand.spieler.length)
    expect(
      within(bereich).getByText(
        `Spieler 1 — erfüllte Aufgaben: ${aufgaben.map(a => `${a.name} (${a.punkte} Punkte)`).join(', ')}`,
      ),
    ).toBeInTheDocument()
    expect(within(bereich).getByText('Spieler 2 — erfüllte Aufgaben: keine')).toBeInTheDocument()
  })
})
