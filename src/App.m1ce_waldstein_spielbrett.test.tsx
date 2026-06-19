/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1ce macht den Waldtanz-Arenastein auf /game wieder zum sichtbaren Spielbrett statt zu einem Scrollpanel.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1ce_waldstein_spielbrett_smoke.mjs', 'utf8')

function cssBlock(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M1ce Waldstein-Spielbrett', () => {
  it('behandelt den /game-Arenastein als zusammenhängende Brettfläche statt als internes Scrollpanel', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arena = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const lichtung = within(arena).getByRole('region', { name: 'Schlangenlichtung' })
    const waldobjekte = within(arena).getByRole('complementary', { name: 'Waldobjekte' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(arena.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(lichtung).toBeVisible()
    expect(waldobjekte).toBeVisible()
    expect(within(lichtung).getByRole('button', { name: 'Neue Schlange starten' })).toBeVisible()

    const routeArena = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(routeArena).toMatch(/height:\s*clamp\(32\.5rem,\s*58vh,\s*33rem\)/)
    expect(routeArena).toMatch(/overflow:\s*visible/)
    expect(routeArena).not.toMatch(/overflow:\s*auto/)
    expect(routeArena).not.toMatch(/scrollbar-gutter:\s*stable/)
    expect(routeArena).toMatch(/padding-bottom:\s*clamp\(5\.2rem,\s*13vh,\s*7\.2rem\)/)

    expect(packageJson).toContain('node scripts/m1ce_waldstein_spielbrett_smoke.mjs')
    expect(smokeScript).toContain("width: 1100")
    expect(smokeScript).toContain("width: 1280")
  })
})
