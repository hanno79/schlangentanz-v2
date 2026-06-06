/*
 * Author: rahn
 * Datum: 05.06.2026
 * Version: 1.0
 * Beschreibung: F31 UI-Test für eine echte Spieltisch-Ansicht mit Handkarten und Schlangen in einer gemeinsamen Bühne.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (sel: string) =>
  appCss.match(new RegExp(`\\.${sel}\\s*\\{([^}]*)\\}`))?.[1] ?? ''

function zustandMitSpieltisch() {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  const eigeneKarten = zustand.spieler[0].hand.slice(0, 3)
  const gegnerKarten = zustand.spieler[1].hand.slice(0, 2)

  zustand.spieler[0].hand = zustand.spieler[0].hand.slice(3)
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(2)
  zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-f31', karten: eigeneKarten, zustand: 'aktiv' }]
  zustand.spieler[1].schlangen = [{ id: 'schlange-spieler-2-f31', karten: gegnerKarten, zustand: 'aktiv' }]

  return zustand
}

describe('F31 Spieltisch-Ansicht', () => {
  it('ordnet Handkarten und Schlangen in einer gemeinsamen Spieltisch-Bühne an', () => {
    render(<App initialZustand={zustandMitSpieltisch()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const debugAktiverSpieler = screen.getByText('Debug: Aktiver Spieler')

    expect(within(handBereich).getByText('Handkarten als Kartenleiste')).toBeInTheDocument()
    expect(within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })).toBeInTheDocument()
    expect(within(schlangenbereich).getByRole('region', { name: 'Gegnerische Schlangen' })).toBeInTheDocument()
    expect(within(schlangenbereich).getByText('schlange-spieler-1-f31')).toBeInTheDocument()
    expect(within(schlangenbereich).getByText('schlange-spieler-2-f31')).toBeInTheDocument()
    expect(spieltisch.compareDocumentPosition(debugAktiverSpieler) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    expect(cssBlock('spielbrett')).toMatch(/display:\s*grid/)
    expect(cssBlock('spielbrett')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*320px\),\s*1fr\)\)/)
    expect(cssBlock('spielbrett')).toMatch(/align-items:\s*stretch/)
    expect(cssBlock('spielbrett')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid rgba\(6, 57, 7, 0.7\)/)
  })
})
