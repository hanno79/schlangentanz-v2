/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R126 UI-Test für spielerfreundliche Schlangenstatus-Copy ohne rohe Schlangen-IDs/Zustandswerte.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type SchlangenZustand } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

function deterministischerZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [
    { id: 'schlange-r126-aktiv', zustand: 'aktiv' as SchlangenZustand, karten: [farbkarte('rot-r126-1', 'Rot')] },
    { id: 'schlange-r126-blockiert', zustand: 'blockiert' as SchlangenZustand, karten: [farbkarte('blau-r126-1', 'Blau')] },
    { id: 'schlange-r126-geschuetzt', zustand: 'geschuetzt' as SchlangenZustand, karten: [farbkarte('gruen-r126-1', 'Grün')] },
  ]
  return zustand
}

describe('R126 spielerfreundliche Schlangenstatus-Copy', () => {
  it('beschreibt Schlangenstatus nach Spieler und laufender Nummer statt mit Roh-ID und Zustandswert', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const spielerstatus = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Spielerstatus' })

    expect(within(spielerstatus).getByText('Schlange 1 von Spieler 1: spielbereit.')).toBeVisible()
    expect(within(spielerstatus).getByText('Schlange 2 von Spieler 1: gerade blockiert.')).toBeVisible()
    expect(within(spielerstatus).getByText('Schlange 3 von Spieler 1: geschützt.')).toBeVisible()

    const spielerstatusText = spielerstatus.textContent ?? ''
    expect(spielerstatusText).not.toMatch(/Status von Schlange spieler-1\//)
    expect(spielerstatusText).not.toMatch(/:\s*(aktiv|geschuetzt)\b/)
  })
})
