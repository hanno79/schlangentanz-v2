/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1be macht den leeren Startkreis mit Startfährten statt separater Buttonliste spielerisch lesbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

function startfaehrtenZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [
    farbkarte('gelb-start-m1be', 'Gelb', 5),
    farbkarte('gruen-start-m1be', 'Grün', 4),
  ]
  zustand.spieler[0].schlangen = []
  return zustand
}

describe('M1be Waldtanz-Startfährten', () => {
  it('zeigt startbare Handkarten direkt als körperliche Startfährten im Startkreis', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startfaehrtenZustand()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const startkreis = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    const startfaehrten = within(startkreis).getByRole('list', { name: 'Startfährten im Startkreis' })

    expect(within(startfaehrten).getAllByText('Startfährte')).toHaveLength(2)
    expect(within(startfaehrten).getByText('gelb-start-m1be')).toHaveClass('schlangen-startzone__faehrte-id')
    expect(within(startfaehrten).getByText('gruen-start-m1be')).toHaveClass('schlangen-startzone__faehrte-id')
    expect(within(schlangenbereich).queryByRole('button', { name: /Startkreis mit Karte/ })).toBeNull()

    fireEvent.click(startkreis)

    expect(screen.getByText('Zuletzt ausgeführt: Neue Schlange starten mit Karte gelb-start-m1be')).toBeVisible()
    expect(within(schlangenbereich).getByRole('button', { name: /Schlange schlange-spieler-1-1/ })).toBeVisible()
  })

  it('legt den Stitch-Vertrag für Startfährten und die untergeordnete Startliste CSS-seitig ab', () => {
    expect(cssBlock('.schlangen-startzone__faehrten')).toMatch(/display:\s*flex/)
    expect(cssBlock('.schlangen-startzone__faehrten')).toMatch(/list-style:\s*none/)
    expect(cssBlock('.schlangen-startzone__faehrte')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.schlangen-startzone__faehrte')).toMatch(/box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('.schlangen-startzone__faehrte-id')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(cssBlock('.spielbereich--game-route [class~="schlangekarte__anlegeaktionen--starten"]')).toMatch(/display:\s*none/)
  })

  it('begrenzt Startfährten auf /game und lässt den klassischen Startlisten-Fallback außerhalb sichtbar', () => {
    render(<App initialZustand={startfaehrtenZustand()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const startkreis = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })

    expect(within(startkreis).queryByRole('list', { name: 'Startfährten im Startkreis' })).toBeNull()
    expect(within(schlangenbereich).getByRole('button', { name: 'Startkreis mit Karte gelb-start-m1be' })).toBeVisible()
    expect(within(schlangenbereich).getByRole('button', { name: 'Startkreis mit Karte gruen-start-m1be' })).toBeVisible()
  })
})
