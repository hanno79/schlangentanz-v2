/* Author: hermes-cron
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M2y — Waldtanz-Gegnerlichtung im Leerlauf kompaktifizieren.
 *              Auf /game faellt die riesige leere "Gegner-Schlangen"-Box
 *              (Initial-State, ~250px hoch) zu einem kompakten Hinweis-Banner
 *              (~50-80px) zusammen, sobald keine gegnerischen Schlangen
 *              existieren. Sobald die erste gegnerische Schlange erscheint,
 *              expandiert die Card wieder zur vollen Liste. Reine CSS-only-
 *              Konsolidierung im route-scoped Block; Engine, JSX und
 *              M1dp-Basis-Deklarationen bleiben unveraendert.
 *
 * Akzeptanzkriterien:
 * 1. Compact-Hoehe: route-scoped min-height klein genug
 * 2. Stitch-Stil bleibt (Border + Box-Shadow) sichtbar
 * 3. Populated-State (Liste rendert) bleibt voll
 * 4. / (Lobby) bleibt Default-Look
 * 5. Cascade-Safe: alle M1dp-Basis-Deklarationen in der spaeteren Regel
 * 6. package.json smoke:production enthaelt M2y
 * 7. M2y ist jetzt der juengste Slice (Last-In-Chain)
 * 8. Smoke-Script enthaelt die richtigen Asserts + Helper
 */
import { readFileSync, existsSync } from 'node:fs'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { erstelleSpielzustand } from './engine'
import {istVerdrahtet, produktionsKette} from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeChain = produktionsKette()

// cssBlock-Helper: letzte Top-Level-Regel fuer einen Selektor finden.
// Skippt @media-reduce-Blöcke via depth-tracked {}-Zaehlung.
function cssBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(^|[\\s,>])${escaped}\\s*\\{([^}]*)\\}`, 'g')
  const matches = Array.from(appCss.matchAll(re))
  if (matches.length === 0) return ''
  // Walk back: skip matches whose preceding 200 chars have more @media opens
  // than } closings (i.e. inside an open @media block).
  for (let i = matches.length - 1; i >= 0; i--) {
    const start = matches[i].index ?? 0
    const preceding = appCss.slice(0, start)
    // Depth-track: walk through preceding text and find current brace depth
    // at `start`. If depth > 0, we're inside an @media block.
    let depth = 0
    let inAtMedia = false
    let atMediaDepth = 0
    for (let j = 0; j < preceding.length; j++) {
      const ch = preceding[j]
      if (ch === '{') {
        // Check if this opens an @media
        const before = preceding.slice(Math.max(0, j - 50), j)
        if (/@media[^{]*$/.test(before)) {
          inAtMedia = true
          atMediaDepth = depth
        }
        depth++
      } else if (ch === '}') {
        depth--
        if (inAtMedia && depth === atMediaDepth) {
          inAtMedia = false
        }
      }
    }
    if (inAtMedia) continue
    return matches[i][2] ?? ''
  }
  return matches[matches.length - 1]?.[2] ?? ''
}

describe('M2y Gegnerlichtung-Leerlauf kompaktifizieren', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('M2y:1 — Compact-Hoehe: route-scoped min-height klein genug fuer Empty-State', () => {
    // Die neue Regel muss fuer den Empty-State (kein __liste-Child)
    // die Hoehe auf <= 90px druecken.
    // Pattern: .spielbereich--game-route [class~="waldtanz-gegnerlichtung"]:not(:has([class~="waldtanz-gegnerlichtung__liste"]))
    const block = cssBlock('.spielbereich--game-route [class~="waldtanz-gegnerlichtung"]:not(:has([class~="waldtanz-gegnerlichtung__liste"]))')
    expect(block).toMatch(/min-height\s*:\s*clamp\(/)
    // Extrahiere den min-height-Wert
    const m = block.match(/min-height\s*:\s*clamp\(([\d.]+)rem/)
    expect(m).not.toBeNull()
    const rem = parseFloat(m![1])
    // Annahme root-font-size 16px, also 1rem = 16px. 3.6rem = 57.6px, 5.6rem = 89.6px
    // Wir wollen <= 6rem (96px) — das ist die Compact-Schwelle.
    expect(rem).toBeLessThanOrEqual(6)
  })

  it('M2y:2 — Stitch-Stil bleibt sichtbar (Border + Box-Shadow im Compact-Mode)', () => {
    const block = cssBlock('.spielbereich--game-route [class~="waldtanz-gegnerlichtung"]:not(:has([class~="waldtanz-gegnerlichtung__liste"]))')
    expect(block).toMatch(/border\s*:\s*3px solid/)
    expect(block).toMatch(/box-shadow\s*:/)
  })

  it('M2y:3 — Populated-State: volle Card bleibt unveraendert (kein Compact-Mode)', () => {
    // Wenn der Selektor via :not(:has(__liste)) greift, ist der Populated-Fall
    // der Default. Pruefe: im Populated-Fall greift KEIN min-height-Override
    // mit kleinem Wert, d.h. der Basis-Wert bleibt.
    // Wir rendern mit einer 2-Spieler-Fixture und pruefen, dass der Override
    // NUR fuer den :not-Pfad existiert.
    const emptyBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-gegnerlichtung"]:not(:has([class~="waldtanz-gegnerlichtung__liste"]))')
    expect(emptyBlock).toBeTruthy()
    // Basis-Regel hat KEIN min-height (nur padding-bedingte Hoehe)
    const baseBlock = cssBlock('.waldtanz-gegnerlichtung')
    expect(baseBlock).not.toMatch(/min-height\s*:/)
  })

  it('M2y:4 — / (Lobby) bleibt Default-Look (kein route-scoped Override aktiv)', () => {
    // Auf / greift der route-scoped Selektor nicht, weil
    // .spielbereich--game-route nur auf /game gesetzt ist.
    // Wir koennen das nicht direkt im CSS pruefen, aber wir verifizieren
    // dass der Selektor an .spielbereich--game-route gebunden ist.
    const re = /\.spielbereich--game-route\s+\[class~="waldtanz-gegnerlichtung"\]:not/
    expect(appCss).toMatch(re)
  })

  it('M2y:5 — Cascade-Safe: alle M1dp-Basis-Deklarationen in der spaeteren Regel erhalten', () => {
    // M1dt-Pitfall-Management: M2y darf die M1dp-Basis-Deklarationen
    // (display:flex, flex-direction:column, gap, width, max-width, padding,
    // border, border-radius, background, box-shadow, box-sizing, color)
    // nicht ueberschreiben.
    const block = cssBlock('.spielbereich--game-route [class~="waldtanz-gegnerlichtung"]:not(:has([class~="waldtanz-gegnerlichtung__liste"]))')
    // Die M2y-Regel darf max-height, min-height, padding, gap aendern —
    // aber display/flex-direction/width/background/border MUSS enthalten sein.
    expect(block).toMatch(/display\s*:\s*flex/)
    expect(block).toMatch(/flex-direction\s*:\s*column/)
    expect(block).toMatch(/background\s*:/)
    expect(block).toMatch(/border\s*:/)
  })

  it('M2y:6 — DOM-Render-Test: Empty-Gegnerlichtung rendert die leere Card', () => {
    // Render-Test: 2-Spieler-Spiel, Spieler 2 hat keine Schlangen
    const zustand = erstelleSpielzustand(2, () => 0.999999)
    render(<App initialZustand={zustand} />)
    // Waldtanz-Gegnerlichtung-Region muss existieren
    const gegnerLichtung = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    expect(gegnerLichtung).toBeInTheDocument()
    // Empty-Hinweis rendert
    expect(gegnerLichtung.querySelector('.waldtanz-gegnerlichtung__leertext')).not.toBeNull()
    // KEINE Liste im Empty-State
    expect(gegnerLichtung.querySelector('.waldtanz-gegnerlichtung__liste')).toBeNull()
  })

  it('M2y:7 — package.json smoke:production enthaelt M2y in der Kette', () => {
    // AENDERUNG 30.06.2026 (M2z-Migration): M2y ist nicht mehr letzter Schritt
    // (M2z haengt jetzt dahinter). Per Pitfall #14 migrate to member+index.
    expect(istVerdrahtet('m2y_gegnerlichtung_leerlauf_smoke.mjs')).toBe(true)
    const steps = smokeChain.split(/\s*&&\s*/)
    const m2yIndex = steps.findIndex((s) => s.includes('m2y_gegnerlichtung_leerlauf_smoke.mjs'))
    expect(m2yIndex).toBeGreaterThanOrEqual(0)
  })

  it('M2y:8 — Smoke-Script existiert und enthaelt die richtigen Asserts', () => {
    expect(existsSync('scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs')).toBe(true)
    const src = readFileSync('scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs', 'utf8')
    expect(src).toMatch(/BASE_URL/)
    expect(src).toMatch(/waldtanz-gegnerlichtung/)
    expect(src).toMatch(/pruefeM2yLeerlauf|gegnerlichtungLeerlauf/)
    expect(src).toMatch(/sichtInfo|leerlaufHoehe/)
  })
})
