/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ax macht die Schlangenlichtung trotz board-naher Handkante wieder frei lesbar und spielbar.
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

describe('M1ax Waldtanz-Freie Lichtung', () => {
  it('kompaktiert die Handkante, damit Startkreis und Schlangenlichtung im Erstbild spielbar bleiben', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arena = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const schlangenbereich = within(arena).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    const startzone = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    const zielkompass = within(schlangenbereich).getByRole('region', { name: 'Waldtanz-Zielkompass' })

    expect(schlangenbereich).toHaveClass('schlangenbereich--waldlichtung')
    expect(startzone).toHaveClass('schlangen-startzone--magiekreis')
    expect(startzone.compareDocumentPosition(zielkompass)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(handkarten).toHaveClass('handkarten-panel--waldtanz-handbuehne')

    const handBlock = cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')
    expect(handBlock).toMatch(/max-height:\s*clamp\(11\.5rem,\s*24vh,\s*13rem\)/)
    expect(handBlock).toMatch(/padding:\s*0\.35rem\s+0\.55rem/)
    expect(handBlock).toMatch(/pointer-events:\s*none/)

    const buehneBlock = cssBlock('.spielbereich--game-route [class~="handkarten-buehne"]')
    expect(buehneBlock).toMatch(/min-height:\s*auto/)
    expect(buehneBlock).toMatch(/padding:\s*0\.25rem\s+0\.4rem/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-buehne__statuschip"]')).toMatch(/display:\s*none/)

    const kartenBlock = cssBlock('.spielbereich--game-route [class~="handkarte__button--karte"]')
    expect(kartenBlock).toMatch(/min-height:\s*clamp\(8rem,\s*16vh,\s*9\.75rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarte__idplakette"]')).toMatch(/display:\s*none/)

    expect(smokeScript).toContain('pruefeM1axFreieLichtung')
    expect(smokeScript).toContain('M1ax Freie Lichtung')
    expect(smokeScript).toContain('Handkante verdeckt zu viel Schlangenlichtung')
  })
})
