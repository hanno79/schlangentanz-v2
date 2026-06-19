/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1br holt die Magiekreise auf /game als echte runde Brettziele in die Waldlichtung zurück.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1br_magiekreise_lichtung_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1br Waldtanz-Magiekreise in der Lichtung', () => {
  it('behält Magiekreise als Brettziele zwischen Tischkarte und Schlangenbereich statt als entfernte Buttonliste', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const lichtung = within(spieltisch).getByRole('region', { name: 'Schlangenlichtung' })
    const magiekreise = within(lichtung).getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const tischkarte = within(lichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const schlangenbereich = within(lichtung).getByRole('region', { name: 'Schlangenbereich' })
    const kreise = within(magiekreise).getAllByRole('listitem')

    expect(tischkarte.compareDocumentPosition(magiekreise) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(magiekreise.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(kreise).toHaveLength(3)
    expect(within(magiekreise).getByRole('list', { name: 'Leuchtende Brettwege' })).toBeVisible()
  })

  it('legt den /game-CSS-Vertrag fuer runde, hit-testbare Stitch-Dropzonen statt flacher Textkaesten ab', () => {
    const lichtung = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]')
    const magiekreise = cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise"]')
    const magiekreiseInLichtung = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="waldtanz-magiekreise"]')
    const liste = cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise__liste"]')
    const kreis = cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise__kreis"]')
    const kopf = cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise__kopf"]')
    const hinweis = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="waldtanz-magiekreise"] p')

    expect(lichtung).toMatch(/grid-template-areas:[\s\S]*"tisch magiekreise"[\s\S]*"schlangen schlangen"/)
    expect(magiekreise).toMatch(/background:\s*transparent/)
    expect(magiekreise).toMatch(/border-color:\s*transparent/)
    expect(magiekreise).toMatch(/box-shadow:\s*none/)
    expect(magiekreiseInLichtung).toMatch(/max-height:\s*none/)
    expect(magiekreiseInLichtung).toMatch(/overflow:\s*visible/)
    expect(liste).toMatch(/grid-template-columns:\s*repeat\(3,\s*minmax\(4\.8rem,\s*1fr\)\)/)
    expect(liste).toMatch(/align-items:\s*center/)
    expect(kreis).toMatch(/aspect-ratio:\s*1\s*\/\s*1/)
    expect(kreis).toMatch(/min-height:\s*clamp\(4\.9rem,\s*9vw,\s*6\.75rem\)/)
    expect(kreis).toMatch(/border:\s*var\(--st-border-width-chunky\) dashed var\(--st-color-border-strong\)/)
    expect(kreis).toMatch(/border-radius:\s*999px/)
    expect(kopf).toMatch(/position:\s*absolute/)
    expect(kopf).toMatch(/clip-path:\s*inset\(50%\)/)
    expect(hinweis).toMatch(/display:\s*none/)
    expect(smokeScript).toContain('M1br Magiekreise')
    expect(smokeScript).toContain('aspectDelta > 0.18')
    expect(smokeScript).toContain('elementFromPoint')
  })
})
