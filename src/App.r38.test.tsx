/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R38 UI-Tests für die sichtbare Ablagestapelgröße.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

function zustandMitPflichtAbwurf(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const sonderkarte = zustand.nachziehstapel.find(karte => karte.typ === 'Sonderkarte')
  if (!sonderkarte) throw new Error('Testsetup erwartet eine Sonderkarte im Nachziehstapel.')

  return {
    ...zustand,
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: [sonderkarte],
    }),
    nachziehstapel: zustand.nachziehstapel.filter(karte => karte.id !== sonderkarte.id),
  }
}

describe('R38 UI-Ablagestapelgröße', () => {
  it('zeigt die vorhandene Engine-Ablagestapelgröße auch bei leerem Stapel an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(`Ablagestapelgröße: ${zustand.ablagestapel.length} Karten`)).toBeInTheDocument()
  })

  it('aktualisiert die Ablagestapelgröße nach einem Engine-Pflicht-Abwurf', () => {
    const zustand = zustandMitPflichtAbwurf()

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText('Ablagestapelgröße: 0 Karten')).toBeInTheDocument()
    fireEvent.click(within(bereich).getByRole('button', { name: /karte .+ abwerfen/i }))

    expect(within(bereich).getByText('Ablagestapelgröße: 1 Karten')).toBeInTheDocument()
    expect(within(bereich).getByText(/Ablagestapel: /)).toBeInTheDocument()
  })
})
