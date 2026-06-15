/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1i macht die Ablage als zentrale Waldtanz-Spielkarte sichtbar statt nur als Material-/Debugzeile.
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

function zustandMitAblage(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.ablagestapel = [
    farbkarte('rot-m1i-ablage', 'Rot', 3),
    sonderkarte('farbenfusion-m1i', 'Farbenfusion'),
  ]
  return zustand
}

function ablageRegion() {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
  return within(spieltisch).getByRole('region', { name: 'Waldtanz-Ablage' })
}

describe('M1i Waldtanz-Ablage', () => {
  it('zeigt den Ablagestapel als kompaktes Waldobjekt neben der Schlangenlichtung', () => {
    render(<App initialZustand={zustandMitAblage()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const fortschritt = within(spieltisch).getByRole('region', { name: 'Partiefortschritt' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const waldobjekte = within(arenastein).getByRole('complementary', { name: 'Waldobjekte' })
    const schlangenlichtung = within(arenastein).getByRole('region', { name: 'Schlangenlichtung' })
    const ablage = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Ablage' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })

    expect(ablage).toHaveClass('waldtanz-ablage')
    expect(within(ablage).getByRole('heading', { name: 'Waldtanz-Ablage' })).toBeInTheDocument()
    expect(within(ablage).getByText('Ablage: 2 Karten')).toBeVisible()
    expect(within(ablage).getByText('Letzte Karte')).toHaveClass('waldtanz-ablage__label')
    expect(within(ablage).getByText('farbenfusion-m1i')).toBeVisible()
    expect(within(ablage).getByText('Sonderkarte Farbenfusion')).toBeVisible()
    expect(within(ablage).getByText('Darunter: rot-m1i-ablage')).toBeVisible()
    expect(fortschritt.compareDocumentPosition(ablage) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(waldobjekte).toContainElement(ablage)
    expect(schlangenlichtung).toContainElement(schlangenbereich)

    expect(cssBlock('waldtanz-ablage')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-ablage')).toMatch(/border-radius:\s*2rem/)
    expect(cssBlock('waldtanz-ablage')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-ablage__karte[\s\S]*aspect-ratio:\s*2\s*\/\s*3/)
    expect(appCss).toMatch(/\.waldtanz-ablage__karte[\s\S]*transform:\s*rotate\(-2deg\)/)
    expect(appCss).toMatch(/\.waldtanz-ablage__karte--sonderkarte\s*\{[\s\S]*--kartenfarbe:\s*var\(--st-color-tertiary-container,\s*#ffbcaa\)/)
  })

  it('bleibt als leerer board-naher Ablageplatz sichtbar', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const ablage = ablageRegion()
    expect(within(ablage).getByText('Ablage: 0 Karten')).toBeVisible()
    expect(within(ablage).getByText('Noch keine Karten auf der Ablage.')).toBeVisible()
    expect(within(ablage).getByText('Der nächste Sonderkarten- oder Abwurfeffekt landet hier sichtbar.')).toBeVisible()
  })
})
