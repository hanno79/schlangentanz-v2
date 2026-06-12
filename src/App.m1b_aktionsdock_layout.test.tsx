/**
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: M1b beweist den Stitch-inspirierten Aktionsdock-Slice: schnelle Kontextaktionen board-nah und Fallback-Liste weniger dominant.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function liegtVor(a: Element, b: Element): boolean {
  return Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
}

describe('M1b Waldtanz-Aktionsdock', () => {
  it('macht schnelle Aktionen board-nah sichtbar und ordnet die lange Buttonliste als Fallback ein', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpielerPanel = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const spieltisch = within(aktiverSpielerPanel).getByRole('region', { name: 'Spieltisch' })
    const aktionen = within(aktiverSpielerPanel).getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionen).getByRole('region', { name: 'Empfohlene Aktion' })
    const phasenaktion = within(aktionen).getByRole('region', { name: 'Phasenaktion' })
    const weitereAktionen = within(aktionen).getByRole('region', { name: 'Weitere Aktionen' })

    expect(aktionen).toHaveClass('aktionen-panel--waldtanz-dock')
    expect(spieltisch.nextElementSibling).toBe(aktionen)
    expect(aktionen.querySelector('.aktionen-dock__schnellzug')).toContainElement(empfohleneAktion)
    expect(aktionen.querySelector('.aktionen-dock__schnellzug')).toContainElement(phasenaktion)
    expect(liegtVor(empfohleneAktion, phasenaktion)).toBe(true)
    expect(liegtVor(phasenaktion, weitereAktionen)).toBe(true)
    expect(within(weitereAktionen).getByText('Spielregeln prüfen jede Aktion vor dem Ausführen.')).toBeInTheDocument()

    expect(cssBlock('aktionen-panel--waldtanz-dock')).toMatch(/position:\s*sticky/)
    expect(cssBlock('aktionen-dock__schnellzug')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*220px\),\s*1fr\)\)/)
    expect(cssBlock('aktionen-gruppe--weitere')).toMatch(/max-height:\s*clamp\(10rem,\s*26vh,\s*18rem\)/)
    expect(cssBlock('aktions-liste')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*180px\),\s*1fr\)\)/)
  })
})
