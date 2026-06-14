/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1h beweist den Waldtanz-Zielkompass: ausgewählte Handkarten zeigen board-nahe Brettziele statt Sucharbeit in der Buttonliste.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { FarbkarteInfo, SonderkarteInfo } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

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

function zielkompassZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('zielkarte-m1h', 'Blau', 2)]
  zustand.spieler[0].schlangen = [{
    id: 'waldpfad-m1h',
    zustand: 'aktiv',
    karten: [farbkarte('start-m1h', 'Blau', 1)],
  }]
  return zustand
}

function zweiGegnerFrassZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('schlangenfrass-m1h', 'Schlangenfrass')]
  zustand.spieler[0].schlangen = []
  zustand.spieler[1].schlangen = [{ id: 'gegner-a-m1h', zustand: 'aktiv', karten: [farbkarte('rot-gegner-m1h', 'Rot', 1)] }]
  zustand.spieler[2].schlangen = [{ id: 'gegner-b-m1h', zustand: 'aktiv', karten: [farbkarte('blau-gegner-m1h', 'Blau', 1)] }]
  return zustand
}

describe('M1h Waldtanz-Zielkompass', () => {
  it('fasst nach Kartenwahl die leuchtenden Brettziele direkt im Schlangenbereich zusammen', () => {
    render(<App initialZustand={zielkompassZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const zielkompass = within(schlangenbereich).getByRole('region', { name: 'Waldtanz-Zielkompass' })

    expect(zielkompass).toHaveClass('schlangen-zielkompass')
    expect(within(zielkompass).getByText('Wähle oder ziehe eine Handkarte, dann leuchten die passenden Brettziele auf.')).toBeVisible()

    fireEvent.click(within(handBereich).getByRole('button', { name: /zielkarte-m1h/ }))

    expect(within(zielkompass).getByText('Ausgewählt: zielkarte-m1h')).toBeVisible()
    expect(within(zielkompass).getByText('2 Brettziele bereit')).toBeVisible()
    expect(within(zielkompass).getByText('Neue Schlange')).toHaveClass('schlangen-zielkompass__chip')
    expect(within(zielkompass).getByText('Eigene Schlange')).toHaveClass('schlangen-zielkompass__chip')
    expect(within(zielkompass).getByText('Leuchtende Ziele sind direkt auf dem Brett spielbar.')).toBeVisible()
    expect(within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })).toHaveClass('schlangen-startzone--zielbereit')
    expect(within(schlangenbereich).getByRole('button', { name: /Schlange waldpfad-m1h/ })).toHaveClass('schlangekarte--zielbereit')

    expect(cssBlock('schlangen-zielkompass')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangen-zielkompass')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangen-zielkompass')).toMatch(/border-radius:\s*999px/)
    expect(appCss).toMatch(/\.schlangen-zielkompass__chip\s*\{[\s\S]*background:\s*var\(--st-color-secondary-container\)/)
  })

  it('zählt nur tatsächlich gerenderte Brettziele und verspricht keine Zwei-Gegner-Schlangenfrass-Zone', () => {
    render(<App initialZustand={zweiGegnerFrassZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const zielkompass = within(schlangenbereich).getByRole('region', { name: 'Waldtanz-Zielkompass' })

    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-m1h/ }))

    expect(within(zielkompass).getByText('Ausgewählt: schlangenfrass-m1h')).toBeVisible()
    expect(within(zielkompass).getByText('0 Brettziele bereit')).toBeVisible()
    expect(within(zielkompass).queryByText('Karten-Ziel')).toBeNull()
    expect(within(zielkompass).getByText('Für diese Karte leuchtet gerade kein Brettziel.')).toBeVisible()
    expect(within(schlangenbereich).queryByRole('button', { name: /Schlangenfrass im Schlangenbereich/ })).toBeNull()
  })
})
