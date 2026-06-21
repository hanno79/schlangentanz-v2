/*
 * Author: rahn
 * Datum: 21.06.2026
 * Version: 1.0
 * Beschreibung: M1cr macht die Brettschritt-Stempel der letzten Aktionen am Waldtanz-Arenenstein sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

afterEach(() => {
  window.history.pushState({}, '', '/')
})

function zustandMitAblageStapel() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1cr-01', 'Blau', 1)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cr-start', 'Grün', 1)], 'eigene-schlange-m1cr')]
  zustand.spieler[1].schlangen = [schlange([farbkarte('rot-m1cr-ziel', 'Rot', 2)], 'gegner-schlange-m1cr')]
  zustand.ablagestapel = [
    farbkarte('gelb-m1cr-a', 'Gelb', 2),
    sonderkarte('farbendieb-m1cr-b', 'Farbendieb'),
    farbkarte('violett-m1cr-c', 'Violett', 3),
  ]
  return zustand
}

describe('M1cr Waldtanz-Brettschritt-Stempel', () => {
  it('zeigt die drei letzten Ablagekarten als Stempel-Reihe auf dem Arenenstein', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAblageStapel()} />)

    const { spieltisch } = ermittleSpielbereiche()
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })

    const stempel = within(stempelReihe).getAllByRole('listitem')
    expect(stempel).toHaveLength(3)
    expect(stempel[0]).toHaveTextContent('gelb-m1cr-a')
    expect(stempel[1]).toHaveTextContent('farbendieb-m1cr-b')
    expect(stempel[2]).toHaveTextContent('violett-m1cr-c')
  })

  it('hebt den juengsten Stempel als aktuellen Brettschritt hervor', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAblageStapel()} />)

    const { spieltisch } = ermittleSpielbereiche()
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })
    const stempel = within(stempelReihe).getAllByRole('listitem')

    expect(stempel[2]).toHaveClass('brettschritt-stempel--aktuell')
    expect(stempel[0]).toHaveClass('brettschritt-stempel--vergangen')
    expect(stempel[1]).toHaveClass('brettschritt-stempel--vergangen')
  })

  it('zeigt die Stempel-Reihe nur in der Brettschritt-Spielansicht', () => {
    window.history.pushState({}, '', '/')
    render(<App initialZustand={zustandMitAblageStapel()} />)

    expect(() => within(document.body).getByRole('list', { name: 'Brettschritt-Stempel' })).toThrow()
  })

  it('rendert die Stempel-Reihe erst wenn der Ablagestapel gefuellt ist', () => {
    const leererZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    leererZustand.spieler[0].hand = [farbkarte('leer-m1cr', 'Blau', 1)]
    window.history.pushState({}, '', '/game')
    const { unmount } = render(<App initialZustand={leererZustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenensteinLeer = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    expect(within(arenensteinLeer).queryByRole('list', { name: 'Brettschritt-Stempel' })).not.toBeInTheDocument()
    unmount()

    const gefuellterZustand = { ...leererZustand, ablagestapel: [farbkarte('brettschritt-m1cr-1', 'Gelb', 2), farbkarte('brettschritt-m1cr-2', 'Blau', 1)] }
    render(<App initialZustand={gefuellterZustand} />)

    const spieltisch2 = screen.getByRole('region', { name: 'Spieltisch' })
    const arenenstein = within(spieltisch2).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })
    expect(within(stempelReihe).getAllByRole('listitem').length).toBe(2)
  })

  it('schuetzt CSS- und Smoke-Vertrag fuer die Brettschritt-Stempel', () => {
    expect(appCss).toContain('[class~="waldtanz-arenastein__stempel"]')
    expect(appCss).toContain('[class~="brettschritt-stempel--aktuell"]')
    expect(appCss).toContain('[class~="brettschritt-stempel--vergangen"]')
    expect(appCss).toContain('grid-template-columns: repeat(3')
    expect(packageJson).toContain('node scripts/m1cr_brettschritt_stempel_smoke.mjs')
  })
})
