/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1d beweist die Waldtanz-Steinplatte: zentrale Magic-Circle-Arena und gefächerte Hand statt Listenbrett.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function steinplattenZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('rot-m1d-1', 'Rot', 3),
    farbkarte('gelb-m1d-2', 'Gelb', 2),
  ], 'steinplatte-du')]
  zustand.spieler[1].schlangen = [schlange([
    farbkarte('blau-m1d-1', 'Blau', 4),
  ], 'steinplatte-gegner')]
  return zustand
}

describe('M1d Waldtanz-Steinplatte', () => {
  it('macht den Schlangenbereich zur zentralen Stein-Arena mit Magic-Circle-Zonen und Kartenfächer', () => {
    render(<App initialZustand={steinplattenZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    const startzone = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })

    expect(schlangenbereich).toHaveClass('schlangenbereich--waldlichtung')
    expect(startzone).toHaveClass('schlangen-startzone')
    expect(within(schlangenbereich).getByText('steinplatte-du')).toBeInTheDocument()
    expect(within(schlangenbereich).getByText('steinplatte-gegner')).toBeInTheDocument()
    expect(schlangenbereich.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    expect(cssBlock('schlangenbereich--waldlichtung')).toMatch(/border-radius:\s*4rem/)
    expect(cssBlock('schlangenbereich--waldlichtung')).toMatch(/overflow:\s*hidden/)
    expect(cssBlock('schlangenbereich--waldlichtung')).toMatch(/position:\s*relative/)
    expect(appCss).toMatch(/\.schlangenbereich--waldlichtung \.schlangen-startzone\s*\{[\s\S]*border:\s*3px dashed var\(--st-color-primary-container\)/)
    expect(appCss).toMatch(/\.schlangenbereich--waldlichtung \.schlangen-startzone\s*\{[\s\S]*border-radius:\s*999px/)
    expect(appCss).toMatch(/\.schlangenbereich--waldlichtung \.schlangen-startzone\s*\{[\s\S]*aspect-ratio:\s*1/)
    expect(appCss).toMatch(/\.handkartenleiste \.handkarte:nth-child\(2n \+ 1\)[\s\S]*rotate\(-4deg\)/)
    expect(appCss).toMatch(/\.handkartenleiste \.handkarte:nth-child\(2n\)[\s\S]*rotate\(4deg\)/)
  })
})
