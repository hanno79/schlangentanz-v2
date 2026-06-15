/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ab macht die Wertung als Stitch-Rangtafel statt nur als Debug-/Punkteliste spielnah sichtbar.
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

function rangtafelZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('rang-du-1', 'Grün', 3),
    farbkarte('rang-du-2', 'Grün', 3),
    farbkarte('rang-du-3', 'Grün', 3),
  ], 'rang-du')]
  zustand.spieler[1].schlangen = [schlange([
    farbkarte('rang-fuehrung-1', 'Rot', 4),
    farbkarte('rang-fuehrung-2', 'Rot', 4),
    farbkarte('rang-fuehrung-3', 'Rot', 4),
  ], 'rang-fuehrung')]
  zustand.spieler[2].schlangen = [schlange([
    farbkarte('rang-dritter-1', 'Blau', 1),
    farbkarte('rang-dritter-2', 'Blau', 1),
    farbkarte('rang-dritter-3', 'Blau', 1),
  ], 'rang-dritter')]
  return zustand
}

describe('M1ab Waldtanz-Rangtafel', () => {
  it('zeigt die Wertung als spielnahe Rangtafel mit Führung, aktuellem Spieler und echten Punktequellen', () => {
    render(<App initialZustand={rangtafelZustand()} />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })
    const rangtafel = within(wertung).getByRole('region', { name: 'Waldtanz-Rangtafel' })
    const plaetze = within(rangtafel).getAllByRole('listitem')

    expect(within(rangtafel).getByRole('heading', { name: 'Waldtanz-Rangtafel' })).toBeVisible()
    expect(plaetze).toHaveLength(3)
    expect(plaetze[0]).toHaveClass('waldtanz-rangtafel__karte--fuehrung')
    expect(plaetze[0]).toHaveTextContent('#1')
    expect(plaetze[0]).toHaveTextContent('Spieler 2')
    expect(plaetze[0]).toHaveTextContent('12 Punkte')
    expect(plaetze[0]).toHaveTextContent('führt')

    const aktiveKarte = plaetze.find((platz) => platz.getAttribute('aria-current') === 'true')
    expect(aktiveKarte).toBeTruthy()
    expect(aktiveKarte).toHaveTextContent('Spieler 1')
    expect(aktiveKarte).toHaveTextContent('am Zug')
    expect(aktiveKarte).toHaveTextContent('Handkarten 5')
    expect(aktiveKarte).toHaveTextContent('Schlangen 1')
    expect(aktiveKarte).toHaveTextContent('Farbgruppen 9')
    expect(aktiveKarte).toHaveTextContent('Quests 0')

    expect(within(wertung).getByRole('region', { name: 'Punktetafel' })).toBeVisible()
  })

  it('verankert die Rangtafel visuell als chunky Google-Stitch-Waldschild', () => {
    expect(cssBlock('waldtanz-rangtafel')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-rangtafel')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('waldtanz-rangtafel')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-rangtafel__karte')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-rangtafel__rang')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('waldtanz-rangtafel__karte--fuehrung')).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
  })
})
