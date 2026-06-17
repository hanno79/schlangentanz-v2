/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M2n macht Farbenfusion als körperlichen Rankenring auf dem Schlangenpfad sichtbar.
 */

import { readFileSync } from 'node:fs'
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

function farbenfusionRankenringZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbenfusion-m2n', 'Farbenfusion')]
  zustand.spieler[0].schlangen = [{
    id: 'fusion-pfad-m2n',
    zustand: 'aktiv',
    karten: [
      farbkarte('blau-m2n-a', 'Blau', 2),
      farbkarte('blau-m2n-b', 'Blau', 3),
      farbkarte('rot-m2n-c', 'Rot', 4),
    ],
  }]
  return zustand
}

describe('M2n Farbenfusion-Rankenring', () => {
  it('zeigt Farbenfusion als greifbaren Rankenring auf dem Kartenpaar und führt weiter über die Engine-Aktion aus', () => {
    render(<App initialZustand={farbenfusionRankenringZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbenfusion-m2n/ }))

    const erstePaarKarte = within(schlangenbereich).getByText('blau-m2n-a').closest('.schlangekarte__karte') as HTMLElement
    const zweitePaarKarte = within(schlangenbereich).getByText('blau-m2n-b').closest('.schlangekarte__karte') as HTMLElement
    const ring = within(erstePaarKarte).getByRole('group', { name: 'Farbenfusion-Rankenring für blau-m2n-a und blau-m2n-b' })

    expect(ring).toHaveClass('farbenfusion-rankenring')
    expect(within(ring).getByText('Farbenfusion-Rankenring')).toBeVisible()
    expect(within(ring).getByText('Zauberkarte farbenfusion-m2n')).toBeVisible()
    expect(within(ring).getByText('blau-m2n-a + blau-m2n-b')).toBeVisible()
    expect(within(ring).getByText('5 Punkte werden verschmolzen')).toBeVisible()
    expect(within(zweitePaarKarte).getByText('Rankenpartner')).toHaveClass('farbenfusion-rankenring__partner')
    expect(within(erstePaarKarte).queryByText('Paar fusionieren')).toBeNull()

    fireEvent.click(within(ring).getByRole('button', {
      name: 'Farbenfusion-Paar im Schlangenbereich mit Karte farbenfusion-m2n: blau-m2n-a und blau-m2n-b fusionieren',
    }))

    expect(screen.getByText('Zuletzt ausgeführt: Farbenfusion mit Karte farbenfusion-m2n auf Schlange fusion-pfad-m2n bei Karte blau-m2n-a spielen')).toBeVisible()
    expect(within(schlangenbereich).getByText('farbenfusion-m2n')).toBeVisible()
    expect(within(schlangenbereich).queryByText('blau-m2n-a')).toBeNull()
    expect(within(schlangenbereich).queryByText('blau-m2n-b')).toBeNull()
  })

  it('schützt den Stitch-CSS-Vertrag des Rankenrings gegen flache Textplaketten', () => {
    const css = readFileSync('src/App.css', 'utf8')

    expect(css).toContain('.farbenfusion-rankenring {')
    expect(css).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong);')
    expect(css).toContain('border-radius: var(--st-radius-xl);')
    expect(css).toContain('box-shadow: var(--st-shadow-hard);')
    expect(css).toContain('.farbenfusion-rankenring__button {')
    expect(css).toContain('background: var(--st-color-secondary-container);')
  })
})
