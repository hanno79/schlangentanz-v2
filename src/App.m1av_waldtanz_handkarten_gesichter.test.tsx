/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1av macht Handkarten als Stitch-nahe Spielkarten-Gesichter statt ID-lastiger Textbuttons sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selector: string) => appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function erwarteterKartenname(farbe: string): string {
  switch (farbe) {
    case 'Blau': return 'Wasserwirbel'
    case 'Rot': return 'Feuerkeim'
    case 'Gelb': return 'Sonnenblatt'
    case 'Violett': return 'Mondranke'
    case 'Braun': return 'Wurzelpfad'
    case 'Grün': return 'Waldspross'
    default: throw new Error(`Unerwartete Farbe ${farbe}`)
  }
}

function erwartetesSymbol(farbe: string): string {
  switch (farbe) {
    case 'Blau': return '💧'
    case 'Rot': return '🔥'
    case 'Gelb': return '☀️'
    case 'Violett': return '🌙'
    case 'Braun': return '🌰'
    case 'Grün': return '🌿'
    default: throw new Error(`Unerwartete Farbe ${farbe}`)
  }
}

describe('M1av Waldtanz-Handkarten-Gesichter', () => {
  it('zeigt die Handkarten als spielnahe Karten mit Artfläche, Namen und Wertchip statt roher ID als Hauptfläche', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    render(<App initialZustand={zustand} />)

    const handkarten = within(screen.getByRole('region', { name: 'Spieltisch' })).getByRole('region', { name: 'Handkarten' })
    const ersteFarbkarte = zustand.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte')
    if (!ersteFarbkarte || ersteFarbkarte.typ !== 'Farbkarte') throw new Error('Testsetup erwartet eine Farbkarte in der ersten Hand.')

    const button = within(handkarten).getByRole('button', { name: new RegExp(`${ersteFarbkarte.id} Farbkarte ${ersteFarbkarte.farbe}`) })
    expect(within(button).getByText('Waldtanzkarte')).toHaveClass('handkarte__eyebrow')
    expect(within(button).getByText(erwarteterKartenname(ersteFarbkarte.farbe))).toHaveClass('handkarte__titel')
    expect(within(button).getByText(`${ersteFarbkarte.punkte} Pkt`)).toHaveClass('handkarte__wertechip')
    expect(within(button).getByText(ersteFarbkarte.id)).toHaveClass('handkarte__idplakette')
    expect(within(button).getByText(ersteFarbkarte.farbe)).toHaveClass('handkarte__farbe')

    const art = button.querySelector('.handkarte__art') as HTMLElement | null
    expect(art).not.toBeNull()
    expect(art).toContainElement(within(button).getByText(erwartetesSymbol(ersteFarbkarte.farbe)))
    expect(button).toHaveClass('handkarte__button--karte')

    expect(cssBlock('.handkarte__art')).toMatch(/min-height:\s*38%/)
    expect(cssBlock('.handkarte__art')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.handkarte__titel')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(cssBlock('.handkarte__wertechip')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
  })
})
