/*
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M2e macht Schlangengrube nach Handkarten-Auswahl direkt am Spielerrahmen spielbar.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { SonderkarteInfo } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const sonderkarte = (id: string, name: string): SonderkarteInfo => ({
  typ: 'Sonderkarte',
  id,
  name,
})

function cssBlock(selektor: string) {
  const css = readFileSync('src/App.css', 'utf8')
  return css.match(new RegExp(`${selektor.replaceAll('.', '\\.') }\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M2e Schlangengrube-Spielerziel', () => {
  it('macht eine ausgewählte Schlangengrube direkt auf Gegnerplaketten im Spielerrahmen ausführbar', () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
    const scrollIntoViewSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    const schlangengrube = sonderkarte('schlangengrube-m2e', 'Schlangengrube')
    zustand.spieler[0].hand = [schlangengrube]
    zustand.spieler[1].hand = []
    zustand.spieler[2].hand = []

    render(<App initialZustand={zustand} />)

    const { handBereich, spieltisch } = ermittleSpielbereiche()
    const spielerrahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gegnerliste = within(spielerrahmen).getByRole('list', { name: 'Gegner am Tisch' })
    const gegnerSpieler2 = within(gegnerliste).getByText('Gegner: Spieler 2').closest('li') as HTMLElement
    const gegnerSpieler3 = within(gegnerliste).getByText('Gegner: Spieler 3').closest('li') as HTMLElement

    expect(gegnerSpieler2).not.toHaveClass('waldtanz-spielerrahmen__gegnerplatz--grubenziel')
    expect(within(gegnerSpieler2).queryByRole('button', { name: /Schlangengrube im Spielerrahmen/ })).toBeNull()

    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangengrube-m2e/ }))

    expect(gegnerSpieler2).toHaveClass('waldtanz-spielerrahmen__gegnerplatz--grubenziel')
    expect(gegnerSpieler3).toHaveClass('waldtanz-spielerrahmen__gegnerplatz--grubenziel')
    const grubenfalle = within(gegnerSpieler2).getByRole('group', {
      name: 'Schlangengrube-Grubenfalle für Spieler 2 mit Karte schlangengrube-m2e',
    })
    expect(within(grubenfalle).getByText('Grubenfalle')).toBeVisible()
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: 'center', inline: 'nearest' })
    const zielButton = within(grubenfalle).getByRole('button', {
      name: 'Schlangengrube im Spielerrahmen mit Karte schlangengrube-m2e auf Spieler 2',
    })

    fireEvent.click(zielButton)

    expect(screen.getByText('Zuletzt ausgeführt: Schlangengrube mit Karte schlangengrube-m2e auf Spieler 2 spielen')).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Aktionen' })).getByRole('button', { name: 'Ausspielphase beenden' })).toBeVisible()
    scrollIntoViewSpy.mockRestore()
  })

  it('blendet Schlangengrube-Spielerziele während eines KI-Zugs aus', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.spieler[0].steuerung = 'KI'
    zustand.spieler[0].hand = [sonderkarte('schlangengrube-m2e-ki', 'Schlangengrube')]

    render(<App initialZustand={zustand} />)

    const { handBereich, spieltisch } = ermittleSpielbereiche()
    const spielerrahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gegnerliste = within(spielerrahmen).getByRole('list', { name: 'Gegner am Tisch' })
    const gegnerSpieler2 = within(gegnerliste).getByText('Gegner: Spieler 2').closest('li') as HTMLElement

    // H3: Die KI-Hand ist verdeckt — die Kartenschaltfläche existiert nicht, das Spielerziel bleibt aus.
    expect(within(handBereich).queryByRole('button', { name: /schlangengrube-m2e-ki/ })).toBeNull()

    expect(gegnerSpieler2).not.toHaveClass('waldtanz-spielerrahmen__gegnerplatz--grubenziel')
    expect(within(gegnerSpieler2).queryByRole('button', { name: /Schlangengrube im Spielerrahmen/ })).toBeNull()
  })

  it('legt den sichtbaren Waldtanz-Zielstil für Grubenziele im Spielerrahmen ab', () => {
    const platzBlock = cssBlock('.waldtanz-spielerrahmen__gegnerplatz--grubenziel')
    const quelle = readFileSync('src/App.css', 'utf8')

    expect(platzBlock).toContain('Schlangengrube-Spielerziel')
    expect(platzBlock).toContain('background: linear-gradient')
    expect(quelle).toContain('.schlangengrube-grubenfalle {')
    expect(quelle).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong)')
    expect(quelle).toContain('box-shadow: var(--st-shadow-hard)')
  })
})
