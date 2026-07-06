/**
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: M1a beweist den Stitch-inspirierten Waldtanz-Arena-Slice: zentrale Spielfläche, Hand unten/board-nah und kompakte Nebenbereiche.
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

function waldtanzZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const eigeneKarten = zustand.spieler[0].hand.slice(0, 2)
  const gegnerKarten = zustand.spieler[1].hand.slice(0, 1)

  zustand.spieler[0].hand = zustand.spieler[0].hand.slice(2)
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(1)
  zustand.spieler[0].schlangen = [{ id: 'waldtanz-eigene-schlange', karten: eigeneKarten, zustand: 'aktiv' }]
  zustand.spieler[1].schlangen = [{ id: 'waldtanz-gegner-schlange', karten: gegnerKarten, zustand: 'aktiv' }]

  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1a Waldtanz-Arena-Layout', () => {
  it('macht den Spieltisch zur zentralen Waldarena und schiebt die Hand board-nah nach unten', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={waldtanzZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpielerPanel = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const spieltisch = within(aktiverSpielerPanel).getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const aktionenBereich = within(aktiverSpielerPanel).getByRole('region', { name: 'Aktionen' })

    expect(spielbereich).toHaveClass('spielbereich--waldtanz')
    expect(aktiverSpielerPanel).toHaveClass('info-panel--waldtanz-arena')
    expect(spieltisch).toHaveClass('spielbrett--waldtanz')
    expect(within(schlangenbereich).getByText('waldtanz-eigene-schlange')).toBeInTheDocument()
    expect(within(spieltisch).getByText('waldtanz-gegner-schlange')).toBeInTheDocument()
    expect(schlangenbereich.compareDocumentPosition(handBereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    // Auf /game rueckt die Aktionen-Dock als board-nahes Inline-Element in den
    // Spieltisch selbst (aktionen-panel--brettinline), statt ihm als Geschwister zu folgen.
    expect(spieltisch.contains(aktionenBereich)).toBe(true)
    expect(aktionenBereich).toHaveClass('aktionen-panel--brettinline')

    expect(cssBlock('spielbereich--waldtanz')).toMatch(/grid-template-areas:/)
    expect(cssBlock('info-panel--waldtanz-arena')).toMatch(/grid-area:\s*arena/)
    expect(cssBlock('spielbrett--waldtanz')).toMatch(/radial-gradient/)
    expect(cssBlock('spielbrett--waldtanz')).toMatch(/border-radius:\s*3rem/)
    expect(cssBlock('handkarten-panel')).toMatch(/align-self:\s*end/)
  })
})
