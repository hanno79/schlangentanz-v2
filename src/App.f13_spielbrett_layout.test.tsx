/**
 * Author: rahn
 * Datum: 04.06.2026
 * Version: 1.0
 * Beschreibung: F13 UI-Test für ein ruhigeres zweispaltiges Spielbrett-/Schlangenlayout.
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

function zustandMitSpielbrettSchlangen() {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  const eigeneKarten = zustand.spieler[0].hand.slice(0, 2)
  const gegnerKarten = zustand.spieler[1].hand.slice(0, 2)

  zustand.spieler[0].hand = zustand.spieler[0].hand.slice(2)
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(2)
  zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-f13', karten: eigeneKarten, zustand: 'aktiv' }]
  zustand.spieler[1].schlangen = [{ id: 'schlange-spieler-2-f13', karten: gegnerKarten, zustand: 'aktiv' }]

  return zustand
}

describe('F13 Spielbrett-/Layout-Polish', () => {
  it('ordnet eigene und gegnerische Schlangen als ruhige Spielfeld-Spalten an', () => {
    render(<App initialZustand={zustandMitSpielbrettSchlangen()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const gegnerGruppe = within(schlangenbereich).getByRole('region', { name: 'Gegnerische Schlangen' })

    expect(within(eigeneGruppe).getByText('schlange-spieler-1-f13')).toBeInTheDocument()
    expect(within(gegnerGruppe).getByText('schlange-spieler-2-f13')).toBeInTheDocument()
    expect(within(eigeneGruppe).getByRole('list', { name: 'Kartenreihe schlange-spieler-1-f13' })).toBeInTheDocument()
    expect(within(gegnerGruppe).getByRole('list', { name: 'Kartenreihe schlange-spieler-2-f13' })).toBeInTheDocument()
    expect(cssBlock('schlangenbereich')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*280px\),\s*1fr\)\)/)
    expect(cssBlock('schlangenbereich')).toMatch(/align-items:\s*stretch/)
    expect(cssBlock('schlangen-gruppe')).toMatch(/align-content:\s*start/)
    expect(cssBlock('schlangenleiste')).toMatch(/grid-template-columns:\s*1fr/)
    expect(cssBlock('schlangekarte')).toMatch(/min-height:\s*8rem/)
    expect(cssBlock('schlangekarte')).toMatch(/align-content:\s*start/)
    expect(appCss).toMatch(/\.schlangenbereich\s*>\s*h4\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s)
  })
})
