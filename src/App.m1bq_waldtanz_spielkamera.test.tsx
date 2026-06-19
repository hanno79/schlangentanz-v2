/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bq befreit die /game-Spielkamera vom breiten Seitenrahmen, damit Waldstein, Zugleiste und Hand als Brettfläche statt gequetschtes Panel wirken.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1bq_spielkamera_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bq Waldtanz-Spielkamera', () => {
  it('behält den Spielrahmen vor dem Spieltisch, aber macht den Spieltisch zum ersten breiten Brettfokus', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spielrahmen = within(spielbereich).getByRole('complementary', { name: 'Waldtanz-Spielrahmen' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const waldstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(spielbereich).toHaveClass('spielbereich--game-route')
    expect(spielrahmen.compareDocumentPosition(spieltisch) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(spieltisch).toContainElement(waldstein)
    expect(spieltisch).toContainElement(zugleiste)
    expect(waldstein.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(spielrahmen).getByText('Waldtanz-Kompass')).toBeVisible()
    expect(within(waldstein).getByText('Leuchtender Waldstein')).toBeVisible()
    expect(within(zugleiste).getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })).toBeVisible()
    expect(within(handkarten).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })).toHaveLength(5)
  })

  it('legt den CSS- und Browser-Smoke-Vertrag fuer die rankenschmale Stitch-Brettkamera ab', () => {
    const routeGrid = cssBlock('.spielbereich--waldtanz.spielbereich--game-route')
    const routeRahmen = cssBlock('.spielbereich--game-route [class~="waldtanz-seitenmenue"]')
    const routeNichtAktiveNav = cssBlock('.spielbereich--game-route [class~="waldtanz-seitenmenue__liste"] li:not(:has([class~="waldtanz-seitenmenue__punkt--aktiv"]))')
    const routeBrett = cssBlock('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    const routeWaldstein = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    const routeZugleiste = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')

    expect(routeGrid).toMatch(/grid-template-columns:\s*minmax\(6\.5rem,\s*0\.22fr\)\s*minmax\(0,\s*2\.78fr\)/)
    expect(routeGrid).toMatch(/gap:\s*clamp\(0\.55rem,\s*0\.9vw,\s*0\.8rem\)/)
    expect(routeRahmen).toMatch(/max-height:\s*min\(88vh,\s*48rem\)/)
    expect(routeRahmen).toMatch(/overflow:\s*auto/)
    expect(routeNichtAktiveNav).toMatch(/display:\s*none/)
    expect(routeBrett).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(routeWaldstein).toMatch(/height:\s*clamp\(32\.5rem,\s*58vh,\s*33rem\)/)
    expect(routeWaldstein).toMatch(/max-height:\s*none/)
    expect(routeWaldstein).toMatch(/overflow:\s*visible/)
    expect(routeWaldstein).toMatch(/width:\s*100%/)
    expect(routeZugleiste).toMatch(/grid-row:\s*4/)
    expect(routeZugleiste).toMatch(/max-height:\s*clamp\(5\.4rem,\s*12vh,\s*6\.6rem\)/)
    expect(smokeScript).toContain('M1bq Spielkamera')
    expect(smokeScript).toContain('brettWidth < 980')
    expect(smokeScript).toContain('waldsteinWidth < 820')
    expect(smokeScript).toContain('zugleiste.y < waldstein.bottom')
    expect(smokeScript).toContain('seitenrahmenWidth > 128')
  })
})
