/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1m macht Links-/Rechts-Anlegen als sichtbare Waldtanz-Anlegeplätze am Schlangenpfad statt kleiner Textbuttons greifbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function anlegeplaetzeZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1m', 'Blau', 4)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('start-m1m', 'Blau', 2)], 'pfad-m1m')]
  return zustand
}

describe('M1m Waldtanz-Anlegeplätze', () => {
  it('zeigt Links/Rechts-Anlegen als echte board-nahe Endplätze und führt den bestehenden Engine-Pfad aus', () => {
    render(<App initialZustand={anlegeplaetzeZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /blau-m1m/ }))

    const eigeneSchlange = within(schlangenbereich).getByRole('button', { name: /Schlange pfad-m1m/ })
    const anlegeplaetze = within(eigeneSchlange).getByLabelText('Waldtanz-Anlegeplätze für pfad-m1m')
    const links = within(anlegeplaetze).getByRole('button', { name: 'Schlangenbereich: Karte blau-m1m links anlegen' })
    const rechts = within(anlegeplaetze).getByRole('button', { name: 'Schlangenbereich: Karte blau-m1m rechts anlegen' })

    expect(anlegeplaetze).toHaveClass('schlangekarte__anlegeplaetze')
    expect(links).toHaveClass('schlangekarte__anlegeplatz', 'schlangekarte__anlegeplatz--links')
    expect(rechts).toHaveClass('schlangekarte__anlegeplatz', 'schlangekarte__anlegeplatz--rechts')
    expect(within(links).getByText('Linkes Ende')).toBeVisible()
    expect(within(rechts).getByText('Rechtes Ende')).toBeVisible()
    expect(within(links).getByText('blau-m1m')).toHaveClass('schlangekarte__anlegeplatz-karte')
    expect(within(rechts).getByText('Karte dort anlegen')).toBeVisible()

    fireEvent.click(rechts)

    expect(screen.getByText('Zuletzt ausgeführt: Karte blau-m1m an Schlange pfad-m1m rechts anlegen')).toBeVisible()
    expect(within(screen.getByRole('list', { name: 'Kartenreihe pfad-m1m' })).getByLabelText(/Farbkarte blau-m1m/)).toBeVisible()
  })

  it('legt die Stitch-Endplatz-Optik mit Zielrinne, 3px-Rand und Hard Shadow ab', () => {
    expect(cssBlock('schlangekarte__anlegeplaetze')).toMatch(/display:\s*grid/)
    expect(cssBlock('schlangekarte__anlegeplaetze')).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(cssBlock('schlangekarte__anlegeplatz')).toMatch(/border:\s*var\(--st-border-width-chunky\) dashed var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__anlegeplatz')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__anlegeplatz')).toMatch(/border-radius:\s*1\.5rem/)
    expect(appCss).toMatch(/\.schlangekarte__anlegeplatz--links[\s\S]*transform:\s*rotate\(-2deg\)/)
    expect(appCss).toMatch(/\.schlangekarte__anlegeplatz--rechts[\s\S]*transform:\s*rotate\(2deg\)/)
  })
})
