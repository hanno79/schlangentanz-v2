/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1v macht gegnerische Hände als Stitch-nahe, verdeckte Kartenfächer am Waldtanz-Tisch sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function vierSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
}

describe('M1v Waldtanz-Gegnerfächer', () => {
  it('zeigt gegnerische Hände als verdeckte Kartenfächer mit Score-Plaketten im Spielerrahmen', () => {
    render(<App initialZustand={vierSpielerZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const rahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gegnerliste = within(rahmen).getByRole('list', { name: 'Gegner am Tisch' })
    expect(gegnerliste).toHaveClass('waldtanz-spielerrahmen__gegnerliste--kartenfaecher')

    const gegner = Array.from(gegnerliste.children) as HTMLElement[]
    expect(gegner).toHaveLength(3)
    expect(gegner[0]).toHaveClass('waldtanz-spielerrahmen__gegnerplatz--kartenfaecher')
    expect(within(gegner[0]).getByText('Gegner: Spieler 2')).toBeVisible()
    expect(within(gegner[0]).getByText('0 Punkte')).toBeVisible()

    const faecher = within(gegner[0]).getByRole('list', { name: 'Verdeckter Kartenfächer von Spieler 2' })
    expect(faecher).toHaveClass('waldtanz-spielerrahmen__handruecken--faecher')
    const verdeckteKarten = within(faecher).getAllByRole('listitem')
    expect(verdeckteKarten).toHaveLength(vierSpielerZustand().spieler[1].hand.length)
    expect(verdeckteKarten[0]).toHaveClass('waldtanz-spielerrahmen__kartenruecken--stitch')
    expect(within(gegner[0]).getByText('verdeckter Kartenfächer')).toHaveClass('waldtanz-spielerrahmen__faecherlabel')
    expect(within(gegner[0]).getByText('5 verdeckte Karten')).toHaveClass('waldtanz-spielerrahmen__handzahl')
  })

  it('legt die Stitch-Kartenrücken-Optik mit Peeking-Layout, 3px-Rand und Hard Shadow ab', () => {
    expect(cssBlock('waldtanz-spielerrahmen__gegnerliste--kartenfaecher')).toMatch(/align-items:\s*start/)
    expect(cssBlock('waldtanz-spielerrahmen__gegnerplatz--kartenfaecher')).toMatch(/transform:\s*rotate\(-1deg\)/)
    expect(cssBlock('waldtanz-spielerrahmen__handruecken--faecher')).toMatch(/display:\s*flex/)
    expect(cssBlock('waldtanz-spielerrahmen__handruecken--faecher')).toMatch(/min-height:\s*clamp\(4\.8rem,\s*9vw,\s*7rem\)/)
    expect(cssBlock('waldtanz-spielerrahmen__kartenruecken--stitch')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-spielerrahmen__kartenruecken--stitch')).toMatch(/box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-spielerrahmen__kartenruecken--stitch')).toMatch(/transform:\s*translateY\(-0\.55rem\) rotate\(-6deg\)/)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__kartenruecken--stitch:nth-child\(2n\)\s*\{[^}]*transform:\s*translateY\(-0\.95rem\) rotate\(4deg\)/s)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__kartenruecken--stitch::before\s*\{[^}]*content:\s*'🍃'/s)
  })
})
