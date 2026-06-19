/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bu verdichtet den Waldstein-Kopf zur Spielbrett-Plakette, damit die Lichtung weniger wie ein Textpanel wirkt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1bu_steinplakette_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bu Waldtanz-Steinplakette', () => {
  it('behält den Waldstein-Kopf als sichtbare Brettplakette, ohne ihn zum dominanten Textpanel zu machen', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const plakette = within(arenastein).getByText('Leuchtender Waldstein').closest('.waldtanz-arenastein__kopf') as HTMLElement
    const lichtung = within(arenastein).getByRole('region', { name: 'Schlangenlichtung' })
    const startkreis = within(lichtung).getByRole('button', { name: 'Neue Schlange starten' })

    expect(plakette).toBeVisible()
    expect(plakette).toHaveClass('waldtanz-arenastein__kopf')
    expect(plakette.compareDocumentPosition(lichtung) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(plakette).getByText('Magische Zielkreise leuchten im Brett.')).toBeInTheDocument()
    expect(startkreis).toBeVisible()
  })

  it('legt route-sichere CSS- und Smoke-Verträge für eine kompakte, klickdurchlässige Steinplakette ab', () => {
    const routeKopf = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__kopf"]')
    const routeKopfText = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__kopf"] p')
    const routeSpielfeld = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__spielfeld"]')
    const routeLichtung = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__schlangenlichtung"]')

    expect(routeKopf).toMatch(/justify-self:\s*start/)
    expect(routeKopf).toMatch(/width:\s*fit-content/)
    expect(routeKopf).toMatch(/max-width:\s*min\(100%,\s*24rem\)/)
    expect(routeKopf).toMatch(/pointer-events:\s*none/)
    expect(routeKopf).toMatch(/transform:\s*rotate\(-1deg\)/)
    expect(routeKopf).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(routeKopf).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(routeKopfText).toMatch(/clip-path:\s*inset\(50%\)/)
    expect(routeSpielfeld).toMatch(/margin-top:\s*-0\.35rem/)
    expect(routeLichtung).toMatch(/padding-top:\s*clamp\(0\.35rem,\s*0\.8vw,\s*0\.55rem\)/)
    expect(smokeScript).toContain('M1bu Steinplakette')
    expect(smokeScript).toContain('pointerEvents !== \'none\'')
    expect(smokeScript).toContain('plakette.width > 390')
  })
})
