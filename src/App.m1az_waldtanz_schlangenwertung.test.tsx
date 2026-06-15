/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1az macht den Wert jeder eigenen Schlange direkt auf der Waldtanz-Lichtung sichtbar.
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

function schlangenwertungZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('blau-wert-m1az', 'Blau', 2),
    farbkarte('blau-wert-2-m1az', 'Blau', 5),
    farbkarte('blau-wert-3-m1az', 'Blau', 4),
    sonderkarte('schutz-wert-m1az', 'Farbenschutz'),
    farbkarte('gruen-wert-m1az', 'Grün', 6),
  ], 'wertpfad-m1az')]
  return zustand
}

describe('M1az Waldtanz-Schlangenwertung', () => {
  it('zeigt Punktestand, Kartenlaenge und Status direkt auf der eigenen Schlangenplakette', () => {
    render(<App initialZustand={schlangenwertungZustand()} />)

    const eigeneSchlangen = within(screen.getByRole('region', { name: 'Schlangenbereich' })).getByRole('region', { name: 'Eigene Schlangen' })
    const schlangeButton = within(eigeneSchlangen).getByRole('button', { name: /wertpfad-m1az/ })
    const wertung = within(schlangeButton).getByLabelText('Schlangenwert wertpfad-m1az')

    expect(wertung).toHaveClass('schlangekarte__wertung')
    expect(within(wertung).getByText('Waldpfad-Wertung')).toBeVisible()
    expect(within(wertung).getByText('11 Punkte')).toHaveClass('schlangekarte__wertung-punkte')
    expect(within(wertung).queryByText('17 Punkte')).toBeNull()
    expect(within(wertung).getByText('5 Karten')).toBeVisible()
    expect(within(wertung).getByText('spielbereit')).toHaveClass('schlangekarte__wertung-status')
    expect(wertung.id).toMatch(/wertung/)
    expect(schlangeButton.getAttribute('aria-describedby')?.split(/\s+/)).toContain(wertung.id)
  })

  it('legt die Wertungsplakette als chunky Stitch-Spielobjekt statt Debugzeile ab', () => {
    expect(cssBlock('schlangekarte__wertung')).toMatch(/border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__wertung')).toMatch(/border-radius:\s*var\(--st-radius-md\)/)
    expect(cssBlock('schlangekarte__wertung')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__wertung')).toMatch(/background:\s*linear-gradient/)
    expect(cssBlock('schlangekarte__wertung-punkte')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(cssBlock('schlangekarte__wertung-status')).toMatch(/border-radius:\s*999px/)
  })
})
