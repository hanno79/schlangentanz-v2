/**
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: M5a sichert, dass der sticky Waldtanz-Aktionsdock board-nahe Klickziele nicht verdeckt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M5a Waldtanz-Boardziele bleiben trotz sticky Aktionsdock klickbar', () => {
  it('haelt Start- und Anlegeziele beim Browser-Scroll oberhalb des Aktionsdocks', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const startZiel = within(schlangenbereich).getAllByRole('button', { name: /Startkreis mit Karte/ })[0]
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })

    expect(startZiel).toHaveClass('schlangekarte__anlegebutton')
    expect(aktionen).toHaveClass('aktionen-panel--waldtanz-dock')
    expect(cssBlock('aktionen-panel--waldtanz-dock')).toMatch(/position:\s*sticky/)
    expect(cssBlock('aktionen-panel--waldtanz-dock')).toMatch(/pointer-events:\s*none/)
    expect(cssBlock('aktionen-panel--waldtanz-dock')).toMatch(/z-index:\s*4/)
    expect(appCss).toMatch(/\.aktionen-panel--waldtanz-dock button,\n\.aktionen-panel--waldtanz-dock a,\n\.aktionen-panel--waldtanz-dock summary\s*\{[^}]*pointer-events:\s*auto/s)
    expect(cssBlock('spielbrett--waldtanz')).toMatch(/position:\s*relative/)
    expect(cssBlock('spielbrett--waldtanz')).toMatch(/z-index:\s*3/)
    expect(cssBlock('schlangekarte__anlegebutton')).toMatch(/scroll-margin-bottom:\s*18rem/)
  })
})
