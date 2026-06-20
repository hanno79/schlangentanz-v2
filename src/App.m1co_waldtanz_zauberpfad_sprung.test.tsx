/*
 * Author: rahn
 * Datum: 20.06.2026
 * Version: 1.0
 * Beschreibung: M1co macht Zauberpfad-Karten zu Sprungfährten auf die echten Brettobjekte.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, sonderkarte, schlange } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

afterEach(() => {
  window.history.pushState({}, '', '/')
})

function schlangenfrassSprungZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('schlangenfrass-m1co', 'Schlangenfrass')]
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('rot-sprung-m1co', 'Rot', 1),
    farbkarte('blau-bleibt-m1co', 'Blau', 4),
  ], 'eigene-sprungschlange-m1co')]
  return zustand
}

describe('M1co Waldtanz-Zauberpfad-Sprungfaehrten', () => {
  it('springt aus der Zauberpfad-Karte zum echten Bissspur-Brettobjekt und hebt es hervor', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={schlangenfrassSprungZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-m1co/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const bissspur = within(schlangenbereich).getByRole('group', { name: 'Schlangenfrass-Bissspur für rot-sprung-m1co' })
    expect(bissspur).not.toHaveClass('waldtanz-zielspur-ziel--aktiv')

    const pfad = within(zielspur).getByRole('listitem', { name: 'Bissspur-Zauberpfad rot-sprung-m1co' })
    const sprung = within(pfad).getByRole('button', { name: 'Zum 1. Bissspur-Brettobjekt springen' })
    expect(within(zielspur).getByRole('button', { name: 'Zum 2. Bissspur-Brettobjekt springen' })).toBeVisible()
    fireEvent.click(sprung)

    expect(bissspur).toHaveClass('waldtanz-zielspur-ziel--aktiv')
    expect(bissspur).toHaveAttribute('data-zielspur-key', 'frass:spieler-1:eigene-sprungschlange-m1co:rot-sprung-m1co')
    expect(bissspur.querySelector('button')).toBe(document.activeElement)
    expect(pfad).toHaveClass('waldtanz-zielspur__zauberpfad--aktiv')
  })

  it('rendert keine toten Sprungbuttons fuer noch nicht verdrahtete Gegner-Zauberpfade', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangenfrass-gegner-m1co', 'Schlangenfrass')]
    zustand.spieler[0].schlangen = []
    zustand.spieler[1].schlangen = [schlange([farbkarte('rot-gegner-m1co', 'Rot', 1)], 'gegner-a-m1co')]
    zustand.spieler[2].schlangen = [schlange([farbkarte('blau-gegner-m1co', 'Blau', 1)], 'gegner-b-m1co')]
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-gegner-m1co/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const pfad = within(zielspur).getByRole('listitem', { name: 'Bissspur-Zauberpfad rot-gegner-m1co + blau-gegner-m1co' })

    expect(within(pfad).queryByRole('button')).toBeNull()
    expect(within(schlangenbereich).getByRole('button', { name: 'Schlangenfrass-Ziel 1 im Schlangenbereich wählen: rot-gegner-m1co' })).toBeVisible()
  })

  it('schuetzt den Stitch-Stil und verdrahtet den dauerhaften Browser-Smoke', () => {
    expect(appCss).toContain('.spielbereich--game-route [class~="waldtanz-zielspur__sprung"]')
    expect(appCss).toContain('.waldtanz-zielspur-ziel--aktiv')
    expect(appCss).toContain('animation: waldtanz-zielspur-puls')
    expect(packageJson).toContain('node scripts/m1cn_zauberpfad_smoke.mjs && node scripts/m1co_zauberpfad_sprung_smoke.mjs')
  })
})
