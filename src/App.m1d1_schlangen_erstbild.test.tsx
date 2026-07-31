/**
 * Author: rahn
 * Datum: 23.06.2026
 * Version: 1.0
 * Beschreibung: M1d1 beweist, dass die eigene Schlangenlichtung im
 * 1280×900-Erstbild sichtbar bleibt, indem das Arena-Internlayout das
 * Spielfeld per Flex bevorzugt und die Gegnerplakette kompaktiert wird.
 *
 * RED-Vertrag (TDD):
 *   1. Auf /game ist das waldtanz-arenastein ein flex-direction:column-
 *      Container, sodass das Spielfeld den Restplatz nach den Kopf-
 *      Elementen füllt.
 *   2. Das waldtanz-arenastein__spielfeld hat flex:1 1 auto (oder
 *      flex-grow >= 1), damit es nicht vom Kopfbereich verdrängt wird.
 *   3. Die waldtanz-gegnerplakette hat ein max-height-Constraint
 *      (<= 7rem), damit sie nicht 149 px vertikalen Platz verbraucht.
 *   4. Das Arena-Grid-Row-Clamp ist >= 19rem (vorher 17rem), damit
 *      das Arena mit Flex-Layout genug Gesamthöhe bekommt.
 *   5. Der Schlangenbereich bleibt strukturell innerhalb des Arenastein
 *      (DOM-Containment-Vertrag erhalten — kein Refactor der Component).
 *   6. Auf / (Lobby) bleibt der Arena-Vertrag unangetastet (kein
 *      Game-Route-CSS ausserhalb von .spielbereich--game-route).
 */
/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import {istVerdrahtet, produktionsKette} from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

// Kimi-Review NON-BLOCKER #1 (24.06.2026): cssBlockForSelector inkludiert
// /* … */-Kommentare im Rueckgabewert. In Bloecken mit langen AENDERUNG-
// Kommentaren, die ALT-Werte als Text erwaehnen, koennen Regex-Assertions
// auf Kommentar-Text statt auf echte CSS-Deklarationen matchen (M1cx-Pitfall).
// cleanedBlock strippt Kommentare VOR dem Matching und ist der kanonische
// Pattern aus App.m1d0_waldtanz_layout_konsolidierung.test.tsx.
function cssBlockForSelector(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const raw = appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
  return raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
}

describe('M1d1 Waldtanz-Schlangen-Erstbild', () => {
  // Kimi-Review NON-BLOCKER #3 (24.06.2026): history-Reset zwischen Tests,
  // damit /game-Routen-Push nicht in den naechsten Test ueberblutet. Andere
  // /game-Tests (z.B. App.m1d0) nutzen denselben afterEach-Reset.
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('gibt dem waldtanz-arenastein auf /game ein flex-direction:column-Layout', () => {
    const block = cssBlockForSelector(
      '.spielbereich--game-route [class~="waldtanz-arenastein"]',
    )
    expect(block).toContain('display:')
    expect(block).toContain('flex')
    expect(block.toLowerCase()).toContain('flex-direction')
    expect(block.toLowerCase()).toContain('column')
  })

  it('gibt dem waldtanz-arenastein__spielfeld flex:1 damit es den Restplatz füllt', () => {
    const block = cssBlockForSelector(
      '.spielbereich--game-route [class~="waldtanz-arenastein__spielfeld"]',
    )
    // flex:1 1 auto oder flex-grow:1 — Hauptsache das Spielfeld wächst.
    const hasFlex = /flex\s*:\s*1/.test(block) || /flex-grow\s*:\s*1/.test(block)
    expect(hasFlex).toBe(true)
  })

  it('kapppt die waldtanz-gegnerplakette auf max-height <= 7rem', () => {
    const block = cssBlockForSelector(
      '.spielbereich--game-route [class~="spielbrett--waldtanz"] [class~="waldtanz-gegnerplakette"]',
    )
    expect(block).toContain('max-height')
    // Extrahiere den max-height-Wert und stelle sicher, dass er <= 7rem ist.
    const match = block.match(/max-height\s*:\s*([^;]+)/)
    expect(match).toBeTruthy()
    const value = match![1].trim()
    // clamp(MIN, PREF, MAX) — der MAX-Wert muss <= 7rem sein.
    const remMatch = value.match(/(\d+(?:\.\d+)?)rem/g)
    expect(remMatch).toBeTruthy()
    const maxRem = Math.max(...remMatch!.map((m) => parseFloat(m)))
    expect(maxRem).toBeLessThanOrEqual(7)
  })

  /* ÄNDERUNG [31.07.2026]: S-2c — Test entfallen: „erhöht das Arena-Grid-Row-Clamp auf mindestens 19rem"

     Er las im CSS-Quelltext einen Wert, den der Brettrand-Pivot abgeschafft hat
     (Bühnen-/Kartenhöhe bzw. Arena-clamp). Die Bodenleiste liegt seit S-2c am
     Viewport-Boden, die Arenazeile nimmt `minmax(0, 1fr)` statt eines von Hand
     gerechneten clamp(), und die Hero-Größen aus M2x/M2i gelten wieder.

     Die Absicht wird gemessen statt gelesen:
     tests/layout/hand_am_brettrand.spec.ts prüft Bühnen- und Kartenhöhe,
     tests/layout/spielbrett_zeilen.spec.ts, dass keine Zeile ihren Inhalt
     sprengt. */

  it('behält den Schlangenbereich strukturell innerhalb des Arenastein', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpieler = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const arena = within(aktiverSpieler).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const schlangenlichtung = within(arena).getByRole('region', { name: 'Schlangenlichtung' })

    expect(arena).toContainElement(schlangenlichtung)
  })

  it('behält Kern-Regionen auf /game sichtbar (Arenastein, Handkarten, Schlangenlichtung)', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    expect(within(spielbereich).getByRole('region', { name: 'Waldtanz-Arenastein' })).toBeTruthy()
    expect(within(spielbereich).getByRole('region', { name: 'Handkarten' })).toBeTruthy()
    expect(within(spielbereich).getByRole('region', { name: 'Schlangenlichtung' })).toBeTruthy()
  })

  it('verdrahtet das M1d1-Browser-Smoke-Skript in der kanonischen npm-Smoke-Kette', () => {
    expect(existsSync('scripts/m1d1_arena_flex_column_smoke.mjs')).toBe(true)
    const smokeBlock = produktionsKette()
    expect(istVerdrahtet('m1d1_arena_flex_column_smoke.mjs')).toBe(true)
    // M1d1-Smoke kommt direkt nach M1dd (dem bisher letzten Smoke).
    const m1ddIdx = smokeBlock.indexOf('m1dd_aktionsdock_im_spielbrett_smoke.mjs')
    const m1d1Idx = smokeBlock.indexOf('m1d1_arena_flex_column_smoke.mjs')
    expect(m1ddIdx).toBeGreaterThan(-1)
    expect(m1d1Idx).toBeGreaterThan(m1ddIdx)
  })
})
