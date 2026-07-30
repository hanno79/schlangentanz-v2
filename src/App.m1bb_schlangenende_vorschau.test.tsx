/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1bb macht Schlangenenden nach Handkartenauswahl als körperliche Waldtanz-Anlegevorschau spielbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function schlangenendeZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('gelb-ende-m1bb', 'Gelb', 5)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('blau-start-m1bb', 'Blau', 2)], 'pfad-m1bb')]
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bb Schlangenende-Vorschau', () => {
  it('macht die ausgewählte Handkarte direkt an den Schlangenenden als Brettobjekt ausführbar', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={schlangenendeZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /gelb-ende-m1bb/ }))

    const eigeneSchlange = within(schlangenbereich).getByRole('button', { name: /Schlange pfad-m1bb/ })
    const anlegeplaetze = within(eigeneSchlange).getByLabelText('Waldtanz-Anlegeplätze für pfad-m1bb')
    const rechts = within(anlegeplaetze).getByRole('button', { name: 'Schlangenbereich: Karte gelb-ende-m1bb rechts anlegen' })
    const vorschau = within(rechts).getByText('Anlegekarte').closest('.schlangekarte__anlegeplatz-vorschau')

    expect(anlegeplaetze).toHaveClass('schlangekarte__anlegeplaetze', 'schlangekarte__anlegeplaetze--vorschau')
    expect(rechts).toHaveClass('schlangekarte__anlegeplatz', 'schlangekarte__anlegeplatz--ausgewaehlt')
    expect(vorschau).not.toBeNull()
    expect(vorschau).toHaveAttribute('id')
    expect(vorschau).not.toHaveAttribute('aria-label')
    expect(rechts.getAttribute('aria-describedby')?.split(/\s+/)).toContain((vorschau as HTMLElement).id)
    expect(within(vorschau as HTMLElement).getByText('gelb-ende-m1bb')).toHaveClass('schlangekarte__anlegeplatz-vorschau-id')
    expect(within(vorschau as HTMLElement).getByText('Klick legt die Karte rechts an.')).toBeVisible()
    expect(within(rechts).queryByText('Karte dort anlegen')).toBeNull()

    fireEvent.click(rechts)

    const zugtafel = within(screen.getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })).getByRole('region', { name: 'Waldtanz-Zugtafel' })
    expect(within(zugtafel).getByText(/Letzte Aktion:/)).toBeVisible()
    expect(within(zugtafel).getByText(/rechts an .*anlegen/)).toBeVisible()
    const kartenreihe = within(eigeneSchlange).getByRole('list', { name: 'Kartenreihe pfad-m1bb' })
    expect(within(kartenreihe).getByLabelText(/Farbkarte gelb-ende-m1bb/)).toBeVisible()
  })

  it('stylt ausgewählte Schlangenenden als Stitch-Endplätze und ordnet fremde Endlisten auf /game unter', () => {
    expect(cssBlock('schlangekarte__anlegeplaetze--vorschau')).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(cssBlock('schlangekarte__anlegeplatz-vorschau')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__anlegeplatz-vorschau')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('schlangekarte__anlegeplatz-vorschau')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__anlegeplatz-vorschau-id')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(appCss).toMatch(/\.spielbereich--game-route \[class~="schlangenbereich--karte-ausgewaehlt"\][\s\S]*\.schlangekarte__anlegeplatz:not\(\.schlangekarte__anlegeplatz--ausgewaehlt\)[\s\S]*display:\s*none/)
  })
})
