/*
Author: rahn
Datum: 02.06.2026
Version: 1.1
Beschreibung: R69 UI-Test für spielerfreundliche Copy bei erfüllten Aufgaben.
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

describe('R69 erfüllte Aufgaben in der Spielerübersicht', () => {
  it('zeigt erfüllte offene Aufgaben in der Spielerübersicht mit spielerfreundlicher Copy an', () => {
    const zustand = zustandMitErfuelltenAufgaben()

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(
      within(bereich).getByText(
        `Spieler 1 — erfüllte Aufgaben: ${zustand.spieler[0]!.erfuellteAufgaben.map(a => `${a.name} (${a.punkte} Punkte)`).join(', ')}`,
      ),
    ).toBeInTheDocument()
    expect(within(bereich).getByText('Spieler 2 — erfüllte Aufgaben: keine')).toBeInTheDocument()
  })
})
