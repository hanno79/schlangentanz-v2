/**
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: M3 beweist den Google-Stitch-Lobby-Vertical: Sonniges Nest mit KI-Gegnerwahl startet sichtbare Partien, ohne das Waldtanz-Spielbrett zu verdrängen.
 */
/// <reference types="node" />

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'


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
    // M3h (2026-07-01): wartende Slots rendern jetzt "frei" statt
    // "wartet auf KI-Schlange" — kuerzerer Platzhalter-Stitch-Stil.
    expect(within(lobby).getAllByText('frei')).toHaveLength(2)

    const startButtons = within(lobby).getAllByRole('button', { name: /starten/i })
    expect(startButtons.map(button => button.textContent?.replace(/▶/g, '').trim())).toEqual([
      'Duell starten (1 KI)',
      'Waldparty starten (2 KI)',
      'Große Runde starten (3 KI)',
    ])

    fireEvent.click(within(lobby).getByRole('button', { name: 'Waldparty starten (2 KI)' }))

    expect(within(lobby).getByText('Aktive Partie: Du + 2 KI')).toBeInTheDocument()
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    expect(within(spieleruebersicht).getByText(/KI Gegner 2: .*Handkarten/)).toBeInTheDocument()
    expect(within(spieleruebersicht).queryByText(/KI Gegner 3: .*Handkarten/)).not.toBeInTheDocument()

    fireEvent.click(within(lobby).getByRole('button', { name: 'Große Runde starten (3 KI)' }))

    expect(within(lobby).getByText('Aktive Partie: Du + 3 KI')).toBeInTheDocument()
    expect(within(spieleruebersicht).getByText(/KI Gegner 3: .*Handkarten/)).toBeInTheDocument()

    fireEvent.click(within(lobby).getByRole('button', { name: 'Duell starten (1 KI)' }))

    expect(within(lobby).getByText('Aktive Partie: Du + 1 KI')).toBeInTheDocument()
    expect(within(spieleruebersicht).queryByText(/KI Gegner 2: .*Handkarten/)).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Spieltisch' })).toHaveClass('spielbrett--waldtanz')
  })

  // ÄNDERUNG [30.07.2026]: AP-6 — der Stitch-Stil der Lobby (Rahmen, Radius,
  // Streifen-Verlauf, harter Schatten, Hover-Anhebung) wird jetzt als berechneter
  // Stil im Browser gemessen: tests/layout/lobby_erstbild.spec.ts. Der frühere
  // Assert las die Deklarationen im Quelltext und hätte eine überschriebene oder
  // umbenannte Regel nicht bemerkt.
})
