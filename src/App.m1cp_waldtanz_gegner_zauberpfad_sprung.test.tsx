/*
 * Author: rahn
 * Datum: 20.06.2026
 * Version: 1.0
 * Beschreibung: M1cp verdrahtet Zauberpfad-Sprungfährten mit gegnerischen Brettobjekten.
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

function farbendiebZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbendieb-m1cp', 'Farbendieb')]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-eigen-m1cp', 'Grün', 2)], 'eigene-schlange-m1cp')]
  zustand.spieler[1].schlangen = [schlange([farbkarte('rot-beute-m1cp', 'Rot', 7)], 'gegner-schlange-m1cp')]
  return zustand
}

function blockadeZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('blockade-m1cp', 'Schlangenblockade')]
  zustand.spieler[1].schlangen = [schlange([farbkarte('blau-blockiert-m1cp', 'Blau', 3)], 'blockade-ziel-m1cp')]
  return zustand
}

describe('M1cp Waldtanz-Gegner-Zauberpfad-Sprungfaehrten', () => {
  it('springt aus dem Farbendieb-Zauberpfad zum echten Beutekorb und hebt ihn hervor', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={farbendiebZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbendieb-m1cp/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const beutekorb = within(schlangenbereich).getByRole('group', { name: 'Farbendieb-Beutekorb für rot-beute-m1cp' })
    // M2a: Sonderkarten-Selektion aktiviert das passende Brett-Ziel automatisch.
    expect(beutekorb).toHaveClass('waldtanz-zielspur-ziel--aktiv')

    const pfad = within(zielspur).getByRole('listitem', { name: 'Beutekorb-Zauberpfad rot-beute-m1cp' })
    fireEvent.click(within(pfad).getByRole('button', { name: 'Zum 1. Beutekorb-Brettobjekt springen' }))

    expect(beutekorb).toHaveClass('waldtanz-zielspur-ziel--aktiv')
    expect(beutekorb).toHaveAttribute('data-zielspur-key', 'dieb:spieler-2:gegner-schlange-m1cp:rot-beute-m1cp')
    expect(within(beutekorb).getByRole('button', { name: /an Platz 1 legen/ })).toBe(document.activeElement)
    expect(pfad).toHaveClass('waldtanz-zielspur__zauberpfad--aktiv')
  })

  it('springt aus dem Blockade-Zauberpfad zur echten Rankenfessel und hebt sie hervor', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={blockadeZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /blockade-m1cp/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const fessel = within(schlangenbereich).getByRole('group', { name: 'Schlangenblockade-Fessel für blockade-ziel-m1cp' })
    const pfad = within(zielspur).getByRole('listitem', { name: 'Fessel-Zauberpfad blockade-ziel-m1cp' })

    fireEvent.click(within(pfad).getByRole('button', { name: 'Zum 1. Fessel-Brettobjekt springen' }))

    expect(fessel).toHaveClass('waldtanz-zielspur-ziel--aktiv')
    expect(fessel).toHaveAttribute('data-zielspur-key', 'blockade:spieler-2:blockade-ziel-m1cp')
    expect(within(fessel).getByRole('button', { name: /Schlangenblockade-Fessel mit Karte blockade-m1cp/ })).toBe(document.activeElement)
  })

  it('schuetzt Stil- und Smoke-Wiring-Vertrag fuer Gegner-Sprungfaehrten', () => {
    expect(appCss).toContain('.spielbereich--game-route [class~="farbendieb-beutekorb"].waldtanz-zielspur-ziel--aktiv')
    expect(appCss).toContain('.spielbereich--game-route [class~="schlangenblockade-fessel"].waldtanz-zielspur-ziel--aktiv')
    expect(packageJson).toContain('node scripts/m1co_zauberpfad_sprung_smoke.mjs && node scripts/m1cp_gegner_zauberpfad_sprung_smoke.mjs')
  })
})
