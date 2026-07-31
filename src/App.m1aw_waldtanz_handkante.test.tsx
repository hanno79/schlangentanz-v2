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
    // M1d0 22.06.2026: Handkarten-Panel hat jetzt grid-area: hand in der
    // benannten Bottom-Row "sp-plakette hand arenazug" statt grid-row: 4 +
    // align-self: end. Die expliziten Positions-Properties entfallen,
    // weil das benannte Grid-Areas-Schema die Lage explizit beschreibt.
    // Kommentare muessen vorher entfernt werden, weil der AENDERUNG-Kommentar
    // noch "pointer-events:none" als veraltet beschreibt.
    const handGridDeklarationen = handGridBlock
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
    expect(handGridDeklarationen).toMatch(/grid-area:\s*hand\b/)
    expect(handGridDeklarationen).not.toMatch(/grid-row:\s*[34]/)
    expect(handGridDeklarationen).not.toMatch(/align-self:\s*end/)
    expect(handGridDeklarationen).not.toMatch(/pointer-events:\s*none/)
    expect(handGridBlock).toMatch(/z-index:\s*4/)
    expect(handGridBlock).toMatch(/max-height:\s*clamp\(13rem,\s*24vh,\s*15rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-panel"] button')).toMatch(/pointer-events:\s*auto/)

    const arenaBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    // M1d0 22.06.2026: Arenastein-Hoehe ergibt sich jetzt aus dem
    // benannten Grid-Auto-Flow + fester Arenastein-Hoehe clamp(28rem,
    // 50vh, 30rem). Die alte explizite Pin-Hoehe 32.5rem/58vh/33rem und
    // das bottom-Padding sind obsolet.
    expect(arenaBlock).toMatch(/grid-area:\s*arenastein/)
    expect(arenaBlock).not.toMatch(/height:\s*clamp\(32\.5rem,\s*58vh,\s*33rem\)/)
    expect(arenaBlock).toMatch(/overflow:\s*hidden/)

    // M3i (Pitfall #48 Cascade-Contract-Migration): Die Karten-Hoehe lebt jetzt in der
    // spezifischeren Spielkartenfaecher-Kaskade statt im einfachen Basis-Selector, und
    // die Kartenreihe clippt nicht mehr per overflow:hidden, sondern der Handkarte-Wrapper
    // erlaubt overflow:visible, damit die handkarte-wackelt-Hebeanimation nicht abgeschnitten wird.
    /* ÄNDERUNG [31.07.2026]: S-2c — CSS-Quelltext-Assert auf die M3i-Kartenhöhe
       `clamp(5rem, 9vh, 6rem)` entfernt. M3i hatte diesen Wert gesenkt, damit die
       Hand ins Erstbild rutscht, und dabei den M2i-Hero-Vertrag (>= 100 px)
       unterschritten. Seit die Bodenleiste am Viewport-Boden verankert ist, gilt
       wieder die Hero-Größe. Gemessen statt gelesen:
       tests/layout/hand_am_brettrand.spec.ts */
    expect(appCss.match(/^\.handkarte \{([^}]*)\}/m)?.[1] ?? '').toMatch(/overflow:\s*visible/)

    expect(cssBlock('.spielbereich--game-route [class~="handkartenleiste--tiefenfaecher"]')).toMatch(/padding-block:\s*0/)
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-status"]')).toMatch(/display:\s*none/)
    expect(smokeScript).toContain('pruefeM1awHandkante')
    expect(smokeScript).toContain('Handkante: Hand liegt zu hoch')
    // M1d0 22.06.2026: Handbuehnen-Blockaden werden jetzt als vertikale
    // Ueberlappung zwischen Hand-Panel und Arenastein geprueft, weil das
    // Hand-Panel in der benannten Grid-Row "hand" liegt und Arenastein und
    // Hand-Panel strukturell nicht mehr ueberlappen koennen. Die alte
    // "leere Handbuehne blockiert das Brett"-Pruefung wurde durch die
    // praezisere vertikale Ueberlappungs-Pruefung ersetzt.
    expect(smokeScript).toContain('Hand-Panel ueberlappt Arenastein vertikal')
    expect(smokeScript).toContain('M1aw Handkante')
  })
})
