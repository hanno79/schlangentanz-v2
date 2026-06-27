/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2h RED-Tests fuer den Stitch-Forest-Background-Texture auf
 *              der Waldtanz-Schlangenlichtung-Spielflaeche. Die Forest-Arena
 *              bekommt einen subtilen organischen Dot-Pattern (radial-gradient
 *              + 26px-Tiling) als ::before-Pseudo-Element, der den bestehenden
 *              Gradient ueberlagert ohne ihn zu ersetzen.
 *
 * Ziel:
 *  - ::before auf .waldtanz-schlangenlichtung__spielflaeche rendert
 *    einen radial-gradient mit kleinem Radius (1.4-2px) und Stitch-#c4fdb6-Farbe
 *  - ::before hat 26px-Tiling (Stitch nutzt 30px; 26px ist dichter, da der
 *    Container schmaler ist als der Full-Body-View)
 *  - ::before hat opacity 0.3-0.55 (subtil, nicht dominant)
 *  - ::before hat pointer-events: none (kein Click-Intercept)
 *  - .waldtanz-schlangenlichtung__spielflaeche hat position: relative
 *    (M1di-Contract, damit ::before richtig contained ist)
 *  - Bestehender Gradient bleibt unveraendert (kein Cascade-Override)
 *  - package.json smoke:production enthaelt M2h-Skript
 *  - M2h-Smoke-Skript enthaelt pruefeM2hForestTexture + Slice-Klassen
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import App from './App'

function readSrc(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8')
}

describe('M2h Waldtanz-Forest-Background-Texture (RED)', () => {
  beforeEach(() => {
    // Sicherstellen, dass jeder Test auf /game startet
    window.history.pushState({}, '', '/game')
  })

  it('M2h:1 ::before deklariert Stitch-Dot-Pattern mit radial-gradient (CSS-Source-Assert)', () => {
    const css = readSrc('src/App.css')
    // ::before auf .waldtanz-schlangenlichtung__spielflaeche mit radial-gradient
    // Pattern: .waldtanz-schlangenlichtung__spielflaeche::before { ... background-image: radial-gradient(...); ... }
    const match = css.match(/\.waldtanz-schlangenlichtung__spielflaeche::before\s*\{([^}]*)\}/)
    expect(match, '::before-Regel auf .waldtanz-schlangenlichtung__spielflaeche muss existieren').not.toBeNull()
    const block = match![1]
    // MUSS einen radial-gradient enthalten
    expect(block).toMatch(/background-image:\s*radial-gradient/)
    // MUSS einen kleinen Radius haben (1.4px oder 2px — Stitch-Stil)
    expect(block).toMatch(/radial-gradient\([^)]*(?:1\.4|1\.5|1\.6|2)px/)
    // MUSS eine Tiling-Groesse haben (background-size: 24-30px)
    expect(block).toMatch(/background-size:\s*(24|26|28|30)px/)
  })

  it('M2h:2 ::before hat pointer-events: none (kein Click-Intercept fuer Karten darunter)', () => {
    const css = readSrc('src/App.css')
    const match = css.match(/\.waldtanz-schlangenlichtung__spielflaeche::before\s*\{([^}]*)\}/)
    expect(match).not.toBeNull()
    expect(match![1]).toMatch(/pointer-events:\s*none/)
  })

  it('M2h:3 ::before hat Opacity 0.3-0.55 (subtil, nicht dominant)', () => {
    const css = readSrc('src/App.css')
    const match = css.match(/\.waldtanz-schlangenlichtung__spielflaeche::before\s*\{([^}]*)\}/)
    expect(match).not.toBeNull()
    const opacityMatch = match![1].match(/opacity:\s*(0\.\d+)/)
    expect(opacityMatch, '::before braucht eine opacity-Deklaration zwischen 0.3 und 0.55').not.toBeNull()
    const opacity = parseFloat(opacityMatch![1])
    expect(opacity).toBeGreaterThanOrEqual(0.3)
    expect(opacity).toBeLessThanOrEqual(0.55)
  })

  it('M2h:4 .waldtanz-schlangenlichtung__spielflaeche hat position: relative (M1di-Contract)', () => {
    const css = readSrc('src/App.css')
    // Es gibt mehrere Regeln mit dieser Klasse. Wir pruefen, dass mindestens
    // eine davon position: relative deklariert.
    const lines = css.split('\n')
    let found = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.match(/^\.waldtanz-schlangenlichtung__spielflaeche\s*\{/)) {
        const body = lines.slice(i, i + 30).join('\n')
        if (/position:\s*relative/.test(body)) {
          found = true
          break
        }
      }
    }
    expect(found, '.waldtanz-schlangenlichtung__spielflaeche braucht position: relative fuer ::before-Containing').toBe(true)
  })

  it('M2h:5 Bestehender Gradient bleibt unveraendert (kein Cascade-Override durch ::before-Regel)', () => {
    const css = readSrc('src/App.css')
    // Die Basis-Regel .waldtanz-schlangenlichtung__spielflaeche muss weiterhin
    // den Multi-Color-Gradient (radial-gradient + linear-gradient) haben.
    // Wir suchen die Basis-Regel und pruefen, dass sie background (oder
    // background-image) mit radial-gradient enthaelt.
    const baseMatch = css.match(/^\.waldtanz-schlangenlichtung__spielflaeche\s*\{([^}]*)\}/m)
    expect(baseMatch, 'Basis-Regel .waldtanz-schlangenlichtung__spielflaeche muss existieren').not.toBeNull()
    const baseBody = baseMatch![1]
    // MUSS weiterhin einen radial-gradient haben (Multi-Color-Gradient)
    expect(baseBody).toMatch(/radial-gradient/)
    // MUSS weiterhin einen linear-gradient haben (Lime-Gelb-White)
    expect(baseBody).toMatch(/linear-gradient/)
  })

  it('M2h:6 package.json smoke:production-Kette enthaelt M2h-Skript', () => {
    const pkg = JSON.parse(readSrc('package.json')) as { scripts: Record<string, string> }
    const chain = pkg.scripts['smoke:production'] ?? ''
    expect(chain, 'smoke:production-Script muss existieren').toContain('m2h_waldtanz_forest_texture_smoke.mjs')
  })

  it('M2h:7 M2h-Smoke-Skript enthaelt pruefeM2hForestTexture und Slice-Klassen', () => {
    const smoke = readSrc('scripts/m2h_waldtanz_forest_texture_smoke.mjs')
    expect(smoke).toMatch(/pruefeM2hForestTexture/)
    expect(smoke).toMatch(/\.waldtanz-schlangenlichtung__spielflaeche/)
  })

  it('M2h:8 App rendert Schlangenlichtung-Spielflaeche auf /game (DOM-Assert fuer Smoke-Vorbedingung)', () => {
    render(<App />)
    // Die Spielflaeche muss im DOM sein, damit der Live-Smoke sie messen kann
    const spielflaechen = document.querySelectorAll('.waldtanz-schlangenlichtung__spielflaeche')
    expect(spielflaechen.length, 'Mindestens eine .waldtanz-schlangenlichtung__spielflaeche muss gerendert werden').toBeGreaterThanOrEqual(1)
  })
})
