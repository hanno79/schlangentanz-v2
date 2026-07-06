/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1aj macht Sonderkarten-Ziele als Waldtanz-Zauberkreis direkt im Arenastein spielbar.
 */

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { FarbkarteInfo, SonderkarteInfo } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

const farbkarte = (id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo => ({ typ: 'Farbkarte', id, farbe, punkte })
const sonderkarte = (id: string, name: string): SonderkarteInfo => ({ typ: 'Sonderkarte', id, name })

function farbenfusionZauberkreisZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbenfusion-m1aj', 'Farbenfusion')]
  zustand.spieler[0].schlangen = [{
    id: 'fusion-pfad-m1aj',
    zustand: 'aktiv',
    karten: [farbkarte('blau-m1aj-a', 'Blau', 2), farbkarte('blau-m1aj-b', 'Blau', 3), farbkarte('rot-m1aj-c', 'Rot', 4)],
  }]
  return zustand
}

function farbendiebZauberkreisZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbendieb-m1aj', 'Farbendieb')]
  zustand.spieler[0].schlangen = [{ id: 'eigene-schlange-m1aj', zustand: 'aktiv', karten: [farbkarte('gruen-m1aj-eigen', 'Grün', 2)] }]
  zustand.spieler[1].hand = []
  zustand.spieler[1].schlangen = [{ id: 'gegner-schlange-m1aj', zustand: 'aktiv', karten: [farbkarte('rot-m1aj-beute', 'Rot', 7)] }]
  return zustand
}

describe('M1aj Magiekreis-Sonderzauber', () => {
  beforeEach(() => { window.history.pushState({}, '', '/game') })

  it('führt eine ausgewählte Farbenfusion direkt über den Zauberkreis im Arenastein aus', () => {
    render(<App initialZustand={farbenfusionZauberkreisZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbenfusion-m1aj/ }))

    const magiekreise = screen.getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const zauberkreis = within(magiekreise).getByRole('listitem', { name: 'Sonderzauber: 1 Zauberweg' })
    const zauberButton = within(zauberkreis).getByRole('button', {
      name: 'Magiekreis-Sonderzauber: Farbenfusion mit Karte farbenfusion-m1aj auf Schlange fusion-pfad-m1aj bei Karte blau-m1aj-a spielen',
    })

    expect(zauberkreis).toHaveClass('waldtanz-magiekreise__kreis--sonderzauber')
    expect(within(zauberButton).getByText('Farbenfusion')).toBeVisible()
    expect(within(zauberButton).getByText('fusion-pfad-m1aj')).toBeVisible()

    fireEvent.click(zauberButton)

    expect(screen.getByTestId('waldtanz-letzte-aktion-hinweis')).toHaveTextContent('Zuletzt ausgeführt:Farbenfusion mit Karte farbenfusion-m1aj auf Schlange fusion-pfad-m1aj bei Karte blau-m1aj-a spielen')
    expect(within(schlangenbereich).getByText('farbenfusion-m1aj')).toBeVisible()
    expect(within(schlangenbereich).queryByText('blau-m1aj-a')).toBeNull()
    expect(within(schlangenbereich).queryByText('blau-m1aj-b')).toBeNull()
  })

  it('zeigt gegnerische Farbendieb-Ziele ebenfalls als Zauberwege statt nur in der Fallback-Liste', () => {
    render(<App initialZustand={farbendiebZauberkreisZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbendieb-m1aj/ }))

    const zauberkreis = within(screen.getByRole('region', { name: 'Waldtanz-Magiekreise' })).getByRole('listitem', { name: 'Sonderzauber: 2 Zauberwege' })
    const zauberButton = within(zauberkreis).getByRole('button', {
      name: 'Magiekreis-Sonderzauber: Farbendieb mit Karte farbendieb-m1aj von Spieler 2 / Schlange gegner-schlange-m1aj Karte rot-m1aj-beute auf Schlange eigene-schlange-m1aj an Position 1 spielen',
    })

    fireEvent.click(zauberButton)

    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const gegnerischeSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    expect(within(eigeneSchlangen).getByText('rot-m1aj-beute')).toBeVisible()
    expect(within(gegnerischeSchlangen).queryByText('rot-m1aj-beute')).toBeNull()
  })

  it('gibt dem Sonderzauber-Kreis einen eigenständigen Stitch-Spielobjekt-Stil', () => {
    expect(appCss).toMatch(/--st-color-tertiary-container:\s*#ffbcaa/)
    expect(cssBlock('waldtanz-magiekreise__kreis--sonderzauber')).toMatch(/background:\s*radial-gradient/)
    expect(appCss).toMatch(/\.waldtanz-magiekreise__kreis--sonderzauber\.waldtanz-magiekreise__kreis--aktiv\s*\{[\s\S]*background:\s*radial-gradient/)
    expect(cssBlock('waldtanz-magiekreise__aktion--sonderzauber')).toMatch(/background:\s*var\(--st-color-tertiary-container\)/)
    expect(cssBlock('waldtanz-magiekreise__aktion--sonderzauber')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
  })
})
