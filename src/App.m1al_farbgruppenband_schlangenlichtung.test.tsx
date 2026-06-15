/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1al zeigt Farbgruppen- und Questnähe direkt auf der Schlangenlichtung statt nur in Nebenlisten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function farbgruppenbandZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const farbkombination = aufgabenPool.find((aufgabe) => aufgabe.name === 'Farbkombination')
  if (!farbkombination) throw new Error('Testsetup erwartet die Engine-Aufgabe Farbkombination.')
  zustand.offeneAufgaben = [farbkombination]
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('blau-gruppe-1-m1al', 'Blau', 2),
    farbkarte('blau-gruppe-2-m1al', 'Blau', 3),
    farbkarte('blau-gruppe-3-m1al', 'Blau', 4),
    farbkarte('rot-unterbrecher-m1al', 'Rot', 6),
  ], 'farbpfad-m1al')]
  return zustand
}

describe('M1al Waldtanz-Farbgruppenband', () => {
  it('zeigt Farbgruppen- und Questnähe direkt an der eigenen Schlangenreihe', () => {
    render(<App initialZustand={farbgruppenbandZustand()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const farbgruppenband = within(eigeneSchlangen).getByRole('group', { name: 'Farbgruppenband für Schlange farbpfad-m1al' })

    expect(farbgruppenband).toHaveClass('waldtanz-farbgruppenband')
    expect(farbgruppenband.closest('[role="button"]')).toBeNull()
    expect(within(farbgruppenband).getByText('Blau-Gruppe ×3')).toHaveClass('waldtanz-farbgruppenband__chip')
    expect(within(farbgruppenband).getByText('Karten 1–3')).toBeVisible()
    expect(within(farbgruppenband).getByText('Farbkombination: noch 2 Karten')).toHaveClass('waldtanz-farbgruppenband__quest')

    const kartenreihe = within(eigeneSchlangen).getByRole('list', { name: 'Kartenreihe farbpfad-m1al' })
    expect(kartenreihe.compareDocumentPosition(farbgruppenband) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('meldet Farbkombination bereit, wenn fünf gleichfarbige Karten in einer Schlange liegen', () => {
    const zustand = farbgruppenbandZustand()
    zustand.spieler[0].schlangen = [schlange([
      farbkarte('blau-split-1-m1al', 'Blau', 2),
      farbkarte('blau-split-2-m1al', 'Blau', 3),
      farbkarte('blau-split-3-m1al', 'Blau', 4),
      farbkarte('rot-split-m1al', 'Rot', 6),
      farbkarte('blau-split-4-m1al', 'Blau', 5),
      farbkarte('blau-split-5-m1al', 'Blau', 7),
    ], 'split-farbpfad-m1al')]

    render(<App initialZustand={zustand} />)

    const eigeneSchlangen = within(screen.getByRole('region', { name: 'Schlangenbereich' })).getByRole('region', { name: 'Eigene Schlangen' })
    const farbgruppenband = within(eigeneSchlangen).getByRole('group', { name: 'Farbgruppenband für Schlange split-farbpfad-m1al' })

    expect(within(farbgruppenband).getByText('Blau-Gruppe ×3')).toBeVisible()
    expect(within(farbgruppenband).getByText('Farbkombination bereit')).toHaveClass('waldtanz-farbgruppenband__quest')
    expect(within(farbgruppenband).queryByText(/Farbkombination: noch/)).toBeNull()
  })

  it('legt das Farbgruppenband als chunky Waldtanz-Brettplakette ab', () => {
    expect(cssBlock('waldtanz-farbgruppenband')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-farbgruppenband')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('waldtanz-farbgruppenband')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-farbgruppenband__chip')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('waldtanz-farbgruppenband__quest')).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
  })
})
