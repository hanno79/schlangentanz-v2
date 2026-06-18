/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M2q macht Regenbogenschlangen als sichtbare Wildfarben-Karten im Waldtanz-Schlangenpfad verständlich.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function regenbogenWildpfadZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('blau-m2q-a', 'Blau', 2),
    sonderkarte('regenbogen-m2q-own', 'Regenbogenschlange'),
    farbkarte('blau-m2q-b', 'Blau', 3),
  ], 'regenbogen-pfad-m2q')]
  zustand.spieler[1].schlangen = [schlange([
    farbkarte('rot-m2q-a', 'Rot', 1),
    sonderkarte('regenbogen-m2q-gegner', 'Regenbogenschlange'),
    farbkarte('rot-m2q-b', 'Rot', 2),
  ], 'gegner-regenbogen-pfad-m2q')]
  return zustand
}

describe('M2q Regenbogenschlange-Wildpfad', () => {
  it('zeigt Regenbogenschlangen in eigenen und gegnerischen Schlangen als Wildfarben-Spielkarten statt generischer Sonderkarte', () => {
    render(<App initialZustand={regenbogenWildpfadZustand()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneReihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe regenbogen-pfad-m2q' })
    const gegnerReihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe gegner-regenbogen-pfad-m2q' })
    const eigeneRegenbogenkarte = within(eigeneReihe).getByLabelText('Sonderkarte regenbogen-m2q-own: Regenbogenschlange')
    const gegnerRegenbogenkarte = within(gegnerReihe).getByLabelText('Sonderkarte regenbogen-m2q-gegner: Regenbogenschlange')

    expect(eigeneRegenbogenkarte).toHaveClass('schlangekarte__karte--regenbogenpfad')
    expect(within(eigeneRegenbogenkarte).getByText('🌈')).toHaveClass('schlangekarte__karte-symbol')
    expect(within(eigeneRegenbogenkarte).getByText('Wildfarbe Blau')).toHaveClass('regenbogenpfad-chip')
    expect(within(eigeneRegenbogenkarte).getByText('Farbgruppen-Joker')).toHaveClass('regenbogenpfad-hinweis')
    expect(within(eigeneRegenbogenkarte).getByText('0 Punkte · verbindet Blau')).toHaveClass('schlangekarte__karte-wert')

    expect(gegnerRegenbogenkarte).toHaveClass('schlangekarte__karte--regenbogenpfad')
    expect(within(gegnerRegenbogenkarte).getByText('Wildfarbe Rot')).toBeVisible()
  })

  it('legt den Regenbogenpfad als Google-Stitch-Wildkartenobjekt mit 3px-Rand und Regenbogen-Chip ab', () => {
    expect(cssBlock('schlangekarte__karte--regenbogenpfad')).toMatch(/border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__karte--regenbogenpfad')).toMatch(/background:\s*conic-gradient/)
    expect(cssBlock('schlangekarte__karte--regenbogenpfad')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('regenbogenpfad-chip')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('regenbogenpfad-chip')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('regenbogenpfad-hinweis')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
  })
})
