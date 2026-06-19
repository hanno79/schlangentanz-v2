/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bv macht die Waldobjekte im Spielbrett zu kompakten Waldtaschen statt einer gequetschten Textspalte.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1bv_waldtaschen_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bv Waldtanz-Waldtaschen', () => {
  it('bündelt die Waldobjekte auf /game als beschriftete Spielbrett-Taschen neben der Lichtung', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const waldobjekte = within(arenastein).getByRole('complementary', { name: 'Waldobjekte' })

    expect(waldobjekte).toHaveClass('waldtanz-waldtaschen')
    expect(within(waldobjekte).getByRole('heading', { name: 'Waldtaschen' })).toBeVisible()
    expect(within(waldobjekte).getByText('Ziehstapel · Ablage · Zugspur · Quests')).toBeVisible()

    const reihenfolge = Array.from(waldobjekte.children).map((element) => element.textContent ?? '')
    expect(reihenfolge[0]).toContain('Waldtaschen')
    expect(reihenfolge[1]).toContain('Waldtanz-Nachziehstapel')
    expect(reihenfolge[2]).toContain('Waldtanz-Ablage')
    expect(reihenfolge[3]).toContain('Waldtanz-Zugspur')
    expect(reihenfolge[4]).toContain('Waldtanz-Aufgabentafel')
  })

  it('legt route-sichere Kompakt-CSS- und Browser-Smoke-Verträge für die Waldtaschen ab', () => {
    const spielfeld = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__spielfeld"]')
    const waldtaschen = cssBlock('.spielbereich--game-route [class~="waldtanz-waldtaschen"]')
    const waldtaschenDirekt = cssBlock('.spielbereich--game-route [class~="waldtanz-waldtaschen"] > :is(section, .waldtanz-waldtaschen__kopf)')
    const verborgeneTexte = cssBlock('.spielbereich--game-route [class~="waldtanz-waldtaschen"] [class~="waldtanz-nachziehstapel__deckreihe"] p,\n  .spielbereich--game-route [class~="waldtanz-waldtaschen"] [class~="waldtanz-ablage__leer"] p + p,\n  .spielbereich--game-route [class~="waldtanz-waldtaschen"] [class~="waldtanz-zugspur__ablage"],\n  .spielbereich--game-route [class~="waldtanz-waldtaschen"] [class~="waldtanz-aufgabentafel__hinweis"]')

    expect(spielfeld).toMatch(/grid-template-columns:\s*minmax\(0,\s*2\.55fr\)\s*minmax\(9\.5rem,\s*0\.65fr\)/)
    expect(waldtaschen).toMatch(/width:\s*min\(100%,\s*11\.5rem\)/)
    expect(waldtaschen).toMatch(/overflow-x:\s*visible/)
    expect(waldtaschen).toMatch(/scroll-padding-block:\s*0\.35rem/)
    const deckreihe = cssBlock('.spielbereich--game-route [class~="waldtanz-waldtaschen"] [class~="waldtanz-nachziehstapel__deckreihe"]')

    expect(waldtaschenDirekt).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(waldtaschenDirekt).toMatch(/box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
    expect(deckreihe).toMatch(/display:\s*grid/)
    expect(deckreihe).not.toMatch(/display:\s*none/)
    expect(verborgeneTexte).toMatch(/clip-path:\s*inset\(50%\)/)
    expect(smokeScript).toContain('M1bv Waldtaschen')
    expect(smokeScript).toContain('waldtaschen.width < 145')
    expect(smokeScript).toContain('Math.max(...messung.kartenHoehen) > 150')
  })
})
