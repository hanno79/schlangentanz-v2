/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bh macht gegnerische verdeckte Hände zu körperlichen Laubfächern statt flachen Gegnerlisten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function vierSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bh Waldtanz-Laubfächer', () => {
  it('zeigt alle Gegner als körperliche verdeckte Laubfächer am Spieltisch statt als flache Textliste', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={vierSpielerZustand()} />)

    const rahmen = within(screen.getByRole('region', { name: 'Spieltisch' })).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gegnerliste = within(rahmen).getByRole('list', { name: 'Gegner am Tisch' })
    expect(within(gegnerliste).getAllByRole('group', { name: /Laubfächer von Spieler/ })).toHaveLength(3)
    expect(within(rahmen).queryByText('verdeckter Kartenfächer')).toBeNull()

    const spieler2Platz = within(gegnerliste).getByRole('group', { name: 'Laubfächer von Spieler 2' })
    expect(spieler2Platz).toHaveClass('waldtanz-spielerrahmen__laubfaecher')
    expect(within(spieler2Platz).getByText('Gegner: Spieler 2')).toBeVisible()
    expect(within(spieler2Platz).getByText('Spieler 2 beobachtet den Tanz')).toBeVisible()
    expect(within(spieler2Platz).getByText('5 verdeckte Karten im Laub')).toBeVisible()
    expect(within(spieler2Platz).getByText('nächster Zug')).toBeVisible()

    const faecher = within(spieler2Platz).getByRole('list', { name: 'Verdeckter Laubfächer von Spieler 2' })
    expect(faecher).toHaveClass('waldtanz-spielerrahmen__handruecken--laubfaecher')
    expect(within(faecher).getAllByRole('listitem')).toHaveLength(5)
    expect(within(faecher).getAllByLabelText(/verdeckte Laubkarte .* von Spieler 2/)).toHaveLength(5)
  })

  it('legt den Google-Stitch-CSS-Vertrag fuer Laubfächer mit 3px-Rand, Überlappung und Hard Shadow ab', () => {
    const platzBlock = cssBlock('.waldtanz-spielerrahmen__laubfaecher')
    const faecherBlock = cssBlock('.waldtanz-spielerrahmen__handruecken--laubfaecher')
    const rueckenBlock = cssBlock('.waldtanz-spielerrahmen__kartenruecken--laubkarte')

    expect(platzBlock).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(platzBlock).toMatch(/border-radius:\s*var\(--st-radius-xl\)/)
    expect(platzBlock).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(platzBlock).toMatch(/radial-gradient\(circle at 18% 16%/)
    expect(faecherBlock).toMatch(/display:\s*flex/)
    expect(faecherBlock).toMatch(/margin-left:\s*clamp\(-1\.05rem,\s*-1\.8vw,\s*-0\.55rem\)/)
    expect(rueckenBlock).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(rueckenBlock).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.spielbereich--game-route \[class~="waldtanz-spielerrahmen__handruecken--laubfaecher"\]\s*\{[^}]*min-height:\s*clamp\(5\.4rem,\s*9vw,\s*7\.4rem\)/s)
    expect(appCss).toMatch(/\.spielbereich--game-route \[class~="waldtanz-spielerrahmen__kartenruecken--laubkarte"\]\s*\{[^}]*width:\s*clamp\(2\.65rem,\s*5\.8vw,\s*4\.2rem\)/s)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__kartenruecken--laubkarte:nth-child\(2\)\s*\{[^}]*rotate\(-4deg\)/s)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__kartenruecken--laubkarte:nth-child\(5\)\s*\{[^}]*rotate\(7deg\)/s)
  })
})
