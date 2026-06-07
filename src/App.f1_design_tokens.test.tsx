/**
 * Author: rahn
 * Datum: 03.06.2026
 * Version: 1.0
 * Beschreibung: F1 UI-Test für Stitch-inspirierte Design-Tokens.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function deterministischerAppZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F1 Stitch Design Tokens', () => {
  it('stellt die spielerische Wald-Palette als CSS-Variablen bereit, ohne Engine-Debuganzeigen zu entfernen', () => {
    render(<App initialZustand={deterministischerAppZustand()} />)

    expect(appCss).toContain('--st-color-background: #ecffe3;')
    expect(appCss).toContain('--st-color-primary: #4b6700;')
    expect(appCss).toContain('--st-color-primary-container: #a4de02;')
    expect(appCss).toContain('--st-color-secondary-container: #fecb00;')
    expect(appCss).toContain('--st-color-tertiary: #b12d00;')
    expect(appCss).toContain('--st-color-border-strong: #063907;')
    expect(appCss).toContain("--st-font-headline: 'Rubik'")
    expect(appCss).toContain("--st-font-body: 'Plus Jakarta Sans'")
    expect(appCss).toContain('--st-border-width-chunky: 3px;')
    expect(appCss).toContain('--st-shadow-hard: 0 4px 0 #063907;')

    expect(screen.getByRole('region', { name: /spielstatus/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /legale aktionen/i })).toBeInTheDocument()
  })
})
