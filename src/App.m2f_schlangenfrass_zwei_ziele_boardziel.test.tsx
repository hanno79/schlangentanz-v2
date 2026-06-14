/*
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M2f macht den Zwei-Ziel-Schlangenfrass auf gegnerischen Brettkarten board-nah ausführbar.
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

describe('M2f Schlangenfrass-Zwei-Ziele-Boardziel', () => {
  it('wählt zwei gegnerische Karten direkt im Schlangenbereich und führt Schlangenfrass aus', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangenfrass-m2f', 'Schlangenfrass')]
    zustand.spieler[0].schlangen = [{ id: 'eigene-schlange-m2f', zustand: 'aktiv', karten: [farbkarte('eigene-m2f', 'Grün', 2)] }]
    zustand.spieler[1].schlangen = [{ id: 'gegner-a-m2f', zustand: 'aktiv', karten: [farbkarte('rot-gegner-m2f', 'Rot', 1)] }]
    zustand.spieler[2].schlangen = [{ id: 'gegner-b-m2f', zustand: 'aktiv', karten: [farbkarte('blau-gegner-m2f', 'Blau', 1)] }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-m2f/ }))

    const gegnerischeSchlangen = within(schlangenbereich).getByRole('region', { name: 'Gegnerische Schlangen' })
    const erstesZiel = within(gegnerischeSchlangen).getByText('rot-gegner-m2f').closest('.schlangekarte__karte')!
    const zweitesZiel = within(gegnerischeSchlangen).getByText('blau-gegner-m2f').closest('.schlangekarte__karte')!

    expect(erstesZiel).toHaveClass('schlangekarte__karte--schlangenfrass-ziel')
    expect(zweitesZiel).toHaveClass('schlangekarte__karte--schlangenfrass-ziel')
    const ersterPick = within(erstesZiel as HTMLElement).getByRole('button', {
      name: 'Schlangenfrass-Ziel 1 im Schlangenbereich wählen: rot-gegner-m2f',
    })
    expect(ersterPick).toBeVisible()

    fireEvent.click(ersterPick)

    expect(erstesZiel).toHaveClass('schlangekarte__karte--schlangenfrass-ausgewaehlt')
    expect(screen.getByText('Erstes Ziel: rot-gegner-m2f. Wähle eine zweite gegnerische Karte.')).toBeVisible()
    const frassAusfuehren = within(zweitesZiel as HTMLElement).getByRole('button', {
      name: 'Schlangenfrass im Schlangenbereich mit Karte schlangenfrass-m2f auf Karten rot-gegner-m2f und blau-gegner-m2f',
    })
    expect(frassAusfuehren).toBeVisible()

    fireEvent.click(frassAusfuehren)

    expect(screen.getByText('Zuletzt ausgeführt: Schlangenfrass mit Karte schlangenfrass-m2f: Karte rot-gegner-m2f aus Schlange gegner-a-m2f und Karte blau-gegner-m2f aus Schlange gegner-b-m2f entfernen')).toBeVisible()
    expect(within(schlangenbereich).queryByText('rot-gegner-m2f')).toBeNull()
    expect(within(schlangenbereich).queryByText('blau-gegner-m2f')).toBeNull()
    expect(within(schlangenbereich).getByText('eigene-m2f')).toBeVisible()
  })

  it('legt einen sichtbaren Waldtanz-Zielstil für zweiteilige Schlangenfrass-Ziele ab', () => {
    const css = readFileSync('src/App.css', 'utf8')
    const zielBlock = css.match(/\.schlangekarte__karte--schlangenfrass-ausgewaehlt \{[^}]+\}/)?.[0] ?? ''
    const kompassBlock = css.match(/\.schlangenfrass-zweiziel-kompass \{[^}]+\}/)?.[0] ?? ''

    expect(zielBlock).toContain('outline: 4px solid var(--st-color-secondary-container)')
    expect(kompassBlock).toContain('border: 3px solid var(--st-color-border-strong)')
    expect(kompassBlock).toContain('box-shadow: var(--st-shadow-hard)')
  })
})
