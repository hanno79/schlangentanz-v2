/*
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R180 macht Farbenfusion-Zielpaare nach Sonderkarten-Auswahl board-nah spielbar.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

describe('R180 Farbenfusion-Boardziel', () => {
  it('markiert das passende Kartenpaar und führt die Farbenfusion direkt im Schlangenbereich aus', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const farbenfusion = sonderkarte('farbenfusion-r180', 'Farbenfusion')
    zustand.spieler[0].hand = [farbenfusion]
    zustand.spieler[0].schlangen = [{
      id: 'schlange-r180-fusion',
      zustand: 'aktiv',
      karten: [
        farbkarte('blau-r180-a', 'Blau', 1),
        farbkarte('blau-r180-b', 'Blau', 1),
        farbkarte('rot-r180-c', 'Rot', 1),
      ],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getByRole('button', { name: /farbenfusion-r180/ })
    const zielkarte = within(schlangenbereich).getByText('blau-r180-a').closest('.schlangekarte__karte')!

    expect(zielkarte).not.toHaveClass('schlangekarte__karte--farbenfusion-ziel')
    expect(within(zielkarte as HTMLElement).queryByRole('button', { name: /Farbenfusion im Schlangenbereich/ })).toBeNull()

    fireEvent.click(handkarte)

    expect(zielkarte).toHaveClass('schlangekarte__karte--farbenfusion-ziel')
    const boardAktion = within(zielkarte as HTMLElement).getByRole('button', {
      name: 'Farbenfusion im Schlangenbereich mit Karte farbenfusion-r180 bei Karte blau-r180-a',
    })
    expect(boardAktion).toBeVisible()
    expect(fireEvent.keyDown(boardAktion, { key: 'Enter' })).toBe(true)

    fireEvent.click(boardAktion)

    expect(screen.getByText('Zuletzt ausgeführt: Farbenfusion mit Karte farbenfusion-r180 auf Schlange schlange-r180-fusion bei Karte blau-r180-a spielen')).toBeVisible()
    expect(within(schlangenbereich).getByText('farbenfusion-r180')).toBeVisible()
    expect(within(schlangenbereich).queryByText('blau-r180-a')).toBeNull()
    expect(within(schlangenbereich).queryByText('blau-r180-b')).toBeNull()
  })
})
