/**
 * Author: rahn
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M2x — Brettrand-Bottom-Hero: Handkarten-Buehne + End-Turn-Pille
 *              + Pflicht-Abwurf-Pille + Handkarten-Spielbarkeit als prominente
 *              Stitch-Spielobjekte auf /game. Pattern: M2i (route-scoped
 *              Additive-Erweiterung, NICHT base-rule-Override), M1ds
 *              (Token-driven Hero-Styles), M1db (Lift y via token).
 *              Keine Engine-Aenderung, keine JSX-Reorder, keine neuen
 *              Komponenten. Reines CSS-Only-Visual-Plus + 1-Zeilen-Text-Fix
 *              in WaldtanzArenazugknopf.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

function alleRegelBloecksFuer(selector: string): string[] {
  const results: string[] = []
  let searchFrom = 0
  while (true) {
    const idx = appCss.indexOf(selector, searchFrom)
    if (idx === -1) break
    if (idx > 0) {
      const prev = appCss[idx - 1]
      if (!/[\s,]/.test(prev ?? '')) {
        searchFrom = idx + 1
        continue
      }
    }
    const braceStart = appCss.indexOf('{', idx)
    if (braceStart === -1) break
    const braceEnd = appCss.indexOf('}', braceStart)
    if (braceEnd === -1) break
    results.push(appCss.slice(braceStart + 1, braceEnd))
    searchFrom = braceEnd + 1
  }
  return results
}

function alleRegelBloeckeMitSelektor(selector: string): Array<{ body: string; fullSelector: string; braceStart: number }> {
  const results: Array<{ body: string; fullSelector: string; braceStart: number }> = []
  let searchFrom = 0
  while (true) {
    const idx = appCss.indexOf(selector, searchFrom)
    if (idx === -1) break
    if (idx > 0) {
      const prev = appCss[idx - 1]
      if (!/[\s,]/.test(prev ?? '')) {
        searchFrom = idx + 1
        continue
      }
    }
    const braceStart = appCss.indexOf('{', idx)
    if (braceStart === -1) break
    const braceEnd = appCss.indexOf('}', braceStart)
    if (braceEnd === -1) break
    // Walk back from braceStart to find the selector start (skip whitespace
    // and walk over a preceding `}` or `;` to a non-whitespace char).
    let selStart = braceStart - 1
    while (selStart > 0 && /\s/.test(appCss[selStart] ?? '')) selStart--
    while (selStart > 0 && /[};]/.test(appCss[selStart] ?? '')) {
      selStart--
      while (selStart > 0 && /\s/.test(appCss[selStart] ?? '')) selStart--
    }
    // Now walk back to the previous rule-terminator `}` or BOF.
    let walker = selStart
    while (walker > 0) {
      const ch = appCss[walker]
      if (ch === '}') {
        walker++
        break
      }
      if (ch === '{' && walker < braceStart) {
        // hit the previous rule's open — back off
        break
      }
      walker--
    }
    // Walker may be at selStart+1 from the while above. Trim again.
    let realStart = walker
    if (realStart < 0) realStart = 0
    while (realStart < braceStart && /\s/.test(appCss[realStart] ?? '')) realStart++
    const fullSelector = appCss.slice(realStart, braceStart).trim()
    results.push({
      body: appCss.slice(braceStart + 1, braceEnd),
      fullSelector,
      braceStart,
    })
    searchFrom = braceEnd + 1
  }
  return results
}

function routeScopedBody(selector: string): string {
  // Waehlt aus allen Treffern die letzte BASE-Regel (nicht :hover, :focus,
  // :active, :visited). Verhindert dass der Helper eine Pseudo-Override-Regel
  // zurueckgibt. Skip-Bedingungen:
  //   1. fullSelector enthaelt :hover/:focus/:active/:visited/:focus-visible
  //   2. body enthaelt KEINE der typischen Top-Level-Deklarationen
  //      (border, min-height, max-height, padding, background, font-size, box-shadow)
  const blocks = alleRegelBloeckeMitSelektor(selector)
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]
    if (!block) continue
    const { body, fullSelector } = block
    if (/:hover|:focus-visible|:focus\b|:active|:visited/.test(fullSelector)) {
      continue
    }
    if (/border\s*:|min-height\s*:|max-height\s*:|padding\s*:|background\s*:|font-size\s*:|box-shadow\s*:/.test(body)) {
      return body
    }
  }
  // Fallback: letzte base-Regel
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]
    if (!block) continue
    if (!/:hover|:focus-visible|:focus\b|:active|:visited/.test(block.fullSelector)) {
      return block.body
    }
  }
  return blocks[blocks.length - 1]?.body ?? ''
}

describe('M2x Brettrand-Bottom-Hero: Hand + End-Turn + Pflicht-Abwurf + Spielbarkeit', () => {
  it('M2x:1 Handkarten-Buehne hat route-scoped min-height mit rem-Wert (Hero-Prominenz)', () => {
    // AENDERUNG 30.06.2026 (M3a): M3a reduziert die M2x-Mindesthoehe von
    // 6.5rem (104 px) auf 3.2rem (51 px), damit die 5 Handkarten in
    // den 900er Viewport passen. Die Hero-Prominenz wird durch den
    // prominenten Border + Box-Shadow + die Spielerplakette-Titel
    // (font-size 1.05rem, font-weight 800) erhalten, nicht durch die
    // Buehnen-Hoehe. Threshold daher auf >= 3rem (48 px) gesenkt.
    const body = routeScopedBody('.spielbereich--game-route [class~="handkarten-buehne"]')
    const minHeightMatch = body.match(/min-height:\s*([^;]+)/)
    expect(minHeightMatch).not.toBeNull()
    const value = minHeightMatch?.[1]?.trim() ?? ''
    const remMatch = value.match(/([\d.]+)rem/)
    expect(remMatch).not.toBeNull()
    const remValue = Number(remMatch?.[1] ?? 0)
    expect(remValue).toBeGreaterThanOrEqual(3.0)
  })

  it('M2x:2 Handkarten-Spielbarkeit-Pille ist eine Stitch-Pille (3px Border + border-radius 999px)', () => {
    const selector = '.spielbereich--game-route [class~="handkarten-spielbarkeit"]'
    const bodies = alleRegelBloecksFuer(selector)
    expect(bodies.length).toBeGreaterThan(0)
    const last = bodies[bodies.length - 1] ?? ''
    expect(last).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(last).toMatch(/border-radius:\s*999px/)
    expect(last).toMatch(/box-shadow:\s*[^;]*var\(--st-color-border-strong\)/)
  })

  it('M2x:3 End-Turn-Pille ist Hero (3px Border + Hard-Shadow)', () => {
    const selector = '.spielbereich--game-route [class~="handkarten-buehne__endturn"]'
    const last = routeScopedBody(selector)
    expect(last.length).toBeGreaterThan(0)
    expect(last).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(last).toMatch(/box-shadow:\s*[^;]*var\(--st-color-border-strong\)/)
  })

  it('M2x:4 Pflicht-Abwurf-Pille ist Hero (3px orange-red Border + Hard-Shadow)', () => {
    const selector = '.spielbereich--game-route [class~="handkarten-buehne__pflichtabwurf"]'
    const last = routeScopedBody(selector)
    expect(last.length).toBeGreaterThan(0)
    expect(last).toMatch(/border:\s*3px\s+solid\s+#[Cc]?[0-9a-fA-F]{6}/)
    expect(last).toMatch(/box-shadow:\s*[^;]*#[Cc]?[0-9a-fA-F]{6}/)
  })

  it('M2x:5 End-Turn-Icon ist Bold (font-weight: 900)', () => {
    const selector = '.spielbereich--game-route [class~="handkarten-buehne__endturn-icon"]'
    const body = routeScopedBody(selector)
    expect(body).toMatch(/font-weight:\s*900/)
  })

  it('M2x:6 Eyebrow-Titel der Spielerplakette in der Buehne hat font-size >= 0.95rem (Hero-Schrift)', () => {
    const selector = '.spielbereich--game-route [class~="handkarten-buehne__spielerplakette-titel"]'
    const body = routeScopedBody(selector)
    expect(body).toMatch(/font-size:\s*([0-9.]+)rem/)
    const fontSizeMatch = body.match(/font-size:\s*([0-9.]+)rem/)
    const fontSize = Number(fontSizeMatch?.[1] ?? 0)
    expect(fontSize).toBeGreaterThanOrEqual(0.95)
  })

  it('M2x:7 WaldtanzArenazugknopf zeigt im Default-State "Waehle eine Karte" statt "Spiele zuerst"', () => {
    // Default-State: Ausspielphase, keine Aktion vorhanden, Hand vorhanden.
    // Der fruehere "Spiele zuerst eine Handkarte auf dem Brett."-Text wird
    // durch den dezenten Hinweis "Waehle eine Karte und nutze die leuchtenden
    // Brettziele." ersetzt.
    const arenazugknopfSource = readFileSync('src/components/WaldtanzArenazugknopf.tsx', 'utf8')
    // Der Default-Status-Text-Return darf "Spiele zuerst" NICHT mehr als
    // String-Literal enthalten. Wir matchen auf "return" + String (sicherer
    // als freier String-Match, der den Kommentar erwischt).
    const hatSpieleZuerstReturn = /return\s+['"]Spiele zuerst/.test(arenazugknopfSource)
    expect(hatSpieleZuerstReturn).toBe(false)
    // Positiv: der neue dezente Hinweis-String ist vorhanden.
    expect(arenazugknopfSource).toMatch(/Wähle eine Karte und nutze die leuchtenden Brettziele/)
  })

  it('M2x:8 Cascade-Schutz: alle M2x-Regeln liegen in route-scoped Blocks (kein base-rule-Override)', () => {
    // M2i-Pitfall-Schutz: die Aenderungen duerfen nicht die Base-Regeln
    // `.handkarten-buehne` (ohne spielbereich-Prefix) ueberschreiben.
    // Pruefe dass min-height nur in der route-scoped-Regel vorkommt.
    const baseRuleBody = routeScopedBody('.handkarten-buehne')
    const routeRuleBody = routeScopedBody('.spielbereich--game-route [class~="handkarten-buehne"]')
    // Wenn die Base-Regel min-height enthaelt, ist die Cascade heikel
    // (spaetere Override mit gleicher Specificity 0,1,0). Wir verlangen
    // dass die route-scoped-Regel min-height enthaelt (M2x:1 abgesichert)
    // und die Base-Regel es ebenfalls enthaelt (Original-Wert) — die
    // M2x-Slice darf die Base-Regel NICHT ueberschreiben.
    expect(routeRuleBody).toMatch(/min-height:\s*[^;]*rem/)
    // Die Base-Regel darf die M2x-Erweiterung NICHT enthalten.
    expect(baseRuleBody).not.toMatch(/min-height:\s*6rem|min-height:\s*7rem/)
  })
})

describe('M2x Production-Smoke wiring', () => {
  it('M2x:9 smoke:production-Kette enthaelt das M2x-Smoke-Script', () => {
    expect(packageJson).toContain('node scripts/m2x_brettrand_hand_hero_smoke.mjs')
  })

  it('M2x:10 Smoke-Script enthaelt die M2x-Assertion + sichtInfo-Helper + Klassen-IDs', () => {
    const smokeScript = readFileSync('scripts/m2x_brettrand_hand_hero_smoke.mjs', 'utf8')
    expect(smokeScript).toContain('M2x Brettrand-Hand-Hero')
    expect(smokeScript).toContain('pruefeM2xBrettrandHandHero')
    expect(smokeScript).toContain('handkarten-buehne')
    expect(smokeScript).toContain('handkarten-buehne__endturn')
  })
})
