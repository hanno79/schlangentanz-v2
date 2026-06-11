/**
 * Author: rahn
 * Datum: 10.06.2026
 * Version: 1.0
 * Beschreibung: R127 UI-Test für spielerfreundliche Spielerübersicht-Copy ohne rohe Spieler-IDs.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

function deterministischerZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  // Spieler 1 (aktiv) hat 2 Schlangen
  zustand.spieler[0].schlangen = [
    {
      id: 'schlange-r127-a',
      zustand: 'aktiv' as const,
      karten: [farbkarte('rot-r127-1', 'Rot'), farbkarte('rot-r127-2', 'Rot')],
    },
    {
      id: 'schlange-r127-b',
      zustand: 'blockiert' as const,
      karten: [farbkarte('blau-r127-1', 'Blau')],
    },
  ]
  // Spieler 2 (gegnerisch) hat 1 Schlange
  zustand.spieler[1].schlangen = [
    {
      id: 'schlange-r127-c',
      zustand: 'aktiv' as const,
      karten: [farbkarte('gruen-r127-1', 'Grün')],
    },
  ]
  return zustand
}

describe('R127 spielerfreundliche Spielerübersicht-Copy', () => {
  it('beschreibt jeden Spieler mit Name und spielerfreundlichen Angaben statt roher IDs', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const uebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    const text = uebersicht.textContent ?? ''

    // Spielername statt „spieler-1" / „spieler-2"
    expect(text).toContain('Spieler 1')
    expect(text).toContain('Spieler 2')
    expect(text).not.toMatch(/\bspieler-\d\b/)
    expect(text).not.toMatch(/\bSpieler spieler-\d\b/)
    expect(text).not.toMatch(/\((Mensch|KI)\)/)
  })

  it('zeigt Schlangen je Spieler mit laufender Nummer statt roher Schlangen-ID', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const uebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    const text = uebersicht.textContent ?? ''

    // Keine rohen IDs wie „Schlangen von spieler-1: schlange-xxx (...)"
    expect(text).not.toMatch(/\bspieler-\d\b/)
    expect(text).not.toMatch(/Schlangen von spieler-\d/)
    expect(text).not.toMatch(/schlange-r127-[a-z]/)
    // Stattdessen spielerfreundlich, z.B. „2 Schlangen"
    expect(text).toContain('2 Schlangen')
    expect(text).toContain('Schlange 1 von Spieler 1: spielbereit.')
    expect(text).toContain('Schlange 2 von Spieler 1: gerade blockiert.')
    expect(text).toContain('Schlange 1 von Spieler 2: spielbereit.')
  })

  it('zeigt erfüllte Aufgaben spielerfreundlich statt mit roher Spieler-ID', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const uebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    const text = uebersicht.textContent ?? ''

    expect(text).not.toMatch(/Erfüllte Aufgaben spieler-\d/)
  })
})
