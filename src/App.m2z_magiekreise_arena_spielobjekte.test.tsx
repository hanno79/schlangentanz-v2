/**
 * Author: rahn
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M2z beweist, dass die 3 Waldtanz-Magiekreise in der Schlangenlichtung
 * auf /game als grosse lebendige Forest-Arena-Spielobjekte rendern (Stitch-Groesse),
 * nicht als schmaler Mini-Strip am Brettrand. Engine, Legal-Aktionen, Spielregeln
 * und Aktionspfade bleiben unveraendert.
 *
 * RED-Vertrag (TDD):
 *   1. CSS-Source: Magiekreise-Container-Mindesthoehe angehoben auf
 *      clamp(11rem, 22vh, 15rem) — vorher 4.9rem/9vw/6.75rem.
 *   2. CSS-Source: Magiekreise-Liste Grid-Template-Columns repeat(3, minmax(6.5rem, 1fr))
 *      — vorher minmax(4.8rem, 1fr) — fuer grosszuegigere Kreisel-Slots.
 *   3. CSS-Source: Magiekreise-Kreisel min-height angehoben auf
 *      clamp(7.5rem, 14vh, 9.5rem) — vorher 4.9rem/9vw/6.75rem.
 *   4. CSS-Source: Magiekreise-Container hat 3px forest-green Border + Hard-Shadow
 *      + 1.5rem border-radius (Stitch-Spielobjekt-Stil).
 *   5. CSS-Source: aktive Kreise (--aktiv) haben eine lime-Glow-Animation
 *      (Stitch-Magic-Circle-Pulse).
 *   6. CSS-Source: Reduced-Motion-Override schaltet die Glow-Animation ab.
 *   7. DOM: Auf /game hat der Magiekreise-Container die waldtanz-magiekreise-Klasse
 *      mit aria-label="Waldtanz-Magiekreise" (unveraendert, regression-safety).
 *   8. package.json: smoke:production-Kette enthaelt m2z_magiekreise_arena_spielobjekte_smoke.mjs
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Last-top-level-match: walk back from last match, skip @media blocks.
  const matches: RegExpExecArray[] = []
  const re = new RegExp(`(?:^|[\\s,>])${escaped}\\s*\\{`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(appCss)) !== null) {
    // Skip if inside @media (preceding 200 chars contain unclosed @media)
    const before = appCss.slice(Math.max(0, m.index - 200), m.index)
    const openCount = (before.match(/@media[^{]*\{/g) ?? []).length
    const closeCount = (before.match(/\}/g) ?? []).length
    if (openCount > closeCount) continue
    matches.push(m)
  }
  if (matches.length === 0) return ''
  const last = matches[matches.length - 1]
  const start = last.index + last[0].length
  const rest = appCss.slice(start)
  const depth = 1
  let depthCount = depth
  let i = 0
  while (i < rest.length && depthCount > 0) {
    if (rest[i] === '{') depthCount++
    else if (rest[i] === '}') depthCount--
    i++
  }
  return rest.slice(0, i - 1)
}

describe('M2z Waldtanz-Magiekreise als Forest-Arena-Spielobjekte', () => {
  it('M2z:1 CSS-Source: Magiekreise-Container-Mindesthoehe auf clamp(11rem, 22vh, 15rem) angehoben', () => {
    // Es gibt zwei Blocks: M1d3-Basis-Block (min-height: clamp(4.9rem, 9vw, 6.75rem))
    // und M2z-Override-Block (min-height: clamp(11rem, 22vh, 15rem)).
    // Wir matchen den M2z-Block via route-scoped Selector.
    const m2zOverride = appCss.match(
      /\.spielbereich--game-route\s+\[class~="waldtanz-magiekreise"\][^{]*\{([^}]*min-height[^}]*)\}/s
    )
    expect(m2zOverride, 'M2z-Override-Block mit min-height muss existieren').not.toBeNull()
    expect(m2zOverride![1]).toMatch(/min-height:\s*clamp\(\s*11rem/)
    expect(m2zOverride![1]).toMatch(/22vh/)
    expect(m2zOverride![1]).toMatch(/15rem/)
  })

  it('M2z:2 CSS-Source: Magiekreise-Liste-Grid repeat(3, minmax(6.5rem, 1fr))', () => {
    // M2z-Override setzt grosszuegigere Kreisel-Slots (6.5rem min statt 4.8rem).
    // Suche im route-scoped .__liste-Block mit 6.5rem (M2z), NICHT M1d3 (4.8rem).
    const allMatches = Array.from(
      appCss.matchAll(
        /\.spielbereich--game-route\s+\[class~="waldtanz-magiekreise__liste"\][^{]*\{([^}]*)\}/g
      )
    )
    const m2zOverride = allMatches.find(([, body]) => body.includes('6.5rem'))
    expect(m2zOverride, 'M2z-Override-Block (6.5rem) fuer .__liste muss existieren').toBeDefined()
    expect(m2zOverride![1]).toMatch(/repeat\(\s*3\s*,\s*minmax\(\s*6\.5rem/)
  })

  it('M2z:3 CSS-Source: Magiekreise-Kreisel min-height clamp(7.5rem, 14vh, 9.5rem) (Stitch-Groesse)', () => {
    // M1d3 setzt 4.9rem/9vw/6.75rem (max 108px). M2z-Override setzt 7.5rem/14vh/9.5rem (max 152px).
    // Wir matchen den M2z-Override-Block der route-scoped auf .waldtanz-magiekreise__kreis wirkt.
    // Da M2z auf dem Container selbst ansetzt (ueber grid-template-rows + min-height-Inhalt),
    // koennen wir die Kreisel-Groesse auch ueber den M1d3-Override-Pfad pruefen.
    // Strategie: suche nach einer route-scoped-Regel mit min-height clamp(7.5rem, 14vh, 9.5rem)
    // im Magiekreise-Kontext.
    const allKreiselRules = Array.from(
      appCss.matchAll(/[^{]*waldtanz-magiekreise__kreis[^{]*\{([^}]*)\}/g)
    )
    const stitchGrosse = allKreiselRules.find(([, body]) =>
      body.match(/min-height:\s*clamp\(\s*7\.5rem/) &&
      body.match(/14vh/) &&
      body.match(/9\.5rem/)
    )
    expect(stitchGrosse, 'Stitch-Groessen-Kreisel-Override (clamp 7.5rem/14vh/9.5rem) muss existieren').not.toBeUndefined()
  })

  it('M2z:4 CSS-Source: Magiekreise-Container hat 3px-Border + Hard-Shadow + Stitch-Border-Radius', () => {
    // M2z-Block enthaelt min-height: clamp(11rem, ...). Wir koennen am M1d3-
    // Override-Block vorbeigreifen indem wir auf den body mit min-height matchen.
    const m2zOverride = appCss.match(
      /\.spielbereich--game-route\s+\[class~="waldtanz-magiekreise"\][^{]*\{([^}]*clamp\(11rem[^}]*)\}/s
    )
    expect(m2zOverride, 'M2z-Override-Block mit min-height: clamp(11rem,...) muss existieren').not.toBeNull()
    const body = m2zOverride![1]
    expect(body).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(body).toMatch(/box-shadow:\s*0\s+\d+px\s+0\s+var\(--st-color-border-strong\)/)
    expect(body).toMatch(/border-radius:\s*1\.5rem/)
  })

  it('M2z:5 CSS-Source: aktive Kreise (--aktiv) haben lime-Glow-Animation (Stitch-Magic-Circle-Pulse)', () => {
    // Suche nach .waldtanz-magiekreise__kreis--aktiv (letzter match) mit animation: + Keyframe.
    const activeRule = cssBlock('.waldtanz-magiekreise__kreis--aktiv')
    expect(activeRule, 'Aktive-Kreise-Override muss existieren').not.toMatch(/^\s*$/)
    // M2z-Override: animation: waldtanz-magiekreis-glow 1.8s ease-in-out infinite;
    expect(activeRule).toMatch(/animation:\s*[\w-]+\s+[\d.]+s/)
    // Keyframe muss im File existieren
    const keyframeMatch = appCss.match(/@keyframes\s+[\w-]*magiekreis[\w-]*\s*\{/)
    expect(keyframeMatch, 'Magiekreis-Glow-Keyframe muss existieren').not.toBeNull()
  })

  it('M2z:6 CSS-Source: Reduced-Motion-Override schaltet die Glow-Animation ab', () => {
    // Suche nach @media (prefers-reduced-motion: reduce) Block mit magiekreis-Animation: none
    // Deutsche Klassen-Schreibweise: --aktiv (NICHT --active)
    const reducedMotion = appCss.match(
      /@media\s+\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.waldtanz-magiekreise__kreis--aktiv\s*\{[\s\S]*?animation:\s*none[\s\S]*?\}/
    )
    expect(
      reducedMotion,
      'Reduced-Motion-Override fuer .waldtanz-magiekreise__kreis--aktiv { animation: none } muss existieren'
    ).not.toBeNull()
  })

  it('M2z:7 DOM: Auf /game rendert der Magiekreise-Container unveraendert mit aria-label + 3 Kreisel', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const magiekreise = document.querySelector('[aria-label="Waldtanz-Magiekreise"]')
    expect(magiekreise).not.toBeNull()
    expect(magiekreise).toHaveClass('waldtanz-magiekreise')

    // 3 Kreisel muessen weiter existieren
    const kreisel = magiekreise!.querySelectorAll('.waldtanz-steinkreis__kreisel')
    expect(kreisel.length).toBe(3)
  })

  it('M2z:8 package.json: smoke:production-Kette enthaelt m2z_magiekreise_arena_spielobjekte_smoke.mjs', () => {
    expect(istVerdrahtet('m2z_magiekreise_arena_spielobjekte_smoke.mjs')).toBe(true)
  })
})
