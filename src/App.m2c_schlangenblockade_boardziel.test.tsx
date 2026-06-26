/*
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: M2c macht Schlangenblockade nach Sonderkarten-Auswahl direkt auf gegnerischen Schlangen board-nah spielbar.
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

describe('M2c Schlangenblockade-Boardziel', () => {
  beforeEach(() => { window.history.pushState({}, '', '/game') })

  it('markiert gegnerische Zielschlangen und blockiert direkt im Schlangenbereich', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const blockade = sonderkarte('schlangenblockade-m2c', 'Schlangenblockade')
    zustand.spieler[0].hand = [blockade]
    zustand.spieler[0].schlangen = [{
      id: 'eigene-schlange-m2c',
      zustand: 'aktiv',
      karten: [farbkarte('gruen-m2c-eigen', 'Grün', 2)],
    }]
    zustand.spieler[1].hand = []
    zustand.spieler[1].schlangen = [{
      id: 'gegner-schlange-m2c',
      zustand: 'aktiv',
      karten: [farbkarte('rot-m2c-ziel', 'Rot', 5)],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getByRole('button', { name: /schlangenblockade-m2c/ })
    const gegnerischeSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const zielschlange = within(gegnerischeSchlangen).getByText('gegner-schlange-m2c').closest('.schlangekarte')!
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })

    expect(zielschlange).not.toHaveClass('schlangekarte--blockade-ziel')
    expect(within(zielschlange as HTMLElement).queryByRole('button', { name: /Schlangenblockade im Schlangenbereich/ })).toBeNull()

    fireEvent.click(handkarte)

    expect(zielschlange).toHaveClass('schlangekarte--blockade-ziel')
    expect(within(eigeneSchlangen).getByText('eigene-schlange-m2c').closest('.schlangekarte')).not.toHaveClass('schlangekarte--blockade-ziel')
    const blockadeFessel = within(zielschlange as HTMLElement).getByRole('group', {
      name: 'Schlangenblockade-Fessel für gegner-schlange-m2c',
    })
    expect(within(blockadeFessel).getByText('Blockade-Fessel')).toBeVisible()
    expect(within(blockadeFessel).getByText('schlangenblockade-m2c')).toBeVisible()
    expect(within(blockadeFessel).getByText('Ziel: gegner-schlange-m2c')).toBeVisible()
    expect(within(blockadeFessel).getByText('Klick legt die Ranken um diese Schlange.')).toBeVisible()
    const boardAktion = within(blockadeFessel).getByRole('button', {
      name: 'Schlangenblockade-Fessel mit Karte schlangenblockade-m2c um Schlange gegner-schlange-m2c legen',
    })
    expect(boardAktion).toBeVisible()

    fireEvent.click(boardAktion)

    expect(screen.getByText('Zuletzt ausgeführt: Schlangenblockade mit Karte schlangenblockade-m2c auf Spieler 2 / Schlange gegner-schlange-m2c spielen')).toBeVisible()
    expect(within(zielschlange as HTMLElement).getByText('schlangenblockade-m2c')).toBeVisible()
    expect(within(zielschlange as HTMLElement).getByText('Sonderkarte Schlangenblockade')).toBeVisible()
  })

  it('legt einen sichtbaren Waldtanz-Zielstil für blockierbare Gegnerschlangen ab', () => {
    const css = readFileSync('src/App.css', 'utf8')
    const zielBlock = css.match(/\.schlangekarte--blockade-ziel \{[^}]+\}/)?.[0] ?? ''

    expect(zielBlock).toContain('Schlangenblockade-Ziele')
    expect(zielBlock).toContain('background: linear-gradient')
    expect(zielBlock).toContain('rgba(177, 45, 0')
    expect(css).toContain('.schlangenblockade-fessel {')
    expect(css).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong)')
    expect(css).toContain('border-radius: var(--st-radius-xl)')
    expect(css).toContain('box-shadow: 0 6px 0 var(--st-color-border-strong)')
    expect(css).not.toContain('--st-font-heading')
  })
})
