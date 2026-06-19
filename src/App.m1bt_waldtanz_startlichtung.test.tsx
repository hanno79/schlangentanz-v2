/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bt macht die erste Startlichtung als freien, hit-testbaren Brettbereich oberhalb der Hand sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1bt_startlichtung_smoke.mjs', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bt Waldtanz-Startlichtung', () => {
  it('zeigt den Startkreis als erste freie Brettentscheidung vor der Handbank', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const lichtung = within(spieltisch).getByRole('region', { name: 'Schlangenlichtung' })
    const schlangenbereich = within(lichtung).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const startkreis = within(eigeneSchlangen).getByRole('button', { name: 'Neue Schlange starten' })
    const hand = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(schlangenbereich).toHaveClass('schlangenbereich--waldlichtung')
    expect(eigeneSchlangen.compareDocumentPosition(startkreis) & Node.DOCUMENT_POSITION_CONTAINED_BY).toBeTruthy()
    expect(startkreis.compareDocumentPosition(hand) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(startkreis).getByText('Startkreis')).toHaveClass('schlangen-startzone__badge')
    expect(within(startkreis).getByText('Leuchtender Startplatz')).toBeVisible()
    expect(within(startkreis).getAllByText(/Startfährte/)).toHaveLength(5)
    expect(within(startkreis).getByText('blau-01')).toBeVisible()
  })

  it('legt CSS- und Browser-Smoke-Vertrag ab, damit der Startkreis nicht von der Handbank überdeckt wird', () => {
    const routeSchlangenbereich = cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"]')
    const routeTitel = cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"] > h4')
    const routeLeererStatus = cssBlock('.spielbereich--game-route [class~="schlangen-dragstatus"]:empty')

    const routeLichtungsSchlangen = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="schlangenbereich--waldlichtung"]')
    const routeEigene = cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"] [class~="schlangen-gruppe"]:first-of-type')
    const routeStartzone = cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"] [class~="schlangen-startzone"]')
    const routeFaehrten = cssBlock('.spielbereich--game-route [class~="schlangen-startzone__faehrten"]')

    expect(routeSchlangenbereich).toMatch(/grid-template-columns:\s*1fr/)
    expect(routeSchlangenbereich).toMatch(/align-content:\s*start/)
    expect(routeSchlangenbereich).toMatch(/overflow:\s*visible/)
    expect(routeLichtungsSchlangen).toMatch(/overflow:\s*visible/)
    expect(routeTitel).toMatch(/clip-path:\s*inset\(50%\)/)
    expect(routeLeererStatus).toMatch(/display:\s*none/)
    expect(appCss).toMatch(/@media\s*\(min-width:\s*1100px\)\s*\{[\s\S]*\.spielbereich--game-route \[class~="schlangenbereich--waldlichtung"\] \[class~="schlangen-gruppe"\]:first-of-type\s*\{[\s\S]*transform:\s*translateY\(-2\.8rem\)/)
    expect(routeEigene).toMatch(/transform:\s*translateY\(-2\.8rem\)/)
    expect(routeEigene).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(routeStartzone).toMatch(/min-height:\s*clamp\(5\.8rem,\s*10vh,\s*6\.4rem\)/)
    expect(routeStartzone).toMatch(/overflow:\s*visible/)
    expect(routeFaehrten).toMatch(/display:\s*grid/)
    expect(routeFaehrten).toMatch(/grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/)
    expect(smokeScript).toContain('M1bt Startlichtung')
    expect(smokeScript).toContain('metrics.startBottom > metrics.handTop - 4')
    expect(smokeScript).toContain('elementFromPoint')
  })
})
