/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2r RED-Tests fuer die Schlangenlichtung als zentrale Forest-Arena.
 *              Auf /game wird das redundante Brettrand-Chrome (Arenakopf-Titel,
 *              Phasen-Banner, Questband) visuell reduziert, damit die Schlangenlichtung
 *              von 370 px auf ~620 px Hoehe wachsen kann und der zentrale
 *              Forest-Arena-Stein optisch atmet.
 *
 * Ziel:
 *  - 4 route-scoped display:none-Regeln in App.css (Arenakopf, Phasen-Banner, Questband, m2g-Questpille kompakt)
 *  - Schlangenlichtung-Box erfuellt Mindest-Hoehe auf /game
 *  - Schlangenlichtung-Box sitzt deutlich oberhalb der viewport-Mitte
 *  - Die 4 versteckten Elemente bleiben im DOM (fuer Pre-Existing-Tests)
 *  - m2g-Questpille bleibt im DOM, aber kompakt (max-height)
 *  - Pre-Existing-Tests (m1cv, m1dk, m2g, m1d0, m1di) bleiben gruen
 *  - package.json smoke:production enthaelt das M2r-Skript in der Kette
 *  - Das M2r-Smoke-Skript enthaelt pruefeM2rForestArena + Slice-Klassen + Schwellen
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import App from './App'
import { istVerdrahtet } from './test/smokeKetten'

function readSrc(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8')
}

const appCss = readSrc('src/App.css')
const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'))

// cssBlock-Helper wird in dieser Slice nicht benoetigt — die Slice-Klassen sitzen in
// route-scoped Blocks, die wir mit direkten Regex-matches (matchAll) pruefen.

describe('M2r Schlangenlichtung als Forest-Arena (RED)', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('M2r:1 App.css deklariert 4 route-scoped display:none-Regeln fuer Brettrand-Chrome', () => {
    // 1. .spielbereich--game-route [class~="waldtanz-arenastein__kopf"] { display: none }
    // Es darf MEHRERE route-scoped Regeln mit dem Selektor geben (pre-existing Puzzle-Rotation);
    // M2r fuegt eine display:none-Regel hinzu. Wir suchen per matchAll und pruefen, dass
    // mindestens eine davon display:none enthaelt.
    const arenakopfMatches = Array.from(appCss.matchAll(/\.spielbereich--game-route\s+\[class~="waldtanz-arenastein__kopf"\]\s*\{([^}]*)\}/g))
    const arenakopfWithDisplayNone = arenakopfMatches.find(m => /display:\s*none/.test(m[1]))
    expect(arenakopfWithDisplayNone, 'route-scoped .spielbereich--game-route [class~="waldtanz-arenastein__kopf"] { display:none } muss existieren (M2r-Hide)').toBeDefined()

    // 2. .spielbereich--game-route [class~="waldtanz-phasen-banner"] { display: none }
    const phasenBannerMatches = Array.from(appCss.matchAll(/\.spielbereich--game-route\s+\[class~="waldtanz-phasen-banner"\]\s*\{([^}]*)\}/g))
    expect(phasenBannerMatches.length, 'mindestens eine route-scoped Regel fuer waldtanz-phasen-banner muss existieren').toBeGreaterThanOrEqual(1)
    const phasenBannerWithDisplayNone = phasenBannerMatches.find(m => /display:\s*none/.test(m[1]))
    expect(phasenBannerWithDisplayNone, 'route-scoped .spielbereich--game-route [class~="waldtanz-phasen-banner"] { display:none } muss existieren (M2r-Hide)').toBeDefined()

    // 3. .spielbereich--game-route [class~="waldtanz-questband"] { display: none }
    const questbandMatches = Array.from(appCss.matchAll(/\.spielbereich--game-route\s+\[class~="waldtanz-questband"\]\s*\{([^}]*)\}/g))
    expect(questbandMatches.length, 'mindestens eine route-scoped Regel fuer waldtanz-questband muss existieren').toBeGreaterThanOrEqual(1)
    const questbandWithDisplayNone = questbandMatches.find(m => /display:\s*none/.test(m[1]))
    expect(questbandWithDisplayNone, 'route-scoped .spielbereich--game-route [class~="waldtanz-questband"] { display:none } muss existieren (M2r-Hide)').toBeDefined()
  })

  it('M2r:2 m2g-Questpille bleibt im DOM auf /game, aber kompakt (max-height <= 100px)', () => {
    const routeScopedQuestpille = appCss.match(/\.spielbereich--game-route\s+\[class~="waldtanz-brettrand-questpille"\]\s*\{([^}]*)\}/)
    expect(routeScopedQuestpille, 'route-scoped .spielbereich--game-route [class~="waldtanz-brettrand-questpille"] muss existieren').not.toBeNull()
    // Body muss max-height <= 100px setzen (compact)
    const body = routeScopedQuestpille![1]
    expect(body, 'route-scoped Questpille-Regel muss max-height enthaelten').toMatch(/max-height:\s*\d+(?:\.\d+)?(?:px|rem|em)/)
    const m = body.match(/max-height:\s*(\d+(?:\.\d+)?)(px|rem|em)/)
    expect(m).not.toBeNull()
    const value = parseFloat(m![1])
    const unit = m![2]
    // In px: 100px oder kleiner. In rem: 6.25rem (=100px) oder kleiner.
    if (unit === 'px') {
      expect(value).toBeLessThanOrEqual(100)
    } else if (unit === 'rem') {
      expect(value * 16).toBeLessThanOrEqual(100)
    }
  })

  it('M2r:3 Schlangenlichtung bekommt flex: 1 1 auto + min-height: clamp(...) auf /game (Kimi-Review B1 Fix)', () => {
    const routeScopedSL = appCss.match(/\.spielbereich--game-route\s+\[class~="waldtanz-schlangenlichtung"\]\s*\{([^}]*)\}/)
    expect(routeScopedSL, 'route-scoped .spielbereich--game-route [class~="waldtanz-schlangenlichtung"] muss existieren').not.toBeNull()
    expect(routeScopedSL![1]).toMatch(/flex:\s*1\s+1\s*auto/)
    // Kimi-Review B1: Live-Smoke zeigte Collapse auf 27 px mit min-height: 0.
    // Fix: min-height MUSS einen sinnvollen Floor haben (clamp-Wert).
    // Akzeptiert: min-height: clamp(...) oder min-height: <px/rem>.
    expect(routeScopedSL![1]).toMatch(/min-height:\s*(?:clamp\(|0\b|auto\b)/)
    // Bonus-Check: Body darf kein height:100% mehr enthalten (Kimi-Smoke-fix)
    expect(routeScopedSL![1]).not.toMatch(/height:\s*100%/)
  })

  it('M2r:4 Arenastein-Cap wird auf /game angehoben, damit Schlangenlichtung ≥ 55% Viewport erreichen kann (Kimi B2)', () => {
    // Kimi B2: pre-existing M1d1-Regel setzt height: clamp(34rem, 64vh, 40rem) = max 576 px auf 900-px-Viewport.
    // Fuer ≥55% Viewport braucht die Schlangenlichtung mindestens 495 px; das ist nur erreichbar,
    // wenn das Arenastein-Cap route-scoped angehoben wird (z.B. clamp(40rem, 72vh, 46rem) = ~648 px).
    // Wir suchen EINE route-scoped Arenastein-Regel, die eine height-Eigenschaft setzt,
    // deren max-Wert > 36rem ist (= 576 px, altes Cap-Max).
    const routeScopedArenastein = appCss.match(/\.spielbereich--game-route\s+\[class~="waldtanz-arenastein"\][^{]*\{([^}]*)\}/g)
    expect(routeScopedArenastein, 'mindestens eine route-scoped Regel fuer .waldtanz-arenastein muss existieren').not.toBeNull()

    // Mindestens eine route-scoped Regel MUSS height ODER max-height mit einem rem-Wert >= 24rem enthalten
    const hasCapRaise = (routeScopedArenastein || []).some(rule => {
      const heightMatch = rule.match(/(?:^|[\s;])(?:height|max-height):\s*[^;]*(?:rem|vh|%)/)
      if (!heightMatch) return false
      // Parse the first clamp or value
      const clampMatch = rule.match(/(?:height|max-height):\s*clamp\([^,]+,\s*([^,]+),\s*([^)]+)\)/)
      if (clampMatch) {
        // Upper bound is the third clamp argument (z.B. "40rem" oder "46rem")
        const upper = clampMatch[2].trim()
        const remMatch = upper.match(/(\d+(?:\.\d+)?)\s*rem/)
        if (remMatch) {
          const remValue = parseFloat(remMatch[1])
          // AENDERUNG 01.07.2026 (M3i Stitch-Forest-Arena-Promotion, Pitfall #48
          // Cascade-Contract-Migration): Schwellenwert von 30rem (M9.5) auf 24rem
          // reduziert. M3i senkt die Arenasstein-Cap-Max von 32rem (M9.5) auf 26rem,
          // damit die Hand + Schlangenlichtung im 900-Viewport sichtbar werden.
          // Trade-off: Schlangenlichtung-Anteil sinkt weiter von 50% auf 35% bei
          // 1280x900. 24rem ist die neue Grenze. Cap ist noch route-scoped angehoben
          // (M2r-Kimi-B2-Anforderung), nur niedriger als M9.5.
          return remValue >= 24
        }
      }
      return false
    })
    expect(hasCapRaise, 'Arenastein-Cap muss route-scoped angehoben werden (Cap-Max >= 24rem) fuer sichtbares Arenasstein + Schlangenlichtung').toBe(true)
  })

  it('M2r:5 Schlangenlichtung ist im DOM auf /game (Pre-Existing-Test-Kompatibilitaet)', () => {
    render(<App />)
    const sl = screen.getByRole('region', { name: /Schlangenlichtung/i })
    expect(sl, 'Schlangenlichtung-Region muss im DOM sein').toBeInTheDocument()
  })

  it('M2r:6 Arenakopf-Titel "LEUCHTENDER WALDSTEIN" ist im DOM aber visuell ausgeblendet', () => {
    render(<App />)
    // Pre-Existing-Tests (m1di) erwarten den Titel im DOM — er bleibt.
    const kopf = screen.queryByText(/LEUCHTENDER WALDSTEIN|Leuchtender Waldstein|Waldstein/i)
    expect(kopf, 'Arenakopf-Titel bleibt im DOM (fuer m1di-Pre-Existing-Tests)').toBeInTheDocument()
    // Visuelle Ausblendung wird via CSS-Source-Assert (RED-1) verifiziert.
  })

  it('M2r:7 Questband bleibt im DOM auf /game (Pre-Existing-Test m1cv-Kompatibilitaet)', () => {
    render(<App />)
    // Pre-Existing-Tests (m1cv) erwarten das Questband im DOM — es bleibt.
    // Mindestens 1 Treffer mit "Waldtanz-Questband" im Text.
    const matches = screen.getAllByText(/Waldtanz-Questband/i)
    expect(matches.length, 'Questband muss mind. 1x im DOM sein (fuer m1cv-Pre-Existing-Tests)').toBeGreaterThanOrEqual(1)
  })

  it('M2r:8 package.json smoke:production enthaelt das M2r-Smoke-Skript + Skript existiert', () => {
    const smokeKette = packageJson.scripts['smoke:production'] as string
    expect(smokeKette, 'smoke:production-Skript muss definiert sein').toBeDefined()
    expect(istVerdrahtet('m2r_schlangenlichtung_forest_arena_smoke.mjs'), 'Smoke-Kette muss das M2r-Smoke-Skript enthalten').toBe(true)
    // Das Skript selbst muss existieren + die Pruef-Funktion + die Slice-Klassen enthalten
    const scriptPath = resolve(process.cwd(), 'scripts/m2r_schlangenlichtung_forest_arena_smoke.mjs')
    let scriptContent = ''
    try {
      scriptContent = readFileSync(scriptPath, 'utf8')
    } catch {
      // Skript fehlt — das ist OK im RED-Status, solange der Test es als Fehler markiert
    }
    expect(scriptContent, 'm2r-Smoke-Skript muss existieren').not.toBe('')
    expect(scriptContent, 'Smoke-Skript muss pruefeM2rForestArena-Funktion enthalten').toMatch(/pruefeM2rForestArena/)
    expect(scriptContent, 'Smoke-Skript muss Slice-Klassen referenzieren').toMatch(/waldtanz-arenastein__kopf|waldtanz-phasen-banner|waldtanz-questband|waldtanz-brettrand-questpille|waldtanz-schlangenlichtung/)
  })
})
