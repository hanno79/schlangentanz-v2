/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bj macht die Spielerübersicht als körperliche Waldtanz-Spielerbänke sichtbar, bevor die Entwicklungsdaten folgen.
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

function dreiSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
}

describe('M1bj Waldtanz-Spielerbänke', () => {
  it('zeigt alle Spieler als chunky Sitzplätze vor den Spielerstatus-Entwicklungsdaten', () => {
    render(<App initialZustand={dreiSpielerZustand()} />)

    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    const baenke = within(spieleruebersicht).getByRole('group', { name: 'Waldtanz-Spielerbänke' })
    const liste = within(baenke).getByRole('list', { name: 'Sitzplätze der Tischrunde' })
    const sitzplaetze = within(liste).getAllByRole('listitem')
    const entwicklungsdaten = within(spieleruebersicht).getByRole('complementary', { name: 'Entwicklungsdaten: Spielerstatus' })

    expect(sitzplaetze).toHaveLength(3)
    expect(within(baenke).getByText('Tischrunde bereit')).toBeInTheDocument()
    expect(within(baenke).getByText('3 Sitzplätze · Spieler 1 ist am Zug')).toBeInTheDocument()

    expect(sitzplaetze[0]).toHaveAttribute('aria-current', 'true')
    expect(within(sitzplaetze[0]).getByText('Spieler 1')).toBeInTheDocument()
    expect(within(sitzplaetze[0]).getByText('am Zug')).toBeInTheDocument()
    expect(within(sitzplaetze[0]).getByText('0 Punkte')).toBeInTheDocument()
    expect(within(sitzplaetze[0]).getByText('5 Handkarten')).toBeInTheDocument()
    expect(within(sitzplaetze[0]).getByText('0 Schlangen')).toBeInTheDocument()
    expect(within(sitzplaetze[0]).getByText('0 Aufgaben')).toBeInTheDocument()

    expect(within(sitzplaetze[1]).getByText('Spieler 2')).toBeInTheDocument()
    expect(within(sitzplaetze[1]).getByText('KI wartet')).toBeInTheDocument()
    expect(within(sitzplaetze[2]).getByText('Spieler 3')).toBeInTheDocument()

    expect(Array.from(spieleruebersicht.children).indexOf(baenke)).toBeLessThan(
      Array.from(spieleruebersicht.children).indexOf(entwicklungsdaten),
    )
    expect(within(entwicklungsdaten).getByText(/Handkarten insgesamt:/)).toBeInTheDocument()

    expect(cssBlock('spielerbaenke')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('spielerbaenke')).toMatch(/border-radius:\s*var\(--st-radius-xl\)/)
    expect(cssBlock('spielerbaenke')).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    expect(cssBlock('spielerbaenke__liste')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*8rem\),\s*1fr\)\)/)
    expect(cssBlock('spielerbaenke__sitz--aktiv')).toMatch(/transform:\s*translateY\(-3px\) rotate\(-1deg\)/)
  })
})
