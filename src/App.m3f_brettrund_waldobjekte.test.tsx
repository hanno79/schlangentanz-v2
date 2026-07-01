/**
 * Author: rahn
 * Datum: 2026-07-01
 * Version: 1.0
 * Beschreibung: M3f RED-Tests — Brettrund-Waldobjekte (Nachziehstapel, Ablage,
 * Zugspur, Aufgabentafel) als kompakte 4-in-1-Stitch-Pill-Reihe im Brettrund-
 * Zentrum sichtbar. Vertrag: Auf /game ist der .waldtanz-arenasstein__waldobjekte-
 * Container eine horizontale Pill-Reihe mit display:flex + flex-direction:row,
 * align-self:stretch, order:-1, max-height:clamp(5rem, 10vh, 6.5rem), jeder Pill-Children-
 * Section ist 1fr-breit mit 3px forest-green Border + Hard-Shadow. Auf / (Lobby)
 * bleibt das Verhalten unveraendert (route-scoped Override).
 *
 * Sechs RED-Tests:
 *  1. M3f:1 — DOM: Container [aria-label="Waldobjekte"] rendert, alle 4 Sections
 *              (Nachziehstapel/Ablage/Zugspur/Aufgabentafel) als direkte Children
 *  2. M3f:2 — CSS-Source: route-scoped Container hat display:flex + flex-direction:row
 *              + align-self:stretch + order:-1 + max-height:clamp(5rem, 10vh, 6.5rem)
 *  3. M3f:3 — CSS-Source: Children-Pill-Sections haben flex:1 1 0 + min-width:0
 *              + max-height:clamp(4.5rem, 9vh, 6rem) + 3px-Border + Hard-Shadow
 *  4. M3f:4 — CSS-Source: .waldtanz-waldtaschen__kopf wird auf /game versteckt
 *              (display:none, weil Pill-Reihe selbst der Label ist)
 *  5. M3f:5 — Cascade-Safe: align-self:stretch + order:-1 auf der neuen Regel steht NACH
 *              der min-height:clamp(34rem, 60vh, 42rem)-Schlangenlichtungs-Regel
 *  6. M3f:6 — Smoke-Wiring: smoke:production-Kette enthaelt m3f-Smoke
 *
 * Pitfall-Discipline:
 *  - Pitfall #43: aria-label statt getByRole 'region' (Aside=complementary)
 *  - Pitfall #30: Additive-Override — neue Regel re-inkludiert pre-existing
 *    max-height: min(21rem, 40vh) + overflow:auto + min-height
 *  - Pitfall #32: CSS-Kommentar in Worten, keine .klasse { property: value }-Form
 *  - Pitfall #14: M9.5-W5 Last-In-Chain-Migration M3e -> M3f
 */

import { readFileSync } from 'node:fs'
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

/** cssBlockRouteScoped(route, sel) — last-match top-level rule body for .route [class~="sel"] { ... } */
function cssBlockRouteScoped(route: string, sel: string, css: string = appCss): string {
  const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `\\.${route}\\s*\\[class~=["']${escaped}["']\\]\\s*\\{([^}]*)\\}`,
    'g',
  )
  const matches = Array.from(css.matchAll(regex))
  if (matches.length === 0) return ''
  return matches[matches.length - 1][1] ?? ''
}

describe('M3f Brettrund-Waldobjekte im Brettrund sichtbar', () => {
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

  it('M3f:1 — DOM: Container [aria-label="Waldobjekte"] rendert, alle 4 Brettrund-Stapel-Sections als Children', () => {
    render(<App />)
    // aria-label="Waldobjekte" (M2d-Komponenten-Vertrag) — getByLabelText ist robuster
    // als getByRole 'region' (Aside = complementary landmark, nicht region).
    const container = screen.getByLabelText('Waldobjekte')
    expect(container).toBeInTheDocument()
    // Pitfall #15: Echte DOM-Klasse ist waldtanz-arenastein (ohne Doppel-s),
    // siehe App.tsx Z. 387 — der CSS-Selector mit [class~="..."] matcht
    // auf das ganze Token, also exakt "waldtanz-arenastein__waldobjekte".
    expect(container).toHaveClass('waldtanz-arenastein__waldobjekte')
    // 4 Brettrund-Stapel-Sections als direkte Children
    const children = Array.from(container.querySelectorAll('section')) as HTMLElement[]
    const klassen = children.map(c => c.className).join(' ')
    expect(klassen).toMatch(/waldtanz-nachziehstapel/)
    expect(klassen).toMatch(/waldtanz-ablage/)
    expect(klassen).toMatch(/waldtanz-zugspur/)
    expect(klassen).toMatch(/waldtanz-aufgabentafel/)
  })

  it('M3f:2 — CSS-Source: route-scoped Container hat display:flex + flex-direction:row + align-self:stretch + order:-1 + max-height clamp', () => {
    // Pitfall #15: Echte DOM-Klasse ist waldtanz-arenastein (ohne Doppel-s),
    // siehe App.tsx Z. 387.
    const body = cssBlockRouteScoped('spielbereich--game-route', 'waldtanz-arenastein__waldobjekte')
    // Pitfall #30 Additive-Override: re-inkludiert pre-existing max-height: min(21rem, 40vh)
    // und overflow: auto. Plus neue flex-direction:row + align-self:stretch + order:-1.
    expect(body).toMatch(/display:\s*flex/)
    expect(body).toMatch(/flex-direction:\s*row/)
    expect(body).toMatch(/align-self:\s*stretch/)
    expect(body).toMatch(/order:\s*-1/)
    expect(body).toMatch(/max-height:\s*clamp\(5rem,\s*10vh,\s*6\.5rem\)/)
    // 3px Stitch-Border + Hard-Shadow + Border-Radius als visueller Container
    expect(body).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(body).toMatch(/box-shadow:\s*0\s+5px\s+0\s+var\(--st-color-border-strong\)/)
  })

  it('M3f:3 — CSS-Source: Children-Pill-Sections haben flex:1 1 0 + min-width:0 + max-height clamp + 3px-Border + Hard-Shadow', () => {
    // Die Children-Pill-Regel steht auf .spielbereich--game-route [class~="waldtanz-waldtaschen"] > :is(section, .waldtanz-waldtaschen__kopf).
    // Wir suchen die spezifische Section-Override-Regel.
    const routeSel = 'waldtanz-waldtaschen'
    // Direkter Regex auf den relevanten Block
    const regex = new RegExp(
      `\\.spielbereich--game-route\\s+\\[class~=["']${routeSel}["']\\]\\s*>\\s*:is\\(section,\\s*\\.waldtanz-waldtaschen__kopf\\)\\s*\\{([^}]*)\\}`,
    )
    const match = appCss.match(regex)
    expect(match).not.toBeNull()
    const body = match![1] ?? ''
    expect(body).toMatch(/flex:\s*1\s+1\s+0/)
    expect(body).toMatch(/min-width:\s*0/)
    expect(body).toMatch(/max-height:\s*clamp\(4\.5rem,\s*9vh,\s*6rem\)/)
    expect(body).toMatch(/border:\s*var\(--st-border-width-chunky\)\s+solid\s+var\(--st-color-border-strong\)/)
    expect(body).toMatch(/box-shadow:\s*0\s+3px\s+0\s+var\(--st-color-border-strong\)/)
  })

  it('M3f:4 — CSS-Source: .waldtanz-waldtaschen__kopf wird auf /game versteckt (display:none)', () => {
    // Wir suchen die spezifische route-scoped Headline-Hide-Regel.
    const regex = new RegExp(
      `\\.spielbereich--game-route\\s+\\[class~=["']waldtanz-waldtaschen__kopf["']\\]\\s*\\{([^}]*)\\}`,
    )
    const matches = Array.from(appCss.matchAll(new RegExp(regex.source, 'g')))
    expect(matches.length).toBeGreaterThan(0)
    // Mindestens eine Variante muss display:none tragen (Pill-Reihe selbst ist der Label)
    const hasHide = matches.some(m => /display:\s*none/.test(m[1] ?? ''))
    expect(hasHide).toBe(true)
  })

  it('M3f:5 — Cascade-Safe: M3f-Container-Regel (align-self:stretch + order:-1) wird NICHT von spaeteren pre-existing-Regeln auf waldtanz-arenastein__waldobjekte ueberschrieben', () => {
    // Pitfall #30 (Additive-Override) Verifikation: M3f setzt align-self:center +
    // 3px-Border + Hard-Shadow + flex-direction:row auf route-scoped Block.
    // Wir muessen sicherstellen, dass KEINE spaetere pre-existing-Regel auf
    // .waldtanz-arenastein__waldobjekte diese Properties ueberschreibt.
    //
    // Strategie: Suche alle Top-Level-Regeln auf waldtanz-arenastein__waldobjekte
    // NACH dem M3f-Marker, und pruefe, dass keine davon align-self/border/box-shadow
    // enthaelt.
    const m3fMarker = appCss.indexOf('01.07.2026 (M3f)')
    expect(m3fMarker).toBeGreaterThan(-1)
    const escaped = 'waldtanz-arenastein__waldobjekte'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\.${escaped}\\s*\\{([^}]*)\\}`, 'g')
    const allMatches = Array.from(appCss.matchAll(regex))
    expect(allMatches.length).toBeGreaterThan(0)
    // Filter auf Matches NACH dem M3f-Marker.
    const laterMatches = allMatches.filter(m => m.index !== undefined && m.index > m3fMarker)
    for (const m of laterMatches) {
      const body = m[1] ?? ''
      // Keine spaetere Regel darf align-self, border oder box-shadow ueberschreiben.
      const hasAlignSelf = /align-self\s*:/.test(body)
      const hasBorderShorthand = /\bborder\s*:\s*[^;]*solid/.test(body)
      const hasBoxShadow = /box-shadow\s*:/.test(body)
      if (hasAlignSelf || hasBorderShorthand || hasBoxShadow) {
        throw new Error(`M3f-Container-Eigenschaft wird von spaeterer pre-existing-Regel ueberschrieben: ${body.slice(0, 80)}`)
      }
    }
  })

  it('M3f:6 — Smoke-Wiring: package.json smoke:production enthaelt m3f_brettrund_waldobjekte_smoke.mjs', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const chain: string = pkg.scripts?.['smoke:production'] ?? ''
    expect(chain).toContain('m3f_brettrund_waldobjekte_smoke.mjs')
    // M9.5-W5 Last-In-Chain-Migration (Pitfall #14): M3f ist der letzte Schritt
    const steps: string[] = chain.split('&&').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    const lastNodeStep: string = steps.filter((s: string) => s.startsWith('node ')).pop() ?? ''
    expect(lastNodeStep).toContain('m3f_brettrund_waldobjekte_smoke.mjs')
  })
})
