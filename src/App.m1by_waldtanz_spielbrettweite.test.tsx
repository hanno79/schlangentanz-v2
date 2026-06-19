/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1by macht den Waldtanz-Spieltisch breiter, indem die Zugleiste nicht mehr als rechte Spalte den Waldstein zusammendrückt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1by_spielbrettweite_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1by Waldtanz-Spielbrettweite', () => {
  it('behält Spieltisch, Waldstein, Zugleiste und Hand strukturell zusammen, aber gibt dem Waldstein auf /game die volle Brettbreite', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(arenastein.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(zugleiste).toBeInTheDocument()
    expect(within(arenastein).getByRole('region', { name: 'Schlangenlichtung' })).toBeVisible()
    expect(within(zugleiste).getByRole('region', { name: 'Zugpfad' })).toBeVisible()
  })

  it('legt den route-sicheren CSS- und Smoke-Vertrag fuer eine breite Waldstein-Spielmatte ab', () => {
    const brett = cssBlock('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    const spielerrahmen = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]')
    const arenastein = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    const zugleiste = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')

    expect(brett).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(spielerrahmen).toMatch(/max-height:\s*clamp\(5\.6rem,\s*11vh,\s*7\.2rem\)/)
    expect(spielerrahmen).toMatch(/background:\s*transparent/)
    expect(spielerrahmen).toMatch(/box-shadow:\s*none/)
    expect(arenastein).toMatch(/grid-column:\s*1/)
    expect(arenastein).toMatch(/width:\s*100%/)
    expect(zugleiste).toMatch(/grid-column:\s*1/)
    expect(zugleiste).toMatch(/grid-row:\s*4/)
    expect(zugleiste).toMatch(/grid-template-columns:\s*minmax\(6rem,\s*0\.65fr\)\s+repeat\(6,\s*minmax\(5\.1rem,\s*1fr\)\)/)
    expect(zugleiste).toMatch(/max-height:\s*clamp\(5\.4rem,\s*12vh,\s*6\.6rem\)/)
    expect(zugleiste).toMatch(/overflow:\s*visible/)
    expect(smokeScript).toContain('M1by Spielbrettweite')
    expect(smokeScript).toContain('daten.gartenkopf.height > 185')
    expect(smokeScript).toContain('waldsteinWidth < 820')
    expect(smokeScript).toContain('zugleiste.y < waldstein.bottom')
    expect(packageJson).toContain('scripts/live_smoke.mjs && node scripts/m1bx_spielkartenfaecher_smoke.mjs && node scripts/m1by_spielbrettweite_smoke.mjs')
  })
})
