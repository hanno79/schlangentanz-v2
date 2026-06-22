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
    // AENDERUNG 22.06.2026: M1cx verschiebt die Hand von grid-row 3 auf grid-row 4,
    // damit sie UNTER dem Arenastein sitzt (keine Collision mehr). Wichtig: dieser
    // Test muss die echte Deklaration pruefen, NICHT das Kommentar-Match. Der Block
    // enthaelt im Kommentar den String "grid-row 3", was ein falsches Positiv liefern
    // wuerde. Wir matchen daher auf die Kommentar-bereinigte Form (Semikolon-getrennte
    // Deklarationszeilen) statt auf den rohen Block.
    const handGridDeklarationen = handGridBlock
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
    expect(handGridDeklarationen).toMatch(/grid-row:\s*4\s*;/)
    expect(handGridDeklarationen).not.toMatch(/grid-row:\s*3/)
    expect(handGridBlock).toMatch(/align-self:\s*end/)
    expect(handGridBlock).toMatch(/z-index:\s*4/)
    expect(handGridBlock).toMatch(/max-height:\s*clamp\(10\.25rem,\s*23vh,\s*12\.1rem\)/)
    expect(handGridBlock).toMatch(/pointer-events:\s*none/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-panel"] button')).toMatch(/pointer-events:\s*auto/)

    const arenaBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(arenaBlock).toMatch(/height:\s*clamp\(32\.5rem,\s*58vh,\s*33rem\)/)
    expect(arenaBlock).toMatch(/max-height:\s*none/)
    expect(arenaBlock).toMatch(/padding-bottom:\s*clamp\(5\.2rem,\s*13vh,\s*7\.2rem\)/)
    expect(arenaBlock).toMatch(/overflow:\s*visible/)

    const kartenBlock = cssBlock('.spielbereich--game-route [class~="handkarte__button--karte"]')
    expect(kartenBlock).toMatch(/height:\s*clamp\(5\.8rem,\s*10vh,\s*6\.1rem\)/)
    expect(kartenBlock).toMatch(/min-height:\s*clamp\(5\.8rem,\s*10vh,\s*6\.1rem\)/)
    expect(kartenBlock).toMatch(/overflow:\s*hidden/)

    expect(cssBlock('.spielbereich--game-route [class~="handkartenleiste--tiefenfaecher"]')).toMatch(/padding-block:\s*0/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-status"]')).toMatch(/display:\s*none/)
    expect(smokeScript).toContain('pruefeM1awHandkante')
    expect(smokeScript).toContain('Handkante: Hand liegt zu hoch')
    expect(smokeScript).toContain('Handkante: leere Handbühne blockiert das Brett')
    expect(smokeScript).toContain('M1aw Handkante')
  })
})
