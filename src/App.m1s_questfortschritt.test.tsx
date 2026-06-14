/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1s zeigt erfüllbare Questkarten direkt auf der Waldtanz-Aufgabentafel statt erst nach Phasenabschluss.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase, type Spielkarte, type Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

const roteKarte = (index: number): Spielkarte => ({
  typ: 'Farbkarte',
  id: `rot-quest-${index}`,
  farbe: 'Rot',
  punkte: index,
})

function zustandMitErfuellbarerQuest(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  const farbkombination = aufgabenPool.find(aufgabe => aufgabe.id === 'aufgabe-03')!
  const farbvielfalt = aufgabenPool.find(aufgabe => aufgabe.id === 'aufgabe-04')!
  zustand.offeneAufgaben = [farbkombination, farbvielfalt]
  zustand.aufgabenStapel = aufgabenPool.filter(aufgabe => !['aufgabe-03', 'aufgabe-04'].includes(aufgabe.id))
  zustand.spieler[zustand.aktiverSpielerIndex].schlangen = [{
    id: 'quest-schlange-rot',
    zustand: 'aktiv',
    karten: [1, 2, 3, 4, 5].map(roteKarte),
  }]
  return zustand
}

describe('M1s Questfortschritt auf der Waldtanz-Aufgabentafel', () => {
  it('markiert erfüllbare Questkarten als board-nahe Sammelziele und lässt offene Aufgaben unterscheidbar', () => {
    render(<App initialZustand={zustandMitErfuellbarerQuest()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const aufgabentafel = within(spieltisch).getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const questkarten = within(aufgabentafel).getAllByRole('listitem')
    const farbkombination = questkarten.find(karte => within(karte).queryByText('Farbkombination'))!
    const farbvielfalt = questkarten.find(karte => within(karte).queryByText('Farbvielfalt'))!

    expect(within(aufgabentafel).getByText('1 Quest bereit')).toHaveClass('waldtanz-aufgabentafel__bereit')
    expect(farbkombination).toHaveClass('waldtanz-questkarte--erfuellbar')
    expect(within(farbkombination).getByText('Bereit zum Einsammeln')).toHaveClass('waldtanz-questkarte__status', 'waldtanz-questkarte__status--bereit')
    expect(within(farbkombination).getByText('In der nächsten Aufgabenprüfung kassierst du diese Punkte.')).toBeVisible()
    expect(farbvielfalt).not.toHaveClass('waldtanz-questkarte--erfuellbar')
    expect(within(farbvielfalt).getByText('Noch offen')).toHaveClass('waldtanz-questkarte__status')

    expect(cssBlock('waldtanz-questkarte--erfuellbar')).toMatch(/border-color:\s*var\(--st-color-tertiary\)/)
    expect(cssBlock('waldtanz-questkarte--erfuellbar')).toMatch(/box-shadow:\s*0 6px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-questkarte__status--bereit')).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
  })
})
