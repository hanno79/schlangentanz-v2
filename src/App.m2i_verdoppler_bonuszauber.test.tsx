/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M2i macht den globalen Verdoppler als board-nahen Bonuszauber spielbar statt nur als Aktionslisten-Button.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { sonderkarte } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function verdopplerZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('verdoppler-m2i', 'Verdoppler')]
  zustand.spieler[1].hand = []
  zustand.spieler[2].hand = []
  zustand.zugpflichten.gespielteKarten = 0
  zustand.zugpflichten.gespielteSonderkarten = 0
  return zustand
}

describe('M2i Verdoppler-Bonuszauber', () => {
  it('aktiviert den Verdoppler board-nah aus der ausgewählten Handkarte und öffnet danach das Reaktionsschild', () => {
    render(<App initialZustand={verdopplerZustand()} />)

    const { spieltisch } = ermittleSpielbereiche()
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(within(spieltisch).queryByRole('region', { name: 'Waldtanz-Bonuszauber' })).toBeNull()
    fireEvent.click(within(handkarten).getByRole('button', { name: /verdoppler-m2i Sonderkarte Verdoppler/i }))

    const zauber = within(spieltisch).getByRole('region', { name: 'Waldtanz-Bonuszauber' })
    expect(zauber).toHaveClass('waldtanz-bonuszauber')
    expect(within(zauber).getByText('Verdoppler-Zauber bereit')).toBeVisible()
    expect(within(zauber).getByText('verdoppler-m2i')).toHaveClass('waldtanz-bonuszauber__karte')
    expect(within(zauber).getByText('Eine Extra-Karte für diesen Zug freischalten.')).toBeVisible()
    expect(within(zauber).getByRole('button', {
      name: 'Verdoppler-Bonuszauber mit Karte verdoppler-m2i aktivieren',
    })).toHaveClass('waldtanz-bonuszauber__button')

    fireEvent.click(within(zauber).getByRole('button', {
      name: 'Verdoppler-Bonuszauber mit Karte verdoppler-m2i aktivieren',
    }))

    const schild = within(within(spieltisch).getByRole('region', { name: 'Zugkompass' })).getByRole('region', { name: 'Waldtanz-Reaktionsschild' })
    expect(within(schild).getByText('Spieler 2 entscheidet über Verdoppler.')).toBeVisible()
    expect(screen.queryByRole('region', { name: 'Waldtanz-Bonuszauber' })).toBeNull()
    expect(screen.getByText(/Zuletzt ausgeführt: Verdoppler/)).toBeVisible()
  })

  it('legt den Bonuszauber als chunky Stitch-Spielobjekt mit 3px-Rand, Hard Shadow und Goldbutton ab', () => {
    expect(cssBlock('waldtanz-bonuszauber')).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong)')
    expect(cssBlock('waldtanz-bonuszauber')).toContain('box-shadow: 0 5px 0 var(--st-color-border-strong)')
    expect(appCss).toMatch(/--st-radius-lg:\s*2rem;/)
    expect(cssBlock('waldtanz-bonuszauber')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('waldtanz-bonuszauber__button')).toContain('background: var(--st-color-secondary-container)')
    expect(cssBlock('waldtanz-bonuszauber__button:active')).toMatch(/transform:\s*translateY\(4px\)/)
    expect(appCss).toMatch(/--st-color-tertiary-container:\s*#ffbcaa/)
  })
})
