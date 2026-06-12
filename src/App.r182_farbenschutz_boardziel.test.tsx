/*
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R182 macht Farbenschutz nach Sonderkarten-Auswahl board-nah auf eigenen Schlangen spielbar.
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

describe('R182 Farbenschutz-Boardziel', () => {
  it('markiert eine eigene aktive Schlange und schützt sie direkt im Schlangenbereich', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const farbenschutz = sonderkarte('farbenschutz-r182', 'Farbenschutz')
    zustand.spieler[0].hand = [farbenschutz]
    zustand.spieler[0].schlangen = [{
      id: 'schlange-r182-schutz',
      zustand: 'aktiv',
      karten: [farbkarte('gruen-r182-a', 'Grün', 3)],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getByRole('button', { name: /farbenschutz-r182/ })
    const zielSchlange = within(schlangenbereich).getByRole('button', { name: /Schlange schlange-r182-schutz/ })

    expect(zielSchlange).not.toHaveClass('schlangekarte--farbenschutz-ziel')
    expect(within(zielSchlange).queryByRole('button', { name: /Farbenschutz im Schlangenbereich/ })).toBeNull()

    fireEvent.click(handkarte)

    expect(zielSchlange).toHaveClass('schlangekarte--farbenschutz-ziel')
    const boardAktion = within(zielSchlange).getByRole('button', {
      name: 'Farbenschutz im Schlangenbereich mit Karte farbenschutz-r182 auf Schlange schlange-r182-schutz',
    })
    expect(boardAktion).toBeVisible()
    expect(fireEvent.keyDown(boardAktion, { key: 'Enter' })).toBe(true)

    fireEvent.click(boardAktion)

    expect(screen.getByText('Zuletzt ausgeführt: Farbenschutz mit Karte farbenschutz-r182 auf Schlange schlange-r182-schutz spielen')).toBeVisible()
    expect(within(schlangenbereich).getByText('Status: geschützt')).toBeVisible()
  })

  it('legt einen sichtbaren Waldtanz-Zielstil für den Schlangen-Schutz ab', () => {
    const css = readFileSync('src/App.css', 'utf8')

    const zielBlock = css.match(/\.schlangekarte--farbenschutz-ziel \{[^}]+\}/)?.[0] ?? ''

    expect(zielBlock).toContain('Farbenschutz-Ziele')
    expect(zielBlock).toContain('background: linear-gradient')
    expect(zielBlock).toContain('rgba(164, 222, 2')
    const handButtonBlock = css.match(/\.handkarte__button \{[^}]+\}/)?.[0] ?? ''

    expect(handButtonBlock).toContain('scroll-margin-bottom: 18rem')
  })
})
