/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1au macht den oberen Waldtanz-Spielerrahmen zum Stitch-nahen Gartenkopf mit Gegnerfokus, Kartenrücken und Zugtempo.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function vierSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1au Waldtanz-Gartenkopf', () => {
  it('stellt auf /game den naechsten Gegner, verdeckte Top-Karten und Zugtempo als oberen Spielbrett-Kopf dar', () => {
    window.history.pushState({}, '', '/game')

    const zustand = vierSpielerZustand()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const rahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gartenkopf = within(rahmen).getByRole('group', { name: 'Waldtanz-Gartenkopf' })
    const gegnerliste = within(rahmen).getByRole('list', { name: 'Gegner am Tisch' })

    expect(gartenkopf).toHaveClass('waldtanz-spielerrahmen__gartenkopf')
    expect(rahmen.firstElementChild).toBe(gartenkopf)
    expect(gartenkopf.compareDocumentPosition(gegnerliste) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(gartenkopf).getByText('Gegnerfokus')).toBeVisible()
    expect(within(gartenkopf).getByText('Spieler 2')).toBeVisible()
    expect(within(gartenkopf).getByText('0 Punkte')).toBeVisible()
    expect(within(gartenkopf).getByText('5 verdeckte Karten')).toBeVisible()

    const topFaecher = within(gartenkopf).getByRole('list', { name: 'Top-Kartenfächer von Spieler 2' })
    expect(topFaecher).toHaveClass('waldtanz-spielerrahmen__tophand')
    expect(within(topFaecher).getAllByRole('listitem')).toHaveLength(3)
    expect(within(gartenkopf).getByText('Zugtempo')).toBeVisible()
    expect(within(gartenkopf).getByText('Ausspielphase')).toBeVisible()
    expect(within(gartenkopf).getByText('Nächster Halt: Spieler 2')).toBeVisible()
  })

  it('liefert den Stitch-CSS-Vertrag fuer den Gartenkopf mit 3px-Rand, Hard Shadow und Top-Karten', () => {
    expect(cssBlock('waldtanz-spielerrahmen__gartenkopf')).toMatch(/grid-template-columns:\s*minmax\(11rem,\s*0\.8fr\)\s*minmax\(13rem,\s*1fr\)\s*max-content/)
    expect(cssBlock('waldtanz-spielerrahmen__gartenkopf')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-spielerrahmen__gartenkopf')).toMatch(/border-radius:\s*2\.75rem/)
    expect(cssBlock('waldtanz-spielerrahmen__gartenkopf')).toMatch(/box-shadow:\s*0 6px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-spielerrahmen__tophand')).toMatch(/display:\s*flex/)
    expect(cssBlock('waldtanz-spielerrahmen__topkarte')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-spielerrahmen__tempo')).toMatch(/border-radius:\s*999px/)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__topkarte::before\s*\{[^}]*content:\s*'🍃'/s)
  })
})
