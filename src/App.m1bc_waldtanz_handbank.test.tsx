/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bc macht die Handkante zur freien Waldtanz-Handbank statt zum Brett-Overlay.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/live_smoke.mjs', 'utf8')
const cssBlock = (selector: string) => appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1bc Waldtanz-Handbank', () => {
  it('lässt die Handkarten als Spielkartenbank schweben, ohne den Waldstein mit einem Panel zu verdecken', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arena = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const handbuehne = handkarten.querySelector('.handkarten-buehne') as HTMLElement

    expect(arena.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(handkarten).toHaveClass('handkarten-panel--waldtanz-handbuehne')
    expect(handbuehne).toBeInTheDocument()
    expect(within(handkarten).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ }).length).toBeGreaterThan(0)

    const handPanelRouteBlock = cssBlock('.spielbereich--game-route [class~="handkarten-panel--waldtanz-handbuehne"]')
    expect(handPanelRouteBlock).toMatch(/background:\s*transparent/)
    expect(handPanelRouteBlock).toMatch(/border-color:\s*transparent/)
    expect(handPanelRouteBlock).toMatch(/box-shadow:\s*none/)
    expect(handPanelRouteBlock).toMatch(/backdrop-filter:\s*none/)

    const handbuehneRouteBlock = cssBlock('.spielbereich--game-route [class~="handkarten-buehne"]')
    expect(handbuehneRouteBlock).toMatch(/position:\s*relative/)
    expect(handbuehneRouteBlock).toMatch(/isolation:\s*isolate/)

    const handbankBlock = cssBlock('.spielbereich--game-route [class~="handkarten-buehne"]::before')
    expect(handbankBlock).toMatch(/content:\s*''/)
    expect(handbankBlock).toMatch(/pointer-events:\s*none/)
    expect(handbankBlock).toMatch(/height:\s*clamp\(3\.8rem,\s*8vh,\s*5\.2rem\)/)
    expect(handbankBlock).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(handbankBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)

    const handTitleRouteBlock = cssBlock('.spielbereich--game-route [class~="handkarten-panel"] h4')
    expect(handTitleRouteBlock).toMatch(/position:\s*absolute/)
    expect(handTitleRouteBlock).toMatch(/clip-path:\s*inset\(50%\)/)

    expect(cssBlock('.spielbereich--game-route [class~="handkarten-buehne"] > *')).toMatch(/z-index:\s*1/)
    expect(smokeScript).toContain('pruefeM1bcWaldtanzHandbank')
    expect(smokeScript).toContain('Waldtanz-Handbank: Panel verdeckt noch den Waldstein')
  })
})
