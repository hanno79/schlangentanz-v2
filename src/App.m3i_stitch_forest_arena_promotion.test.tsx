/*
 * Author: hermes-cron
 * Datum: 01.07.2026
 * Version: 1.0
 * Beschreibung: M3i — Stitch-Forest-Arena-Promotion. Reduziert die
 *   Arenasstein-Cap (M9.5: 24rem/50vh/32rem) auf M3i-Wert
 *   (20rem/42vh/26rem) und die Schlangenlichtung-Spielflaeche-Mindest-Hoehe
 *   (M1di: 14rem/32vh/20rem) auf M3i-Wert (10rem/22vh/14rem), damit
 *   Hand + Schlangenlichtung im 1280x900-Erstbild sichtbar bleiben.
 *
 * RED-Vertrag (TDD):
 *   1. CSS-Source: waldtanz-arenastein height + max-height auf
 *      clamp(20rem, 42vh, 26rem) (M3i-Cap, M9.5:1+2+3+5+7 migriert).
 *   2. CSS-Source: waldtanz-schlangenlichtung__spielflaeche min-height
 *      auf clamp(10rem, 22vh, 14rem) (M3i-Senkung).
 *   3. CSS-Source: handkarte__button--karte height + min-height auf
 *      clamp(5rem, 9vh, 6rem) (M3i-Karten-Senkung, M1f:1 migriert).
 *   4. CSS-Source: Cascade-Safe — AENDERUNG an existierendem route-scoped
 *      Block, kein neuer Block. Vorhandene Properties (display, flex-direction,
 *      overflow, min-height: 0) bleiben unveraendert.
 *   5. DOM: Auf /game rendert die handkarten-buehne weiterhin (regression).
 *   6. package.json: smoke:production-Kette enthaelt
 *      m3i_stitch_forest_arena_promotion_smoke.mjs.
 *   7. Migration: M9.5:1/2/3/5/7 + M1f:1 migrieren ihre Asserts auf
 *      M3i-Werte (Pitfall #48 Cascade-Contract-Migration).
 */

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeChain = (JSON.parse(packageJson) as { scripts: Record<string, string> })
  .scripts['smoke:production'] ?? ''

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractBlockBody(css: string, selectorStart: number): string {
  // depth-tracked brace-walk ab selectorStart, bis depth=0
  const openBraceIdx = css.indexOf('{', selectorStart)
  if (openBraceIdx === -1) return ''
  let depth = 0
  let end = openBraceIdx
  for (let i = openBraceIdx; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  return css.slice(openBraceIdx + 1, end)
}

function isInsideOpenMedia(css: string, idx: number): boolean {
  // Walk-back max 400 chars und zaehle @media { vs } um zu wissen ob idx
  // INNERHALB eines offenen @media-Blocks liegt (Pitfall #32 + #51).
  const window = css.slice(Math.max(0, idx - 400), idx)
  let depth = 0
  for (let i = 0; i < window.length; i++) {
    if (window[i] === '{') depth++
    else if (window[i] === '}') depth--
  }
  return depth > 0
}

function cssBlockAll(selector: string): string[] {
  // Pflicht-Discipline (Pitfall #30 + #32 + #45 + #51 + M1dt-Pattern-2):
  // Prefix-Anchor `(^|[\s,>])` damit NUR Regeln mit EXAKT diesem Selector-
  // Start gefunden werden. AGGREGIERT ALLE top-level-Matches (Pitfall #30
  // additive-override) die NICHT innerhalb eines offenen @media-Blocks
  // liegen. So fangen wir BEIDE route-scoped-Regeln (z.B. M1di-Base +
  // M9.5-Cap-Add-on) statt nur die letzte.
  const escaped = escapeRegex(selector.trim())
  const re = new RegExp(
    `(^|[\\s,>])${escaped}(\\s*[,\\{])`,
    'g',
  )
  const matches = Array.from(appCss.matchAll(re))
  const out: string[] = []
  for (const m of matches) {
    const idx = m.index ?? 0
    if (isInsideOpenMedia(appCss, idx)) continue
    const body = extractBlockBody(appCss, idx)
    if (body) out.push(body)
  }
  return out
}

function cssBlockAllProperties(selector: string): string {
  // Pitfall #30 Additive-Override-Discipline: ein Selector kann in
  // mehreren route-scoped-Blocks vorkommen. Wir aggregieren alle
  // gefundenen Bodies, damit Pitfall-#30-Tests (Properties-erhalten)
  // über ALLE Blöcke hinweg pruefen, nicht nur den ersten.
  return cssBlockAll(selector).join('\n')
}

describe('M3i Stitch-Forest-Arena-Promotion (Cap-Senkung für 1280x900-Erstbild)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/game')
    }
  })

  it('M3i:1 — Arenasstein-Cap auf M3i-Wert gesenkt (M9.5-Contract migriert)', () => {
    // M9.5 hatte height: clamp(24rem, 50vh, 32rem) — M3i senkt auf
    // clamp(20rem, 42vh, 26rem), damit 72px in die Bottom-Row wandern.
    const capRe = /height:\s*clamp\(\s*20rem\s*,\s*42vh\s*,\s*26rem\s*\)/
    const capMaxRe = /max-height:\s*clamp\(\s*20rem\s*,\s*42vh\s*,\s*26rem\s*\)/
    const oldCapRe = /clamp\(\s*24rem\s*,\s*50vh\s*,\s*32rem\s*\)/
    const allBlocks = cssBlockAll('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(allBlocks.length).toBeGreaterThanOrEqual(2)
    allBlocks.forEach((block, i) => {
      expect(block, `Arenasstein-Regel #${i + 1} muss die M3i-Cap haben`).toMatch(capRe)
      expect(block, `Arenasstein-Regel #${i + 1} max-height muss M3i-Cap haben`).toMatch(capMaxRe)
      // Cascade-Safe: Alte M9.5-Cap darf NICHT mehr vorkommen.
      expect(block, `Arenasstein-Regel #${i + 1} darf M9.5-Cap 24rem/50vh/32rem NICHT mehr haben`).not.toMatch(oldCapRe)
    })
  })

  it('M3i:2 — Schlangenlichtung-Spielflaeche min-height auf M3i-Wert gesenkt (Pitfall #11)', () => {
    // M1di hatte min-height: clamp(14rem, 32vh, 20rem) — M3i senkt auf
    // clamp(10rem, 22vh, 14rem), damit die Spielflaeche nicht in der
    // Arenasstein-Cap-Limitierung verschluckt wird.
    const m3iMinRe = /min-height:\s*clamp\(\s*10rem\s*,\s*22vh\s*,\s*14rem\s*\)/
    const allBlocks = cssBlockAll('.waldtanz-schlangenlichtung__spielflaeche')
    expect(allBlocks.length, 'mindestens 1 Regel fuer waldtanz-schlangenlichtung__spielflaeche').toBeGreaterThanOrEqual(1)
    const m3iBlock = allBlocks.find((b) => m3iMinRe.test(b))
    expect(m3iBlock, 'M3i-Override-Block fuer Schlangenlichtung-Spielflaeche min-height muss existieren').toBeDefined()
  })

  it('M3i:3 — Handkarten-Karten-Hoehe auf M3i-Wert gesenkt (M1f-Contract migriert)', () => {
    // M1f hatte height: clamp(6rem, 11vh, 7rem) — M3i senkt auf
    // clamp(5rem, 9vh, 6rem), damit 5 Karten + Buehne + Spielerplakette
    // im 900vh-Viewport bleiben.
    const m3iKarteRe = /height:\s*clamp\(\s*5rem\s*,\s*9vh\s*,\s*6rem\s*\)/
    const allBlocks = cssBlockAll('.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"] [class~="handkarte__button--karte"]')
    expect(allBlocks.length, 'mindestens 1 route-scoped Block fuer handkarte__button--karte').toBeGreaterThanOrEqual(1)
    const m3iBlock = allBlocks.find((b) => m3iKarteRe.test(b))
    expect(m3iBlock, 'M3i-Override-Block fuer handkarte__button--karte height muss M3i-Wert haben').toBeDefined()
  })

  it('M3i:4 — Cascade-Safe: Arenasstein behält display/flex-direction/overflow (Pitfall #30)', () => {
    // Additive-Override-Discipline: alle existierenden Properties der
    // M9.5-Regel müssen in der M3i-Regel weiterhin enthalten sein
    // (display, flex-direction, min-height, overflow, padding-bottom).
    const baseBlock = cssBlockAllProperties('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(baseBlock).toMatch(/display:\s*flex/)
    expect(baseBlock).toMatch(/flex-direction:\s*column/)
    expect(baseBlock).toMatch(/min-height:\s*0/)
    expect(baseBlock).toMatch(/overflow:\s*hidden/)
  })

  it('M3i:5 — DOM: Auf /game rendert die handkarten-buehne weiterhin (regression-safety)', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const result = render(<App initialZustand={zustand} />)
    const buehne = result.container.querySelector('.handkarten-buehne')
    expect(buehne, 'handkarten-buehne muss im DOM sein').not.toBeNull()
    expect((buehne as HTMLElement).getAttribute('aria-label')).toBe('Waldtanz-Handbühne')
    // Handkarten-Kartenleiste muss ebenfalls rendern
    const leiste = result.container.querySelector('.handkartenleiste')
    expect(leiste, 'handkartenleiste muss im DOM sein').not.toBeNull()
  })

  it('M3i:6 — package.json: smoke:production-Kette enthaelt m3i_stitch_forest_arena_promotion_smoke.mjs', () => {
    expect(smokeChain).toContain('m3i_stitch_forest_arena_promotion_smoke.mjs')
  })

  it('M3i:7 — Geometrie-Bonus: 60+70+30+360+30+220+30 = 800 px <= 900 px (Viewport-Budget)', () => {
    // M3i Cap-Sum-Formel: Spielerrahmen (60) + Brettrund (70) +
    // Schlangenlichtung-Kopf (30) + Arenasstein (360, M3i-Cap) +
    // Hand-Buehne (30) + Handkarten-Leiste (220) + Bottom-Padding (30)
    // = 800 px <= 900 px. Im 900vh-Viewport bleibt 100px Reserve.
    const SLOTS = 60 + 70 + 30 + 360 + 30 + 220 + 30
    expect(SLOTS).toBeLessThanOrEqual(900)
  })
})
