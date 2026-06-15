/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ba macht den Startkreis nach Handkartenauswahl als körperliche Brett-Vorschau spielbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startkreisZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('gelb-start-m1ba', 'Gelb', 5)]
  zustand.spieler[0].schlangen = []
  return zustand
}

describe('M1ba Startkreis-Vorschau', () => {
  it('macht die ausgewählte Handkarte direkt im Startkreis als Brettobjekt ausführbar', () => {
    render(<App initialZustand={startkreisZustand()} />)

    const handkarten = within(screen.getByRole('region', { name: 'Handkarten' }))
    fireEvent.click(handkarten.getByRole('button', { name: /gelb-start-m1ba/ }))

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const startkreis = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    const vorschau = within(startkreis).getByText('Startkarte').closest('.schlangen-startzone__vorschau')

    expect(within(startkreis).queryByRole('button')).toBeNull()
    expect(vorschau).not.toBeNull()
    expect(vorschau).toHaveClass('schlangen-startzone__vorschau')
    expect(vorschau).toHaveAttribute('id')
    expect(vorschau).not.toHaveAttribute('aria-label')
    expect(startkreis.getAttribute('aria-describedby')?.split(/\s+/)).toContain((vorschau as HTMLElement).id)
    expect(startkreis).toHaveAccessibleDescription(expect.stringContaining('Klick auf den Startkreis legt diese Karte als neue Schlange.'))
    expect(within(vorschau as HTMLElement).getByText('gelb-start-m1ba')).toHaveClass('schlangen-startzone__vorschau-id')
    expect(within(vorschau as HTMLElement).getByText('Klick auf den Startkreis legt diese Karte als neue Schlange.')).toBeVisible()

    fireEvent.click(startkreis)

    expect(screen.getByText('Zuletzt ausgeführt: Neue Schlange starten mit Karte gelb-start-m1ba')).toBeVisible()
    const eigeneSchlange = within(schlangenbereich).getByRole('button', { name: /Schlange schlange-spieler-1-1/ })
    expect(within(eigeneSchlange).getByText('gelb-start-m1ba')).toBeVisible()
  })

  it('stylt die Vorschau als Stitch-Spielobjekt und ordnet Startlisten auf /game unter', () => {
    expect(cssBlock('schlangen-startzone__vorschau')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangen-startzone__vorschau')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('schlangen-startzone__vorschau')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangen-startzone__vorschau')).not.toContain('--st-color-surface-bright')
    expect(cssBlock('schlangen-startzone__vorschau-id')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(appCss).toMatch(/\.spielbereich--game-route \[class~="schlangenbereich--karte-ausgewaehlt"\][\s\S]*\[class~="schlangekarte__anlegeaktionen--starten"\][\s\S]*display:\s*none/)
  })
})
