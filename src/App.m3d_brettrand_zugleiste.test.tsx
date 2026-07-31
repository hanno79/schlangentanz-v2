/**
 * Author: rahn
 * Datum: 2026-07-01
 * Version: 1.1
 * Beschreibung: M3d beweist den Brettrand-Zugleisten-Konsolidierungs-Slice:
 * Die 4 sichtbaren Children-Pillen der .waldtanz-zugseitenleiste werden
 * visuell zu EINER Stitch-Aktionsleiste zusammengefasst.
 *
 * Sieben RED-Tests:
 * 1.  M3d:1 — DOM: Container rendert als complementary landmark (aria-label Zugleiste)
 * 2.  M3d:2 — DOM: Region enthaelt Aktions-Pillen als Children
 * 3.  M3d:3 — CSS-Source: .waldtanz-zugseitenleiste hat route-scoped
 *              konsolidierten Container-Style (3px-Border, Hard-Shadow, Lime-BG)
 * 4.  M3d:4 — CSS-Source: route-scoped override entfernt die individuellen
 *              3px-Borders der Children-Pillen (Specificity 0,3,0)
 * 5.  M3d:5 — CSS-Source: route-scoped override legt Innenabstand auf Container
 * 6.  M3d:6 — A11y: Container hat aria-label Zugleiste, Children behalten ihre aria-labels
 * 7.  M3d:7 — Smoke-Wiring: smoke:production chain enthaelt m3d_brettrand_zugleiste_smoke.mjs
 */

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlockRouteScoped(route: string, sel: string): string {
  const escapedSel = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `\\.${route}\\s*\\[class~=["']${escapedSel}["']\\]\\s*\\{([^}]*)\\}`,
    'g'
  )
  const matches = Array.from(appCss.matchAll(regex))
  if (matches.length === 0) return ''
  return matches[matches.length - 1][1] ?? ''
}

describe('M3d Brettrand-Zugleiste Konsolidierung', () => {
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

  it('M3d:1 — DOM: Container rendert mit konsolidierter Klasse waldtanz-zugseitenleiste', () => {
    render(<App />)
    // aria-label="Zugleiste" (M1ao-Vertrag) bleibt semantisch identisch.
    // <aside> mit aria-label ist ein complementary landmark.
    const region = screen.getByLabelText('Zugleiste')
    expect(region).toBeInTheDocument()
    expect(region).toHaveClass('waldtanz-zugseitenleiste')
  })

  it('M3d:2 — DOM: Region enthaelt Aktions-Pillen als Children', () => {
    render(<App />)
    const region = screen.getByLabelText('Zugleiste')
    const children = Array.from(region.children) as HTMLElement[]
    const klassen = children.map(c => c.className).join(' ')
    // Mindestens eine bekannte Aktions-Pillen-Klasse muss vorkommen.
    expect(klassen).toMatch(/zugpfad|zugkompass|ki-zug-buehne|waldtanz-spielhilfe|waldtanz-bonuszauber|partiefortschritt|gegnerzug|spielerfuehrung|waldtanz-unterholzleiste/)
  })

  it('M3d:3 — CSS-Source: .waldtanz-zugseitenleiste hat route-scoped konsolidierten Container-Style', () => {
    const body = cssBlockRouteScoped('spielbereich--game-route', 'waldtanz-zugseitenleiste')
    expect(body).toMatch(/display:\s*grid/)
    // Konsolidierte Container-Deko: 3px-Border + Hard-Shadow
    expect(body).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(body).toMatch(/box-shadow:\s*0\s+6px\s+0\s+var\(--st-color-border-strong\)/)
    expect(body).toMatch(/border-radius:\s*2rem/)
  })

  it('M3d:4 — CSS-Source: route-scoped override entfernt die individuellen 3px-Borders der Children (!important-Pattern)', () => {
    // Pitfall #30 (Additive-Override-Discipline): Die Override-Regel nutzt
    // !important auf den Border/Shadow/Background-Properties, um gegen
    // die spaetere M2w-Regel auf .zugpfad/.zugkompass/.ki-zug-buehne--brettnah
    // /.waldtanz-spielhilfe (0,2,0) zu gewinnen. Die pre-existing
    // grid-column/grid-row/max-height-Properties bleiben erlaubt (M1ao-Vertrag).
    const selectorPattern = /\.spielbereich--game-route\s*\[class~=["']waldtanz-zugseitenleiste["']\]\s*>\s*\*\s*\{([^}]*)\}/g
    const matches = Array.from(appCss.matchAll(selectorPattern))
    expect(matches.length).toBeGreaterThan(0)
    const lastBody = matches[matches.length - 1][1]
    // Die Children tragen einen transparenten Border (border-color neutralisiert)
    // und kein eigenes box-shadow mehr — mit !important, damit spaetere
    // M2w-Regel (0,2,0) den transparent-Border nicht ueberschreibt.
    expect(lastBody).toMatch(/border:\s*\d+px\s+solid\s+transparent\s*!important/)
    expect(lastBody).toMatch(/box-shadow:\s*none\s*!important/)
    expect(lastBody).toMatch(/background:\s*transparent\s*!important/)
  })

  it('M3d:5 — CSS-Source: Container hat route-scoped Innenabstand', () => {
    const body = cssBlockRouteScoped(
      'spielbereich--game-route',
      'waldtanz-zugseitenleiste'
    )
    // Body muss Padding am Container enthalten (Stitch-Pille).
    expect(body).toMatch(/padding:/)
  })

  it('M3d:6 — A11y: Container hat aria-label, Children behalten ihre individuellen aria-labels', () => {
    render(<App />)
    // aria-label="Zugleiste" ist der M1ao-Vertrag; M3d aendert die
    // Aria-Identitaet NICHT, weil semantisch dieselbe Region.
    const region = screen.getByLabelText('Zugleiste')
    expect(region).toHaveAttribute('aria-label', 'Zugleiste')
    // Children behalten ihre individuellen aria-labels.
    expect(within(region).getByText('Zugpfad')).toBeInTheDocument()
    expect(within(region).getByText('Zugkompass')).toBeInTheDocument()
  })

  it('M3d:7 — Smoke-Wiring: smoke:production chain enthaelt m3d_brettrand_zugleiste_smoke.mjs', () => {
    expect(istVerdrahtet('m3d_brettrand_zugleiste_smoke.mjs')).toBe(true)
  })
})
