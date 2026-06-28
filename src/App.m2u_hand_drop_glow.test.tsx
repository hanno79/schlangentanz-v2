/**
 * Author: rahn
 * Datum: 28.06.2026
 * Version: 1.0
 * Beschreibung: M2u — Handkarten-Drag-Glow auf Schlangenlichtung.
 *              Wenn der Spieler eine Handkarte per Drag aus der Handbuehne zieht,
 *              bekommt die .waldtanz-schlangenlichtung einen sichtbaren Drop-Glow-
 *              Rim (forest-gruene dashed-border + scale-Pulse). Der Spieler sieht
 *              "hier ist dein Spielbereich". data-drag-aktiv-Attribut schaltet
 *              die Animation an/aus.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

// M1ds-Pattern: eigene Schlange + Ausspielphase fuer Handkarten-Drag.
function startZustand(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.2))
}

/**
 * Liefert alle Regel-Bodies fuer einen vollstaendigen Selector-String.
 * Substring-Index statt Regex, damit [class~="..."]-Syntax nicht escaped
 * werden muss und Kommentar-Literals die Suche nicht verfaelschen.
 */
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

function hatRegelMitBody(selector: string, bodyRegex: RegExp): boolean {
  return alleRegelBloecksFuer(selector).some((body) => bodyRegex.test(body))
}

/** Sucht body im @media (prefers-reduced-motion: reduce) Block. */
function reducedMotionBody(selector: string): string {
  const re = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/g
  const matches = Array.from(appCss.matchAll(re))
  for (const m of matches) {
    const body = m[1]
    const idx = body.indexOf(selector)
    if (idx === -1) continue
    const braceStart = body.indexOf('{', idx)
    if (braceStart === -1) continue
    const braceEnd = body.indexOf('}', braceStart)
    if (braceEnd === -1) continue
    return body.slice(braceStart + 1, braceEnd)
  }
  return ''
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M2u Hand-Drag-Glow auf Schlangenlichtung', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('M2u:1 Schlangenlichtung traegt data-drag-aktiv=false im Idle', () => {
    render(<App initialZustand={startZustand()} />)
    const lichtung = screen.getByRole('region', { name: 'Schlangenlichtung' })
    expect(lichtung.getAttribute('data-drag-aktiv')).toBe('false')
  })

  it('M2u:2 data-drag-aktiv wechselt auf true bei Drag-Start einer Handkarte', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    expect(karten.length).toBeGreaterThan(0)
    const lichtung = screen.getByRole('region', { name: 'Schlangenlichtung' })
    const dataTransfer = { setData: () => {}, effectAllowed: '' } as unknown as DataTransfer
    act(() => {
      fireEvent.dragStart(karten[0]!, { dataTransfer })
    })
    expect(lichtung.getAttribute('data-drag-aktiv')).toBe('true')
  })

  it('M2u:3 data-drag-aktiv wechselt zurueck auf false bei Drag-Ende', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    const lichtung = screen.getByRole('region', { name: 'Schlangenlichtung' })
    const dataTransfer = { setData: () => {}, effectAllowed: '' } as unknown as DataTransfer
    act(() => {
      fireEvent.dragStart(karten[0]!, { dataTransfer })
    })
    expect(lichtung.getAttribute('data-drag-aktiv')).toBe('true')
    act(() => {
      fireEvent.dragEnd(karten[0]!, { dataTransfer })
    })
    expect(lichtung.getAttribute('data-drag-aktiv')).toBe('false')
  })

  it('M2u:4 CSS-Source: .waldtanz-schlangenlichtung[data-drag-aktiv="true"] hat forest-gruene Animation + Glow', () => {
    expect(
      hatRegelMitBody(
        '.waldtanz-schlangenlichtung[data-drag-aktiv="true"]',
        /animation\s*:\s*[^;}]*waldtanz-lichtung-drag-glow/,
      ),
    ).toBe(true)
  })

  it('M2u:5 Keyframe waldtanz-lichtung-drag-glow existiert mit scale + forest-gruenem box-shadow', () => {
    expect(appCss).toMatch(/@keyframes\s+waldtanz-lichtung-drag-glow\s*\{/)
    const m = appCss.match(/@keyframes\s+waldtanz-lichtung-drag-glow\s*\{([\s\S]*?)\n\}/)
    expect(m).not.toBeNull()
    const body = m?.[1] ?? ''
    expect(body).toMatch(/scale\(/)
    expect(body).toMatch(/box-shadow\s*:|var\(--st-color-primary|#4b6700|#063907/)
  })

  it('M2u:6 Reduced-Motion Override deaktiviert die Drag-Glow-Animation', () => {
    const body = reducedMotionBody('.waldtanz-schlangenlichtung[data-drag-aktiv="true"]')
    expect(body).toMatch(/animation\s*:\s*none/)
  })

  it('M2u:7 Smoke-Script ist in package.json smoke:production verdrahtet', () => {
    expect(packageJson).toContain('m2u_hand_drop_glow_smoke')
  })
})
