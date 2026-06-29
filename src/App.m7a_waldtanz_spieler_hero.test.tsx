/*
 * Author: rahn
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M7a — Waldtanz-Spieler-Hero als Stitch-Stats-Card.
 *              Der linke Spielrahmen erhaelt additiv einen grossen
 *              Stats-Hero (Avatar 64×64, Name + Forest-Spirit-Tag,
 *              Punkte-Zahl prominent) in einer forest-container-Card
 *              mit 3px Border und hard-shadow. M7a ist additiv — die
 *              bestehenden Rankenchips und der Waldtanz-Kompass bleiben
 *              unveraendert fuer M1ci/M1d3/M1dn-Kompatibilitaet.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import App from './App'

function cssBlock(selector: string, source = readFileSync('src/App.css', 'utf8')): string {
  // Basis-Regel direkt matchen (single top-level rule, kein Descendant-Suffix).
  // Vermeidet M1dt-Last-Match-Trap auf route-scoped Overrides (Zeile > Basis).
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = source.match(new RegExp(`(^|[\\s,>.])${escaped}\\s*\\{([^}]*)\\}`, 'm'))
  return m ? m[2] : ''
}

describe('M7a Waldtanz-Spieler-Hero als Stitch-Stats-Card', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('M7a:1 — CSS-Source Stats-Hero Container mit forest-bg, 3px Border, hard-shadow-sm', () => {
    const block = cssBlock('.waldtanz-seitenmenue__stats-hero')
    expect(block).toContain('background: var(--st-color-forest-container')
    expect(block).toContain('border: 3px solid var(--st-color-border-strong')
    expect(block).toContain('box-shadow: var(--st-shadow-hard-sm')
  })

  it('M7a:2 — CSS-Source Avatar gross 64x64, rund, mit Border', () => {
    const block = cssBlock('.waldtanz-seitenmenue__stats-hero-avatar')
    expect(block).toContain('width: 64px')
    expect(block).toContain('height: 64px')
    expect(block).toContain('border-radius: 999px')
    expect(block).toContain('border: 3px solid var(--st-color-border-strong')
  })

  it('M7a:3 — CSS-Source Punkte-Zahl prominent in Rubik-Black, lime-Ton', () => {
    const block = cssBlock('.waldtanz-seitenmenue__stats-hero-punkte')
    expect(block).toContain('font-weight: 900')
    expect(block).toContain('color: var(--st-color-primary')
    expect(block).toContain('font-size: 1.6rem')
  })

  it('M7a:4 — CSS-Source Tag als lime-bg-Pille mit Border', () => {
    const block = cssBlock('.waldtanz-seitenmenue__stats-hero-tag')
    expect(block).toContain('background: var(--st-color-primary')
    expect(block).toContain('border-radius: 999px')
    expect(block).toContain('border: 2px solid var(--st-color-border-strong')
  })

  it('M7a:5 — CSS-Source Route-Scoped: Stats-Hero auf /game angezeigt', () => {
    // Stats-Hero soll auf beiden Routes (/ und /game) sichtbar sein — keine
    // route-scoped display:none-Regel im CSS
    const routeBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-seitenmenue__stats-hero"]')
    expect(routeBlock).not.toMatch(/display:\s*none/)
  })

  it('M7a:6 — DOM Stats-Hero rendert auf /game mit Avatar + Name + Punkten', () => {
    render(<App />)
    const hero = screen.getByRole('region', { name: /Spieler-Stats/i })
    expect(hero).toBeInTheDocument()
    // Avatar-Span existiert
    const avatar = within(hero).getByText('🧝')
    expect(avatar).toBeInTheDocument()
    // Punkte-Zahl wird gerendert (kanonische Form "Punkte")
    expect(within(hero).getByText(/Punkte/i)).toBeInTheDocument()
  })

  it('M7a:7 — DOM Pre-existing Vertraege: Spielrahmen + Spielprofil + Kompass bleiben', () => {
    render(<App />)
    // Pre-existing M1ci/M1bq/M1d3-Vertraege
    expect(screen.getByLabelText('Waldtanz-Spielrahmen')).toBeInTheDocument()
    // Spielprofil kann migriert werden zu Stats, oder als Alias bleiben
    const profil = screen.queryByLabelText('Spielprofil')
    const stats = screen.queryByLabelText(/Spieler-Stats/)
    // Mindestens einer von beiden muss da sein
    expect(profil || stats).toBeTruthy()
    // Waldtanz-Kompass bleibt auf /game (heading wird per CSS versteckt, Region existiert)
    expect(screen.getByRole('region', { name: 'Waldtanz-Kompass' })).toBeInTheDocument()
  })

  it('M7a:8 — DOM Pre-existing Vertraege: 3 Rankenchips auf /game (Phase/Hand/Quest) bleiben', () => {
    render(<App />)
    // M1ci-Vertrag: drei Rankenchips als aria-label-Identifizierte Elemente
    expect(screen.getByLabelText(/Phase: /)).toHaveClass('waldtanz-seitenmenue__rankenchip')
    expect(screen.getByLabelText(/Handkarten: /)).toHaveClass('waldtanz-seitenmenue__rankenchip')
    expect(screen.getByLabelText(/Offene Quests: /)).toHaveClass('waldtanz-seitenmenue__rankenchip')
  })

  it('M7a:9 — package.json smoke:production enthaelt m7a-Skript', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const chain: string = pkg.scripts?.['smoke:production'] ?? ''
    expect(chain).toMatch(/m7a_waldtanz_spieler_hero_smoke/)
  })

  it('M7a:10 — Smoke-Skript enthaelt pruefeM7aSpielerHero + stats-hero-Selector', () => {
    const src = readFileSync('scripts/m7a_waldtanz_spieler_hero_smoke.mjs', 'utf8')
    expect(src).toMatch(/pruefeM7aSpielerHero/)
    expect(src).toMatch(/waldtanz-seitenmenue__stats-hero/)
  })
})