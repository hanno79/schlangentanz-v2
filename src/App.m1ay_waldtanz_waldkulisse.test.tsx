/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ay legt eine sichtbare Google-Stitch-Waldkulisse hinter das /game-Brett, ohne Brett-/Hand-Klicks zu blockieren.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/live_smoke.mjs', 'utf8')
const cssBlock = (selector: string) => appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1ay Waldtanz-Waldkulisse', () => {
  it('macht /game zur sonnigen Waldlichtung mit dekorativer, klicksicherer Kulisse', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const arena = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const hand = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(spielbereich).toHaveClass('spielbereich--game-route')
    expect(arena).toHaveClass('waldtanz-arenastein')
    expect(hand).toHaveClass('handkarten-panel--waldtanz-handbuehne')

    const gameRouteBlock = cssBlock('.spielbereich--game-route')
    expect(gameRouteBlock).toMatch(/position:\s*relative/)
    expect(gameRouteBlock).toMatch(/isolation:\s*isolate/)
    expect(gameRouteBlock).toMatch(/background:[\s\S]*#87ceeb/i)
    expect(gameRouteBlock).toMatch(/radial-gradient\(circle at 14% 18%/)
    expect(gameRouteBlock).toMatch(/overflow:\s*clip/)

    const canopyBlock = cssBlock('.spielbereich--game-route::before')
    expect(canopyBlock).toMatch(/pointer-events:\s*none/)
    expect(canopyBlock).toMatch(/radial-gradient\(circle at 15% 20%/)
    expect(canopyBlock).toMatch(/z-index:\s*0/)

    const forestFloorBlock = cssBlock('.spielbereich--game-route::after')
    expect(forestFloorBlock).toMatch(/pointer-events:\s*none/)
    expect(forestFloorBlock).toMatch(/repeating-radial-gradient/)
    expect(forestFloorBlock).toMatch(/border-radius:\s*3rem/)

    expect(cssBlock('.spielbereich--game-route > *')).toMatch(/z-index:\s*1/)
    expect(smokeScript).toContain('await pruefeM1ayWaldkulisse(seite)')
    expect(smokeScript).toContain('M1ay Waldkulisse')
  })
})
