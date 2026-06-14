/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1p zeigt die ausgewählte Handkarte als große Waldtanz-Kartenvorschau statt nur als Textstatus.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function kartenvorschauZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('M1p Waldtanz-Kartenvorschau', () => {
  it('hebt die ausgewählte Handkarte als spielnahe Vorschau mit Zielhinweis hervor', () => {
    render(<App initialZustand={kartenvorschauZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const ersteHandkarte = within(handkarten).getByRole('button', { name: /blau-01/i })

    fireEvent.click(ersteHandkarte)

    const vorschau = within(handkarten).getByRole('region', { name: 'Ausgewählte Handkarte: blau-01' })
    expect(vorschau).toHaveClass('handkarten-preview')
    expect(within(vorschau).getByText('Aktuelle Karte am Waldtanz-Tisch')).toHaveClass('handkarten-preview__headline')
    expect(within(vorschau).getByText('Zugkarte bereit')).toHaveClass('handkarten-preview__eyebrow')
    expect(within(vorschau).getByText('blau-01')).toBeVisible()
    expect(within(vorschau).getByText('Farbkarte Blau')).toBeVisible()
    expect(within(vorschau).getByText('1 Punkte')).toHaveClass('handkarten-preview__werteplakette')
    expect(within(vorschau).getByText('Ausgewählte Karte schwebt über dem Fächer.')).toBeVisible()
    expect(within(vorschau).getByText('Ziehe sie auf eine leuchtende Brettzone oder klicke ein Ziel im Schlangenbereich.')).toBeVisible()

    expect(cssBlock('handkarten-preview')).toMatch(/grid-template-columns:\s*minmax\(6rem,\s*9rem\)\s*minmax\(0,\s*1fr\)/)
    expect(cssBlock('handkarten-preview')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('handkarten-preview__karte')).toMatch(/aspect-ratio:\s*2\s*\/\s*3/)
    expect(cssBlock('handkarten-preview__karte')).toMatch(/box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.handkarten-preview--farbe-blau \.handkarten-preview__symbol\s*\{[\s\S]*background:\s*linear-gradient\(160deg,\s*#cfe8ff,\s*#7bbcff\)/)
  })
})
