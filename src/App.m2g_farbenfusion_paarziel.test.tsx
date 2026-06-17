/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M2g macht Farbenfusion als sichtbares Kartenpaar im Waldtanz-Brett spielbar, nicht nur als Einzelbutton.
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

function farbenfusionPaarZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbenfusion-m2g', 'Farbenfusion')]
  zustand.spieler[0].schlangen = [{
    id: 'fusion-pfad-m2g',
    zustand: 'aktiv',
    karten: [
      farbkarte('blau-m2g-a', 'Blau', 2),
      farbkarte('blau-m2g-b', 'Blau', 3),
      farbkarte('rot-m2g-c', 'Rot', 4),
    ],
  }]
  return zustand
}

describe('M2g Farbenfusion-Paarziel', () => {
  it('hebt beide Karten des legalen Farbenfusion-Paares hervor und führt die Paaraktion board-nah aus', () => {
    render(<App initialZustand={farbenfusionPaarZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const erstePaarKarte = within(schlangenbereich).getByText('blau-m2g-a').closest('.schlangekarte__karte') as HTMLElement
    const zweitePaarKarte = within(schlangenbereich).getByText('blau-m2g-b').closest('.schlangekarte__karte') as HTMLElement
    const nichtPaarKarte = within(schlangenbereich).getByText('rot-m2g-c').closest('.schlangekarte__karte') as HTMLElement

    fireEvent.click(within(handBereich).getByRole('button', { name: /farbenfusion-m2g/ }))

    expect(erstePaarKarte).toHaveClass('schlangekarte__karte--farbenfusion-ziel')
    expect(erstePaarKarte).toHaveClass('schlangekarte__karte--farbenfusion-paar')
    expect(zweitePaarKarte).toHaveClass('schlangekarte__karte--farbenfusion-paar')
    expect(nichtPaarKarte).not.toHaveClass('schlangekarte__karte--farbenfusion-paar')
    const rankenring = within(erstePaarKarte).getByRole('group', { name: 'Farbenfusion-Rankenring für blau-m2g-a und blau-m2g-b' })
    expect(rankenring).toHaveClass('farbenfusion-rankenring')
    expect(within(rankenring).getByText('5 Punkte werden verschmolzen')).toBeVisible()
    expect(within(zweitePaarKarte).getByText('Rankenpartner')).toBeVisible()

    fireEvent.click(within(rankenring).getByRole('button', {
      name: 'Farbenfusion-Paar im Schlangenbereich mit Karte farbenfusion-m2g: blau-m2g-a und blau-m2g-b fusionieren',
    }))

    expect(screen.getByText('Zuletzt ausgeführt: Farbenfusion mit Karte farbenfusion-m2g auf Schlange fusion-pfad-m2g bei Karte blau-m2g-a spielen')).toBeVisible()
    expect(within(schlangenbereich).getByText('farbenfusion-m2g')).toBeVisible()
    expect(within(schlangenbereich).queryByText('blau-m2g-a')).toBeNull()
    expect(within(schlangenbereich).queryByText('blau-m2g-b')).toBeNull()
  })
})
