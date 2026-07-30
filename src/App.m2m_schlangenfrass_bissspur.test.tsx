/*
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M2m macht Schlangenfrass-Ziele als körperliche Waldtanz-Bissspuren statt generischer Textbuttons spielbar.
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

function eigenesFrassZielZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('schlangenfrass-m2m', 'Schlangenfrass')]
  zustand.spieler[0].schlangen = [{
    id: 'eigene-bissspur-m2m',
    zustand: 'aktiv',
    karten: [farbkarte('rot-bissspur-m2m', 'Rot', 1), farbkarte('blau-bleibt-m2m', 'Blau', 1)],
  }]
  return zustand
}

function zweiGegnerFrassZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('schlangenfrass-zwei-m2m', 'Schlangenfrass')]
  zustand.spieler[0].schlangen = [{ id: 'eigene-schlange-m2m', zustand: 'aktiv', karten: [farbkarte('eigene-m2m', 'Grün', 2)] }]
  zustand.spieler[1].schlangen = [{ id: 'gegner-a-bissspur-m2m', zustand: 'aktiv', karten: [farbkarte('rot-gegner-bissspur-m2m', 'Rot', 1)] }]
  zustand.spieler[2].schlangen = [{ id: 'gegner-b-bissspur-m2m', zustand: 'aktiv', karten: [farbkarte('blau-gegner-bissspur-m2m', 'Blau', 1)] }]
  return zustand
}

describe('M2m Schlangenfrass-Bissspur', () => {
  beforeEach(() => { window.history.pushState({}, '', '/game') })

  it('ersetzt das eigene Einzelziel durch eine körperliche Bissspur und nutzt weiter die Engine-Aktion', () => {
    render(<App initialZustand={eigenesFrassZielZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-m2m/ }))

    const zielkarte = within(schlangenbereich).getByRole('listitem', { name: /Farbkarte rot-bissspur-m2m/ }) as HTMLElement
    const bissspur = within(zielkarte).getByRole('group', { name: 'Schlangenfrass-Bissspur für rot-bissspur-m2m' })

    expect(bissspur).toHaveClass('schlangenfrass-bissspur')
    expect(within(bissspur).getByText('Schlangenfrass-Bissspur')).toBeVisible()
    expect(within(bissspur).getByText('Karte aus Schlange lösen')).toBeVisible()
    expect(within(zielkarte).queryByText('Schlangenfrass hier spielen')).toBeNull()

    fireEvent.click(within(bissspur).getByRole('button', {
      name: 'Schlangenfrass im Schlangenbereich mit Karte schlangenfrass-m2m auf Karte rot-bissspur-m2m',
    }))

    const letzteAktionHinweis = screen.getByTestId('waldtanz-letzte-aktion-hinweis')
    expect(within(letzteAktionHinweis).getByText('Zuletzt ausgeführt:')).toBeVisible()
    expect(within(letzteAktionHinweis).getByText(/Schlangenfrass/)).toBeVisible()
    expect(within(schlangenbereich).queryByText('rot-bissspur-m2m')).toBeNull()
    expect(within(schlangenbereich).getByText('blau-bleibt-m2m')).toBeVisible()
  })

  it('führt die Zwei-Gegner-Auswahl über erste und zweite Bissspur statt über generische Zielbuttons', () => {
    render(<App initialZustand={zweiGegnerFrassZustand()} />)

    const { handBereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-zwei-m2m/ }))

    const gegnerischeSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const erstesZiel = within(gegnerischeSchlangen).getByText('rot-gegner-bissspur-m2m').closest('.schlangekarte__karte') as HTMLElement
    const zweitesZiel = within(gegnerischeSchlangen).getByText('blau-gegner-bissspur-m2m').closest('.schlangekarte__karte') as HTMLElement
    const ersteBissspur = within(erstesZiel).getByRole('group', { name: 'Schlangenfrass-Bissspur für rot-gegner-bissspur-m2m' })

    expect(within(ersteBissspur).getByText('Erstes Ziel markieren')).toBeVisible()
    expect(within(erstesZiel).queryByText('Ziel 1 wählen')).toBeNull()
    fireEvent.click(within(ersteBissspur).getByRole('button', {
      name: 'Schlangenfrass-Ziel 1 im Schlangenbereich wählen: rot-gegner-bissspur-m2m',
    }))

    expect(screen.getByText('Erstes Ziel: rot-gegner-bissspur-m2m. Wähle eine zweite gegnerische Karte.')).toBeVisible()
    const zweiteBissspur = within(zweitesZiel).getByRole('group', { name: 'Schlangenfrass-Bissspur für blau-gegner-bissspur-m2m' })
    expect(within(zweiteBissspur).getByText('Zweite Bissspur schließen')).toBeVisible()
    expect(within(zweitesZiel).queryByText('Schlangenfrass mit 2 Zielen ausführen')).toBeNull()

    fireEvent.click(within(zweiteBissspur).getByRole('button', {
      name: 'Schlangenfrass im Schlangenbereich mit Karte schlangenfrass-zwei-m2m auf Karten rot-gegner-bissspur-m2m und blau-gegner-bissspur-m2m',
    }))

    const letzteAktionHinweis = screen.getByTestId('waldtanz-letzte-aktion-hinweis')
    expect(within(letzteAktionHinweis).getByText('Zuletzt ausgeführt:')).toBeVisible()
    expect(within(letzteAktionHinweis).getByText(/Schlangenfrass/)).toBeVisible()
  })

  it('legt den Stitch-Waldtanz-Stil für Bissspuren mit 3px-Rand und Hard Shadow ab', () => {
    const css = readFileSync('src/App.css', 'utf8')
    const bissspurBlock = css.match(/\.schlangenfrass-bissspur \{[^}]+\}/)?.[0] ?? ''
    const buttonBlock = css.match(/\.schlangenfrass-bissspur__button \{[^}]+\}/)?.[0] ?? ''
    const sichtbarerButtonBlock = css.match(/\.schlangenfrass-bissspur \.schlangenfrass-bissspur__button \{[^}]+\}/)?.[0] ?? ''

    expect(bissspurBlock).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong)')
    expect(bissspurBlock).toContain('box-shadow: var(--st-shadow-hard)')
    expect(bissspurBlock).toContain('border-radius: var(--st-radius-xl)')
    expect(buttonBlock).toContain('background: var(--st-color-tertiary-container)')
    expect(sichtbarerButtonBlock).toContain('background: var(--st-color-tertiary-container)')
  })
})
