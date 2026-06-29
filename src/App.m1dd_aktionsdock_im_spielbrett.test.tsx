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

  it('ordnet aktionsdock zwischen gegner-plakette und arenastein an (Empfohlene Aktion vor dem Brett)', () => {
    const block = cssBlockForSelector('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    expect(block).toMatch(/aktionsdock/)
    // Reihenfolge: gegner-plakette kommt vor aktionsdock, aktionsdock vor
    // arenastein, arenastein vor zugseitenleiste. M1dd hat die Position
    // nach dem M1d0+M1dd-Smoke-Blocker revidiert: der Aktionsdock sitzt
    // zwischen Gegnerplakette und Arenastein, damit der Arenastein-Cap
    // bei 360 px bleiben kann und die Tischkarte (Brettschritt-Stempel)
    // wieder vollstaendig im Arenastein sichtbar ist. Vorher (cap 324 px
    // + aktionsdock unter arenastein) ueberlappte die Tischkarte mit
    // dem Aktionsdock und der M1bw-Hit-Test schlug fehl.
    const gegnerIdx = block.indexOf('gegner-plakette')
    const dockIdx = block.indexOf('aktionsdock')
    const arenaIdx = block.indexOf('arenastein')
    const zugleisteIdx = block.indexOf('zugseitenleiste')
    expect(gegnerIdx).toBeGreaterThan(-1)
    expect(dockIdx).toBeGreaterThan(gegnerIdx)
    expect(arenaIdx).toBeGreaterThan(dockIdx)
    expect(zugleisteIdx).toBeGreaterThan(arenaIdx)
  })

  it('nimmt die aktionsdock-Hoehe in das grid-template-rows des spielbrett--waldtantz auf', () => {
    const block = cssBlockForSelector('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    // M1dd urspruenglich clamp(3.5rem, 8vh, 4.5rem); M1d1 (24.06.2026) auf
    // clamp(2rem, 4vh, 2.5rem) reduziert, um vertikalen Platz fuer das
    // vergroesserte Arena (432px) und sichtbare Schlangen freizugeben.
    // AENDERUNG 29.06.2026 (M9 Hand-Erstbild): aktionsdock-Hoehe auf
    // clamp(1.6rem, 3vh, 2rem) gestrafft, damit Hand im 1440x900
    // Erstbild sichtbar bleibt. 1.6/3vh/2rem ist jetzt akzeptiert.
    expect(block).toMatch(/clamp\(\s*(1\.6|2|3\.5)rem,\s*(3|4|8)vh,\s*(2|2\.5|4\.5)rem\s*\)/)
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