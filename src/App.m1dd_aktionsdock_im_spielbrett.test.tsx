/**
 * Author: rahn
 * Datum: 23.06.2026
 * Version: 1.0
 * Beschreibung: M1dd beweist, dass das Aktionendock auf /game strukturell
 * Teil des spielbrett--waldtanz-Grids ist (statt Geschwister), damit es
 * ohne Scrollen im 1280x900-Erstbild sichtbar bleibt.
 *
 * RED-Vertrag (TDD):
 *   1. Auf /game liegt das Aktionen-Region-Element innerhalb des
 *      spielbrett--waldtanz-Sections (DOM-Containment).
 *   2. Auf /game hat das Aktionendock zusaetzlich zur bestehenden
 *      `aktionen-panel--brettfallback`-Klasse die neue
 *      `aktionen-panel--brettinline`-Klasse.
 *   3. Das CSS-Quell-Regelwerk enthaelt eine Regel fuer die neue Klasse
 *      mit `max-height: clamp(4.5rem, 11vh, 7rem); overflow: auto;`.
 *   4. Das CSS-Quell-Regelwerk enthaelt im spielbrett--waldtanz-Block eine
 *      `grid-template-areas`-Zeile mit `aktionsdock` und eine
 *      `grid-template-rows`-Zeile mit `clamp(5rem, 12vh, 8rem)`.
 *   5. Auf `/` (lobby) bleibt die volle Aktionsliste sichtbar (kein
 *      `brettinline`-Override).
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlockForSelector(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M1dd Waldtanz-Aktionsdock im Spielbrett', () => {
  it('rendert auf /game das Aktionen-Panel als Kind des spielbrett--waldtanz-Grids', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpielerPanel = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const spieltisch = within(aktiverSpielerPanel).getByRole('region', { name: 'Spieltisch' })
    const aktionen = within(aktiverSpielerPanel).getByRole('region', { name: 'Aktionen' })

    // NEU in M1dd: das Aktionendock ist Teil des Spielbretts, nicht sein
    // nachfolgendes Geschwister-Element (das war der M1b-Vertrag).
    expect(spieltisch).toContainElement(aktionen)
  })

  it('markiert auf /game das Aktionendock mit aktionen-panel--brettinline und behält --brettfallback', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })

    expect(aktionen).toHaveClass('aktionen-panel--brettfallback')
    expect(aktionen).toHaveClass('aktionen-panel--brettinline')
  })

  it('definiert die neue CSS-Klasse aktionen-panel--brettinline mit kompakter max-height', () => {
    const block = cssBlockForSelector('.aktionen-panel--brettinline')
    expect(block).not.toBe('')
    // Hoehen-Budget (siehe Kommentar in App.css): 56-72 px im 1280x900-Viewport,
    // damit Handbank nicht unter y=900 gedrueckt wird.
    expect(block).toMatch(/max-height:\s*clamp\(3\.5rem,\s*8vh,\s*4\.5rem\)/)
    expect(block).toMatch(/overflow:\s*auto/)
  })

  it('nimmt aktionsdock in das grid-template-areas des spielbrett--waldtantz auf', () => {
    const block = cssBlockForSelector('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    expect(block).toMatch(/aktionsdock/)
    // Reihenfolge: arenastein kommt vor aktionsdock, aktionsdock vor zugseitenleiste.
    const arenaIdx = block.indexOf('arenastein')
    const dockIdx = block.indexOf('aktionsdock')
    const zugleisteIdx = block.indexOf('zugseitenleiste')
    expect(arenaIdx).toBeGreaterThan(-1)
    expect(dockIdx).toBeGreaterThan(arenaIdx)
    expect(zugleisteIdx).toBeGreaterThan(dockIdx)
  })

  it('nimmt die aktionsdock-Hoehe in das grid-template-rows des spielbrett--waldtantz auf', () => {
    const block = cssBlockForSelector('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    expect(block).toMatch(/clamp\(3\.5rem,\s*8vh,\s*4\.5rem\)/)
  })

  it('bewahrt ausserhalb von /game die volle Aktionsliste ohne brettinline-Override', () => {
    window.history.pushState({}, '', '/')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })

    expect(aktionen).not.toHaveClass('aktionen-panel--brettinline')
    expect(aktionen).not.toHaveClass('aktionen-panel--brettfallback')
    expect(within(aktionen).getByRole('region', { name: 'Weitere Aktionen' })).toBeVisible()
  })
})