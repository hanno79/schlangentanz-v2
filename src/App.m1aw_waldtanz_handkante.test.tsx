/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1aw hält die aktive Hand als Stitch-nahe Handkante im ersten Waldtanz-Spielbild sichtbar.
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

describe('M1aw Waldtanz-Handkante', () => {
  it('verankert die Handkarten visuell an der Waldstein-Kante statt tief unter dem Erstbild', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arena = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const ersteKarte = within(handkarten).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })[0]

    expect(arena.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(handkarten).toHaveClass('handkarten-panel--waldtanz-handbuehne')
    expect(ersteKarte).toHaveClass('handkarte__button--karte')

    const handGridBlock = cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')
    expect(handGridBlock).toMatch(/grid-row:\s*3/)
    expect(handGridBlock).toMatch(/align-self:\s*end/)
    expect(handGridBlock).toMatch(/z-index:\s*4/)
    expect(handGridBlock).toMatch(/max-height:\s*clamp\(11\.5rem,\s*24vh,\s*13rem\)/)
    expect(handGridBlock).toMatch(/pointer-events:\s*none/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-panel"] button')).toMatch(/pointer-events:\s*auto/)

    const arenaBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(arenaBlock).toMatch(/max-height:\s*clamp\(24rem,\s*52vh,\s*30\.5rem\)/)
    expect(arenaBlock).toMatch(/padding-bottom:\s*clamp\(6rem,\s*17vh,\s*8\.5rem\)/)

    const kartenBlock = cssBlock('.spielbereich--game-route [class~="handkarte__button--karte"]')
    expect(kartenBlock).toMatch(/min-height:\s*clamp\(8rem,\s*16vh,\s*9\.75rem\)/)
    expect(kartenBlock).toMatch(/overflow:\s*hidden/)

    expect(cssBlock('.spielbereich--game-route [class~="handkartenleiste--tiefenfaecher"]')).toMatch(/padding-block:\s*0/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-status"]')).toMatch(/display:\s*none/)
    expect(smokeScript).toContain('pruefeM1awHandkante')
    expect(smokeScript).toContain('Handkante: Hand liegt zu hoch')
    expect(smokeScript).toContain('Handkante: leere Handbühne blockiert das Brett')
    expect(smokeScript).toContain('M1aw Handkante')
  })
})
