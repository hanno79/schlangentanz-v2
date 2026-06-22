/**
 * Author: rahn
 * Datum: 21.06.2026
 * Version: 1.0
 * Beschreibung: M1cv verbindet das Waldtanz-Questband direkt mit dem Leuchtenden
 *              Waldstein: offene Questkarten erscheinen als bunte Pillen-Reihe
 *              unter dem Waldstein-Kopf, sind erfüllbar markiert und nur auf
 *              /game sichtbar. Reines Regressions-/Sichtbarkeits-Test, kein
 *              Engine-Refactor, kein neuer Aktionstyp.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase, type Spielkarte, type Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function cssPosition(selektor: string): number {
  const re = new RegExp(`\\.${selektor.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*\\{`, 'g')
  let lastIndex = -1
  let match: RegExpExecArray | null
  while ((match = re.exec(appCss)) !== null) {
    lastIndex = match.index
  }
  return lastIndex
}

function cssHas(selektor: string): boolean {
  return cssPosition(selektor) >= 0
}

function cssRule(selektor: string): string {
  const re = new RegExp(`\\.${selektor.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*\\{([^}]*)\\}`, 's')
  return appCss.match(re)?.[1] ?? ''
}

const roteKarte = (index: number): Spielkarte => ({
  typ: 'Farbkarte',
  id: `rot-quest-${index}`,
  farbe: 'Rot',
  punkte: index,
})

function zustandMitOffenenQuests(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  const farbkombination = aufgabenPool.find((aufgabe) => aufgabe.id === 'aufgabe-03')!
  const farbenpracht = aufgabenPool.find((aufgabe) => aufgabe.id === 'aufgabe-01')!
  const schlangenbeschwoerer = aufgabenPool.find((aufgabe) => aufgabe.id === 'aufgabe-07')!
  zustand.offeneAufgaben = [farbkombination, farbenpracht, schlangenbeschwoerer]
  zustand.aufgabenStapel = aufgabenPool.filter((aufgabe) => !['aufgabe-03', 'aufgabe-01', 'aufgabe-07'].includes(aufgabe.id))
  zustand.spieler[zustand.aktiverSpielerIndex].schlangen = [{
    id: 'questband-rot',
    zustand: 'aktiv',
    karten: [1, 2, 3, 4, 5].map(roteKarte),
  }]
  return zustand
}

function zustandMitErfuellterQuest(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  const farbkombination = aufgabenPool.find((aufgabe) => aufgabe.id === 'aufgabe-03')!
  const farbvielfalt = aufgabenPool.find((aufgabe) => aufgabe.id === 'aufgabe-04')!
  zustand.offeneAufgaben = [farbkombination, farbvielfalt]
  zustand.aufgabenStapel = aufgabenPool.filter((aufgabe) => !['aufgabe-03', 'aufgabe-04'].includes(aufgabe.id))
  zustand.spieler[zustand.aktiverSpielerIndex].schlangen = [{
    id: 'questband-erfuellt',
    zustand: 'aktiv',
    karten: [1, 2, 3, 4, 5].map(roteKarte),
  }]
  return zustand
}

function zustandOhneAufgaben(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  zustand.offeneAufgaben = []
  zustand.aufgabenStapel = []
  return zustand
}

describe('M1cv Waldtanz-Questband', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('rendert das Questband direkt unter dem Leuchtenden Waldstein-Kopf und vor der Schlangenlichtung', () => {
    render(<App initialZustand={zustandMitOffenenQuests()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const waldstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const questband = within(waldstein).getByRole('region', { name: 'Waldtanz-Questband' })
    const schlangenlichtung = within(waldstein).getByRole('region', { name: 'Schlangenlichtung' })

    expect(questband).not.toHaveAttribute('aria-label')
    expect(questband.getAttribute('aria-labelledby')).toBeTruthy()
    expect(questband.compareDocumentPosition(schlangenlichtung) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('zeigt alle offenen Quests als Pillen mit Namen, Fortschritt-Chips und Punkten', () => {
    render(<App initialZustand={zustandMitOffenenQuests()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const questband = within(spieltisch).getByRole('region', { name: 'Waldtanz-Questband' })
    const pillen = within(questband).getAllByRole('listitem')

    expect(pillen).toHaveLength(3)

    const farbkombination = pillen.find((pille) => within(pille).queryByText('Farbkombination'))
    const farbenpracht = pillen.find((pille) => within(pille).queryByText('Farbenpracht'))
    const schlangenbeschwoerer = pillen.find((pille) => within(pille).queryByText('Schlangenbeschwörer'))
    expect(farbkombination).toBeDefined()
    expect(farbenpracht).toBeDefined()
    expect(schlangenbeschwoerer).toBeDefined()

    const farbkombinationPunkte = within(farbkombination!).getByText(/Punkte/)
    expect(farbkombinationPunkte).toHaveTextContent('5')
    expect(farbkombination).toHaveTextContent(/Rot/)
    expect(farbkombination).toHaveTextContent(/5\/5/)

    expect(farbenpracht).toHaveTextContent(/Noch offen/)
  })

  it('markiert erfüllbare Quests deutlich als "Bereit" auf einer eigenen Pille', () => {
    render(<App initialZustand={zustandMitErfuellterQuest()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const questband = within(spieltisch).getByRole('region', { name: 'Waldtanz-Questband' })
    const pillen = within(questband).getAllByRole('listitem')
    const farbkombination = pillen.find((pille) => within(pille).queryByText('Farbkombination'))
    const farbvielfalt = pillen.find((pille) => within(pille).queryByText('Farbvielfalt'))

    expect(farbkombination).toHaveTextContent(/Bereit/)
    expect(within(farbkombination!).getByText(/Bereit/).closest('[class~="waldtanz-questband-pille"]'))
      .toHaveClass('waldtanz-questband-pille--bereit')

    expect(farbvielfalt).toHaveTextContent(/Noch offen/)
  })

  it('zeigt einen leeren Hinweis, wenn der Spieler gerade keine offenen Quests hat', () => {
    render(<App initialZustand={zustandOhneAufgaben()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const questband = within(spieltisch).getByRole('region', { name: 'Waldtanz-Questband' })
    expect(within(questband).queryAllByRole('listitem')).toHaveLength(0)
    expect(within(questband).getByText(/Keine offenen Quests/i)).toBeInTheDocument()
  })

  it('folgt dem Stitch-Stil mit 3px-Waldgrün-Border, Pillenform und Spielfeld-Token', () => {
    expect(cssHas('waldtanz-questband')).toBe(true)
    expect(cssHas('waldtanz-questband__liste')).toBe(true)
    expect(cssHas('waldtanz-questband-pille')).toBe(true)
    expect(cssHas('waldtanz-questband-pille--bereit')).toBe(true)
    expect(cssHas('waldtanz-questband-pille--offen')).toBe(true)
    expect(cssHas('waldtanz-questband-pille__punkte')).toBe(true)
    expect(cssHas('waldtanz-questband-pille__chips')).toBe(true)

    expect(cssRule('waldtanz-questband')).toMatch(/border-radius:\s*[\d.]+(?:px|rem|em)/)
    expect(cssRule('waldtanz-questband-pille')).toMatch(/border:\s*(?:3px|var\()/)
    expect(cssRule('waldtanz-questband-pille--bereit'))
      .toMatch(/background:|background-color:|radial-gradient/)
  })
})