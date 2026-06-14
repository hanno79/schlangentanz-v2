/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1t macht erfüllte Questkarten direkt auf der Waldtanz-Aufgabentafel einsammelbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase, type Spielkarte, type Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

const roteKarte = (index: number): Spielkarte => ({
  typ: 'Farbkarte',
  id: `rot-m1t-${index}`,
  farbe: 'Rot',
  punkte: index,
})

function zustandMitSammelbarerQuest(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  const farbkombination = aufgabenPool.find(aufgabe => aufgabe.id === 'aufgabe-03')!
  const farbvielfalt = aufgabenPool.find(aufgabe => aufgabe.id === 'aufgabe-04')!
  zustand.zugphase = 'Aufgabenpruefung'
  zustand.zugpflichten.gespielteKarten = 1
  zustand.offeneAufgaben = [farbkombination, farbvielfalt]
  zustand.aufgabenStapel = aufgabenPool.filter(aufgabe => !['aufgabe-03', 'aufgabe-04'].includes(aufgabe.id))
  zustand.spieler[zustand.aktiverSpielerIndex].schlangen = [{
    id: 'quest-schlange-m1t',
    zustand: 'aktiv',
    karten: [1, 2, 3, 4, 5].map(roteKarte),
  }]
  return zustand
}

function kiZustandMitSammelbarerQuest(): Spielzustand {
  const zustand = zustandMitSammelbarerQuest()
  zustand.spieler[zustand.aktiverSpielerIndex].steuerung = 'KI'
  return zustand
}

describe('M1t Questkarte auf der Waldtanz-Aufgabentafel einsammeln', () => {
  it('führt die Aufgabenprüfung direkt von der erfüllten Questkarte aus und zeigt die eingesammelte Aufgabe', () => {
    render(<App initialZustand={zustandMitSammelbarerQuest()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const aufgabentafel = within(spieltisch).getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const farbkombination = within(aufgabentafel).getByText('Farbkombination').closest('li') as HTMLElement
    const farbvielfalt = within(aufgabentafel).getByText('Farbvielfalt').closest('li') as HTMLElement

    expect(farbkombination).toHaveClass('waldtanz-questkarte--erfuellbar')
    expect(within(farbkombination).getByRole('button', { name: 'Questkarte Farbkombination einsammeln' })).toHaveClass('waldtanz-questkarte__sammelbutton')
    expect(within(farbvielfalt).queryByRole('button', { name: /Questkarte .* einsammeln/ })).toBeNull()

    fireEvent.click(within(farbkombination).getByRole('button', { name: 'Questkarte Farbkombination einsammeln' }))

    expect(within(spieltisch).getByRole('region', { name: 'Zugkompass' })).toHaveTextContent('Zug abschließen')
    expect(screen.getByRole('region', { name: 'Spielerübersicht' })).toHaveTextContent('Spieler 1 — erfüllte Aufgaben: Farbkombination (5 Punkte)')
    expect(screen.getByText('Zuletzt ausgeführt: Aufgabenprüfung beenden')).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Waldtanz-Aufgabentafel' })).queryByText('Farbkombination')).toBeNull()

    expect(cssBlock('waldtanz-questkarte__sammelbutton')).toMatch(/border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-questkarte__sammelbutton')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-questkarte__sammelbutton')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('waldtanz-questkarte__sammelbutton')).not.toMatch(/--st-color-on-background/)
  })

  it('blendet den direkten Sammelbutton im KI-Zug aus, obwohl erfüllte Quests sichtbar bleiben', () => {
    render(<App initialZustand={kiZustandMitSammelbarerQuest()} />)

    const aufgabentafel = screen.getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const farbkombination = within(aufgabentafel).getByText('Farbkombination').closest('li') as HTMLElement

    expect(farbkombination).toHaveClass('waldtanz-questkarte--erfuellbar')
    expect(within(farbkombination).getByText('Bereit zum Einsammeln')).toBeVisible()
    expect(within(farbkombination).queryByRole('button', { name: /Questkarte Farbkombination einsammeln/ })).toBeNull()
  })
})
