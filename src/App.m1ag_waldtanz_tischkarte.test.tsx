/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ag bringt die zuletzt ausgespielte Karte als zentrale Waldtanz-Tischkarte in die Schlangenlichtung.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, sonderkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function zustandMitTischkarte(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.ablagestapel = [
    farbkarte('rot-m1ag-darunter', 'Rot', 4),
    sonderkarte('farbenfusion-m1ag', 'Farbenfusion'),
  ]
  return zustand
}

describe('M1ag Waldtanz-Tischkarte', () => {
  it('zeigt die zuletzt gespielte Karte zentral in der Schlangenlichtung statt nur im Waldobjekte-Stapel', () => {
    render(<App initialZustand={zustandMitTischkarte()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const schlangenlichtung = within(arenastein).getByRole('region', { name: 'Schlangenlichtung' })
    const schlangenbereich = within(schlangenlichtung).getByRole('region', { name: 'Schlangenbereich' })
    const tischkarte = within(schlangenlichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })

    expect(tischkarte).toHaveClass('waldtanz-tischkarte')
    expect(within(tischkarte).getByRole('heading', { name: 'Tischkarte im Waldkreis' })).toBeVisible()
    expect(within(tischkarte).getByText('Zuletzt ausgespielt')).toHaveClass('waldtanz-tischkarte__label')
    expect(within(tischkarte).getByText('farbenfusion-m1ag')).toBeVisible()
    expect(within(tischkarte).getByText('Sonderkarte Farbenfusion')).toHaveClass('waldtanz-tischkarte__typ')
    expect(within(tischkarte).getByText('Darunter wartet rot-m1ag-darunter')).toBeVisible()
    expect(schlangenlichtung).toContainElement(tischkarte)
    expect(tischkarte.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    const waldobjekte = within(arenastein).getByRole('complementary', { name: 'Waldobjekte' })
    expect(within(waldobjekte).getByRole('region', { name: 'Waldtanz-Ablage' })).toBeVisible()
  })

  it('bleibt als leerer zentraler Ausspielplatz sichtbar, bevor die erste Karte abgelegt wird', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const tischkarte = within(screen.getByRole('region', { name: 'Schlangenlichtung' })).getByRole('region', { name: 'Waldtanz-Tischkarte' })

    expect(within(tischkarte).getByText('Tischkarte im Waldkreis')).toBeVisible()
    expect(within(tischkarte).getByText('Noch keine Tischkarte')).toBeVisible()
    expect(within(tischkarte).getByText('Die nächste ausgespielte Sonder- oder Abwurfkarte landet hier im Blickfeld.')).toBeVisible()
  })

  it('legt den zentralen Stitch-Kartenplatz mit 3px-Rand, 2:3-Karte, Hard Shadow und Waldkreis-Glow ab', () => {
    expect(cssBlock('waldtanz-arenastein__schlangenlichtung')).toMatch(/grid-template-rows:\s*auto minmax\(0,\s*1fr\)/)
    expect(appCss).toMatch(/\.waldtanz-arenastein__schlangenlichtung \.schlangenbereich\s*\{[\s\S]*min-height:\s*0/)
    expect(cssBlock('waldtanz-tischkarte')).toMatch(/border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-tischkarte')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-tischkarte')).toMatch(/radial-gradient/)
    expect(cssBlock('waldtanz-tischkarte__karte')).toMatch(/aspect-ratio:\s*2\s*\/\s*3/)
    expect(cssBlock('waldtanz-tischkarte__karte')).toMatch(/border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-tischkarte__symbol')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-tischkarte__wert')).toMatch(/border-radius:\s*999px/)
  })
})
