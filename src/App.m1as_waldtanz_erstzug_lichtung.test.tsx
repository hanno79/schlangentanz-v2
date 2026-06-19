/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1as hält Tischkarte, Magiekreise, Startkreis/Schlangenbereich und Hand im ersten Waldtanz-Spielbild sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selector: string) => appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1as Waldtanz-Erstzug-Lichtung', () => {
  it('ordnet das erste Spielbild als kompakte Lichtung mit sichtbarem Schlangenbereich vor der Hand', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const lichtung = within(spieltisch).getByRole('region', { name: 'Schlangenlichtung' })
    const tischkarte = within(lichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const magiekreise = within(lichtung).getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const schlangenbereich = within(lichtung).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(within(schlangenbereich).getByText('Neue Schlange starten')).toBeVisible()
    expect(tischkarte.compareDocumentPosition(magiekreise) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(magiekreise.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(schlangenbereich.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('kompaktiert die /game-Lichtung, damit Startkreis und Hand ohne innere Scrollsuche im Erstbild liegen', () => {
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__spielfeld"]')).toMatch(/grid-template-columns:\s*minmax\(0,\s*3fr\) minmax\(7rem,\s*0\.4fr\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__schlangenlichtung"]')).toMatch(/grid-template-columns:\s*minmax\(8rem,\s*0\.6fr\) minmax\(12rem,\s*1\.4fr\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__schlangenlichtung"]')).toMatch(/grid-template-rows:\s*auto auto/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise__liste"]')).toMatch(/grid-template-columns:\s*repeat\(3,\s*minmax\(4\.8rem,\s*1fr\)\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise__kreis"]')).toMatch(/min-height:\s*clamp\(4\.9rem,\s*9vw,\s*6\.75rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte"]')).toMatch(/width:\s*min\(100%,\s*22rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte"]')).toMatch(/grid-area:\s*tisch/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise"]')).toMatch(/grid-area:\s*magiekreise/)
    expect(cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"]')).toMatch(/min-height:\s*7\.5rem/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="schlangenbereich--waldlichtung"]')).toMatch(/grid-area:\s*schlangen/)
    expect(cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"]')).toMatch(/overflow:\s*auto/)
  })
})
