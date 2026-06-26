/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1g beweist den Waldtanz-Handkartenfächer als greifbare Spielkartenfläche statt flacher Button-/Textliste.
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

function handkartenZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('M1g Waldtanz-Handkartenfächer', () => {
  it('rendert die Hand als bodennahen Kartenfächer mit Spielkarten-Gesicht und Auswahl-Hub', () => {
    render(<App initialZustand={handkartenZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const handliste = within(handkarten).getByRole('list')
    const ersteHandkarte = within(handliste).getAllByRole('listitem')[0]
    const ersterButton = within(ersteHandkarte).getByRole('button', { name: /blau-01/i })

    expect(handliste).toHaveClass('handkartenleiste--waldtanz-faecher')
    expect(ersteHandkarte).toHaveClass('handkarte--spielkarte')
    expect(ersterButton).toHaveClass('handkarte__button--karte')
    expect(within(ersterButton).getByText('Waldtanzkarte')).toBeInTheDocument()
    expect(within(ersterButton).getByText('Blau')).toHaveClass('handkarte__farbe')
    expect(within(ersterButton).getByText('1 Punkte')).toHaveClass('handkarte__punkte')
    // AENDERUNG 26.06.2026: M1ds hat den Tooltip-Text auf "Karte spielen →" erweitert
    // (Stitch-Pattern: schwarze Pille mit Pfeil-Hint, vorher nur "Spielen").
    expect(within(ersterButton).getByText('Karte spielen →')).toHaveClass('handkarte__spielhinweis')

    fireEvent.click(ersterButton)

    expect(ersteHandkarte).toHaveClass('handkarte--ausgewaehlt')
    expect(within(handkarten).getByText('Ausgewählte Karte schwebt über dem Fächer.')).toBeInTheDocument()

    expect(cssBlock('handkartenleiste--waldtanz-faecher')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*7\.5rem\),\s*8\.5rem\)\)/)
    expect(cssBlock('handkartenleiste--waldtanz-faecher')).toMatch(/justify-content:\s*center/)
    expect(cssBlock('handkarte__button--karte')).toMatch(/aspect-ratio:\s*2\s*\/\s*3/)
    expect(cssBlock('handkarte__button--karte')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('handkarte__button--karte')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    // AENDERUNG 26.06.2026: M1ds hat den Selected-Lift auf den Stitch-Pattern-Wert
    // -3.5rem (Token --handkarte-lift-y) und scale(1.18) angehoben (vorher
    // var(--handkarte-lift-y)=-0.75rem bzw. scale(1.05) im M1g-Vertrag).
    expect(appCss).toMatch(/\.handkarte--ausgewaehlt \.handkarte__button--karte\s*\{[\s\S]*transform:\s*translateY\(var\(--handkarte-lift-y\)\) scale\(1\.18\)/)
  })
})
