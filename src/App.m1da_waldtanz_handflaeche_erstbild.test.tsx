/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.1
 * Beschreibung: M1da macht die untere Spielreihe auf /game (Spielerplakette, Handfächer,
 * End-Turn-Pille) im 900px-Erstbild vollständig sichtbar und überlappungsfrei.
 *
 * Tests:
 *   - DOM-Landmarken (Region-Rollen + accessible names) müssen existieren.
 *   - CSS-Source-Kontrakte für Höhe, Spielerplakette-Kompaktheit,
 *     Arenazug-Margin, Region-Label-Span.
 *   - Smoke-Wiring im package.json.
 *
 * Bewusst NICHT in jsdom:
 *   - `getBoundingClientRect()` liefert in jsdom für alle Werte 0. Echte
 *     Geometrie-Disjunktheit beweist der M1da-Browser-Smoke
 *     (`scripts/m1da_waldtanz_handflaeche_erstbild_smoke.mjs`) auf der
 *     production-alias. Pattern: `default-to-css-source-assertions`.
 *
 * # AENDERUNG 22.06.2026: v1.1 — Kimi-Review: BoundingRect-Assertions entfernt
 *   (jsdom-Trivialtrue), dafür CSS-Source + DOM-Landmark-Asserts hinzugefügt.
 *   Promise-of-negative-assertion für Spielerplakette-Region eingelöst.
 */
/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

const cleanedBlock = (selektor: string) =>
  cssBlock(selektor).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1da Waldtanz-Handfläche und Spielerplakette im Erstbild', () => {
  it('rendert auf /game die untere Spielreihe als benannte Regionen mit korrekter Verschachtelung', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    // DOM-Landmarken: alle drei M1da-Regionen müssen existieren und im
    // Spieltisch (oder dessen direkter Umgebung) verschachtelt sein.
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    expect(spieltisch).toBeInTheDocument()

    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const spielerplakette = screen.getByRole('region', { name: 'Waldtanz-Spielerplakette' })
    const arenazug = within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugaktion' })

    // Spielerplakette und Arenazug sind Geschwister des Spieltischs (position: absolute
    // bzw. eigener grid-row), aber im Dokument muss Handkarten VOR Arenazug kommen,
    // damit der End-Turn-Knopf unter der Hand erscheint.
    const handPos = handkarten.compareDocumentPosition(arenazug) & Node.DOCUMENT_POSITION_FOLLOWING
    expect(handPos).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    // Region-Label ist ein sichtbares inner-Span (sichtbar-heading-IDREF-Pattern).
    const regionLabel = spielerplakette.querySelector('.waldtanz-spielerplakette__region-label')
    expect(regionLabel).not.toBeNull()
    expect(regionLabel?.textContent?.trim()).toBe('Waldtanz-Spielerplakette')
  })

  it('hält die Waldtanz-Spielerplakette kompakt (kein 130-px-Block mehr)', () => {
    const cleaned = cleanedBlock('.spielbereich--game-route [class~="spielbrett--waldtanz"] [class~="waldtanz-spielerplakette"]')
    expect(cleaned).toMatch(/max-height:\s*clamp\(/)
    const max = cleaned.match(/max-height:\s*clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
    expect(max).not.toBeNull()
    if (!max) return
    const remMax = parseFloat(max[3].trim())
    // Obergrenze 5.5 rem = 88 px bei 16-px-Basis; vorher war die Plakette 132 px hoch.
    expect(remMax).toBeLessThanOrEqual(5.5)
  })

  it('begrenzt die Handkarten-Panel-Höhe so dass die Karten unterhalb von 900 px enden', () => {
    const cleaned = cleanedBlock('.spielbereich--game-route [class~="handkarten-panel"]')
    expect(cleaned).toMatch(/max-height:\s*clamp\(/)
    // Panel+Spielerplakette+End-Turn sollen in 900 px passen: Panel max 12.1rem.
    const panelMax = cleaned.match(/max-height:\s*clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
    expect(panelMax).not.toBeNull()
    if (!panelMax) return
    expect(parseFloat(panelMax[3].trim())).toBeLessThanOrEqual(12.1)
  })

  it('begrenzt die Handkarten-Höhe pro Karte (chunky Stitch-Look)', () => {
    // M1bx pinnt max-height 7.15rem (114.4 px). Die Regel muss in der
    // /game-Route fuer --spielkartenfaecher-Karten existieren.
    const cleaned = cleanedBlock('.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"] [class~="handkarte__button--karte"]')
    expect(cleaned).toMatch(/height:\s*clamp\([^)]+\)/)
    const heightMatch = cleaned.match(/height:\s*clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
    expect(heightMatch).not.toBeNull()
    if (!heightMatch) return
    // 7.15rem = 114.4 px — verhindert dass Karten aus dem 900-Erstbild fallen.
    expect(parseFloat(heightMatch[3].trim())).toBeLessThanOrEqual(7.2)
  })

  it('verhindert dass der Arenazugknopf die Handkarten überlagert (M1da-Margin-Reduktion)', () => {
    const cleaned = cleanedBlock('.spielbereich--game-route [class~="waldtanz-arenazug"]')
    // M1cl pinnt grid-row 5; M1da reduziert margin-top, damit der Knopf
    // die Hand nicht ueber die Panel-Unterkante schiebt.
    expect(cleaned).toMatch(/grid-row:\s*5/)
    const marginMatch = cleaned.match(/margin-top:\s*clamp\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
    expect(marginMatch).not.toBeNull()
    if (!marginMatch) return
    // Negativ-Spannweite, deren Obergrenze (3. Wert) nicht ueber -1.5 rem liegt
    // (vorher -5 rem, von M1cl auf -1.5 rem reduziert).
    const remMax = parseFloat(marginMatch[3].trim())
    expect(remMax).toBeGreaterThanOrEqual(-3)
    expect(remMax).toBeLessThanOrEqual(-1)
  })

  it('verdrahtet das M1da-Smoke-Skript in der kanonischen npm-Smoke-Kette', () => {
    expect(existsSync('scripts/m1da_waldtanz_handflaeche_erstbild_smoke.mjs')).toBe(true)
    expect(packageJson).toContain('m1da_waldtanz_handflaeche_erstbild_smoke.mjs')
    const smokeBlock = packageJson.match(/"smoke:production":\s*"([^"]+)"/)?.[1] ?? ''
    expect(smokeBlock).toContain('m1da_waldtanz_handflaeche_erstbild_smoke.mjs')
    const m1cyIdx = smokeBlock.indexOf('m1cy_waldtanz_gegnerplakette_smoke.mjs')
    const m1daIdx = smokeBlock.indexOf('m1da_waldtanz_handflaeche_erstbild_smoke.mjs')
    expect(m1daIdx).toBeGreaterThan(m1cyIdx)
    expect(m1daIdx).toBeGreaterThan(-1)
  })
})
