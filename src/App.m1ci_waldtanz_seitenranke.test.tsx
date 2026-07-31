/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1ci verdichtet den /game-Spielrahmen zur schmalen Waldtanz-Seitenranke, damit das Brett sichtbar mehr Raum bekommt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1ci_seitenranke_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1ci Waldtanz-Seitenranke', () => {
  it('macht den /game-Spielrahmen zur kompakten Ranke statt zur breiten Debug-Seitenleiste', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const seitenranke = within(spielbereich).getByRole('complementary', { name: 'Waldtanz-Spielrahmen' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const kompass = within(seitenranke).getByRole('region', { name: 'Waldtanz-Kompass' })

    expect(seitenranke).toHaveClass('waldtanz-seitenmenue--seitenranke')
    expect(seitenranke.compareDocumentPosition(spieltisch) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(seitenranke).getByRole('heading', { name: 'Schlangentanz' })).toBeVisible()
    expect(within(seitenranke).getByLabelText('Phase: Ausspielphase')).toHaveClass('waldtanz-seitenmenue__rankenchip')
    expect(within(seitenranke).getByLabelText('Handkarten: 5')).toHaveClass('waldtanz-seitenmenue__rankenchip')
    expect(within(seitenranke).getByLabelText('Offene Quests: 3')).toHaveClass('waldtanz-seitenmenue__rankenchip')
    expect(within(seitenranke).queryByRole('button')).not.toBeInTheDocument()
    expect(within(seitenranke).queryByRole('link')).not.toBeInTheDocument()
    expect(within(kompass).getByText('Nächster Schritt: Eine spielbare Aktion auswählen.')).toBeInTheDocument()
  })

  it('schützt den route-spezifischen CSS- und Smoke-Vertrag der schmalen Seitenranke', () => {
    const routeGrid = cssBlock('.spielbereich--waldtanz.spielbereich--game-route')
    const routeRanke = cssBlock('.spielbereich--game-route [class~="waldtanz-seitenmenue--seitenranke"]')
    const rankenchip = cssBlock('waldtanz-seitenmenue__rankenchip')

    expect(routeGrid).toMatch(/grid-template-columns:\s*minmax\(6\.5rem,\s*0\.22fr\)\s*minmax\(0,\s*2\.78fr\)/)
    expect(routeRanke).toMatch(/max-width:\s*7\.25rem/)
    expect(routeRanke).toMatch(/overflow:\s*visible/)
    expect(routeRanke).toMatch(/scrollbar-gutter:\s*auto/)
    expect(rankenchip).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(rankenchip).toMatch(/box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
    expect(istVerdrahtet('m1ci_seitenranke_smoke.mjs')).toBe(true)
    expect(smokeScript).toContain('M1ci Seitenranke')
    expect(smokeScript).toContain('seitenranke.width > 128')
    expect(smokeScript).toContain('brett.width < 1030')
  })
})
