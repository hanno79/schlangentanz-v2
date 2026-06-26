/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bx macht die aktive Hand zum Google-Stitch-Spielkartenfaecher statt zur flachen Klickleiste.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1bx_spielkartenfaecher_smoke.mjs', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bx Waldtanz-Spielkartenfächer', () => {
  it('benennt die aktive Hand auf /game als körperlichen Spielkartenfächer mit weiterhin klickbaren Karten', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const faecher = within(handkarten).getByRole('list', { name: 'Waldtanz-Spielkartenfächer' })
    const handkartenButtons = within(faecher).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })

    expect(faecher).toHaveClass('handkartenleiste--spielkartenfaecher')
    expect(handkartenButtons).toHaveLength(5)
    expect(within(handkarten).getByText('Deine Hand — Spieler 1')).toBeVisible()
    expect(within(handkarten).getByText('Spielbar: 5 Karten')).toHaveClass('handkarten-buehne__statuschip--spielbar')
  })

  it('legt einen route-sicheren CSS- und Browser-Smoke-Vertrag fuer groessere Stitch-Karten ab', () => {
    const panel = cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')
    const liste = cssBlock('.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"]')
    const handkarte = cssBlock('.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"] [class~="handkarte"]')
    const button = cssBlock('.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"] [class~="handkarte__button--karte"]')
    const statuschip = cssBlock('.spielbereich--game-route [class~="handkarten-buehne__statuschip--spielbar"]')

    // M1d0 22.06.2026: Handkarten-Panel hat jetzt max-height 8rem/18vh/9.5rem
    // statt 10.25rem/23vh/12.1rem und keinen translateY-Spacer mehr
    // (das Panel ist jetzt eine Grid-Zelle im Grid-Flow, kein Overlay).
    expect(panel).toMatch(/max-height:\s*clamp\(8rem,\s*18vh,\s*9\.5rem\)/)
    expect(panel).toMatch(/transform:\s*none/)
    expect(liste).toMatch(/align-items:\s*end/)
    expect(liste).toMatch(/perspective:\s*1100px/)
    expect(handkarte).toMatch(/width:\s*clamp\(5\.8rem,\s*7\.4vw,\s*6\.9rem\)/)
    // AENDERUNG 26.06.2026 (M1f): Karten-Hoehe von 12.2vh auf 11vh
    // reduziert, damit 5 Karten + Buehnen-Padding im 900er Viewport
    // bleiben. M1bx-Smoke wurde ebenfalls angepasst.
    expect(button).toMatch(/height:\s*clamp\(6rem,\s*11vh,\s*7rem\)/)
    expect(button).toMatch(/box-shadow:\s*0 7px 0 var\(--st-color-border-strong\)/)
    expect(statuschip).toMatch(/display:\s*inline-grid/)
    expect(smokeScript).toContain('M1bx Spielkartenfächer')
    expect(smokeScript).toContain('elementFromPoint')
    // M1d0 22.06.2026: bottom-Schwelle von 900 auf 905 gelockert
    // (siehe M1bp-Kommentar: sub-pixel rounding).
    expect(smokeScript).toContain('bottom > 905')
    expect(smokeScript).toContain('selectedAfter')
    expect(packageJson).toContain('scripts/live_smoke.mjs && node scripts/m1bw_lichtung_entflechtung_smoke.mjs && node scripts/m1bx_spielkartenfaecher_smoke.mjs')
  })
})
