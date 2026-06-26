/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ar staffelt die Handkarten als tieferen Stitch-Kartenfächer mit Hover-/Auswahl-Lift.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selector: string) => appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function kartenImTiefenfaecher() {
  const handkarten = within(screen.getByRole('region', { name: 'Spieltisch' })).getByRole('region', { name: 'Handkarten' })
  const tiefenfaecher = handkarten.querySelector('.handkartenleiste--tiefenfaecher') as HTMLElement
  return { handkarten, tiefenfaecher, karten: within(tiefenfaecher).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ }) }
}

describe('M1ar Waldtanz-Tiefenfächer', () => {
  it('staffelt die aktive Hand auf /game als greifbaren Kartenfächer und hebt Auswahl sichtbar aus der Bühne', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    render(<App initialZustand={zustand} />)

    const { handkarten, tiefenfaecher, karten } = kartenImTiefenfaecher()
    const handbuehne = within(handkarten).getByRole('group', { name: 'Waldtanz-Handbühne' })

    expect(handbuehne.compareDocumentPosition(tiefenfaecher) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(tiefenfaecher).toHaveClass('handkartenleiste--waldtanz-faecher')
    expect(karten).toHaveLength(5)
    expect(karten[0].closest('li')).toHaveStyle({ '--hand-faecher-rotation': '-8deg' })
    expect(karten[2].closest('li')).toHaveStyle({ '--hand-faecher-y': '-0.64rem' })
    expect(karten[4].closest('li')).toHaveStyle({ '--hand-faecher-rotation': '8deg' })

    fireEvent.click(karten[0])
    expect(karten[0]).toHaveAttribute('aria-pressed', 'true')
    expect(karten[0].closest('li')).toHaveClass('handkarte--ausgewaehlt')
    expect(karten[0].closest('li')).toHaveStyle({ '--hand-faecher-z': '99' })

    expect(cssBlock('.handkartenleiste--tiefenfaecher')).toMatch(/display:\s*flex/)
    expect(cssBlock('.handkartenleiste--tiefenfaecher')).toMatch(/perspective:\s*900px/)
    expect(cssBlock('.handkartenleiste--tiefenfaecher .handkarte')).toMatch(/margin-inline:\s*clamp\(-0\.35rem,\s*-0\.4vw,\s*-0\.12rem\)/)
    // AENDERUNG 26.06.2026: M1ds hat den Hover-Lift auf den Stitch-Pattern-Wert
    // -2.5rem angehoben (vorher -1.25rem) und die Tiefenfaecher-Wackel-Animation
    // behaelt ihre eigenen Werte (siehe handkarte-tiefenfaecher-wackelt-Keyframe).
    expect(appCss).toMatch(/\[class~="handkartenleiste--tiefenfaecher"\] \[class~="handkarte__button--karte"\]:hover[\s\S]*translateY\(-2\.5rem\)/)
    expect(appCss).toMatch(/\[class~="handkartenleiste--tiefenfaecher"\] \[class~="handkarte--ausgewaehlt"\] \[class~="handkarte__button--karte"\][\s\S]*animation:\s*handkarte-tiefenfaecher-wackelt/)
    expect(appCss).toMatch(/@keyframes\s+handkarte-tiefenfaecher-wackelt[\s\S]*translateY\(-1\.6rem\)[\s\S]*translateY\(-1\.85rem\)/)
  })

  it('berechnet die Fächerstaffel auch für sechs Handkarten symmetrisch', () => {
    window.history.pushState({}, '', '/game')
    const basis = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const mitSechsHandkarten = {
      ...basis,
      spieler: basis.spieler.with(0, { ...basis.spieler[0], hand: [...basis.spieler[0].hand, basis.nachziehstapel[0]] }),
    }
    render(<App initialZustand={mitSechsHandkarten} />)

    const { karten: sechsKarten } = kartenImTiefenfaecher()
    expect(sechsKarten).toHaveLength(6)
    expect(sechsKarten[0].closest('li')).toHaveStyle({ '--hand-faecher-rotation': '-8deg' })
    expect(sechsKarten[5].closest('li')).toHaveStyle({ '--hand-faecher-rotation': '8deg' })
    expect(sechsKarten[2].closest('li')).toHaveStyle({ '--hand-faecher-y': '-0.64rem' })
  })
})
