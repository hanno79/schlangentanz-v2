/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1af macht Karten in Schlangenpfaden als echte Waldtanz-Spielkarten mit Symbolen und Wertplaketten sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function schlangenkartenGesichterZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('gesicht-blau-m1af', 'Blau', 3),
    sonderkarte('gesicht-grube-m1af', 'Schlangengrube'),
  ], 'gesichter-pfad-m1af')]
  return zustand
}

describe('M1af Waldtanz-Schlangenkarten-Gesichter', () => {
  it('zeigt Karten im Schlangenpfad als greifbare Mini-Spielkarten statt nur ID-Textzeilen', () => {
    render(<App initialZustand={schlangenkartenGesichterZustand()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const reihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe gesichter-pfad-m1af' })
    const karten = within(reihe).getAllByRole('listitem')
    const farbkarteElement = karten[0]
    const sonderkarteElement = karten[1]

    expect(farbkarteElement).toHaveClass('schlangekarte__karte--spielkarte')
    expect(within(farbkarteElement).getByText('Schlangenkarte')).toHaveClass('schlangekarte__karte-eyebrow')
    expect(within(farbkarteElement).getByText('💧')).toHaveClass('schlangekarte__karte-symbol')
    expect(within(farbkarteElement).getByText('Farbkarte Blau')).toHaveClass('schlangekarte__karte-typ')
    expect(within(farbkarteElement).getByText('3 Punkte')).toHaveClass('schlangekarte__karte-wert')

    expect(sonderkarteElement).toHaveClass('schlangekarte__karte--spielkarte')
    expect(within(sonderkarteElement).getByText('✨')).toHaveClass('schlangekarte__karte-symbol')
    expect(within(sonderkarteElement).getByText('Sonderkarte Schlangengrube')).toHaveClass('schlangekarte__karte-typ')
    expect(within(sonderkarteElement).getByText('Sonderaktion')).toHaveClass('schlangekarte__karte-wert')
  })

  it('legt den Stitch-Kartenflächen-Stil für Schlangenpfadkarten ab', () => {
    expect(cssBlock('schlangekarte__karte--spielkarte')).toMatch(/aspect-ratio:\s*2\s*\/\s*3/)
    expect(cssBlock('schlangekarte__karte--spielkarte')).toMatch(/border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__karte--spielkarte')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__karte-symbol')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__karte-wert')).toMatch(/border-radius:\s*999px/)
    expect(appCss).toMatch(/\.schlangekarte__karte--farbe-blau \.schlangekarte__karte-symbol\s*\{[\s\S]*background:\s*linear-gradient/)
    expect(appCss).toMatch(/\.schlangekarte__karte--sonderkarte \.schlangekarte__karte-symbol\s*\{[\s\S]*background:\s*linear-gradient/)
  })

  it('schützt die Kartenflächen-Typografie vor der späteren generischen Schlangenkarten-Span-Regel', () => {
    const generischeSpanRegel = appCss.indexOf('.schlangekarte__karte strong,\n.schlangekarte__karte span')
    const spaeteGesichtsregel = appCss.indexOf('.schlangekarte__karte--spielkarte .schlangekarte__karte-eyebrow')

    expect(generischeSpanRegel).toBeGreaterThan(0)
    expect(spaeteGesichtsregel).toBeGreaterThan(generischeSpanRegel)
    expect(appCss.slice(spaeteGesichtsregel)).toMatch(/\.schlangekarte__karte--spielkarte \.schlangekarte__karte-symbol[\s\S]*font-size:\s*1\.55rem/)
    expect(appCss.slice(spaeteGesichtsregel)).toMatch(/\.schlangekarte__karte--spielkarte \.schlangekarte__karte-wert[\s\S]*line-height:\s*1\.05/)
  })
})
