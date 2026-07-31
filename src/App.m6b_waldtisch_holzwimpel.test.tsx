/**
 * Author: Hermes (autonomer Cron-Lauf, Job-ID `0cca22d2b825`)
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: RED-Tests fuer M6b — Waldtisch-Holzplakette als Forest-Welcome-Banner.
 *              Prominente Holzplakette mit aktivem Spielername + Phase + Zugzaehler +
 *              Lebens-Pulse, sichtbar in der Schlangenlichtung-Kopf auf /game.
 */

import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import App from './App'
import { istVerdrahtet } from './test/smokeKetten'

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

describe('M6b — Waldtisch-Holzplakette als Forest-Welcome-Banner (RED)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/game')
    }
  })

  it('M6b:1 — CSS-Source: .waldtanz-waldtisch-plakette Container existiert (lime, 3px Border, Hard-Shadow)', () => {
    // Cascade-Safe: doubled-class Selector gewinnt 0,2,0 (M1dt Pattern 6).
    // Direkter One-Liner statt cssBlock(), weil die Selector-Form doubled-class ist.
    const blockMatch = appCss.match(/\.waldtanz-waldtisch-plakette\.waldtanz-waldtisch-plakette\s*\{([^}]*)\}/)
    const block = blockMatch?.[1] ?? ''
    expect(block, 'Container-Block .waldtanz-waldtisch-plakette.waldtanz-waldtisch-plakette (cascade-safe doubled-class) muss existieren').not.toBe('')
    expect(block).toMatch(/background:\s*var\(--st-color-primary-container/)
    expect(block).toMatch(/border:\s*(?:3px|var\(--st-border-width-chunky)/)
    expect(block).toMatch(/border-radius:\s*(?:var\(--st-radius-lg\)|9999px|999px|\d+\.?\d*rem)/)
    expect(block).toMatch(/box-shadow:\s*\d+px\s+\d+px\s+0\s+0\s+var\(--st-color-primary/)
  })

  it('M6b:2 — CSS-Source: Name-Slot in Rubik Black Headline-Stil', () => {
    const block = cssBlock('.waldtanz-waldtisch-plakette__name')
    expect(block, '.waldtanz-waldtisch-plakette__name Block muss existieren').not.toBe('')
    expect(block).toMatch(/font-family:\s*var\(--st-font-headline/)
    expect(block).toMatch(/font-weight:\s*[89]00/)
    expect(block).toMatch(/color:\s*var\(--st-color-on-primary-container/)
  })

  it('M6b:3 — CSS-Source: Phase-Pille als secondary-container Gold-Pille', () => {
    const block = cssBlock('.waldtanz-waldtisch-plakette__phase-pille')
    expect(block, 'Phase-Pille Block muss existieren').not.toBe('')
    expect(block).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(block).toMatch(/border-radius:\s*(?:var\(--st-radius-pille\)|9999px|999px|full)/)
    expect(block).toMatch(/border:\s*(?:2px|3px|var\(--st-border-width-chunky)/)
  })

  it('M6b:4 — CSS-Source: Herz-Punkt mit @keyframes herz-pulse und animation', () => {
    const block = cssBlock('.waldtanz-waldtisch-plakette__herz')
    expect(block, 'Herz-Selector Block muss existieren').not.toBe('')
    expect(block).toMatch(/background:\s*var\(--st-color-primary/)
    // Animation: -name herz-pulse required
    expect(block).toMatch(/animation:\s*[^;]*herz-pulse/)
    const keyframeRegex = /@keyframes\s+herz-pulse\s*\{[\s\S]*?\}/
    expect(appCss).toMatch(keyframeRegex)
  })

  it('M6b:5 — CSS-Source: Reduced-motion Override schaltet herz-pulse ab', () => {
    const reducedMotion = appCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.waldtanz-waldtisch-plakette__herz[\s\S]*?animation:\s*none[\s\S]*?\}/)
    expect(reducedMotion, '.waldtanz-waldtisch-plakette__herz Reduced-motion Override muss existieren').not.toBeNull()
  })

  it('M6b:6 — DOM: <aside class="waldtanz-waldtisch-plakette"> rendert in der Schlangenlichtung', () => {
    const { container } = render(<App />)
    const plakette = container.querySelector('.waldtanz-waldtisch-plakette')
    expect(plakette, 'Waldtisch-Holzplakette muss im DOM rendern').toBeTruthy()
  })

  it('M6b:7 — DOM: Spielername + Phase sind sichtbar in der Holzplakette', () => {
    const { container } = render(<App />)
    // Franka ist Default-Spielername in erstelleSpielzustand(2)
    const nameSlot = container.querySelector('.waldtanz-waldtisch-plakette__name')
    expect(nameSlot, 'Name-Slot muss rendern').toBeTruthy()
    expect(nameSlot?.textContent ?? '').toMatch(/Frank|Spieler|Wald/)
    const phasePille = container.querySelector('.waldtanz-waldtisch-plakette__phase-pille')
    expect(phasePille, 'Phase-Pille muss rendern').toBeTruthy()
    expect(phasePille?.textContent ?? '').toMatch(/Ausspiel|Aufgaben|Nachzieh|Zugabschluss|Spielende/)
  })

  it('M6b:8 — DOM: aria-label der Holzplakette enthaelt Spielername und Phase', () => {
    const { container } = render(<App />)
    const plakette = container.querySelector('.waldtanz-waldtisch-plakette')
    const aria = plakette?.getAttribute('aria-label') ?? ''
    expect(aria, 'aria-label muss existieren').not.toBe('')
    expect(aria).toMatch(/(?:Frank|Spieler|Wald)/)
    expect(aria).toMatch(/(?:Ausspiel|Aufgaben|Nachzieh|Zugabschluss|Spielende)/)
  })

  it('M6b:9 — DOM: Bestehender Schlangenlichtung-Header bleibt erhalten (M1di-Vertrag unangetastet)', () => {
    const { container } = render(<App />)
    const kopf = container.querySelector('.waldtanz-schlangenlichtung__kopf h3')
    expect(kopf?.textContent ?? '').toMatch(/Schlangenlichtung/)
    // Holzplakette ist Kind des kopf, innerhalb der schlangenlichtung
    const sl = container.querySelector('.waldtanz-schlangenlichtung')
    const plakette = sl?.querySelector('.waldtanz-waldtisch-plakette')
    expect(plakette, 'Holzplakette muss Kind der Schlangenlichtung sein').toBeTruthy()
  })

  it('M6b:10 — Smoke-Wiring: package.json smoke:production enthaelt m6b-Skript', () => {
    expect(istVerdrahtet('m6b_waldtisch_holzwimpel_smoke.mjs')).toBe(true)
  })

  it('M6b:11 — Live-Smoke Skript existiert mit pruefeM6bWaldtischHolzwimpel-Funktion', () => {
    const smokeScript = readFileSync('scripts/m6b_waldtisch_holzwimpel_smoke.mjs', 'utf8')
    expect(smokeScript).toContain('pruefeM6bWaldtischHolzwimpel')
    expect(smokeScript).toContain('waldtanz-waldtisch-plakette')
    expect(smokeScript).toContain('herz-pulse')
  })
})
