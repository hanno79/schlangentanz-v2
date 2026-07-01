/**
 * M3e RED-Tests — Waldtanz-Spielmat-Boden im Brettrund-Zentrum.
 *
 * Vertrag: Auf /game rendert eine neue Komponente WaldtanzSpielmatBoden
 * zwischen Schlangenlichtung-Kopf und Magiekreise. Sie ist die sichtbare
 * "Hier deine Schlange ablegen"-Affordance (Stitch-Spielmat-Box), vorhanden
 * im Initial-State (kein State-Setup noetig).
 *
 * 6 RED-Tests:
 *  1. CSS-Source: .waldtanz-spielmat-boden Container-Klasse existiert
 *  2. CSS-Source: hat 3px forest-green border + dashed border-style
 *  3. CSS-Source: hat lime/forest-gradient background (passt zum Arenastein)
 *  4. CSS-Source: hat border-radius fuer Hexagon-/Stitch-Optik (nicht 0)
 *  5. DOM: Auf /game existiert [aria-label="Waldtanz-Spielmat"]-Region
 *  6. CSS-Source: Reduced-Motion-Override fuer .waldtanz-spielmat-boden-Animation
 *
 * Pitfall #43 strikt beachtet:
 * - aria-label="Waldtanz-Spielmat" wird via getByLabelText abgefragt (robuster als getByRole 'region')
 * - jsdom getBoundingClientRect ist IMMER 0, also kein boundingClientRect.width > 0-Assert
 * - CSS-Source-Regex nutzt M1dt-Konvention: EscapeRegex + last-match
 */

import { readFileSync } from 'node:fs'
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

/** cssBlock(sel, css) — last-match top-level rule body for .sel { ... }. */
function cssBlock(sel: string, css: string = appCss): string {
  const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Last-match per .sel { ... } (kein Prefix-Anchor noetig fuer Single-Class-Selektoren).
  // Die erste Capture-Group ist der Body.
  const regex = new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`, 'g')
  const matches = Array.from(css.matchAll(regex))
  if (matches.length === 0) return ''
  return matches[matches.length - 1][1] ?? ''
}

describe('M3e Waldtanz-Spielmat-Boden im Brettrund-Zentrum', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/game')
    }
  })
  afterEach(() => {
    cleanup()
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/')
    }
  })

  it('M3e:1 — CSS-Source: .waldtanz-spielmat-boden Container-Klasse existiert', () => {
    const block = cssBlock('waldtanz-spielmat-boden')
    expect(block).not.toBe('')
    expect(block.length).toBeGreaterThan(10)
  })

  it('M3e:2 — CSS-Source: hat 3px forest-green border + dashed border-style', () => {
    const block = cssBlock('waldtanz-spielmat-boden')
    // 3px Border mit forest-green (Stitch-Vorgabe) — entweder als Shorthand oder als
    // border-width: 3px + border-color: var(--st-color-border-strong)
    const borderWidth = block.match(/border(?:-width)?:\s*3px/)
    expect(borderWidth).not.toBeNull()
    // Dashed border-style ODER border: 3px dashed
    const dashed = /border-style:\s*dashed|border:\s*3px\s+dashed/.test(block)
    expect(dashed).toBe(true)
  })

  it('M3e:3 — CSS-Source: hat lime/forest-gradient background (passt zum Arenastein)', () => {
    const block = cssBlock('waldtanz-spielmat-boden')
    // Background muss radial-gradient oder linear-gradient haben
    const hasGradient = /background:[^;]*(radial-gradient|linear-gradient)/.test(block)
    expect(hasGradient).toBe(true)
  })

  it('M3e:4 — CSS-Source: hat border-radius fuer Hexagon-/Stitch-Optik (nicht 0)', () => {
    const block = cssBlock('waldtanz-spielmat-boden')
    const radiusMatch = block.match(/border-radius:\s*([^;]+);/)
    expect(radiusMatch).not.toBeNull()
    const radiusValue = radiusMatch![1].trim()
    // border-radius muss > 0 sein (Stitch-Pillen-Optik, nicht eckig)
    expect(radiusValue).not.toBe('0')
    expect(radiusValue).not.toBe('0px')
  })

  it('M3e:5 — DOM: Auf /game existiert [aria-label="Waldtanz-Spielmat"]-Region', () => {
    render(<App />)
    // Pitfall #43: getByLabelText statt getByRole 'region', weil das Element
    // als <section> ODER <aside> rendern kann, aria-label ist die robuste
    // Schnittstelle.
    const spielmat = screen.getByLabelText('Waldtanz-Spielmat')
    expect(spielmat).toBeInTheDocument()
    // Klassen-Check
    expect(spielmat.className).toMatch(/waldtanz-spielmat-boden/)
  })

  it('M3e:6 — CSS-Source: Reduced-Motion-Override fuer .waldtanz-spielmat-boden Animation', () => {
    // Suche nach @media (prefers-reduced-motion: reduce) Block, der eine
    // .waldtanz-spielmat-boden-Regel mit animation: none enthaelt.
    const reducedMotionMatch = appCss.match(
      /@media\s+\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.waldtanz-spielmat-boden[\s\S]*?animation:\s*none[\s\S]*?\}/
    )
    expect(reducedMotionMatch).not.toBeNull()
  })
})
