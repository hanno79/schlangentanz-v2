/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1e beweist den Stitch-Spielerrahmen mit Gegnerhand, Punkteplaketten und handnaher Spieleridentität.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function spielerrahmenZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.62))
}

describe('M1e Waldtanz-Spielerrahmen', () => {
  it('rahmt die Steinplatten-Arena mit Gegnerhand und Spielerplaketten wie ein echtes Brettspiel', () => {
    render(<App initialZustand={spielerrahmenZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const spielerrahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(spielerrahmen).toHaveClass('waldtanz-spielerrahmen')
    expect(within(spielerrahmen).getByText('Gegner: Spieler 2')).toBeInTheDocument()
    const gegnerliste = within(spielerrahmen).getByRole('list', { name: 'Gegner am Tisch' })
    expect(within(gegnerliste).getAllByText('5 verdeckte Karten')).toHaveLength(3)
    expect(within(spielerrahmen).getByText('Du — Spieler 1')).toBeInTheDocument()
    expect(within(spielerrahmen).getByText('5 Handkarten bereit')).toBeInTheDocument()
    expect(spielerrahmen.querySelectorAll('.waldtanz-spielerrahmen__kartenruecken')).toHaveLength(15)
    expect(spielerrahmen.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(schlangenbereich.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    expect(cssBlock('waldtanz-spielerrahmen')).toMatch(/display:\s*grid/)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__plakette\s*\{[\s\S]*border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__kartenruecken\s*\{[\s\S]*box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__plakette--du\s*\{[\s\S]*transform:\s*rotate\(-2deg\)/)
  })
})
