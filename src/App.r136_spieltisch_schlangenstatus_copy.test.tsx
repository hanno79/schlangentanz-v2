/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R136 UI-Test für spielerfreundliche Schlangenstatus-Copy direkt auf dem Spieltisch.
 */

import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type SchlangenZustand } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

function zustandMitSchlangenStatusAmSpieltisch() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [
    { id: 'schlange-r136-aktiv', zustand: 'aktiv' as SchlangenZustand, karten: [farbkarte('rot-r136-1', 'Rot')] },
    { id: 'schlange-r136-blockiert', zustand: 'blockiert' as SchlangenZustand, karten: [farbkarte('blau-r136-1', 'Blau')] },
    { id: 'schlange-r136-geschuetzt', zustand: 'geschuetzt' as SchlangenZustand, karten: [farbkarte('gruen-r136-1', 'Grün')] },
  ]
  zustand.spieler[1].schlangen = [
    { id: 'schlange-r136-gegner', zustand: 'blockiert' as SchlangenZustand, karten: [farbkarte('gelb-r136-1', 'Gelb')] },
  ]
  return zustand
}

describe('R136 spielerfreundlicher Schlangenstatus am Spieltisch', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('zeigt Schlangenstatus auf Schlangenkarten als Spieler-Copy statt roher Zustandswerte', () => {
    render(<App initialZustand={zustandMitSchlangenStatusAmSpieltisch()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })

    expect(within(spieltisch).getByText('Status: spielbereit')).toBeVisible()
    expect(within(spieltisch).getByText('Status: gerade blockiert')).toBeVisible()
    expect(within(spieltisch).getByText('Status: geschützt')).toBeVisible()

    // M1dp: Gegnerlichtung ist im Arenastein, eigene Schlangen (alle 3) sind im Spieltisch
    // Erwartung 1x blockiert-Status (eigene blockierte Schlange); gegner-Schlange ist jetzt
    // separat in der Gegnerlichtung sichtbar
    expect(screen.getAllByText('Status: gerade blockiert').length).toBeGreaterThanOrEqual(2)

    const gegnerischeSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    expect(within(gegnerischeSchlangen).getByText('Status: gerade blockiert')).toBeVisible()

    const spieltischText = spieltisch.textContent ?? ''
    expect(spieltischText).not.toMatch(/Zustand:\s*(aktiv|blockiert|geschuetzt)\b/i)
  })
})
