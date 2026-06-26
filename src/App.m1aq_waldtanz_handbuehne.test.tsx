/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1aq macht die aktive Hand als Stitch-Handbühne mit Spielerplakette und Zugstatus zum unteren Brettabschluss.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlockForSelector(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M1aq Waldtanz-Handbühne', () => {
  it('macht die Handkarten auf /game zur unteren Spielerbühne statt zu einer losen Kartenliste', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const handbuehne = within(handkarten).getByRole('group', { name: 'Waldtanz-Handbühne' })
    const kartenleiste = handkarten.querySelector('.handkartenleiste--waldtanz-faecher') as HTMLElement

    expect(arenastein.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(handbuehne.compareDocumentPosition(kartenleiste) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(within(handbuehne).getByText('Deine Hand — Spieler 1')).toBeVisible()
    // M1g: Avatar + Punkte-Anzeige sind aus der Handbuehnen-Spielerplakette
    // in die linke Grid-Spielerplakette gewandert. "0 Punkte" lebt jetzt dort,
    // nicht mehr in der Handbuehne.
    expect(handbuehne.querySelector('.handkarten-buehne__avatar')).toBeNull()
    const spielerplakette = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerplakette' })
    expect(within(spielerplakette).getByLabelText(/Punktzahl:/)).toBeVisible()
    expect(within(handbuehne).getByText('Ausspielphase')).toBeVisible()
    expect(within(handbuehne).getByText('5 Handkarten bereit')).toBeVisible()
    expect(within(handbuehne).getByText(/Spielbar: \d Karten/)).toBeVisible()
    expect(within(handkarten).getAllByRole('button', { name: /Farbkarte .* Spielbar jetzt 1 Brettziel/ }).length).toBeGreaterThan(0)

    expect(handkarten).toHaveClass('handkarten-panel--waldtanz-handbuehne')
    expect(cssBlockForSelector('.handkarten-panel--waldtanz-handbuehne')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlockForSelector('.handkarten-panel--waldtanz-handbuehne')).toMatch(/border-radius:\s*2\.5rem/)
    expect(cssBlockForSelector('.handkarten-panel--waldtanz-handbuehne')).toMatch(/box-shadow:\s*0 7px 0 var\(--st-color-border-strong\)/)
    expect(cssBlockForSelector('.handkarten-buehne__spielerplakette')).toMatch(/background:\s*var\(--st-color-primary-container\)/)
    expect(cssBlockForSelector('.handkarten-buehne__statuschip')).toMatch(/border-radius:\s*999px/)
  })
})
