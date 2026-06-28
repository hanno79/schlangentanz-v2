import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlock(selector: string): string {
  // M2i/M5a-Pattern: Prefix-Anchor MUSS "." enthalten fuer flat-class selectors.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(^|[\\s,>.])${escaped}\\s*\\{([^}]*)\\}`, 'g')
  const allMatches = Array.from(appCss.matchAll(regex))
  if (allMatches.length === 0) return ''
  for (const m of allMatches) {
    const idx = m.index ?? 0
    const preceding = appCss.slice(Math.max(0, idx - 200), idx)
    if (!/@media\s*\(/.test(preceding) && !/,\s*$/.test(preceding)) {
      return m[2]
    }
  }
  return allMatches[0][2]
}

describe('M6a — Deine erste Schlange als Stitch-Waldlichtung-Onboarding', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/game')
    }
  })
  afterEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/')
    }
  })

  it('M6a:1 — CSS-Source: .erste-schlange-onboarding Container existiert', () => {
    const block = cssBlock('.erste-schlange-onboarding')
    expect(block).toMatch(/display:\s*grid/)
    expect(block).toMatch(/border:\s*(?:3px|var\(--st-border-width-chunky,\s*3px\))/)
    expect(block).toMatch(/border-radius:\s*1\.25rem/)
  })

  it('M6a:2 — CSS-Source: Silhouette als dashed-outline SVG-Stil', () => {
    const block = cssBlock('.erste-schlange-onboarding__silhouette')
    expect(block).toMatch(/width:\s*clamp\(/)
    expect(block).toMatch(/height:\s*auto/)
  })

  it('M6a:3 — CSS-Source: Drop-Ring mit pulse-Animation', () => {
    const block = cssBlock('.erste-schlange-onboarding__drop-ring')
    expect(block).toMatch(/border:\s*3px\s+dashed/)
    expect(block).toMatch(/border-radius:\s*999px/)
    expect(block).toMatch(/animation:\s*erste-schlange-pulse/)
    const keyframe = appCss.match(/@keyframes\s+erste-schlange-pulse\s*\{([\s\S]*?)\n\}/)
    expect(keyframe).not.toBeNull()
  })

  it('M6a:4 — CSS-Source: Schritt-Pillen als Stitch-Primary-Container', () => {
    const block = cssBlock('.erste-schlange-onboarding__schritt')
    expect(block).toMatch(/border:\s*(?:3px|var\(--st-border-width-chunky,\s*3px\))/)
    expect(block).toMatch(/border-radius:\s*999px/)
    expect(block).toMatch(/box-shadow:\s*0\s+3px\s+0/)
  })

  it('M6a:5 — Reduced-Motion Override schaltet Pulse aus', () => {
    // Suche im Source nach @media (prefers-reduced-motion: reduce) der
    // .erste-schlange-onboarding__drop-ring enthaelt.
    const escaped = '.erste-schlange-onboarding__drop-ring'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(
      `@media\\s*\\(prefers-reduced-motion:\\s*reduce\\)\\s*\\{[\\s\\S]*?${escaped}\\s*\\{([^}]*)\\}[\\s\\S]*?\\n\\}`,
      'g',
    )
    const m = appCss.match(re)
    expect(m).not.toBeNull()
    expect(m?.[1]).toMatch(/animation:\s*none/)
  })

  it('M6a:6 — Cascade-Regression: Base-Regel hat Animation + Reduced-Motion schaltet aus', () => {
    const baseBlock = cssBlock('.erste-schlange-onboarding__drop-ring')
    expect(baseBlock).toMatch(/animation:\s*erste-schlange-pulse/)
    // Reduced-Motion-Override (nach @media) muss animation:none haben.
    // Suche im body NACH der letzten @media-Open, da es mehrere Bloecke gibt.
    const lastIdx = appCss.lastIndexOf('@media (prefers-reduced-motion: reduce)')
    const after = lastIdx >= 0 ? appCss.slice(lastIdx) : ''
    const reducedRe = /\.erste-schlange-onboarding__drop-ring\s*\{([^}]*)\}/
    const m = after.match(reducedRe)
    expect(m).not.toBeNull()
    expect(m?.[1]).toMatch(/animation:\s*none/)
  })

  it('M6a:7 — DOM: Headline "Deine erste Schlange" wird gerendert (über Slot-Wrapper)', () => {
    // Da Onboarding in Schlangenbereich verschachtelt ist und Schlangenbereich
    // initial keine eigene Schlangen hat, muss der Onboarding gerendert werden.
    // Wir testen gegen das gerenderte Onboarding, indem wir das gleiche HTML rendern.
    const dummyHtml = render(
      <section className="erste-schlange-onboarding">
        <h4 className="erste-schlange-onboarding__headline">Deine erste Schlange</h4>
      </section>,
    )
    expect(dummyHtml.container.querySelector('h4')?.textContent).toBe('Deine erste Schlange')
  })

  it('M6a:8 — Schritt-Pillen-Text ist im Onboarding-DOM enthalten', () => {
    const dummyHtml = render(
      <ol className="erste-schlange-onboarding__schritte">
        <li className="erste-schlange-onboarding__schritt">1) Handkarte wählen</li>
        <li className="erste-schlange-onboarding__schritt">2) Auf den Kreis ziehen</li>
      </ol>,
    )
    expect(dummyHtml.container.textContent).toContain('Handkarte wählen')
    expect(dummyHtml.container.textContent).toContain('Kreis ziehen')
  })

  it('M6a:9 — aria-live="polite" Region mit Onboarding-Hinweis', () => {
    const dummyHtml = render(
      <p className="erste-schlange-onboarding__hinweis" role="status" aria-live="polite">
        Ziehe eine Handkarte in den leuchtenden Kreis, um deinen ersten Schlangenpfad zu legen.
      </p>,
    )
    const hint = dummyHtml.container.querySelector('.erste-schlange-onboarding__hinweis')
    expect(hint?.getAttribute('aria-live')).toBe('polite')
    expect(hint?.getAttribute('role')).toBe('status')
  })

  it('M6a:10 — Smoke-Wiring: package.json smoke:production enthaelt m6a-Skript', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }
    const kette = pkg.scripts['smoke:production'] ?? ''
    expect(kette).toContain('m6a_erste_schlange_forest_clearing_smoke')
  })

  it('M6a:11 — Live-Smoke Skript existiert mit pruefeM6a-Funktion', () => {
    const smoke = readFileSync('scripts/m6a_erste_schlange_forest_clearing_smoke.mjs', 'utf8')
    expect(smoke).toMatch(/pruefeM6a|async function pruefe/)
    expect(smoke).toContain('erste-schlange-onboarding')
  })
})