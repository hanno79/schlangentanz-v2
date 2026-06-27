/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M1cz macht die gegnerische Hand am Waldtanz-Brett als
 * dekorativen "Leaf-Handfaecher" sichtbar — 3 Karten-Tiles (max) peeking
 * hinter dem Toad-King-Avatar, im Stitch-Stil mit 3px-Waldgruen-Border,
 * hard-shadow-sm, Eco-Icon und leichter Rotation. Rein dekorativ
 * (pointer-events:none, aria-hidden), interaktionsfrei. Vermittelt
 * Atmosphaere: der Gegner hat Karten, die ich nicht sehe, aber ich sehe
 * ihre Anzahl visuell als peekende Tiles aus dem Wald.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

function zustandMitGegnerHand(gegnerHand: ReturnType<typeof farbkarte>[]) {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1cz-01', 'Blau', 1), farbkarte('gelb-m1cz-02', 'Gelb', 2)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cz-start', 'Grün', 1)], 'eigene-schlange-m1cz')]
  zustand.spieler[1].hand = gegnerHand
  zustand.spieler[1].schlangen = [schlange([farbkarte('violett-m1cz-start', 'Violett', 1)], 'gegner-schlange-m1cz')]
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cz Waldtanz-Gegnerhand-Kartenfaecher', () => {
  it('RED-1: rendert 3 dekorative Leaf-Tiles hinter der Gegnerplakette bei 3 gegnerischen Handkarten', () => {
    window.history.pushState({}, '', '/game')
    const gegnerHand = [
      farbkarte('rot-m1cz-01', 'Rot', 1),
      farbkarte('rot-m1cz-02', 'Rot', 2),
      farbkarte('rot-m1cz-03', 'Rot', 3),
    ]
    render(<App initialZustand={zustandMitGegnerHand(gegnerHand)} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const tiles = gegnerplakette.querySelectorAll('[data-gegner-hand-tile]')

    expect(tiles).toHaveLength(3)
  })

  it('RED-2: Tiles tragen data-gegner-hand-tile und aria-hidden="true"', () => {
    window.history.pushState({}, '', '/game')
    const gegnerHand = [
      farbkarte('rot-m1cz-01', 'Rot', 1),
      farbkarte('rot-m1cz-02', 'Rot', 2),
      farbkarte('rot-m1cz-03', 'Rot', 3),
    ]
    render(<App initialZustand={zustandMitGegnerHand(gegnerHand)} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const tiles = gegnerplakette.querySelectorAll('[data-gegner-hand-tile]')

    tiles.forEach((tile) => {
      expect(tile.getAttribute('aria-hidden')).toBe('true')
    })

    const tileList = gegnerplakette.querySelector('[data-gegner-hand-faecher]')
    expect(tileList).not.toBeNull()
    expect(tileList?.getAttribute('aria-hidden')).toBe('true')
  })

  it('RED-3: CSS-Vertrag — Tile hat 3px waldgruen-Border + hard-shadow-sm + Eco-Icon', () => {
    const tileBlock = appCss.match(/\.spielbereich--game-route\s+\[class~="spielbrett--waldtanz"\]\s+\[class~="waldtanz-gegnerplakette__handkarte"\]\s*\{([^}]*)\}/s)
    expect(tileBlock).not.toBeNull()
    const body = tileBlock?.[1] ?? ''
    expect(body).toMatch(/border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(body).toMatch(/box-shadow:\s*var\(--st-shadow-hard-sm\)/)
    expect(body).toMatch(/background:\s*var\(--st-color-surface-container-highest\)/)
  })

  it('RED-4: Bei 0 gegnerischen Handkarten rendert keine Tile-Liste', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitGegnerHand([])} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const tileList = gegnerplakette.querySelector('[data-gegner-hand-faecher]')
    expect(tileList).toBeNull()
  })

  it('RED-5: Bei 5 gegnerischen Handkarten rendert max 3 Tiles (Cap)', () => {
    window.history.pushState({}, '', '/game')
    const gegnerHand = [
      farbkarte('rot-m1cz-01', 'Rot', 1),
      farbkarte('rot-m1cz-02', 'Rot', 2),
      farbkarte('rot-m1cz-03', 'Rot', 3),
      farbkarte('rot-m1cz-04', 'Rot', 4),
      farbkarte('rot-m1cz-05', 'Rot', 5),
    ]
    render(<App initialZustand={zustandMitGegnerHand(gegnerHand)} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const tiles = gegnerplakette.querySelectorAll('[data-gegner-hand-tile]')
    expect(tiles).toHaveLength(3)
  })

  it('RED-6: CSS-Vertrag — Tile hat pointer-events: none (rein dekorativ)', () => {
    const tileBlock = appCss.match(/\.spielbereich--game-route\s+\[class~="spielbrett--waldtanz"\]\s+\[class~="waldtanz-gegnerplakette__handkarte"\]\s*\{([^}]*)\}/s)
    expect(tileBlock).not.toBeNull()
    const body = tileBlock?.[1] ?? ''
    expect(body).toMatch(/pointer-events:\s*none/)
  })

  it('RED-7: Smoke-Wiring in package.json (M1cz-Script in smoke:production-Kette)', () => {
    // Pflicht: M1cz-Smoke-Script ist in der smoke:production-Kette verdrahtet.
    // Reihenfolge: nach M1cy (gleicher Themenkreis) und vor M1dt (gleicher
    // M1cz-Konsolidierungs-Familie).
    expect(packageJson).toMatch(/m1cz_waldtanz_gegnerhand_faecher_smoke\.mjs/)
    const m1cyIdx = packageJson.indexOf('m1cy_waldtanz_gegnerplakette_smoke.mjs')
    const m1czIdx = packageJson.indexOf('m1cz_waldtanz_gegnerhand_faecher_smoke.mjs')
    const m1dtIdx = packageJson.indexOf('m1dt_waldtanz_schlangenwurm_smoke.mjs')
    expect(m1cyIdx).toBeGreaterThan(-1)
    expect(m1czIdx).toBeGreaterThan(m1cyIdx)
    expect(m1dtIdx).toBeGreaterThan(m1czIdx)
  })
})
