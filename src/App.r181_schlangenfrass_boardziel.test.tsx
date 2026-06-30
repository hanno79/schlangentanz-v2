/*
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R181 macht Schlangenfrass-Zielkarten nach Sonderkarten-Auswahl board-nah spielbar.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
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

describe('R181 Schlangenfrass-Boardziel', () => {
  beforeEach(() => { window.history.pushState({}, '', '/game') })

  it('markiert eigene Zielkarten und führt Schlangenfrass direkt im Schlangenbereich aus', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const schlangenfrass = sonderkarte('schlangenfrass-r181', 'Schlangenfrass')
    zustand.spieler[0].hand = [schlangenfrass]
    zustand.spieler[0].schlangen = [{
      id: 'schlange-r181-frass',
      zustand: 'aktiv',
      karten: [
        farbkarte('rot-r181-ziel', 'Rot', 1),
        farbkarte('blau-r181-bleibt', 'Blau', 1),
      ],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getByRole('button', { name: /schlangenfrass-r181/ })
    const zielkarte = within(schlangenbereich).getByText('rot-r181-ziel').closest('.schlangekarte__karte')!

    expect(zielkarte).not.toHaveClass('schlangekarte__karte--schlangenfrass-ziel')
    expect(within(zielkarte as HTMLElement).queryByRole('button', { name: /Schlangenfrass im Schlangenbereich/ })).toBeNull()

    fireEvent.click(handkarte)

    expect(zielkarte).toHaveClass('schlangekarte__karte--schlangenfrass-ziel')
    const boardAktion = within(zielkarte as HTMLElement).getByRole('button', {
      name: 'Schlangenfrass im Schlangenbereich mit Karte schlangenfrass-r181 auf Karte rot-r181-ziel',
    })
    expect(boardAktion).toBeVisible()

    fireEvent.click(boardAktion)

    // M8b: Brettschritt-Stempel rendert die Konsequenz derselben Aktion ebenfalls
    // (1 Pille + N Stempel). Auf die Pille scoped, um Eindeutigkeit zu erzwingen.
    const aktionsPille = screen.getByTestId('waldtanz-letzte-aktion-hinweis')
    expect(within(aktionsPille).getByText(/^Zuletzt ausgeführt:$/)).toBeVisible()
    expect(within(aktionsPille).getByText(/Schlangenfrass mit Karte schlangenfrass-r181: Karte rot-r181-ziel aus Schlange schlange-r181-frass entfernen/)).toBeVisible()
    expect(within(schlangenbereich).queryByText('rot-r181-ziel')).toBeNull()
    expect(within(schlangenbereich).getByText('blau-r181-bleibt')).toBeVisible()
  })

  it('bietet Zwei-Gegner-Zielauswahl als vorbereitende Boardauswahl statt Einzelkarten-Sofortaktion an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangenfrass-r181-zwei-ziele', 'Schlangenfrass')]
    zustand.spieler[0].schlangen = []
    zustand.spieler[1].schlangen = [{ id: 'gegner-a-r181', zustand: 'aktiv', karten: [farbkarte('rot-gegner-r181', 'Rot', 1)] }]
    zustand.spieler[2].schlangen = [{ id: 'gegner-b-r181', zustand: 'aktiv', karten: [farbkarte('blau-gegner-r181', 'Blau', 1)] }]

    render(<App initialZustand={zustand} />)

    const { handBereich } = ermittleSpielbereiche()
    const gegnerlicheSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-r181-zwei-ziele/ }))

    // M8b: Mit State-Lift in WaldtanzGegnerlichtung sieht BEIDE
    // GegnerSchlangenListe-Instanzen das ausgewaehlte Ziel. Vor Klick:
    // beide Listen zeigen je 1 erstes-Ziel-Bissspur = 2 total.
    expect(within(gegnerlicheSchlangen).getAllByRole('button', { name: /Schlangenfrass-Ziel 1 im Schlangenbereich wählen/ })).toHaveLength(2)
    expect(within(gegnerlicheSchlangen).queryByRole('button', { name: /Schlangenfrass im Schlangenbereich mit Karte/ })).toBeNull()
    fireEvent.click(within(gegnerlicheSchlangen).getByRole('button', { name: /rot-gegner-r181/ }))
    // M8b: Nach Klick auf Spieler-1-Ziel sieht Spieler-2-Liste das aktive
    // Ziel-1 und bietet die Sofortaktion an.
    expect(within(gegnerlicheSchlangen).getByRole('button', { name: /auf Karten rot-gegner-r181 und blau-gegner-r181/ })).toBeVisible()
  })
})
