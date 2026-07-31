/*
 * Author: rahn
 * Datum: 21.06.2026
 * Version: 1.0
 * Beschreibung: M1cu macht die Brettschritt-Stempel zu einem lebendigen Spiel-Trace:
 * jeder Stempel zeigt einen Spieler-Farbstreifen und einen Phasen-Badge, der
 * neueste Stempel traegt eine pulsierende Hervorhebung in der Farbe des aktiven
 * Spielers. Zwischen Stempel-Reihe und Schlangenlichtung sitzt ein
 * "Aktiver Tanz-Schritt"-Pill, der den aktuellen Spieler und die aktuelle Phase
 * sichtbar macht. Engine und Legal-Aktionen bleiben unangetastet; die
 * Spieler-Phase-Zuordnung wird client-seitig aus der ablagestapel-Transition
 * gepflegt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

afterEach(() => {
  window.history.pushState({}, '', '/')
})

function zustandMitBefuelltemAblagestapel() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1cu-01', 'Blau', 1)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cu-start', 'Grün', 1)], 'eigene-schlange-m1cu')]
  zustand.ablagestapel = [
    farbkarte('gelb-m1cu-a', 'Gelb', 2),
    sonderkarte('farbendieb-m1cu-b', 'Farbendieb'),
    farbkarte('violett-m1cu-c', 'Violett', 3),
  ]
  return zustand
}

describe('M1cu Waldtanz-Brettschritt-Lebensader', () => {
  it('rendert pro Brettschritt-Stempel einen Spieler-Farbstreifen und einen Phasen-Badge', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitBefuelltemAblagestapel()} />)

    const { spieltisch } = ermittleSpielbereiche()
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })
    const stempel = within(stempelReihe).getAllByRole('listitem')

    expect(stempel).toHaveLength(3)
    expect(stempel.every((s) => /brettschritt-stempel--spieler-\d/.test(s.className))).toBe(true)
    expect(stempel.every((s) => within(s).getByText(/(Ausspiel|Aufgaben|Zugende|Ziehen|Ende|Reaktion|\?)/i))).toBe(true)
  })

  it('hebt den juengsten Brettschritt-Stempel mit Spieler-Farbstreifen und aktueller Hervorhebung hervor', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitBefuelltemAblagestapel()} />)

    const { spieltisch } = ermittleSpielbereiche()
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })
    const stempel = within(stempelReihe).getAllByRole('listitem')

    const aktueller = stempel[stempel.length - 1]
    expect(aktueller).toHaveClass('brettschritt-stempel--aktuell')
    expect(aktueller.className).toMatch(/brettschritt-stempel--spieler-\d/)
  })

  it('zeigt den Aktiver-Tanz-Schritt-Pill mit aktivem Spielernamen und Phase auf /game', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitBefuelltemAblagestapel()} />)

    const pill = screen.getByRole('group', { name: 'Aktiver Tanz-Schritt' })
    expect(pill).toBeInTheDocument()
    expect(within(pill).getByText(/(Ausspielphase|Aufgabenpruefung|Nachziehphase|Zugabschluss)/i)).toBeInTheDocument()
    expect(within(pill).getByText(/ist am Zug|denkt nach|muss .* abwerfen/i)).toBeInTheDocument()
  })

  it('rendert den Aktiver-Tanz-Schritt-Pill nur auf der /game-Route', () => {
    window.history.pushState({}, '', '/')
    render(<App initialZustand={zustandMitBefuelltemAblagestapel()} />)

    expect(screen.queryByRole('group', { name: 'Aktiver Tanz-Schritt' })).not.toBeInTheDocument()
  })

  it('leere Brettschritt-Reihe ohne ablagestapel-Eintraege zeigt keinen Stempel-Container', () => {
    const leererZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    leererZustand.spieler[0].hand = [farbkarte('leer-m1cu', 'Blau', 1)]
    leererZustand.ablagestapel = []
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={leererZustand} />)

    const { spieltisch } = ermittleSpielbereiche()
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    expect(within(arenenstein).queryByRole('list', { name: 'Brettschritt-Stempel' })).not.toBeInTheDocument()
  })

  it('CSS-Source: vier Spieler-Farbvarianten und Phasen-Badge-Styles sind in App.css deklariert', () => {
    expect(appCss).toMatch(/\.brettschritt-stempel--spieler-0\b/)
    expect(appCss).toMatch(/\.brettschritt-stempel--spieler-1\b/)
    expect(appCss).toMatch(/\.brettschritt-stempel--spieler-2\b/)
    expect(appCss).toMatch(/\.brettschritt-stempel--spieler-3\b/)
    expect(appCss).toMatch(/\.brettschritt-stempel__phase\b/)
    expect(appCss).toMatch(/\.waldtanz-aktiver-tanz-schritt\b/)
    expect(appCss).toMatch(/@keyframes waldtanz-tanzschritt-puls/)
  })

  it('Smoke-Wiring: package.json npm run smoke:production enthaelt das M1cu-Smoke-Script', () => {
    expect(istVerdrahtet('m1cu_brettschritt_lebensader_smoke.mjs')).toBe(true)
  })
})