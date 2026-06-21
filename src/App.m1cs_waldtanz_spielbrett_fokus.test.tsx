/*
 * Author: rahn
 * Datum: 21.06.2026
 * Version: 1.0
 * Beschreibung: M1cs macht den /game-Spielbildschirm zum klaren Brettfokus, indem die
 * redundanten Debug-Listen-Panels (Punktetafel, Spielerübersicht, Material und Aufgaben)
 * auf der Game-Route ausgeblendet werden, ohne die zentrale Waldtanz-Rangtafel zu verlieren.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const appTsx = readFileSync('src/App.tsx', 'utf8')

afterEach(() => {
  window.history.pushState({}, '', '/')
})

function zustandMitVollerPartie() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('m1cs-blau-01', 'Blau', 1), farbkarte('m1cs-blau-02', 'Blau', 2)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('m1cs-gruen-01', 'Grün', 1)], 'eigene-schlange-m1cs')]
  zustand.spieler[1].schlangen = [schlange([farbkarte('m1cs-rot-01', 'Rot', 1)], 'gegner-schlange-m1cs')]
  return zustand
}

describe('M1cs Waldtanz-Spielbrett-Fokus', () => {
  it('hält auf /game die Waldtanz-Rangtafel sichtbar und blendet die Punktetafel-Liste aus', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitVollerPartie()} />)

    const wertung = screen.getByRole('region', { name: /^Wertung$/i })
    expect(within(wertung).getByRole('heading', { name: /Waldtanz-Rangtafel/i })).toBeInTheDocument()
    expect(within(wertung).queryByRole('heading', { name: /^Punktetafel$/i })).not.toBeInTheDocument()
    expect(within(wertung).queryByText(/Punkteübersicht/i)).not.toBeInTheDocument()
  })

  it('versteckt die Spielerübersicht- und Material-Panels auf /game, hält sie aber auf / sichtbar', () => {
    window.history.pushState({}, '', '/game')
    const { unmount } = render(<App initialZustand={zustandMitVollerPartie()} />)

    expect(() => screen.getByRole('region', { name: /^Spielerübersicht$/i })).toThrow()
    expect(() => screen.getByRole('region', { name: /^Material und Aufgaben$/i })).toThrow()
    unmount()

    window.history.pushState({}, '', '/')
    render(<App initialZustand={zustandMitVollerPartie()} />)
    expect(screen.getByRole('region', { name: /^Spielerübersicht$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^Material und Aufgaben$/i })).toBeInTheDocument()
    const wertungLobby = screen.getByRole('region', { name: /^Wertung$/i })
    expect(within(wertungLobby).getByRole('heading', { name: /^Punktetafel$/i })).toBeInTheDocument()
  })

  it('hält das zentrale Spieltisch-Brett und die Handkarten auf /game sichtbar', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitVollerPartie()} />)

    const { spieltisch, handBereich } = ermittleSpielbereiche()
    expect(within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })).toBeInTheDocument()
    expect(within(spieltisch).getByRole('region', { name: /Schlangenlichtung/i })).toBeInTheDocument()
    expect(handBereich).toBeInTheDocument()
  })

  it('schützt den CSS- und Source-Vertrag für den Brettfokus auf /game', () => {
    expect(appCss).toMatch(/\.spielbereich--game-route[^{]*\[class~="wertung-panel--brettfokus"\]/)
    expect(appCss).toMatch(/\.spielbereich--game-route[^{]*\[class~="material-aufgaben-panel--brettfokus"\]/)
    expect(appCss).toMatch(/\.spielbereich--game-route[^{]*\[class~="spieleruebersicht-panel--brettfokus"\]/)
    expect(appTsx).toContain('wertungBrettFokus')
    expect(appTsx).toContain('materialBrettFokus')
    expect(appTsx).toContain('spieleruebersichtBrettFokus')
  })
})
