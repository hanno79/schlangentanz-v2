/*
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M2o macht Schlangengrube-Spielerziele als körperliche Grubenfalle im Spielerrahmen spielbar.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { SonderkarteInfo } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const sonderkarte = (id: string, name: string): SonderkarteInfo => ({
  typ: 'Sonderkarte',
  id,
  name,
})

function grubenfalleZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('schlangengrube-m2o', 'Schlangengrube')]
  zustand.spieler[1].hand = []
  zustand.spieler[2].hand = []
  return zustand
}

function css() {
  return readFileSync('src/App.css', 'utf8')
}

describe('M2o Schlangengrube-Grubenfalle', () => {
  it('ersetzt den flachen Spielerziel-Button durch eine körperliche Grubenfalle und nutzt weiter die Engine-Aktion', () => {
    render(<App initialZustand={grubenfalleZustand()} />)

    const { handBereich, spieltisch } = ermittleSpielbereiche()
    const spielerrahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gegnerliste = within(spielerrahmen).getByRole('list', { name: 'Gegner am Tisch' })
    const gegnerSpieler2 = within(gegnerliste).getByText('Gegner: Spieler 2').closest('li') as HTMLElement

    expect(within(gegnerSpieler2).queryByRole('group', { name: /Schlangengrube-Grubenfalle/ })).toBeNull()

    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangengrube-m2o/ }))

    const grubenfalle = within(gegnerSpieler2).getByRole('group', {
      name: 'Schlangengrube-Grubenfalle für Spieler 2 mit Karte schlangengrube-m2o',
    })
    expect(grubenfalle).toHaveClass('schlangengrube-grubenfalle')
    expect(within(grubenfalle).getByText('Grubenfalle')).toBeVisible()
    expect(within(grubenfalle).getByText('Zauberkarte schlangengrube-m2o')).toBeVisible()
    expect(within(grubenfalle).getByText('Ziel: Spieler 2')).toBeVisible()
    expect(within(grubenfalle).getByText('verdeckte Karten werden verwirbelt')).toBeVisible()
    expect(within(gegnerSpieler2).queryByText('Schlangengrube hier spielen')).toBeNull()

    fireEvent.click(within(grubenfalle).getByRole('button', {
      name: 'Schlangengrube im Spielerrahmen mit Karte schlangengrube-m2o auf Spieler 2',
    }))

    expect(screen.getByText(/Zuletzt ausgeführt: Schlangengrube/)).toBeVisible()
  })

  it('legt den Google-Stitch-Spielobjektstil für die Grubenfalle ab', () => {
    const quelle = css()

    expect(quelle).toContain('.schlangengrube-grubenfalle {')
    expect(quelle).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong);')
    expect(quelle).toContain('border-radius: var(--st-radius-xl);')
    expect(quelle).toContain('box-shadow: var(--st-shadow-hard);')
    expect(quelle).toContain('radial-gradient(circle at 50% 35%')
    expect(quelle).toContain('.schlangengrube-grubenfalle__button {')
    expect(quelle).toContain('background: var(--st-color-tertiary-container);')
    expect(quelle).toContain('.schlangengrube-grubenfalle .schlangengrube-grubenfalle__button {')
  })
})
