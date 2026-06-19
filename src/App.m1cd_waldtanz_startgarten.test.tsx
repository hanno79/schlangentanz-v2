/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cd entflechtet die leere Startlichtung zu einem lesbaren Waldtanz-Startgarten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1cd_startgarten_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cd Waldtanz-Startgarten', () => {
  it('macht die leere eigene Schlangenlichtung auf /game als Startgarten statt als nackte Textzeile sichtbar', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const startzone = within(eigeneSchlangen).getByRole('button', { name: 'Neue Schlange starten' })
    const startgarten = within(eigeneSchlangen).getByRole('note', { name: 'Leerer Startgarten' })

    expect(startzone).toHaveClass('schlangen-startzone--magiekreis')
    expect(startgarten).toHaveClass('schlangen-startgarten')
    expect(startgarten).toHaveTextContent('Noch keine eigene Schlange')
    expect(startgarten).toHaveTextContent('Wähle eine Handkarte und nutze den Startkreis rechts')
    expect(startzone.compareDocumentPosition(startgarten)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('legt Layout- und Smoke-Vertrag für einen getrennten Startgarten mit klickbarem Startkreis ab', () => {
    const eigeneLichtung = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"]')
    const startzone = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangen-startzone"]')
    const startgartenPosition = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangen-startgarten"]')
    const startgartenStil = cssBlock('.spielbereich--game-route [class~="schlangen-startgarten"]')

    expect(eigeneLichtung).toMatch(/grid-template-columns:\s*minmax\(8\.25rem,\s*0\.34fr\) minmax\(13rem,\s*1fr\)/)
    expect(eigeneLichtung).toMatch(/grid-template-areas:\s*"titel titel"\s*"startgarten startzone"/)
    expect(startzone).toMatch(/grid-area:\s*startzone/)
    expect(startzone).toMatch(/justify-self:\s*end/)
    expect(startgartenPosition).toMatch(/grid-area:\s*startgarten/)
    expect(startgartenPosition).toMatch(/align-self:\s*stretch/)
    expect(startgartenStil).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(startgartenStil).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(smokeScript).toContain('M1cd Startgarten')
    expect(smokeScript).toContain('width: 900')
    expect(smokeScript).toContain('width: 1280')
    expect(smokeScript).toContain('elementFromPoint')
    expect(smokeScript).toContain('schlangen-startgarten')
    expect(packageJson).toContain('node scripts/m1cc_handsteg_smoke.mjs && node scripts/m1cd_startgarten_smoke.mjs')
  })
})
