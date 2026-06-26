/*
 * Author: rahn
 * Datum: 20.06.2026
 * Version: 1.0
 * Beschreibung: M1cq verdichtet Gegner-Zauberobjekte zu einem kompakten Waldtanz-Gegnerzauberfeld.
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
  zustand.spieler[0].hand = [sonderkarte('farbendieb-m1cq', 'Farbendieb')]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-eigen-m1cq', 'Grün', 2)], 'eigene-schlange-m1cq')]
  zustand.spieler[1].schlangen = [schlange([
    farbkarte('rot-beute-m1cq', 'Rot', 7),
    farbkarte('blau-bleibt-m1cq', 'Blau', 3),
  ], 'gegner-schlange-m1cq')]
  return zustand
}

function blockadeZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('blockade-m1cq', 'Schlangenblockade')]
  zustand.spieler[1].schlangen = [schlange([farbkarte('blau-blockade-m1cq', 'Blau', 3)], 'blockade-ziel-m1cq')]
  return zustand
}

function schlangenfrassZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('schlangenfrass-m1cq', 'Schlangenfrass')]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-eigen-frass-m1cq', 'Grün', 2)], 'eigene-frass-m1cq')]
  zustand.spieler[1].schlangen = [schlange([farbkarte('rot-frass-m1cq', 'Rot', 1)], 'gegner-frass-a-m1cq')]
  zustand.spieler[2].schlangen = [schlange([farbkarte('blau-frass-m1cq', 'Blau', 1)], 'gegner-frass-b-m1cq')]
  return zustand
}

describe('M1cq Waldtanz-Gegnerzauberfeld', () => {
  it('fasst Farbendieb-Gegnerziele als kompaktes Gegner-Zauberfeld in der Lichtung zusammen', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={farbendiebZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbendieb-m1cq/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const gegnerfeld = within(schlangenbereich).getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const zauberHinweis = within(gegnerfeld).getByRole('note', { name: 'Gegner-Zauberfeld' })
    const liste = within(gegnerfeld).getByRole('list', { name: 'Gegner-Zauberziele' })
    const zielschlange = within(liste).getByText('gegner-schlange-m1cq').closest('li')!

    expect(gegnerfeld).toHaveClass('schlangen-gruppe--gegnerzauberfeld')
    expect(zauberHinweis).toHaveTextContent('Gegner-Zauberfeld')
    expect(zauberHinweis).toHaveTextContent('Beutekorb, Fessel oder Bissspur direkt am Gegnerfeld auslösen.')
    expect(liste).toHaveClass('schlangenleiste--gegnerzauber')
    expect(zielschlange).toHaveClass('schlangekarte--gegnerzauber')
    expect(within(zielschlange).getByRole('group', { name: 'Farbendieb-Beutekorb für rot-beute-m1cq' })).toBeVisible()
    expect(zielspur.compareDocumentPosition(gegnerfeld) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('nutzt das gleiche Gegner-Zauberfeld fuer Blockade-Fesseln ohne Aktionspfade zu aendern', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={blockadeZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /blockade-m1cq/ }))

    const gegnerfeld = within(schlangenbereich).getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const fessel = within(gegnerfeld).getByRole('group', { name: 'Schlangenblockade-Fessel für blockade-ziel-m1cq' })

    expect(gegnerfeld).toHaveClass('schlangen-gruppe--gegnerzauberfeld')
    expect(within(gegnerfeld).getByRole('note', { name: 'Gegner-Zauberfeld' })).toBeVisible()
    expect(within(fessel).getByRole('button', { name: 'Schlangenblockade-Fessel mit Karte blockade-m1cq um Schlange blockade-ziel-m1cq legen' })).toBeVisible()
  })

  it('kompaktiert auch gegnerische Schlangenfrass-Bissspuren im Gegner-Zauberfeld', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={schlangenfrassZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-m1cq/ }))

    const gegnerfeld = within(schlangenbereich).getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const bissspur = within(gegnerfeld).getByRole('group', { name: 'Schlangenfrass-Bissspur für rot-frass-m1cq' })

    expect(gegnerfeld).toHaveClass('schlangen-gruppe--gegnerzauberfeld')
    expect(within(gegnerfeld).getByRole('list', { name: 'Gegner-Zauberziele' })).toHaveClass('schlangenleiste--gegnerzauber')
    expect(bissspur).toBeVisible()
    expect(within(bissspur).getByRole('button', { name: 'Schlangenfrass-Ziel 1 im Schlangenbereich wählen: rot-frass-m1cq' })).toBeVisible()
  })

  it('schuetzt CSS- und Smoke-Vertrag fuer das kompakte Gegner-Zauberfeld', () => {
    expect(appCss).toContain('.spielbereich--game-route [class~="schlangen-gruppe--gegnerzauberfeld"]:has(button)')
    expect(appCss).toContain('grid-template-columns: minmax(7rem, 0.42fr) minmax(0, 1fr)')
    expect(appCss).toContain('max-height: clamp(7.4rem, 18vh, 10.2rem)')
    expect(appCss).toContain('.spielbereich--game-route [class~="schlangen-gruppe--gegnerzauberfeld"] [class~="farbendieb-beutekorb"]')
    expect(appCss).toContain('.spielbereich--game-route [class~="schlangen-gruppe--gegnerzauberfeld"] [class~="schlangenblockade-fessel"]')
    expect(appCss).toContain('.spielbereich--game-route [class~="schlangen-gruppe--gegnerzauberfeld"] [class~="schlangenfrass-bissspur"]')
    expect(packageJson).toContain('node scripts/m1cp_gegner_zauberpfad_sprung_smoke.mjs && node scripts/m1cq_gegnerzauberfeld_smoke.mjs')
  })
})
