/**
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: M3 beweist den Google-Stitch-Lobby-Vertical: Sonniges Nest mit KI-Gegnerwahl startet sichtbare Partien, ohne das Waldtanz-Spielbrett zu verdrängen.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

describe('M3 Sonniges Nest Lobby', () => {
  it('zeigt eine Stitch-inspirierte Lobby und startet eine Partie mit 1 bis 3 KI-Gegnern', () => {
    render(<App />)

    const lobby = screen.getByRole('region', { name: 'Das sonnige Nest' })
    expect(lobby).toHaveClass('sonniges-nest')
    expect(within(lobby).getByText('Lobby Code')).toBeInTheDocument()
    expect(within(lobby).getByText('XK9-B4Z')).toHaveClass('lobby-code-schild__code')
    expect(within(lobby).getByRole('heading', { name: 'Bereit im sonnigen Nest' })).toBeInTheDocument()
    expect(within(lobby).getByText('Slippy Host')).toBeInTheDocument()
    expect(within(lobby).getByText('Orange Crush')).toBeInTheDocument()
    expect(within(lobby).getAllByText('wartet auf KI-Schlange')).toHaveLength(2)

    const startButtons = within(lobby).getAllByRole('button', { name: /starten/i })
    expect(startButtons.map(button => button.textContent)).toEqual([
      'Duell starten (1 KI)',
      'Waldparty starten (2 KI)',
      'Große Runde starten (3 KI)',
    ])

    fireEvent.click(within(lobby).getByRole('button', { name: 'Waldparty starten (2 KI)' }))

    expect(within(lobby).getByText('Aktive Partie: Du + 2 KI')).toBeInTheDocument()
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    expect(within(spieleruebersicht).getByText(/Spieler 3: .*Handkarten/)).toBeInTheDocument()
    expect(within(spieleruebersicht).queryByText(/Spieler 4: .*Handkarten/)).not.toBeInTheDocument()

    fireEvent.click(within(lobby).getByRole('button', { name: 'Große Runde starten (3 KI)' }))

    expect(within(lobby).getByText('Aktive Partie: Du + 3 KI')).toBeInTheDocument()
    expect(within(spieleruebersicht).getByText(/Spieler 4: .*Handkarten/)).toBeInTheDocument()

    fireEvent.click(within(lobby).getByRole('button', { name: 'Duell starten (1 KI)' }))

    expect(within(lobby).getByText('Aktive Partie: Du + 1 KI')).toBeInTheDocument()
    expect(within(spieleruebersicht).queryByText(/Spieler 3: .*Handkarten/)).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Spieltisch' })).toHaveClass('spielbrett--waldtanz')
  })

  it('verankert die Lobby visuell als Holzschild- und Baumhöhlen-Screen statt als Debugliste', () => {
    expect(appCss).toMatch(/\.sonniges-nest\s*\{[^}]*border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.sonniges-nest\s*\{[^}]*border-radius:\s*3rem/s)
    expect(appCss).toMatch(/\.lobby-code-schild\s*\{[^}]*repeating-linear-gradient/s)
    expect(appCss).toMatch(/\.lobby-code-schild\s*\{[^}]*box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.lobby-slot__hoehle\s*\{[^}]*border-radius:\s*999px/s)
    expect(appCss).toMatch(/\.lobby-slot--wartet \.lobby-slot__hoehle/s)
    expect(appCss).toMatch(/\.lobby-startbutton:hover\s*\{[^}]*transform:\s*translateY\(-2px\) scale\(1\.04\)/s)
  })
})
