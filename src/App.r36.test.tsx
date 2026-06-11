/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R36 UI-Tests für sichtbare Schlangenzustände in Schlangentanz v2.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { SchlangenZustand, Spielzustand } from './engine'

function zustandMitSchlangenzustaenden(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const [aktivKarte, blockiertKarte, geschuetztKarte, ...restHand] = zustand.spieler[0].hand
  if (!aktivKarte || !blockiertKarte || !geschuetztKarte) {
    throw new Error('Testsetup erwartet mindestens drei Handkarten für Spieler 1.')
  }

  const schlangen = [
    { id: 'schlange-aktiv', zustand: 'aktiv' as SchlangenZustand, karten: [aktivKarte] },
    { id: 'schlange-blockiert', zustand: 'blockiert' as SchlangenZustand, karten: [blockiertKarte] },
    { id: 'schlange-geschuetzt', zustand: 'geschuetzt' as SchlangenZustand, karten: [geschuetztKarte] },
  ]

  return {
    ...zustand,
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: restHand,
      schlangen,
    }),
  }
}

describe('R36 UI-Schlangenzustände', () => {
  it('zeigt vorhandene Engine-Schlangenzustände für alle Schlangen an', () => {
    render(<App initialZustand={zustandMitSchlangenzustaenden()} />)
    const bereich = screen.getByRole('region', { name: 'Spielbereich' })

    expect(within(bereich).getByText('Schlange 1 von Spieler 1: spielbereit.')).toBeInTheDocument()
    expect(within(bereich).getByText('Schlange 2 von Spieler 1: gerade blockiert.')).toBeInTheDocument()
    expect(within(bereich).getByText('Schlange 3 von Spieler 1: geschützt.')).toBeInTheDocument()
    expect(within(bereich).queryByText(/Schlange 1 von Spieler 2:/)).toBeNull()
  })

  it('aktualisiert den Status der Schlange nach einer Engine-Aktion', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: 'Spielbereich' })

    expect(within(bereich).queryByText(/Schlange 1 von Spieler 1:/)).toBeNull()

    fireEvent.click(within(screen.getByRole('region', { name: 'Aktionen' })).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(
      within(bereich).getByText('Schlange 1 von Spieler 1: spielbereit.'),
    ).toBeInTheDocument()
  })
})
