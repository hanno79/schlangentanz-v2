/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bs macht die Waldtanz-Tischkarte als körperlichen Kartenaltar in der Lichtung sichtbarer.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, sonderkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1bs_tischkartenaltar_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function zustandMitAblagestapel(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.ablagestapel = [
    farbkarte('rot-m1bs-darunter', 'Rot', 4),
    sonderkarte('farbenfusion-m1bs', 'Farbenfusion'),
  ]
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bs Waldtanz-Tischkartenaltar', () => {
  it('zeigt die Tischkarte auf /game als Kartenaltar mit Ablagestapel-Zähler und Lichtkegel', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAblagestapel()} />)

    const lichtung = within(screen.getByRole('region', { name: 'Spieltisch' })).getByRole('region', { name: 'Schlangenlichtung' })
    const tischkarte = within(lichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const altar = within(tischkarte).getByRole('group', { name: 'Waldtanz-Kartenaltar' })
    const karte = within(altar).getByRole('article', { name: 'Zuletzt ausgespielte Tischkarte farbenfusion-m1bs' })

    expect(altar).toHaveClass('waldtanz-tischkarte__altar')
    expect(within(altar).getByText('Kartenaltar')).toHaveClass('waldtanz-tischkarte__altar-label')
    expect(within(altar).getByText('Ablagestapel: 2 Karten')).toBeVisible()
    expect(within(altar).getByText('Spielkarte im Lichtkegel')).toBeVisible()
    expect(karte).toHaveClass('waldtanz-tischkarte__karte--altar')
    expect(within(tischkarte).getByText('Darunter wartet rot-m1bs-darunter')).toBeVisible()
  })

  it('behält den leeren Legeplatz als sichtbaren Altar statt kleiner Statusbox', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const tischkarte = within(screen.getByRole('region', { name: 'Schlangenlichtung' })).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const altar = within(tischkarte).getByRole('group', { name: 'Waldtanz-Kartenaltar' })

    expect(within(altar).getByText('Ablagestapel: 0 Karten')).toBeVisible()
    expect(within(altar).getByText('Freier Lichtkegel')).toBeVisible()
    expect(within(altar).getByText('Noch keine Tischkarte')).toBeVisible()
  })

  it('legt den Stitch-CSS-Vertrag und den Browser-Smoke fuer einen prominenten, hit-testbaren Altar ab', () => {
    const routeLichtungsbrett = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]')
    const routeTischkarte = cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte"]')
    const routeMagiekreise = cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise"]')
    const altar = cssBlock('.waldtanz-tischkarte__altar')
    const routeAltar = cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte__altar"]')
    const routeAltarKopf = cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte__altar-kopf"]')
    const routeAltarPillen = cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte__altar-label"],\n  .spielbereich--game-route [class~="waldtanz-tischkarte__stapel"],\n  .spielbereich--game-route [class~="waldtanz-tischkarte__lichttext"]')
    const routeKarte = cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte__karte--altar"]')
    const routeLichtungsKarte = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="waldtanz-tischkarte__karte--altar"]')
    const routeLeer = cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte__leer"]')
    const routeLeerText = cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte__leer"] p')
    const lichtkegel = cssBlock('.waldtanz-tischkarte__lichtkegel')

    // AENDERUNG 25.06.2026 (M1dj): Section .waldtanz-lichtungsbrett ist jetzt
    // eine single-column Brett-Huelle ohne benannte Areas. Die innere
    // .waldtanz-schlangenlichtung__schlangen traegt jetzt die benannten Areas
    // (tischkarte | magiekreise | schlangen) als 3-Column-Layout.
    expect(routeLichtungsbrett).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(routeLichtungsbrett).not.toMatch(/grid-template-columns:\s*minmax\(14rem,\s*0\.9fr\)\s+minmax\(12rem,\s*0\.7fr\)/)
    expect(routeTischkarte).toMatch(/position:\s*relative/)
    expect(routeTischkarte).toMatch(/z-index:\s*7/)
    expect(routeTischkarte).toMatch(/align-self:\s*start/)
    expect(routeMagiekreise).toMatch(/align-self:\s*start/)
    expect(altar).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(altar).toMatch(/box-shadow:\s*0 6px 0 var\(--st-color-border-strong\)/)
    expect(altar).toMatch(/radial-gradient/)
    expect(routeAltar).toMatch(/min-height:\s*clamp\(4\.25rem,\s*7vw,\s*5\.1rem\)/)
    expect(routeAltar).toMatch(/align-content:\s*start/)
    expect(routeAltarKopf).toMatch(/display:\s*flex/)
    expect(routeAltarKopf).toMatch(/flex-wrap:\s*nowrap/)
    expect(routeAltarPillen).toMatch(/font-size:\s*0\.58rem/)
    expect(routeKarte).toMatch(/width:\s*clamp\(6\.4rem,\s*13vw,\s*9\.2rem\)/)
    expect(routeLichtungsKarte).toMatch(/width:\s*clamp\(6\.4rem,\s*13vw,\s*9\.2rem\)/)
    expect(routeLeer).toMatch(/min-height:\s*3\.1rem/)
    expect(routeLeerText).toMatch(/display:\s*none/)
    expect(lichtkegel).toMatch(/border-radius:\s*999px/)
    expect(smokeScript).toContain('M1bs Tischkartenaltar')
    expect(smokeScript).toContain('elementFromPoint')
    expect(smokeScript).toContain('probePoints')
    expect(smokeScript).toContain('cardHeight < 110')
    expect(smokeScript).toContain('lichtkegelBackground')
  })
})
