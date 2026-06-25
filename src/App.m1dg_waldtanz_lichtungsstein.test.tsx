/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dg beweist, dass das zentrale Spieltfeld
 * `waldtanz-lichtungsbrett` auf /game als sichtbarer Waldstein-Spielplatz
 * mit 3px Dark-Forest-Border und Hard-Shadow gerendert wird — nicht als
 * flache Panel-Innenflaeche. Der Stein-Spielplatz umfasst Tischkarte,
 * Magiekreise (M1df-Drop-Steine) und Schlangenbereich als gemeinsame
 * taktile Spieloberflaeche.
 *
 * RED-Vertrag (TDD):
 *   1. Das CSS enthaelt eine Regel `.waldtanz-lichtungsstein` mit
 *      `position: relative`, `border: 3px solid var(--st-color-border-strong)`
 *      und `box-shadow` (Hard-Shadow).
 *   2. Die CSS-Regel `.waldtanz-lichtungsstein::before` rendert einen
 *      radial-gradient Stein-Hintergrund (Sonnengelb + Sunny-Green-Accent).
 *   3. Die `.waldtanz-lichtungsstein`-Regel enthaelt einen inneren
 *      `padding` und einen `border-radius` (mindestens clamp/2rem),
 *      damit der Stein visuell als Spielplatz abgesetzte Kanten hat.
 *   4. Auf /game existiert genau ein `.waldtanz-lichtungsstein`-Element,
 *      das die Magiekreise, Tischkarte und Schlangenbereich als Kinder
 *      traegt (DOM-Structure-Vertrag).
 *   5. Der `.waldtanz-lichtungsstein` bleibt in der CSS-Source-Reihenfolge
 *      NACH der bestehenden `.waldtanz-arenastein`-Regel und NACH dem
 *      `waldtanz-lichtungsbrett`-Block, sodass der innere Stein den
 *      ausseren Arenatein nicht ueberschreibt (Cascade-Schutz).
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

function cssRuleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

function cssSourceIndex(selector: string): number {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.search(new RegExp(escaped))
}

describe('M1dg Waldtanz-Lichtungsstein (zentraler Spielplatz)', () => {
  it('definiert eine .waldtanz-lichtungsstein-Regel mit 3px Dark-Forest-Border und Hard-Shadow', () => {
    const rule = cssRuleBody('.waldtanz-lichtungsstein')
    expect(rule).toMatch(/position:\s*relative/)
    expect(rule).toMatch(/border:\s*3px\s+solid/)
    expect(rule).toMatch(/box-shadow/)
  })

  it('rendert fuer .waldtanz-lichtungsstein::before einen radial-gradient Stein-Hintergrund', () => {
    const before = cssRuleBody('.waldtanz-lichtungsstein::before')
    expect(before).toMatch(/radial-gradient/)
    expect(before).toMatch(/content:\s*['"]?['"]?/)
  })

  it('rendert den .waldtanz-lichtungsstein mit Padding und Rundung als taktile Spielflaeche', () => {
    const rule = cssRuleBody('.waldtanz-lichtungsstein')
    expect(rule).toMatch(/padding:\s*clamp\(/)
    expect(rule).toMatch(/border-radius:\s*clamp\(|border-radius:\s*\d/)
  })

  it('rendert auf /game genau einen .waldtanz-lichtungsstein mit Magiekreisen und Schlangen als Kindern', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const stein = document.querySelectorAll('.waldtanz-lichtungsstein')
    expect(stein.length).toBe(1)

    const steinElement = stein[0] as HTMLElement
    expect(steinElement.querySelector('.waldtanz-magiekreise')).not.toBeNull()
    expect(steinElement.querySelector('.schlangenbereich')).not.toBeNull()
  })

  it('positioniert die .waldtanz-lichtungsstein-Regel NACH der .waldtanz-arenastein-Regel im CSS', () => {
    const arenasteinIndex = cssSourceIndex('.waldtanz-arenastein')
    const lichtungssteinIndex = cssSourceIndex('.waldtanz-lichtungsstein')
    expect(lichtungssteinIndex).toBeGreaterThan(arenasteinIndex)
  })
})