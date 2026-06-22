/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cc macht die Handbank zu einem schmalen Waldtanz-Handsteg statt einem breiten Brett-Overlay.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1cc_handsteg_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cc Waldtanz-Handsteg', () => {
  it('rendert die Handbank auf /game als eigenen schmalen Steg statt als breite Waldtaschen-Überlagerung', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const handbuehne = within(handkarten).getByRole('group', { name: 'Waldtanz-Handbühne' })
    const handsteg = handbuehne.querySelector('.handkarten-buehne__handsteg')
    const spielkartenfaecher = within(handkarten).getByRole('list', { name: 'Waldtanz-Spielkartenfächer' })

    expect(handsteg).toBeInstanceOf(HTMLElement)
    expect(handsteg).toHaveAttribute('aria-hidden', 'true')
    expect(handkarten).toHaveClass('handkarten-panel--waldtanz-handbuehne')
    expect(spielkartenfaecher).toHaveClass('handkartenleiste--spielkartenfaecher')
  })

  it('legt den CSS- und Smoke-Vertrag für einen zentralen, nicht seitlich dominierenden Handsteg ab', () => {
    const routeHandPanel = cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')
    const alterPseudoSteg = cssBlock('.spielbereich--game-route [class~="handkarten-buehne"]::before')
    const handsteg = cssBlock('.spielbereich--game-route [class~="handkarten-buehne__handsteg"]')

    // M1d0 22.06.2026: Handkarten-Panel hat jetzt grid-area: hand in der
    // benannten Bottom-Row. width: 100% ersetzt die alte min(100%, 34rem)-
    // Begrenzung; margin-right: clamp(10rem, 25vw, 18rem) ist obsolet,
    // weil die Gegnerplakette nicht mehr rechts daneben sitzt, sondern
    // in einer eigenen Grid-Zeile darueber.
    expect(routeHandPanel).toMatch(/width:\s*100%/)
    expect(routeHandPanel).not.toMatch(/margin-right:\s*clamp\(10rem,\s*25vw,\s*18rem\)/)
    expect(alterPseudoSteg).toMatch(/display:\s*none/)
    expect(handsteg).toMatch(/width:\s*min\(100%,\s*34rem\)/)
    expect(handsteg).toMatch(/left:\s*50%/)
    expect(handsteg).toMatch(/transform:\s*translateX\(-50%\)/)
    expect(handsteg).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(handsteg).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    expect(smokeScript).toContain('M1cc Handsteg')
    expect(smokeScript).toContain('1100')
    expect(smokeScript).toContain('waldtanz-waldtaschen')
    expect(smokeScript).toContain('elementFromPoint')
    expect(packageJson).toContain('node scripts/m1cb_zielranken_smoke.mjs && node scripts/m1cc_handsteg_smoke.mjs')
  })
})
