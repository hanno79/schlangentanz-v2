/*
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M2k macht Farbendieb-Beute als körperlichen Beutekorb auf der gegnerischen Zielkarte spielbar.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { FarbkarteInfo, SonderkarteInfo } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const farbkarte = (id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo => ({
  typ: 'Farbkarte',
  id,
  farbe,
  punkte,
})

const sonderkarte = (id: string, name: string): SonderkarteInfo => ({
  typ: 'Sonderkarte',
  id,
  name,
})

function farbendiebBeuteZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbendieb-m2k', 'Farbendieb')]
  zustand.spieler[0].schlangen = [{
    id: 'eigene-schlange-m2k',
    zustand: 'aktiv',
    karten: [farbkarte('gruen-m2k-eigen', 'Grün', 2)],
  }]
  zustand.spieler[1].hand = []
  zustand.spieler[1].schlangen = [{
    id: 'gegner-schlange-m2k',
    zustand: 'aktiv',
    karten: [farbkarte('rot-m2k-beute', 'Rot', 7), farbkarte('blau-m2k-bleibt', 'Blau', 3)],
  }]
  return zustand
}

describe('M2k Farbendieb-Beutekorb', () => {
  beforeEach(() => { window.history.pushState({}, '', '/game') })

  it('macht die gegnerische Beutekarte als Beutekorb mit Einfügeplätzen spielbar', () => {
    render(<App initialZustand={farbendiebBeuteZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getByRole('button', { name: /farbendieb-m2k/ })
    const gegnerischeSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const zielkarte = within(gegnerischeSchlangen).getByRole('listitem', { name: /rot-m2k-beute/ })

    expect(within(zielkarte).queryByRole('group', { name: 'Farbendieb-Beutekorb für rot-m2k-beute' })).toBeNull()

    fireEvent.click(handkarte)

    const beutekorb = within(zielkarte).getByRole('group', { name: 'Farbendieb-Beutekorb für rot-m2k-beute' })
    expect(beutekorb).toBeVisible()
    expect(within(beutekorb).getByText('Beutekorb')).toBeVisible()
    expect(within(beutekorb).getByText('Beutekarte rot-m2k-beute')).toBeVisible()
    expect(within(beutekorb).getByText('Ziel: eigene-schlange-m2k')).toBeVisible()
    expect(within(zielkarte).queryByText('Farbendieb auf Position 1')).toBeNull()

    const platzEins = within(beutekorb).getByRole('button', {
      name: 'Farbendieb-Beutekorb mit Karte farbendieb-m2k: rot-m2k-beute in eigene-schlange-m2k an Platz 1 legen',
    })
    const platzZwei = within(beutekorb).getByRole('button', {
      name: 'Farbendieb-Beutekorb mit Karte farbendieb-m2k: rot-m2k-beute in eigene-schlange-m2k an Platz 2 legen',
    })
    expect(platzEins).toBeVisible()
    expect(platzZwei).toBeVisible()

    fireEvent.click(platzZwei)

    const letzteAktionHinweis = screen.getByTestId('waldtanz-letzte-aktion-hinweis')
    expect(within(letzteAktionHinweis).getByText('Zuletzt ausgeführt:')).toBeVisible()
    expect(within(letzteAktionHinweis).getByText('Farbendieb mit Karte farbendieb-m2k von Spieler 2 / Schlange gegner-schlange-m2k Karte rot-m2k-beute auf Schlange eigene-schlange-m2k an Position 2 spielen')).toBeVisible()
    expect(within(gegnerischeSchlangen).queryByText('rot-m2k-beute')).toBeNull()
    expect(within(schlangenbereich).getByText('rot-m2k-beute')).toBeVisible()
  })

  it('legt den Stitch-Spielobjekt-Stil für den Beutekorb ab', () => {
    const css = readFileSync('src/App.css', 'utf8')
    const korbBlock = css.match(/\.farbendieb-beutekorb \{[^}]+\}/)?.[0] ?? ''
    const buttonBlock = css.match(/\.farbendieb-beutekorb__platz \{[^}]+\}/)?.[0] ?? ''

    expect(korbBlock).toContain('border: 3px solid var(--st-color-border-strong)')
    expect(korbBlock).toContain('border-radius: 2rem')
    expect(korbBlock).toContain('box-shadow: var(--st-shadow-hard)')
    expect(buttonBlock).toContain('border: 2px solid var(--st-color-border-strong)')
    expect(buttonBlock).toContain('background: var(--st-color-secondary-container)')
  })
})
