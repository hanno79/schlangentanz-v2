/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bk macht den aktiven Zug als körperliche Waldtanz-Zugtafel sichtbar, bevor Entwicklungsdaten folgen.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('M1bk Waldtanz-Zugtafel', () => {
  it('zeigt aktiven Spieler, Pflichtschritt und letzte Aktion als spielnahe Zugtafel vor den Entwicklungsdaten', () => {
    render(<App initialZustand={startZustand()} />)

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const zugtafel = within(aktiverSpieler).getByRole('region', { name: 'Waldtanz-Zugtafel' })
    const entwicklungsdaten = within(aktiverSpieler).getByRole('complementary', { name: 'Entwicklungsdaten: Aktiver Spieler' })

    expect(zugtafel).toHaveClass('waldtanz-zugtafel')
    expect(within(zugtafel).getByRole('heading', { name: 'Waldtanz-Zugtafel' })).toBeVisible()
    expect(within(zugtafel).getByText('Spieler 1')).toBeVisible()
    expect(within(zugtafel).getByText('Du bist am Zug.')).toBeVisible()
    expect(within(zugtafel).getByText('Nächster Schritt')).toBeVisible()
    expect(within(zugtafel).getByText('Eine spielbare Aktion auswählen.')).toBeVisible()
    expect(within(zugtafel).getByText('0 Punkte')).toBeVisible()
    expect(within(zugtafel).getByText('5 Handkarten')).toBeVisible()
    expect(within(zugtafel).getByText('0 Schlangen')).toBeVisible()
    expect(within(zugtafel).getByText(/Persönliche Quest:/)).toBeVisible()
    expect(within(zugtafel).getByText('Noch keine Aktion ausgeführt.')).toBeVisible()

    expect(zugtafel.compareDocumentPosition(entwicklungsdaten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    const aktionen = within(aktiverSpieler).getByRole('region', { name: 'Aktionen' })
    const empfohlen = within(aktionen).getByRole('region', { name: 'Empfohlene Aktion' })
    fireEvent.click(within(empfohlen).getByRole('button', { name: /Neue Schlange starten/ }))

    expect(within(zugtafel).getByText(/Letzte Aktion:/)).toBeVisible()
    expect(within(zugtafel).getByText(/Neue Schlange starten/)).toBeVisible()
    expect(within(zugtafel).getByText('1 Schlange')).toBeVisible()
  })

  it('verankert die Zugtafel visuell als chunky Stitch-Spielobjekt', () => {
    expect(cssBlock('waldtanz-zugtafel')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-zugtafel')).toMatch(/border-radius:\s*var\(--st-radius-xl\)/)
    expect(cssBlock('waldtanz-zugtafel')).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    expect(cssBlock('waldtanz-zugtafel__chips')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*7rem\),\s*1fr\)\)/)
    expect(cssBlock('waldtanz-zugtafel__pflicht')).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
  })
})
