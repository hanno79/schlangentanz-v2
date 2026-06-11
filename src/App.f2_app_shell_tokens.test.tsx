/**
 * Author: rahn
 * Datum: 03.06.2026
 * Version: 1.0
 * Beschreibung: F2 UI-Test für die tokenverdrahtete App-Shell.
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

describe('F2 tokenverdrahtete App-Shell', () => {
  it('nutzt Stitch-Tokens für äußere Hülle und Hero, ohne bestehende Spielbereiche zu entfernen', () => {
    render(<App initialZustand={deterministischerAppZustand()} />)

    expect(appCss).toMatch(/\.app-shell\s*{[^}]*background:\s*var\(--st-color-background\)/s)
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*color:\s*var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*font-family:\s*var\(--st-font-body\)/s)
    expect(appCss).toMatch(/\.hero\s*{[^}]*border:\s*var\(--st-border-width-chunky\)\s+solid\s+var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.hero\s*{[^}]*background:\s*var\(--st-color-primary-container\)/s)
    expect(appCss).toMatch(/\.hero\s*{[^}]*box-shadow:\s*var\(--st-shadow-hard\)/s)
    expect(appCss).toMatch(/h1\s*{[^}]*font-family:\s*var\(--st-font-headline\)/s)
    expect(appCss).toMatch(/h1,\s*h2\s*{[^}]*color:\s*var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/p,\s*li\s*{[^}]*color:\s*var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.eyebrow\s*{[^}]*color:\s*var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/code\s*{[^}]*color:\s*var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/code\s*{[^}]*background:\s*var\(--st-color-background\)/s)

    expect(screen.getByRole('region', { name: /spielstatus/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Aktionen' })).toBeInTheDocument()
  })
})
