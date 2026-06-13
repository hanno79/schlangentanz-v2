/*
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: R183 macht Farbendieb nach Sonderkarten-Auswahl board-nah auf gegnerischen Karten spielbar.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
    const gegnerischeSchlangen = within(schlangenbereich).getByRole('region', { name: 'Gegnerische Schlangen' })
    const zielkarte = within(gegnerischeSchlangen).getByRole('listitem', { name: /rot-r183-beute/ })
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const eigeneKarte = within(eigeneSchlangen).getByRole('listitem', { name: /gruen-r183-eigen/ })

    expect(zielkarte).not.toHaveClass('schlangekarte__karte--farbendieb-ziel')
    expect(eigeneKarte).not.toHaveClass('schlangekarte__karte--farbendieb-ziel')
    expect(within(zielkarte).queryByRole('button', { name: /Farbendieb im Schlangenbereich/ })).toBeNull()

    fireEvent.click(handkarte)

    expect(zielkarte).toHaveClass('schlangekarte__karte--farbendieb-ziel')
    expect(eigeneKarte).not.toHaveClass('schlangekarte__karte--farbendieb-ziel')
    const boardAktionen = within(zielkarte).getAllByRole('button', { name: /Farbendieb im Schlangenbereich/ })
    expect(boardAktionen).toHaveLength(2)
    expect(within(zielkarte).getByText('Farbendieb auf Position 1')).toBeVisible()
    expect(within(zielkarte).getByText('Farbendieb auf Position 2')).toBeVisible()
    const boardAktion = within(zielkarte).getByRole('button', {
      name: 'Farbendieb im Schlangenbereich mit Karte farbendieb-r183 von Schlange gegner-schlange-r183 Karte rot-r183-beute auf Schlange eigene-schlange-r183 an Position 2',
    })
    expect(boardAktion).toBeVisible()

    fireEvent.click(boardAktion)

    expect(screen.getByText('Zuletzt ausgeführt: Farbendieb mit Karte farbendieb-r183 von Spieler 2 / Schlange gegner-schlange-r183 Karte rot-r183-beute auf Schlange eigene-schlange-r183 an Position 2 spielen')).toBeVisible()
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
