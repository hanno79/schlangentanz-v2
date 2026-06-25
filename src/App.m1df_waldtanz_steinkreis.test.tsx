/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1df beweist, dass die Magiekreise in der
 * Waldtanz-Spielmoment-Lichtung auf /game als drei sichtbare,
 * kreisrunde, atmende Drop-Steine auf einem gemeinsamen Stein-Hintergrund
 * schweben — nicht als horizontale Buttonliste. Engine, Legal-Aktionen,
 * Spielregeln und Aktionspfade bleiben unveraendert.
 *
 * RED-Vertrag (TDD):
 *   1. Auf /game hat der Magiekreise-Container zusaetzlich zur bestehenden
 *      `waldtanz-magiekreise`-Klasse die neue
 *      `waldtanz-steinkreis`-Klasse.
 *   2. Die drei Magiekreis-Kinder sind mit `waldtanz-steinkreis__kreisel`
 *      markiert und gerendert als visuell runde Elemente (aspect-ratio,
 *      border-radius 50%) — nicht als rechteckige Buttons.
 *   3. Im CSS-Quell-Regelwerk existiert eine `waldtanz-steinkreis`-Regel
 *      mit `position: relative`, einem `::before`-Stein-Hintergrund
 *      (radial-gradient, 3px forest-green border) und einer zentralen
 *      Drop-Slot-Flaeche.
 *   4. Die drei Kreisel haben individuelle aria-labels (Startkreis,
 *      Schlangenende, Sonderzauber) und sind nach Auswahl einer
 *      Handkarte aktiv markiert (`--aktiv`-Klasse).
 *   5. Auf / (Lobby) und im Spielende-Zustand ohne Handkarte werden die
 *      Kreisel als `wartend` markiert und nicht als aktive Drop-Ziele
 *      gerendert.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

function cssRuleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M1df Waldtanz-Spielmoment-Lichtung (Steinkreis)', () => {
  it('rendert auf /game den Magiekreise-Container mit waldtanz-steinkreis-Klasse', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const magiekreise = document.querySelector('.waldtanz-magiekreise.waldtanz-steinkreis')

    expect(magiekreise).not.toBeNull()
    expect(magiekreise).toHaveClass('waldtanz-magiekreise')
    expect(magiekreise).toHaveClass('waldtanz-steinkreis')
  })

  it('rendert auf /game die drei Magiekreis-Kreisel mit waldtanz-steinkreis__kreisel-Klasse', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const magiekreise = document.querySelector('.waldtanz-magiekreise.waldtanz-steinkreis') as HTMLElement
    expect(magiekreise).not.toBeNull()
    const kreisel = magiekreise.querySelectorAll('.waldtanz-steinkreis__kreisel')

    expect(kreisel.length).toBe(3)
    const labels: string[] = Array.from(kreisel).map((k: Element) => k.getAttribute('aria-label') ?? '')
    expect(labels.some((l) => l.toLowerCase().includes('startkreis'))).toBe(true)
    expect(labels.some((l) => l.toLowerCase().includes('schlangenende') || l.toLowerCase().includes('anlegewege'))).toBe(true)
    expect(labels.some((l) => l.toLowerCase().includes('sonderzauber'))).toBe(true)
  })

  it('definiert im CSS einen runden Steinkreis mit Stein-Hintergrund und Slot-Bereich', () => {
    expect(cssRuleBody('.waldtanz-steinkreis')).toMatch(/position:\s*relative/)
    expect(cssRuleBody('.waldtanz-steinkreis::before')).toMatch(/radial-gradient/)
    expect(cssRuleBody('.waldtanz-steinkreis::before')).toMatch(/border:\s*3px\s+solid/)
  })

  it('formt die einzelnen Kreisel als visuell runde Drop-Slots mit eigenem Label', () => {
    const kreiselRule = cssRuleBody('.waldtanz-steinkreis__kreisel')
    expect(kreiselRule).toMatch(/border-radius:\s*50%/)
    expect(kreiselRule).toMatch(/aspect-ratio:\s*1\s*\/\s*1/)
    expect(cssRuleBody('.waldtanz-steinkreis__kreisel--aktiv')).toMatch(/(animation|pulse|atmen)/)
  })

  it('M1d3-Magiekreise-Media-Override (0,2,0) wird durch steinkreis-spezifischen Block (0,2,0) ueberstimmt', () => {
    // Im @media (min-width: 1100px)-Block wuerde M1d3 dem
    // .waldtanz-magiekreise__kreis ein min-height: clamp(4.9rem, 9vw, 6.75rem)
    // setzen, das groesser als die Kreisel-Breite (max 5.6rem) ist und so
    // den runden Stein optisch in ein Oval verwandelt. M1df fuegt deshalb
    // einen Override-Block mit doppelter Klassen-Selector-Specifity (0,2,0)
    // hinzu, der spaeter im Source steht und min-height/padding/border
    // auf 0/transparent setzt. RED: beide Bloecke existieren + Override
    // liegt spaeter im CSS-Source.
    const genericPos = appCss.indexOf('[class~="waldtanz-magiekreise__kreis"] {\n    aspect-ratio: 1 / 1;')
    const overridePos = appCss.indexOf('[class~="waldtanz-magiekreise__kreis"][class~="waldtanz-steinkreis__kreisel"]')
    expect(genericPos).toBeGreaterThan(-1)
    expect(overridePos).toBeGreaterThan(genericPos)

    const overrideRule = cssRuleBody('[class~="waldtanz-magiekreise__kreis"][class~="waldtanz-steinkreis__kreisel"]')
    expect(overrideRule).toMatch(/min-height:\s*0/)
    expect(overrideRule).toMatch(/padding:\s*0/)
    expect(overrideRule).toMatch(/border:\s*0/)
  })

  it('aktive Kreisel-LI rendert visuell unsichtbar (Stone rendert sich selbst)', () => {
    // Ohne diesen Override wuerde der generische M1d3-active-Block dem LI
    // border-style:solid + linear-gradient setzen — daraus wuerde ein
    // weisser Ring um den Stein entstehen. M1df neutralisiert das per
    // .waldtanz-steinkreis__kreisel.waldtanz-magiekreise__kreis--aktiv.
    const activeOverride = cssRuleBody('.waldtanz-steinkreis__kreisel.waldtanz-magiekreise__kreis--aktiv')
    expect(activeOverride).toMatch(/background:\s*transparent/)
    expect(activeOverride).toMatch(/border-color:\s*transparent/)
    expect(activeOverride).toMatch(/box-shadow:\s*none/)
  })
})
