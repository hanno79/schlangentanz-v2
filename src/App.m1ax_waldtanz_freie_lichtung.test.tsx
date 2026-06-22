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
    // M1d0 22.06.2026: Handkarten-Panel wurde von clamp(10.25rem, 23vh, 12.1rem)
    // auf clamp(8rem, 18vh, 9.5rem) reduziert, damit der Brettschritt-Stempel
    // und die Spielerplakette auf gleicher Hoehe sichtbar bleiben. Das Panel
    // ist nicht mehr pointer-events:none (es liegt jetzt in einer eigenen
    // Grid-Zelle unter dem Arenastein, nicht mehr als Overlay darueber).
    // Kommentare muessen vorher entfernt werden, weil der AENDERUNG-Kommentar
    // das Wort "pointer-events:none" noch enthaelt.
    const handBlockClean = handBlock.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(handBlockClean).toMatch(/max-height:\s*clamp\(8rem,\s*18vh,\s*9\.5rem\)/)
    expect(handBlockClean).toMatch(/padding:\s*0\.2rem\s+0\.45rem/)
    expect(handBlockClean).not.toMatch(/pointer-events:\s*none/)

    const buehneBlock = cssBlock('.spielbereich--game-route [class~="handkarten-buehne"]')
    expect(buehneBlock).toMatch(/min-height:\s*0/)
    expect(buehneBlock).toMatch(/height:\s*0/)
    expect(buehneBlock).toMatch(/padding:\s*0/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-buehne__statuschip"]')).toMatch(/display:\s*none/)

    const kartenBlock = cssBlock('.spielbereich--game-route [class~="handkarte__button--karte"]')
    expect(kartenBlock).toMatch(/height:\s*clamp\(5\.8rem,\s*10vh,\s*6\.1rem\)/)
    expect(kartenBlock).toMatch(/min-height:\s*clamp\(5\.8rem,\s*10vh,\s*6\.1rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarte__idplakette"]')).toMatch(/display:\s*none/)

    expect(smokeScript).toContain('pruefeM1axFreieLichtung')
    expect(smokeScript).toContain('M1ax Freie Lichtung')
    expect(smokeScript).toContain('Handkante verdeckt zu viel Schlangenlichtung')
  })
})
