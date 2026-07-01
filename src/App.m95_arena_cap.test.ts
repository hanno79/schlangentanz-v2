/* Author: rahn
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M9.5 beweist, dass die Arenasstein-Cap-Senkung die
 *   M9-Grid-Row tatsaechlich durchsetzt. Vor M9.5 hatte das Kind-Element
 *   .waldtanz-arenasstein eine eigene height: clamp(34rem, 64vh, 40rem)
 *   = 576-720 px, die die M9-Grid-Row-Cap von 480 px schlug. Resultat:
 *   Arenasstein wuchs auf 982 px, Hand bei y=760-988 (88 px unter Falz).
 *
 *   M9.5 senkt die Arenasstein-Cap auf clamp(24rem, 50vh, 32rem) =
 *   450-512 px, sodass die M9-Grid-Row tatsaechlich greift.
 *
 *   M3i (01.07.2026) migriert M9.5: Cap von 24rem/50vh/32rem auf
 *   20rem/42vh/26rem = 360-378 px (Pitfall #48 Cascade-Contract-
 *   Migration), damit Hand + Schlangenlichtung im 1280x900-Erstbild
 *   sichtbar bleiben. Die M9.5-Red-Tests werden hier auf den M3i-Wert
 *   migriert.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const appCss = readFileSync('src/App.css', 'utf8')

/** Extract the FIRST top-level rule body for a given CSS selector.
 *  Useful for distinguishing M1dk base-rule from M2r override at a
 *  later position. */
function cssBlockFirst(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(appCss.matchAll(new RegExp(`(^|[\\s,>])${escaped}\\s*\\{([^}]*)\\}`, 'gm')))
  if (matches.length === 0) return ''
  return matches[0][2] ?? ''
}

/** Extract ALL rule bodies for a given CSS selector. Returns an array
 *  in source order. */
function cssBlockAll(selector: string): string[] {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(appCss.matchAll(new RegExp(`(^|[\\s,>])${escaped}\\s*\\{([^}]*)\\}`, 'gm')))
  return matches.map(m => m[2] ?? '')
}

describe('M9.5 Arenasstein-Cap-Senkung', () => {
  it('M9.5:1 Alle Arenasstein-height-Regeln (M1dk + M2r-Override) sind auf 20rem/42vh/26rem gesenkt (M3i-Migration)', () => {
    // Es gibt ZWEI Arenasstein-Regeln im aktuellen CSS: M1dk-Base und M2r-Override.
    // M9.5 senkte BEIDE auf 24rem/50vh/32rem, M3i (01.07.2026) senkt weiter
    // auf 20rem/42vh/26rem (Pitfall #48 Cascade-Contract-Migration).
    const allBlocks = cssBlockAll('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(allBlocks.length).toBeGreaterThanOrEqual(2)
    allBlocks.forEach((block, i) => {
      expect(block, `Arenasstein-Regel #${i + 1} muss die M3i-Cap haben`).toMatch(/height:\s*clamp\(\s*20rem\s*,\s*42vh\s*,\s*26rem\s*\)/)
      expect(block, `Arenasstein-Regel #${i + 1} darf die alte 40rem-Cap NICHT mehr haben`).not.toMatch(/clamp\(\s*40rem\s*,\s*72vh\s*,\s*46rem\s*\)/)
    })
  })

  it('M9.5:2 Alle Arenasstein-max-height-Regeln entsprechen der neuen height (M3i-Migration)', () => {
    const allBlocks = cssBlockAll('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    allBlocks.forEach((block, i) => {
      expect(block, `Arenasstein-Regel #${i + 1} max-height muss der M3i-Cap entsprechen`).toMatch(/max-height:\s*clamp\(\s*20rem\s*,\s*42vh\s*,\s*26rem\s*\)/)
    })
  })

  it('M9.5:3 Alte Arenasstein-Cap-Werte (34rem/64vh/40rem und 40rem/72vh/46rem) sind komplett verschwunden', () => {
    // Kein height/max-height in irgendeiner Arenasstein-Regel darf die alten Werte haben.
    const allBlocks = cssBlockAll('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    allBlocks.forEach((block, i) => {
      expect(block, `Arenasstein-Regel #${i + 1} darf 34rem-Cap NICHT enthalten`).not.toMatch(/clamp\(\s*34rem\s*,\s*64vh\s*,\s*40rem\s*\)/)
      expect(block, `Arenasstein-Regel #${i + 1} darf 40rem-Cap NICHT enthalten`).not.toMatch(/clamp\(\s*40rem\s*,\s*72vh\s*,\s*46rem\s*\)/)
    })
  })

  it('M9.5:4 Schlangenlichtung-min-height bleibt stabil auf 16rem/38vh/22rem (M1di-Vertrag)', () => {
    const block = cssBlockFirst('.spielbereich--game-route [class~="waldtanz-arenastein__schlangenlichtung"]')
    expect(block).not.toBe('')
    expect(block).toMatch(/min-height:\s*clamp\(\s*16rem\s*,\s*38vh\s*,\s*22rem\s*\)/)
  })

  it('M9.5:5 M9 grid-template-rows-Cap auf 24rem/50vh/32rem bleibt stabil (M9-Vertrag)', () => {
    expect(appCss).toMatch(/clamp\(24rem,\s*50vh,\s*32rem\)/)
  })

  it('M9.5:6 Arenasstein-Cap-Regel existiert noch (cascade-protection: kein versehentliches Loeschen)', () => {
    // Die M1dk-Base-Regel muss noch die Properties display/flex-direction/overflow haben.
    const baseBlock = cssBlockFirst('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(baseBlock).toMatch(/display:\s*flex/)
    expect(baseBlock).toMatch(/flex-direction:\s*column/)
    expect(baseBlock).toMatch(/min-height:\s*0/)
    expect(baseBlock).toMatch(/overflow:\s*hidden/)
  })

  it('M9.5:7 Geometrie-Bonus: 60+70+30+360+30+220+30 = 800 px <= 900 px (Viewport-Budget, M3i-Migration)', () => {
    // Dokumentarischer Bonus-Test: die neue Geometrie-Arithmetik muss
    // im 900vh-Viewport aufgehen. M3i (01.07.2026) senkt Arenasstein-
    // Cap von 450 auf 360 px (Pitfall #48).
    const SLOTS = 60 + 70 + 30 + 360 + 30 + 220 + 30
    expect(SLOTS).toBeLessThanOrEqual(900)
  })
})
