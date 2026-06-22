/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1cx macht den aktiven Spieler am Waldtanz-Spielbrett als
 * körperliche Stitch-Spielerplakette sichtbar: links neben der Handkartenleiste
 * sitzt eine chunky Pill-Karte mit 3px-Waldgrün-Border, Hard-Shadow und
 * Primary-Container-Hintergrund, die Avatar, Spielername, große Punktzahl
 * und Handkarten-Zahl des aktiven Spielers zeigt. Gleichzeitig wird der
 * Layout-Overlap aus M1cv/M1cw aufgelöst (Handkante -38px über der
 * Schlangenlichtung wird auf ≥70px geräumt), damit das erste /game-Bild
 * wieder eine freie Schlangenlichtung zeigt. Engine, Legal-Aktionen und
 * Ausführungspfade bleiben unangetastet.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

function zustandMitAktivemSpieler() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1cx-01', 'Blau', 1), farbkarte('gelb-m1cx-02', 'Gelb', 2)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cx-start', 'Grün', 1)], 'eigene-schlange-m1cx')]
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cx Waldtanz-Spielerplakette', () => {
  it('rendert die Spielerplakette sichtbar innerhalb des Spieltischs auf /game', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const plakette = within(spieltisch).getByRole('region', { name: /Spieler 1/ })

    expect(plakette).toBeInTheDocument()
    expect(plakette.tagName).toBe('SECTION')
    expect(plakette.className).toContain('waldtanz-spielerplakette')
    // Punkte-Pille und Handkarten-Span existieren als sichtbare Elemente
    expect(within(plakette).getByLabelText(/Punktzahl/i)).toBeInTheDocument()
    expect(within(plakette).getByLabelText(/Handkarten/i)).toBeInTheDocument()
  })

  it('rendert die Spielerplakette NICHT auf / (Lobby bleibt ohne Spielerplakette)', () => {
    window.history.pushState({}, '', '/')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)
    expect(document.querySelector('.waldtanz-spielerplakette')).not.toBeInTheDocument()
  })

  it('zeigt die Punktzahl des aktiven Spielers prominent als Headline-Pille', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const plakette = within(spieltisch).getByRole('region', { name: /Spieler 1/ })
    const punktePille = plakette.querySelector('.waldtanz-spielerplakette__punkte')

    expect(punktePille).not.toBeNull()
    expect(punktePille?.tagName).toBe('SPAN')
    expect(punktePille?.className).toContain('waldtanz-spielerplakette__punkte')
    // aria-label macht die Punktzahl als screen-reader-text sichtbar
    expect(punktePille?.getAttribute('aria-label')).toMatch(/Punktzahl:\s*\d+\s*Punkte?/)
    // Sichtbarer Text ist die nackte Zahl
    expect(punktePille?.textContent?.trim()).toMatch(/^\d+$/)
  })

  it('zeigt den Handkarten-Zaehler und den Avatar passend zum aktiven Spieler', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const plakette = within(spieltisch).getByRole('region', { name: /Spieler 1/ })
    const avatar = plakette.querySelector('.waldtanz-spielerplakette__avatar')
    const handkarten = plakette.querySelector('.waldtanz-spielerplakette__handkarten')

    expect(avatar).not.toBeNull()
    expect(avatar?.textContent).toMatch(/[🧙🐸]/u)
    // Handkarten-Span hat aria-label und enthaelt sichtbar die Zahl
    expect(handkarten?.getAttribute('aria-label')).toMatch(/2\s*Handkarten/)
    expect(handkarten?.textContent).toMatch(/2/)
  })

  it('CSS-Source: Spielerplakette nutzt Stitch-Tokens (3px-Border, Hard-Shadow, Primary-Container)', () => {
    // Selector + Basis-Stitch-Styling (Klasse oder Attribut-Selektor zulaessig)
    expect(appCss).toMatch(/(\.waldtanz-spielerplakette\b|\[class~="waldtanz-spielerplakette"\])/)
    const plaketteBlock = appCss.match(/(\.waldtanz-spielerplakette\b|\[class~="waldtanz-spielerplakette"\])\s*\{([^}]*)\}/)?.[2] ?? ''
    expect(plaketteBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)/)
    expect(plaketteBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    expect(plaketteBlock).toMatch(/background:[^;]*var\(--st-color-primary-container\)/)

    // Punkte-Pille hat eigene Stitch-Headline-Schrift
    const punkteBlock = appCss.match(/(\.waldtanz-spielerplakette__punkte\b|\[class~="waldtanz-spielerplakette__punkte"\])\s*\{([^}]*)\}/)?.[2] ?? ''
    expect(punkteBlock).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(punkteBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)/)

    // Avatar als chunky Pill mit sekundaer-Container
    const avatarBlock = appCss.match(/(\.waldtanz-spielerplakette__avatar\b|\[class~="waldtanz-spielerplakette__avatar"\])\s*\{([^}]*)\}/)?.[2] ?? ''
    expect(avatarBlock).toMatch(/border-radius:\s*999px/)
    expect(avatarBlock).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
  })

  it('CSS-Source: Spielerplakette sitzt auf /game links neben der Handkartenleiste (Stitch-Layout)', () => {
    // Reihenfolge im Source garantiert: Plakette-Block kommt VOR Handkartenleiste-Tiefenfaecher-Block
    const plaketteIdx = appCss.search(/(\.waldtanz-spielerplakette\b|\[class~="waldtanz-spielerplakette"\])/)
    const handkarteIdx = appCss.indexOf('.handkartenleiste--tiefenfaecher')
    expect(plaketteIdx).toBeGreaterThan(0)
    expect(handkarteIdx).toBeGreaterThan(plaketteIdx)

    // Plakette bekommt eigene Grid-Spalte im Spieltisch-Grid auf /game
    expect(appCss).toMatch(/\.spielbereich--game-route[^}]*(\.waldtanz-spielerplakette|\[class~="waldtanz-spielerplakette"\])/)
    // Plakette liegt innerhalb des Spieltisch-Containers (gleicher Container wie Handkarten-Panel)
    expect(appCss).toMatch(/(\.spielbrett--waldtanz|\[class~="spielbrett--waldtanz"\])([^}]|\n)*(\.waldtanz-spielerplakette|\[class~="waldtanz-spielerplakette"\])/)
  })

  it('CSS-Source: Handkarten-Panel liegt UNTER dem Arenastein (M1ax-Fix, grid-row 4 statt Collision in grid-row 3)', () => {
    // M1cv/M1cw haben das Arenastein wachsen lassen, sodass die Hand mit grid-row: 3
    // IN dieselbe Grid-Zeile wie das Arenastein fiel und per align-self: end nur
    // teilweise darunter lag. Der Bug: handBox.y (633) lag 39px UEBER schlangenBox.y (672).
    //
    // Konkreter Reparatur-Vertrag: handkarten-panel hat grid-row >= 4 (nicht 3).
    const handkartenBlock = appCss.match(/(\.spielbereich--game-route[^}]*\[class~="handkarten-panel"\][^{]*\{)([^}]*)\}/s)?.[2] ?? ''

    // Kommentare (vor jeder echten Deklaration) ignorieren, damit der erste
    // Treffer nicht aus dem AENDERUNG-Kommentar "grid-row 3" stammt.
    const cleanedBlock = handkartenBlock.replace(/\/\*[\s\S]*?\*\//g, '')
    const gridRowMatch = cleanedBlock.match(/grid-row:\s*(\d+)\s*;/)
    const gridRowValue = gridRowMatch ? parseInt(gridRowMatch[1], 10) : 0
    expect(gridRowValue).toBeGreaterThanOrEqual(4)
  })

  it('Smoke-Wiring: package.json npm run smoke:production enthaelt das M1cx-Smoke-Script', () => {
    expect(packageJson).toMatch(/"smoke:production"\s*:\s*"[^"]*m1cx_waldtanz_spielerplakette_smoke\.mjs/)
  })

  it('CSS-Source: --st-color-on-surface und --st-color-on-primary-container sind in :root definiert (Kimi-Review-Blocker)', () => {
    // Kimi-Review hat gefunden, dass die Plakette-Regeln var(--st-color-on-surface)
    // nutzen, das Token aber NICHT in :root definiert war. Selbe Klasse Bug wie M1cw.
    const rootBlock = appCss.match(/:root\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rootBlock).toMatch(/--st-color-on-surface:\s*#[0-9a-fA-F]{3,6}/)
    expect(rootBlock).toMatch(/--st-color-on-primary-container:\s*#[0-9a-fA-F]{3,6}/)
  })
})