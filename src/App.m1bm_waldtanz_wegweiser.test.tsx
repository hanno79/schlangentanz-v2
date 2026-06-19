/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bm hebt die Spielerführung als körperlichen Waldtanz-Wegweiser vor die Entwicklungsdaten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bm Waldtanz-Wegweiser', () => {
  it('zeigt die Spielerführung auf /game als Wegweiser zwischen Zugtafel und Entwicklungsdaten', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const zugtafel = within(aktiverSpieler).getByRole('region', { name: 'Waldtanz-Zugtafel' })
    const spielerfuehrung = within(aktiverSpieler).getByRole('region', { name: 'Spielerführung' })
    const entwicklungsdaten = within(aktiverSpieler).getByRole('complementary', { name: 'Entwicklungsdaten: Aktiver Spieler' })

    expect(spielerfuehrung).toHaveClass('spielerfuehrung--waldtanz-wegweiser')
    expect(within(spielerfuehrung).getByText('Waldtanz-Wegweiser')).toBeVisible()
    expect(within(spielerfuehrung).getByText('Dein nächster Schritt')).toBeVisible()
    expect(within(spielerfuehrung).getByText('Eine spielbare Aktion auswählen.')).toBeVisible()
    expect(within(spielerfuehrung).getByText('Neue Schlange starten mit Karte blau-01')).toBeVisible()
    expect(within(spielerfuehrung).getByRole('link', { name: 'Zur empfohlenen Aktion im Aktionsbereich' })).toBeVisible()

    expect(zugtafel.compareDocumentPosition(spielerfuehrung) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(spielerfuehrung.compareDocumentPosition(entwicklungsdaten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('verankert den Wegweiser mit Google-Stitch-Spielobjekt-CSS statt flacher Hilfebox', () => {
    expect(cssBlock('.spielerfuehrung--waldtanz-wegweiser')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.spielerfuehrung--waldtanz-wegweiser')).toMatch(/border-radius:\s*var\(--st-radius-xl\)/)
    expect(cssBlock('.spielerfuehrung--waldtanz-wegweiser')).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    expect(cssBlock('.spielerfuehrung__wegweiser')).toMatch(/background:\s*radial-gradient/)
    expect(cssBlock('.spielerfuehrung__pfadchip')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.spielerfuehrung__aktionslink')).toMatch(/border-radius:\s*999px/)
  })
})
