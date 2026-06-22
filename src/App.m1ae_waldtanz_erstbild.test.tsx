/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ae bringt Arenastein, Zugrail und Handkarten auf /game in ein kompaktes erstes Waldtanz-Browserbild.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1ae Waldtanz-Erstbild', () => {
  it('ordnet auf /game Spielrahmen, Arenastein, Zugrail und Handkarten als kompaktes erstes Brettbild statt langer Vorlauf-Liste an', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const spielerrahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const zugkompass = within(zugleiste).getByRole('region', { name: 'Zugkompass' })
    const partiefortschritt = within(zugleiste).getByRole('region', { name: 'Partiefortschritt' })
    const zugpfad = within(zugleiste).getByRole('region', { name: 'Zugpfad' })

    expect(spielbereich).toHaveClass('spielbereich--game-route')
    expect(spielerrahmen.compareDocumentPosition(arenastein) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(arenastein.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(zugpfad.compareDocumentPosition(zugkompass) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(zugkompass.compareDocumentPosition(partiefortschritt) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    // M1d0 22.06.2026: grid-template-areas ersetzt die alte 1-Spalten-Grid +
    // per-Component grid-row/grid-column-Nummerierung. Das Layout wird jetzt
    // durch benannte Areas im /game-Routen-Block des spielbrett--waldtanz
    // definiert. Die Test-Assertions muessen daher die Areas pruefen, nicht
    // die alte row/column-Nummerierung.
    expect(cssBlock('.spielbereich--game-route [class~="spielbrett--waldtanz"]')).toMatch(/grid-template-areas:/)
    const gameRouteBrett = cssBlock('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    const gameRouteBrettClean = gameRouteBrett.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
    expect(gameRouteBrettClean).toMatch(/"spielerrahmen/)
    expect(gameRouteBrettClean).toMatch(/"arenastein/)
    expect(gameRouteBrettClean).toMatch(/"zugseitenleiste/)
    // Spielerrahmen, Arenastein und Zugseitenleiste sitzen jetzt in eigenen
    // benannten Grid-Zeilen (grid-area: <name>).
    const gameRouteSpielerrahmen = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]')
    expect(gameRouteSpielerrahmen).toMatch(/grid-area:\s*spielerrahmen/)
    const gameRouteArenastein = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    expect(gameRouteArenastein).toMatch(/grid-area:\s*arenastein/)
    const gameRouteZugleiste = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')
    expect(gameRouteZugleiste).toMatch(/grid-area:\s*zugseitenleiste/)
    expect(gameRouteZugleiste).toMatch(/grid-template-columns:\s*minmax\(6rem,\s*0\.65fr\)\s+repeat\(6,\s*minmax\(5\.1rem,\s*1fr\)\)/)
    // M1d0: Handkarten-Panel hat grid-area: hand in der benannten Bottom-Row.
    expect(cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')).toMatch(/grid-area:\s*hand/)
    expect(cssBlock('.spielbereich--game-route [class~="zugpfad__strecke"]')).toMatch(/max-height:\s*10rem/)
    expect(cssBlock('.spielbereich--game-route [class~="zugpfad__strecke"]')).toMatch(/overflow:\s*auto/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen__kartenruecken--stitch"]')).toMatch(/width:\s*clamp\(2rem,\s*3\.2vw,\s*2\.6rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="schlangekarte__anlegeaktionen--starten"]')).toMatch(/display:\s*none/)
    expect(cssBlock('.spielbereich--game-route [class~="schlangen-startkreis-button"]')).toMatch(/min-height:\s*2rem/)
  })
})
