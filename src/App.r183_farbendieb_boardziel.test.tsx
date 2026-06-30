/*
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: R183 macht Farbendieb nach Sonderkarten-Auswahl board-nah auf gegnerischen Karten spielbar.
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

describe('R183 Farbendieb-Boardziel', () => {
  beforeEach(() => { window.history.pushState({}, '', '/game') })

  it('markiert gegnerische Zielkarten und stiehlt eine Karte direkt aus dem Schlangenbereich', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const farbendieb = sonderkarte('farbendieb-r183', 'Farbendieb')
    zustand.spieler[0].hand = [farbendieb]
    zustand.spieler[0].schlangen = [{
      id: 'eigene-schlange-r183',
      zustand: 'aktiv',
      karten: [farbkarte('gruen-r183-eigen', 'Grün', 2)],
    }]
    zustand.spieler[1].hand = []
    zustand.spieler[1].schlangen = [{
      id: 'gegner-schlange-r183',
      zustand: 'aktiv',
      karten: [farbkarte('rot-r183-beute', 'Rot', 7), farbkarte('blau-r183-bleibt', 'Blau', 3)],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getByRole('button', { name: /farbendieb-r183/ })
    const gegnerischeSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const zielkarte = within(gegnerischeSchlangen).getByRole('listitem', { name: /rot-r183-beute/ })
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const eigeneKarte = within(eigeneSchlangen).getByRole('listitem', { name: /gruen-r183-eigen/ })

    expect(zielkarte).not.toHaveClass('schlangekarte__karte--farbendieb-ziel')
    expect(eigeneKarte).not.toHaveClass('schlangekarte__karte--farbendieb-ziel')
    expect(within(zielkarte).queryByRole('group', { name: 'Farbendieb-Beutekorb für rot-r183-beute' })).toBeNull()

    fireEvent.click(handkarte)

    expect(zielkarte).toHaveClass('schlangekarte__karte--farbendieb-ziel')
    expect(eigeneKarte).not.toHaveClass('schlangekarte__karte--farbendieb-ziel')
    const beutekorb = within(zielkarte).getByRole('group', { name: 'Farbendieb-Beutekorb für rot-r183-beute' })
    expect(within(beutekorb).getAllByRole('button', { name: /Farbendieb-Beutekorb/ })).toHaveLength(2)
    expect(within(beutekorb).getByText('Platz 1')).toBeVisible()
    expect(within(beutekorb).getByText('Platz 2')).toBeVisible()
    const boardAktion = within(beutekorb).getByRole('button', {
      name: 'Farbendieb-Beutekorb mit Karte farbendieb-r183: rot-r183-beute in eigene-schlange-r183 an Platz 2 legen',
    })
    expect(boardAktion).toBeVisible()

    fireEvent.click(boardAktion)

    // M8b: Brettschritt-Stempel rendert die Konsequenz derselben Aktion ebenfalls
    // (1 Pille + N Stempel). Auf die Pille scoped, um Eindeutigkeit zu erzwingen.
    const aktionsPille = screen.getByTestId('waldtanz-letzte-aktion-hinweis')
    expect(within(aktionsPille).getByText(/^Zuletzt ausgeführt:$/)).toBeVisible()
    expect(within(aktionsPille).getByText(/Farbendieb mit Karte farbendieb-r183 von Spieler 2 \/ Schlange gegner-schlange-r183 Karte rot-r183-beute auf Schlange eigene-schlange-r183 an Position 2 spielen/)).toBeVisible()
    expect(within(gegnerischeSchlangen).queryByText('rot-r183-beute')).toBeNull()
    expect(within(eigeneSchlangen).getByText('rot-r183-beute')).toBeVisible()
    expect(within(gegnerischeSchlangen).getByText('blau-r183-bleibt')).toBeVisible()
  })

  it('legt einen sichtbaren Waldtanz-Zielstil für Farbendieb-Beutekarten ab', () => {
    const css = readFileSync('src/App.css', 'utf8')
    const zielBlock = css.match(/\.schlangekarte__karte--farbendieb-ziel \{[^}]+\}/)?.[0] ?? ''

    expect(zielBlock).toContain('Farbendieb-Ziele')
    expect(zielBlock).toContain('background: linear-gradient')
    expect(zielBlock).toContain('rgba(255, 188, 170')
  })
})
