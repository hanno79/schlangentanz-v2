/**
 * Author: rahn
 * Datum: 03.06.2026
 * Version: 1.0
 * Beschreibung: F3 UI-Test für tokenverdrahtete Status- und Aktionspanels.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerAppZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F3 tokenverdrahtete Status-Panels', () => {
  let appCss = ''

  beforeAll(() => {
    appCss = readFileSync('src/App.css', 'utf8')
  })

  it('gruppiert die Spielbereiche als kontraststarke Stitch-Panels, ohne Debuganzeigen zu entfernen', () => {
    render(<App initialZustand={deterministischerAppZustand()} />)

    const spielbereich = screen.getByRole('region', { name: /legale aktionen/i })
    expect(spielbereich).toHaveClass('spielbereich')

    for (const name of [
      /^Spielstatus$/i,
      /^Aktiver Spieler$/i,
      /^Spielerübersicht$/i,
      /^Material und Aufgaben$/i,
      /^Wertung$/i,
      /^Aktionen$/i,
    ]) {
      expect(screen.getByRole('region', { name })).toHaveClass('info-panel')
    }

    expect(within(screen.getByRole('region', { name: /^Spielstatus$/i })).getByText(/Engine-Demo:/i)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: /^Aktionen$/i })).getByText(/Legale Aktionen:/i)).toBeInTheDocument()

    const spielbereichBlock = appCss.match(/\.spielbereich\s*\{([^}]*)\}/s)?.[1] ?? ''
    const infoPanelBlock = appCss.match(/\.info-panel\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(spielbereichBlock).toMatch(/display:\s*grid/)
    expect(spielbereichBlock).toMatch(/gap:\s*clamp\(1rem,\s*2vw,\s*1\.5rem\)/)
    expect(infoPanelBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)\s+solid\s+var\(--st-color-border-strong\)/)
    expect(infoPanelBlock).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(infoPanelBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
  })
})
