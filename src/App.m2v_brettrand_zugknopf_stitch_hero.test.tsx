/*
 * RED-Tests M2v: Brettrand-Zugknopf als Stitch-Hero-Bubble.
 *
 * Prueft den CSS-Vertrag fuer die M2v-Affordance-Mid-Slice:
 * - Coral-Orange-Hintergrund auf der Hero-Hauptknopf-Pille
 * - Stitch-Icon-Tile (3px-Border) auf der Pfeil-Glyph
 * - Idle-Pulsing-Aura wenn der Knopf "bereit" ist
 * - Hover-Lift mit translateY + groesserer Box-Shadow
 * - Focus-Visible-Ring mit gestrichelter Outline
 * - Reduced-Motion-Override
 *
 * Autor: rahn / Claude Code opusplan
 * Datum: 28.06.2026
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function cssBlock(selector: string): string {
  const appCss = readFileSync(resolve(__dirname, 'App.css'), 'utf-8')
  // Pseudo-Selektoren (mit :) brauchen separate Behandlung — der Prefix-Anchor
  // funktioniert nicht zuverlaessig. Direkter One-Liner.
  if (selector.includes(':')) {
    const escaped = selector.replace(/[.+*?^$(){}|[\]\\]/g, '\\$&')
    const direct = appCss.match(new RegExp(`(^|[\\s,>.])${escaped}\\s*\\{([^}]*)\\}`, 'm'))
    if (!direct) return ''
    // preceding 200 chars — wenn darin ein "@media" ohne schliessende Klammer liegt, skip
    const start = Math.max(0, direct.index! - 200)
    const preceding = appCss.slice(start, direct.index!)
    const openMedia = (preceding.match(/@media[^{]*\{/g) || []).length
    const closeBraces = (preceding.match(/\}/g) || []).length
    if (openMedia > closeBraces) return ''
    return direct[2]
  }
  // Letzter Top-Level-Match, Prefix-Anchor (Klasse am Wortanfang oder nach ,/>,
  // ODER direkt nach einem fuehrenden '.', da CSS-Selektoren mit '.' starten).
  // @media-Bloecke werden uebersprungen.
  const regex = new RegExp(`(^|[\\s,>.])${selector.replace(/[.+*?^$(){}|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'gm')
  let lastMatch: string | null = null
  let m: RegExpExecArray | null
  while ((m = regex.exec(appCss)) !== null) {
    // preceding 200 chars — wenn darin ein "@media" ohne schliessende Klammer liegt, skip
    const start = Math.max(0, m.index - 200)
    const preceding = appCss.slice(start, m.index)
    const openMedia = (preceding.match(/@media[^{]*\{/g) || []).length
    const closeBraces = (preceding.match(/\}/g) || []).length
    if (openMedia > closeBraces) continue
    lastMatch = m[2]
  }
  return lastMatch ?? ''
}



describe('M2v Brettrand-Zugknopf als Stitch-Hero-Bubble', () => {
  it('RED-1: Hauptknopf hat coral-orange Stitch-Hintergrund', () => {
    const block = cssBlock('waldtanz-arenazug__hauptknopf')
    expect(block).toMatch(/background:\s*var\(--st-color-tertiary-container\)/)
  })

  it('RED-2: Pfeil-Glyph ist ein Stitch-Icon-Tile mit 3px-Border', () => {
    const block = cssBlock('waldtanz-arenazug__pfeil')
    expect(block).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
  })

  it('RED-3: Bereit-Zustand hat Idle-Pulsing-Aura als Keyframe-Animation', () => {
    const block = cssBlock('waldtanz-arenazug--bereit')
    expect(block).toMatch(/animation:\s*waldtanz-arenazug-pulse[^;]*infinite/)
  })

  it('RED-4: Hover-Lift hebt den Knopf um 3px nach oben mit groesserer Box-Shadow', () => {
    const block = cssBlock('waldtanz-arenazug__hauptknopf:hover')
    expect(block).toMatch(/translateY\(-3px\)/)
    expect(block).toMatch(/box-shadow:\s*0\s+9px\s+0\s+var\(--st-color-border-strong\)/)
  })

  it('RED-5: Focus-Visible hat gestrichelte Outline mit 4px Offset', () => {
    const block = cssBlock('waldtanz-arenazug__hauptknopf:focus-visible')
    expect(block).toMatch(/outline:\s*3px\s+dashed\s+var\(--st-color-primary-fixed\)/)
    expect(block).toMatch(/outline-offset:\s*4px/)
  })

  it('RED-6: Reduced-Motion-Override deaktiviert die Pulsing-Aura', () => {
    const appCss = readFileSync(resolve(__dirname, 'App.css'), 'utf-8')
    // Suche nach reduced-motion-Block, der .waldtanz-arenazug--bereit enthaelt
    // mit animation: none. Tolerant: beliebiger Block im File.
    const allBlocks = appCss.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/g,
    )
    expect(allBlocks).not.toBeNull()
    const found = allBlocks!.some(block =>
      /\.waldtanz-arenazug--bereit\s*\{[^}]*animation:\s*none/.test(block),
    )
    expect(found).toBe(true)
  })
})

describe('M2v Cascade-Regression: route-scoped Override erlaubt Pulsing weiter', () => {
  it('RED-7: route-scoped Override auf .waldtanz-arenazug--bereit setzt KEIN animation: none', () => {
    const appCss = readFileSync(resolve(__dirname, 'App.css'), 'utf-8')
    // Direkter Match — exakter Selector-Text, ohne cssBlock-Heuristik.
    const regex = /\.spielbereich--game-route\s+\[class~="waldtanz-arenazug--bereit"\]\s*\{([^}]*)\}/
    const m = appCss.match(regex)
    if (!m) return // kein Override -> OK
    expect(m[1]).not.toMatch(/animation:\s*none/)
  })

  it('RED-8: route-scoped Hover/Active auf Hauptknopf behält translateY-Lift (Kimi-B1-Fix)', () => {
    const appCss = readFileSync(resolve(__dirname, 'App.css'), 'utf-8')
    // Cascade-Regression: route-scoped :hover und :active MUESSEN transform/translateY setzen,
    // sonst ueberschreibt die spaetere 0,2,0-Regel die 0,2,0-Basis-Pseudo-Klassen.
    const hoverMatch = appCss.match(
      /\.spielbereich--game-route\s+\[class~="waldtanz-arenazug__hauptknopf"\]:hover\s*\{([^}]*)\}/,
    )
    const activeMatch = appCss.match(
      /\.spielbereich--game-route\s+\[class~="waldtanz-arenazug__hauptknopf"\]:active\s*\{([^}]*)\}/,
    )
    expect(hoverMatch).not.toBeNull()
    expect(hoverMatch![1]).toMatch(/translateY\(-?\d+px\)/)
    expect(activeMatch).not.toBeNull()
    expect(activeMatch![1]).toMatch(/translateY\(\d+px\)/)
  })
})