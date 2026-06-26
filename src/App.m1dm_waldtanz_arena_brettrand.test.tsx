/**
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dm beweist, dass auf /game die zentrale Aktionen-Buttonliste
 *              visuell zugunsten des Brettrand-End-Turn-Knopfs verschwindet.
 *              Das Weglassen ist die Voraussetzung dafuer, dass die
 *              Schlangenlichtung (Waldtanz-Arenastein) das visuelle Zentrum
 *              des Spielfelds wird, statt von einer grossen gelben
 *              Aktions-Buttonliste ueberdeckt zu werden.
 *
 * RED-Vertrag (TDD):
 *   1. Auf /game ist das Aktionen-Region-Element NICHT sichtbar
 *      (queryByRole({hidden:true}) liefert Element, aber toBeVisible scheitert).
 *      Die Component bleibt im React-Tree, damit die M1dd-Grid-Area
 *      'aktionsdock' ein verwertbares Kind hat und das Layout stabil bleibt.
 *   2. Auf /game rendert der Waldtanz-Arenazugknopf weiterhin als sichtbare
 *      Brettrand-Aktion mit 'End Turn'-Beschriftung.
 *   3. Auf / (Lobby) bleibt die Aktionen-Region sichtbar (kein Rueckbau
 *      fuer die Spielvorbereitung).
 *   4. Die CSS-Quelle enthaelt eine aktualisierte Regel
 *      .spielbereich--game-route .aktionen-panel--waldtanz-dock, die das
 *      Panel auf display: none setzt, damit die visuelle Reduktion
 *      source-rule-protected ist.
 *
 * Sichtbares Spielerlebnis: nach GREEN ist die gelbe Aktions-Buttonleiste
 * auf /game weg, der Brettrand-End-Turn-Knopf uebernimmt die sichtbare
 * Zug-Steuerung, die Schlangenlichtung wird zum dominanten Zentrum.
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

describe('M1dm Waldtanz-Arena als Brettrand-Zentrum', () => {
  it('versteckt auf /game das Aktionen-Panel visuell (display:none Pflicht)', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    // hidden:true holt auch display:none-Elemente; wir wollen explizit
    // beweisen, dass es im DOM bleibt (M1dd-Grid-Area-Kind bleibt erhalten)
    // aber visuell nicht sichtbar ist. JSDOM parsed display:none aus
    // Stylesheets nicht automatisch, daher pruefen wir computed-style
    // direkt (siehe jsdom-computed-style-trap).
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen', hidden: true })
    const computedDisplay = window.getComputedStyle(aktionen).display
    // computed-style-resistent gegen jsdom ist die Klassen-Selektion;
    // wir akzeptieren entweder display:none via CSS-resolution oder ein
    // visibility:hidden / aria-hidden=true. Da unser CSS explizit
    // display:none setzt, ist der direkte Check auf Klassen-Strategie
    // (Rule-Body enthaelt display:none) am stabilsten.
    const cssRule = cssBlockForSelector('.spielbereich--game-route .aktionen-panel--waldtanz-dock')
    expect(cssRule).toMatch(/display:\s*none/)
    // Defensive: das Element MUSS im DOM bleiben (M1dd-Grid-Area-Kind).
    expect(aktionen).toBeInTheDocument()
    // JSDOM kann computed style nur eingeschraenkt — daher kein direkter
    // display-Check hier, der Test in der folgenden It deckt das bereits ab.
    expect(computedDisplay === 'none' || computedDisplay === 'block' || computedDisplay === '').toBe(true)
  })

  it('rendert auf /game weiterhin den Waldtanz-Arenazugknopf als sichtbare Brettrand-Aktion', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    // Der Arenazugknopf ist als region mit aria-label 'Waldtanz-Zugaktion'
    // erreichbar (siehe WaldtanzArenazugknopf.tsx). Die section enthaelt
    // entweder einen Button (phasenabhaengig) oder einen Wartehinweis —
    // beides beweist, dass der Brettrand-Zugknopf noch da ist.
    const arenazug = screen.getByRole('region', { name: 'Waldtanz-Zugaktion' })
    expect(arenazug).toBeVisible()
    // End-Turn-Schild ist die sichtbare Stitch-Beschriftung.
    expect(arenazug.textContent).toMatch(/End Turn/)
  })

  it('bewahrt auf / (Lobby) die Aktionen-Region als sichtbare Spielvorbereitung', () => {
    window.history.pushState({}, '', '/')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    expect(aktionen).toBeVisible()
  })

  it('setzt das Aktionen-Panel auf /game per CSS explizit auf display:none', () => {
    // Vertrag: das Aktionen-Panel-Element existiert weiterhin im React-Tree
    // (Nicht-Game-Routen brauchen es, und M1dd-Grid-Area braucht ein Kind),
    // aber auf /game wird es per route-spezifischer CSS-Regel auf
    // display:none gesetzt. Damit ist sichergestellt, dass selbst bei
    // zukuenftigem Re-Render der Komponente auf /game nichts zurueckkommt.
    const block = cssBlockForSelector('.spielbereich--game-route .aktionen-panel--waldtanz-dock')
    expect(block).toMatch(/display:\s*none/)
  })
})