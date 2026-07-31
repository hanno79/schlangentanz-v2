/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.1
 * Beschreibung: M1cx macht den aktiven Spieler am Waldtanz-Spielbrett als
 * körperliche Stitch-Spielerplakette sichtbar: links neben der Handkartenleiste
 * sitzt eine chunky Pill-Karte mit 3px-Waldgrün-Border, Hard-Shadow und
 * Primary-Container-Hintergrund, die Avatar, Spielername, große Punktzahl
 * und Handkarten-Zahl des aktiven Spielers zeigt. Gleichzeitig wird der
 * Layout-Overlap aus M1cv/M1cw aufgelöst (Handkante -38px über der
 * Schlangenlichtung wird auf ≥70px geräumt), damit das erste /game-Bild
 * wieder eine freie Schlangenlichtung zeigt. Engine, Legal-Aktionen und
 * Ausführungspfade bleiben unangetastet.
 *
 * # AENDERUNG 22.06.2026: M1da — Region-Lookup auf stabile semantische
 *   Beschriftung "Waldtanz-Spielerplakette" umgestellt (vorher Spieler-Name
 *   als Proxy). Spieler-Name bleibt sichtbar in __name-text und weiterhin
 *   testbar via CSS-Selektor. Negative Assertion, dass die Region NICHT mehr
 *   den reinen Spieler-Namen als accessible name hat, schuetzt gegen Drift.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

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
    const plakette = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerplakette' })

    expect(plakette).toBeInTheDocument()
    expect(plakette.tagName).toBe('SECTION')
    expect(plakette.className).toContain('waldtanz-spielerplakette')
    // Punkte-Pille und Handkarten-Span existieren als sichtbare Elemente
    expect(within(plakette).getByLabelText(/Punktzahl/i)).toBeInTheDocument()
    expect(within(plakette).getByLabelText(/Handkarten/i)).toBeInTheDocument()
    // M1da: Region darf NICHT mehr unter dem reinen Spielernamen ansprechbar sein
    // (Stale-Assertion-Schutz). Spielername bleibt sichtbar in __name-text.
    expect(within(spieltisch).queryByRole('region', { name: 'Spieler 1' })).not.toBeInTheDocument()
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
    const plakette = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerplakette' })
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
    const plakette = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerplakette' })
    const avatar = plakette.querySelector('.waldtanz-spielerplakette__avatar')
    const handkarten = plakette.querySelector('.waldtanz-spielerplakette__handkarten')
    const nameText = plakette.querySelector('.waldtanz-spielerplakette__name-text')

    expect(avatar).not.toBeNull()
    expect(avatar?.textContent).toMatch(/[🧙🐸]/u)
    // Spieler-Name bleibt sichtbar in der Plakette (visible label, nicht region-name).
    expect(nameText?.textContent?.trim()).toBe('Spieler 1')
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

    // Plakette bekommt eigene Grid-Spalte im Spieltisch-Grid auf /game.
    // Hinweis: Eine echte Greedy-Regex mit ([^}]|\n)* auf einer 235K-CSS-Datei
    // produziert katastrophales Backtracking (14s+ pro Test). Wir ersetzen das
    // durch einen schnellen Selector-Pairing-Check.
    const spielerplaketteContainerPrefix = /\.spielbereich--game-route \[class~="spielbrett--waldtanz"\] \[class~="waldtanz-spielerplakette"\]/
    expect(appCss).toMatch(spielerplaketteContainerPrefix)
    // Plakette hat eine eigene grid-area: sp-plakette-Regel innerhalb des Spieltisch-Kontexts.
    const gridAreaSpPlakette = /\.spielbereich--game-route \[class~="spielbrett--waldtanz"\] \[class~="waldtanz-spielerplakette"\][^{]*\{[^}]*grid-area:\s*sp-plakette/
    expect(appCss).toMatch(gridAreaSpPlakette)
    // Plakette liegt innerhalb des Spieltisch-Containers (gleicher Container wie Handkarten-Panel).
    const plaketteVorHand = (() => {
      const plaketteIdx = appCss.search(/(\.waldtanz-spielerplakette\b|\[class~="waldtanz-spielerplakette"\])(?=[^{]*\{)/)
      const handIdx = appCss.indexOf('.handkarten-panel')
      return plaketteIdx > 0 && handIdx > plaketteIdx
    })()
    expect(plaketteVorHand).toBe(true)
  })

  it('CSS-Source: Handkarten-Panel liegt UNTER dem Arenastein (M1ax-Fix, grid-row 4 statt Collision in grid-row 3)', () => {
    // M1cv/M1cw haben das Arenastein wachsen lassen, sodass die Hand mit grid-row: 3
    // IN dieselbe Grid-Zeile wie das Arenastein fiel und per align-self: end nur
    // teilweise darunter lag. Der Bug: handBox.y (633) lag 39px UEBER schlangenBox.y (672).
    //
    // Konkreter Reparatur-Vertrag: handkarten-panel hat grid-row >= 4 (nicht 3).
    // M1d0 22.06.2026: Handkarten-Panel hat jetzt grid-area: hand in der
    // benannten Bottom-Row statt grid-row >= 4 + align-self: end. Der Bug
    // aus M1ax (Hand auf gleicher Hoehe wie Arenastein) ist damit strukturell
    // ausgeschlossen, weil Arenastein und Bottom-Row eigene benannte Grid-
    // Zeilen sind. Die explizite grid-row >= 4-Bedingung pruefen wir daher
    // nicht mehr — der neue Vertrag ist grid-area: hand.
    const handkartenBlock = appCss.match(/(\.spielbereich--game-route[^}]*\[class~="handkarten-panel"\][^{]*\{)([^}]*)\}/s)?.[2] ?? ''
    const cleanedBlock = handkartenBlock.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(cleanedBlock).toMatch(/grid-area:\s*hand\b/)
    expect(cleanedBlock).not.toMatch(/grid-row:\s*[34]/)
  })

  it('Smoke-Wiring: package.json npm run smoke:production enthaelt das M1cx-Smoke-Script', () => {
    expect(istVerdrahtet('m1cx_waldtanz_spielerplakette_smoke.mjs')).toBe(true)
  })

  it('CSS-Source: --st-color-on-surface und --st-color-on-primary-container sind in :root definiert (Kimi-Review-Blocker)', () => {
    // Kimi-Review hat gefunden, dass die Plakette-Regeln var(--st-color-on-surface)
    // nutzen, das Token aber NICHT in :root definiert war. Selbe Klasse Bug wie M1cw.
    const rootBlock = appCss.match(/:root\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rootBlock).toMatch(/--st-color-on-surface:\s*#[0-9a-fA-F]{3,6}/)
    expect(rootBlock).toMatch(/--st-color-on-primary-container:\s*#[0-9a-fA-F]{3,6}/)
  })
})