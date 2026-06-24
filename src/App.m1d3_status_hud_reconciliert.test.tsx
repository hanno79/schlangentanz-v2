/**
 * Author: rahn
 * Datum: 24.06.2026
 * Version: 1.0
 * Beschreibung: M1d3 reconciliiert das /game Status-HUD — verbirgt die verbose
 * Status-Dopplung (statgitter) auf /game und repariert die kanonische Smoke-Kette,
 * deren M1bg/M1bi/M1bj-Checks seit der bewussten /game-Brettfokus-Reduktion
 * (M1cs/M1bo-Vertrag: genau 2 Spielschubladen) stale waren.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const liveSmoke = readFileSync('scripts/live_smoke.mjs', 'utf8')

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1d3 /game Status-HUD reconciliert', () => {
  it('verbirgt die verbose Statusliste (statgitter) auf /game und behält die kompakten Ranken-Chips als einzige Statusquelle', () => {
    window.history.pushState({}, '', '/game')
    const { container } = render(<App initialZustand={startZustand()} />)

    // Kompakte Ranken-Chips (Phase/Hand/Quest) bleiben auf /game sichtbar
    const rankenwerte = container.querySelector('.waldtanz-seitenmenue__rankenwerte')
    expect(rankenwerte).not.toBeNull()

    // Verbose Statgitter-Liste ist auf /game verborgen — keine Dopplung der
    // bereits als Ranken-Chips gezeigten Werte plus debug-lastige Zusatzwerte.
    const statgitter = container.querySelector('.waldtanz-seitenmenue__statgitter')
    expect(statgitter).toBeNull()
  })

  it('behält die verbose Statusliste (statgitter) auf / (Lobby-Route) als Entwicklungsdatenquelle', () => {
    window.history.pushState({}, '', '/')
    const { container } = render(<App initialZustand={startZustand()} />)

    const statgitter = container.querySelector('.waldtanz-seitenmenue__statgitter')
    expect(statgitter).not.toBeNull()
  })

  it('reconciliiert die M1bg-Smoke-Schwelle auf die bewusst reduzierten /game-Debug-Schubladen', () => {
    // M1bo-Vertrag: auf /game bleiben genau 2 Spielschubladen (Spielphase + Aktiver Spieler),
    // alle eingeklappt. Die Smoke-Schwelle muss <2 (mindestens 2) sein, nicht mehr <5.
    expect(liveSmoke).toMatch(/schubladen < 2/)
    expect(liveSmoke).not.toMatch(/schubladen < 5/)
  })

  it('lässt M1bi/M1bj gegen die Lobby-Route / laufen, wo die Panel-HUDs bewusst verbleiben', () => {
    // M1bi (Materialrucksack) und M1bj (Spielerbänke) testen Stitch-Panel-HUDs, die auf /game
    // zugunsten board-naher Objekte bewusst ausgeblendet sind (brettFokus, M1cs). Die Checks
    // müssen gegen / laufen, wo die Panels rendern — und am Ende der Kette, damit die
    // nachfolgenden /game-Checks ihre Route nicht verlieren.
    expect(liveSmoke).toMatch(/erstelleUrl\('\/'\)/)
    // M1bi/M1bj stehen nach M1bl (Ende der /game-Kette), nicht vor M1ba.
    const m1blIndex = liveSmoke.indexOf('await pruefeM1blBuehnenrahmen(seite)')
    const m1biIndex = liveSmoke.indexOf('await pruefeM1biMaterialrucksack(seite)')
    const m1bjIndex = liveSmoke.indexOf('await pruefeM1bjSpielerbaenke(seite)')
    expect(m1blIndex).toBeGreaterThan(-1)
    expect(m1biIndex).toBeGreaterThan(m1blIndex)
    expect(m1bjIndex).toBeGreaterThan(m1blIndex)
  })
})
