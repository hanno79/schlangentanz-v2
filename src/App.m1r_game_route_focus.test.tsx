/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1r fokussiert die /game-Route direkt auf das Waldtanz-Spielbrett statt erst Lobby/Regelbuch davor zu zeigen.
 */
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function vierSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1r /game Waldtanz-Fokus', () => {
  it('macht auf /game das Waldtanz-Spielbrett zum ersten Spielerlebnis und blendet Lobby sowie Regelbuch aus', () => {
    window.history.pushState({}, '', '/game')

    render(<App initialZustand={vierSpielerZustand()} />)

    expect(screen.queryByRole('region', { name: 'Das sonnige Nest' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Das Schlangenbuch' })).toBeNull()
    expect(screen.queryByText('Das Kartenspiel')).toBeNull()

    const hauptbereich = screen.getByRole('main')
    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    expect(hauptbereich).toHaveClass('app-shell--game')
    expect(spielbereich).toHaveClass('spielbereich--game-route')
    expect(hauptbereich.firstElementChild).toBe(spielbereich)

    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    expect(spieltisch).toBeVisible()
    expect(within(spieltisch).getByRole('region', { name: 'Handkarten' })).toBeVisible()
    expect(within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })).toBeVisible()
    expect(within(spieltisch).getByRole('region', { name: 'Zugkompass' })).toBeVisible()
  })

  it('laesst auf / die Stitch-Lobby und das Schlangenbuch als Start-Erlebnis sichtbar', () => {
    window.history.pushState({}, '', '/')

    render(<App initialZustand={vierSpielerZustand()} />)

    expect(screen.getByRole('region', { name: 'Das sonnige Nest' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Das Schlangenbuch' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Spielbereich' })).not.toHaveClass('spielbereich--game-route')
  })

  it('behandelt nur /game und Unterpfade als fokussierte Spielroute', () => {
    window.history.pushState({}, '', '/games')

    render(<App initialZustand={vierSpielerZustand()} />)

    expect(screen.getByRole('region', { name: 'Das sonnige Nest' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Spielbereich' })).not.toHaveClass('spielbereich--game-route')
  })
})
