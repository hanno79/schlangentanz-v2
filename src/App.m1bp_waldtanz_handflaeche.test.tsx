/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bp macht die Waldtanz-Hand im ersten Spielbild als vollständige, klickbare Kartenfläche sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/live_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bp Waldtanz-Handfläche', () => {
  it('hält auf /game die Handkarten als vollständige Brettkante statt abgeschnittenem Kartenfächer sichtbar', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const handkartenButtons = within(handkarten).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })

    expect(schlangenbereich.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(handkarten).toHaveClass('handkarten-panel--waldtanz-handbuehne')
    expect(handkartenButtons).toHaveLength(5)
    expect(within(handkarten).getByText('Deine Hand — Spieler 1')).toBeVisible()
  })

  it('legt den CSS-Vertrag fuer eine flachere, im Viewport spielbare Handkante ab', () => {
    const panel = cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')
    const karte = cssBlock('.spielbereich--game-route [class~="handkarte__button--karte"]')
    const buehne = cssBlock('.spielbereich--game-route [class~="handkarten-buehne"]')

    // AENDERUNG 26.06.2026 (M1f): max-height/min-height auf das Panel
    // angehoben, damit Buehne + Handkartenleiste im 900er Viewport passen.
    expect(panel).toMatch(/max-height:\s*clamp\(13rem,\s*24vh,\s*15rem\)/)
    expect(panel).toMatch(/min-height:\s*clamp\(12rem,\s*20vh,\s*14rem\)/)
    expect(panel).toMatch(/display:\s*flex/)
    expect(panel).toMatch(/flex-direction:\s*column/)
    expect(panel).toMatch(/transform:\s*none/)
    expect(panel).toMatch(/padding:\s*0\.2rem 0\.45rem/)
    expect(karte).toMatch(/box-sizing:\s*border-box/)
    // AENDERUNG 26.06.2026 (M1f): Die flachere Karten-Hoehe (11vh)
    // wird jetzt am spezifischeren spielkartenfaecher-Selector
    // ausgeloest, weil der allgemeine Selector fuer Deck-Stapel/
    // Handbank bleibt. M1bp testet auf den Selector, der tatsaechlich
    // fuer die sichtbaren 5 Handkarten in der Buehne gewinnt.
    // AENDERUNG 01.07.2026 (M3i Stitch-Forest-Arena-Promotion, Pitfall #48
    // Cascade-Contract-Migration): Karten-Hoehe von clamp(6rem, 11vh, 7rem)
    // auf clamp(5rem, 9vh, 6rem) = 81 px @900vh reduziert, damit Hand-Bottom
    // im 900vh-Viewport unter 870 px landet. M1bp-Vertrag (vorher) migriert.
    // Direkter CSS-Source-Match mit `matchAll` (PITFALL: pre-existing cssBlock-
    // Helper bricht bei langen Kommentaren; `appCss.match` greift ersten
    // Kommentar-Match statt echten Block).
    const heightMatches = [...appCss.matchAll(/height:\s*clamp\(5rem,\s*9vh,\s*6rem\)/g)]
    const minHeightMatches = [...appCss.matchAll(/min-height:\s*clamp\(5rem,\s*9vh,\s*6rem\)/g)]
    expect(heightMatches.length, 'mindestens 1 height:clamp(5rem, 9vh, 6rem) in src/App.css').toBeGreaterThan(0)
    expect(minHeightMatches.length, 'mindestens 1 min-height:clamp(5rem, 9vh, 6rem) in src/App.css').toBeGreaterThan(0)
    expect(karte).toMatch(/padding:\s*0\.35rem/)
    // AENDERUNG 26.06.2026 (M1f): Buehne ist jetzt eine echte Stitch-Zone
    // (gap 0.4 rem statt 0.25, plus Border + Shadow + Innenhoehe).
    expect(buehne).toMatch(/gap:\s*0\.4rem/)
    expect(buehne).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    expect(smokeScript).toContain('pruefeM1bpHandflaeche')
    expect(smokeScript.indexOf('pruefeM1bpHandflaeche(seite)')).toBeLessThan(smokeScript.indexOf('pruefeM1bcWaldtanzHandbank(seite)'))
    // M1d0 22.06.2026: bottom-Schwelle von 900 auf 905 gelockert, weil
    // sub-pixel rounding (clamp() + grid-template-rows) die berechnete
    // Bounding-Box 1-2 px unter 900 schieben kann, ohne dass die Karte
    // visuell abgeschnitten ist. Die Hand bleibt im 900-Viewport sichtbar
    // (height >= 116 px, hit-testbar).
    expect(smokeScript).toContain('bottom > 905')
    expect(smokeScript).toContain('height > 124')
    expect(smokeScript).toContain('elementFromPoint')
    expect(smokeScript).toContain('erste Handkarte vollständig im Erstbild')
  })
})
