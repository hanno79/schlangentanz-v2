/**
 * Author: rahn
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M2w — Brettrand-Zugseitenleiste konsolidieren.
 *              Auf /game rendert die .waldtanz-zugseitenleiste 7 Children als
 *              gleichberechtigte Mini-Cards. Die Card-Reihe fuehlt sich an wie
 *              ein Debug-Dashboard. M2w route-scoped-hidet die redundanten
 *              Cards (Unterholzleiste, Spieluhr, Partiefortschritt) und
 *              konsolidiert die verbleibenden 4 Cards (Zugpfad, Spielhilfe,
 *              KiZugBuehne, Zugkompass) mit konsistenten Stitch-Card-Styles.
 *              Auf / (Lobby) bleiben alle 7 Cards sichtbar.
 *
 * Pattern: CSS-only-Visual-Removal (M1dm/M1dn/M1do) + Card-Container-Styling.
 *          Kein Engine-Touch, keine JSX-Reorder, keine Layout-Shifts.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

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

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M2w Brettrand-Zugseitenleiste konsolidieren', () => {
  it('M2w:1 versteckt die Unterholzleiste auf /game route-scoped (Info dupliziert in Spielhilfe)', () => {
    expect(
      hatRegelMitBody(
        '.spielbereich--game-route [class~="waldtanz-unterholzleiste"]',
        /display:\s*none/,
      ),
    ).toBe(true)
  })

  it('M2w:2 versteckt die Waldtanz-Spieluhr auf /game route-scoped (Info lebt in Partiefortschritt)', () => {
    expect(
      hatRegelMitBody(
        '.spielbereich--game-route [class~="waldtanz-partie-uhr"]',
        /display:\s*none/,
      ),
    ).toBe(true)
  })

  it('M2w:3 versteckt den Partiefortschritt auf /game route-scoped (Lobby-Statistik)', () => {
    expect(
      hatRegelMitBody(
        '.spielbereich--game-route [class~="partiefortschritt"]',
        /display:\s*none/,
      ),
    ).toBe(true)
  })

  it('M2w:4 Card-Container-Styling: verbleibende Cards tragen konsistente 3px-Border + Hard-Shadow', () => {
    // Die verbleibenden 4 Cards sollen konsistente Stitch-Card-Styles tragen.
    // Wir pruefen dass mind. 3 der 4 Karten Border + Box-Shadow haben.
    const selectors = [
      '.spielbereich--game-route [class~="zugpfad"]',
      '.spielbereich--game-route [class~="waldtanz-spielhilfe"]',
      '.spielbereich--game-route [class~="zugkompass"]',
    ]
    const cardsMitCardStyle = selectors.filter(sel =>
      hatRegelMitBody(sel, /border:\s*[^;]*var\(--st-color-border-strong\)/)
      && hatRegelMitBody(sel, /box-shadow:\s*[^;]*var\(--st-color-border-strong\)/)
    )
    expect(cardsMitCardStyle.length).toBeGreaterThanOrEqual(3)
  })

  it('M2w:5 JSX: auf /game sind alle 7 Cards im DOM gerendert (CSS-only-Hide, nicht entfernt)', () => {
    // CSS-only-Visual-Removal-Pattern (M1dm/M1dn/M1do): die DOM-Struktur
    // bleibt unveraendert; nur das CSS hidet die Elemente. Pruefe daher
    // dass alle 7 Klassen weiterhin im rendered DOM auf /game existieren.
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)
    expect(document.querySelector('.waldtanz-unterholzleiste')).not.toBeNull()
    expect(document.querySelector('.zugpfad')).not.toBeNull()
    expect(document.querySelector('.waldtanz-spielhilfe')).not.toBeNull()
    expect(document.querySelector('.waldtanz-partie-uhr')).not.toBeNull()
    expect(document.querySelector('.ki-zug-buehne--brettnah')).not.toBeNull()
    expect(document.querySelector('.zugkompass')).not.toBeNull()
    expect(document.querySelector('.partiefortschritt')).not.toBeNull()
  })

  it('M2w:6 Cascade-Schutz: alle 3 Hide-Regeln tragen !important (gegen spaetere pre-existing Overrides)', () => {
    const bodies1 = alleRegelBloecksFuer('.spielbereich--game-route [class~="waldtanz-unterholzleiste"]')
    const bodies2 = alleRegelBloecksFuer('.spielbereich--game-route [class~="waldtanz-partie-uhr"]')
    const bodies3 = alleRegelBloecksFuer('.spielbereich--game-route [class~="partiefortschritt"]')
    expect(bodies1.some((b) => /display:\s*none\s*!important/.test(b))).toBe(true)
    expect(bodies2.some((b) => /display:\s*none\s*!important/.test(b))).toBe(true)
    expect(bodies3.some((b) => /display:\s*none\s*!important/.test(b))).toBe(true)
  })

  it('M2w:7 Slice-Plan-Referenz: docs/slice_plan_m2w_zugseitenleiste_brettrand_konsolidierung.md existiert', () => {
    const plan = readFileSync('docs/slice_plan_m2w_zugseitenleiste_brettrand_konsolidierung.md', 'utf8')
    expect(plan).toContain('M2w')
    expect(plan).toContain('Zugseitenleiste')
  })

  it('M2w:8 smoke-script + package.json wiring fuer M2w Live-Smoke registriert', () => {
    const smokeScript = readFileSync('scripts/m2w_zugseitenleiste_brettrand_konsolidierung_smoke.mjs', 'utf8')
    expect(smokeScript).toContain('M2w Zugseitenleiste')
    expect(smokeScript).toContain('pruefeM2wZugseitenleiste')
    expect(smokeScript).toContain('waldtanz-unterholzleiste')
    expect(smokeScript).toContain('waldtanz-partie-uhr')
    expect(smokeScript).toContain('partiefortschritt')
    expect(istVerdrahtet('m2w_zugseitenleiste_brettrand_konsolidierung_smoke.mjs')).toBe(true)
  })
})
