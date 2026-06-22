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

    expect(panel).toMatch(/max-height:\s*clamp\(8rem,\s*18vh,\s*9\.5rem\)/)
    expect(panel).toMatch(/transform:\s*none/)
    expect(panel).toMatch(/padding:\s*0\.2rem 0\.45rem/)
    expect(karte).toMatch(/box-sizing:\s*border-box/)
    expect(karte).toMatch(/height:\s*clamp\(5\.8rem, 10vh, 6\.1rem\)/)
    expect(karte).toMatch(/min-height:\s*clamp\(5\.8rem, 10vh, 6\.1rem\)/)
    expect(karte).toMatch(/padding:\s*0\.35rem/)
    expect(buehne).toMatch(/gap:\s*0\.25rem/)
    expect(smokeScript).toContain('pruefeM1bpHandflaeche')
    expect(smokeScript.indexOf('pruefeM1bpHandflaeche(seite)')).toBeLessThan(smokeScript.indexOf('pruefeM1bcWaldtanzHandbank(seite)'))
    expect(smokeScript).toContain('bottom > 900')
    expect(smokeScript).toContain('height > 124')
    expect(smokeScript).toContain('elementFromPoint')
    expect(smokeScript).toContain('erste Handkarte vollständig im Erstbild')
  })
})
