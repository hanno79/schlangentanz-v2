/**
 * Author: rahn
 * Datum: 24.06.2026
 * Version: 1.0
 * Beschreibung: M1e macht den Partiefortschritt als visuellen Countdown-Ring auf
 *              dem Brettschritt sichtbar statt nur als Text-Panel in der
 *              Zugseitenleiste. Der Ring atmet mit dem Spielzustand (Karten im
 *              Nachziehstapel → Endrunden-Zuege → Sieger-Party-Stern).
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${escapeRegex(selektor)}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
const cssBlockContains = (selektor: string, subSelektor: string) =>
  appCss.match(new RegExp(`\\.${escapeRegex(selektor)}\\s+\\.${escapeRegex(subSelektor)}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function partieUhrBereich(): HTMLElement {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
  return within(spieltisch).getByRole('region', { name: 'Waldtanz-Spieluhr' })
}

function zustandMitFortschritt(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
  zustand.nachziehstapel = zustand.nachziehstapel.slice(0, 8)
  return zustand
}

function zustandImEndspurt(): Spielzustand {
  const zustand = zustandMitFortschritt()
  zustand.spielphase = 'Endspurt'
  zustand.zugphase = 'Nachziehphase'
  zustand.aktiverSpielerIndex = 1
  zustand.nachziehstapel = []
  zustand.endrunde = {
    ausloeserSpielerIndex: 0,
    verbleibendeSpielerIndizes: [1, 2],
  }
  return zustand
}

function zustandImSpielende(): Spielzustand {
  const zustand = zustandMitFortschritt()
  zustand.zugphase = 'Spielende'
  zustand.spielphase = 'Beendet'
  zustand.nachziehstapel = []
  zustand.endrunde = {
    ausloeserSpielerIndex: 0,
    verbleibendeSpielerIndizes: [],
  }
  return zustand
}

describe('M1e Waldtanz-Spieluhr', () => {
  it('rendert im Spieltisch einen SVG-Countdown-Ring mit sichtbarer Phasen-Phase und Kartenstand', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitFortschritt()} />)

    const uhr = partieUhrBereich()
    expect(uhr).toHaveClass('waldtanz-partie-uhr')
    expect(uhr).toHaveAttribute('data-partie-uhr-phase', 'nachziehphase')
    const svg = within(uhr).getByRole('img', { name: /Countdown bis zur Sieger-Party/ })
    expect(svg).toBeInTheDocument()
    const kreise = svg.querySelectorAll('circle')
    expect(kreise.length).toBe(2)
    expect(kreise[0]).toHaveClass('waldtanz-partie-uhr__kreis-hintergrund')
    expect(kreise[1]).toHaveClass('waldtanz-partie-uhr__kreis-fortschritt')
    expect(within(uhr).getByText('8 Karten bis zur Sieger-Party')).toBeVisible()
  })

  it('wechselt im Endspurt zu Spieler-Countdown mit pulsierendem Ring', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandImEndspurt()} />)

    const uhr = partieUhrBereich()
    expect(uhr).toHaveAttribute('data-partie-uhr-phase', 'endspurt')
    expect(uhr).toHaveClass('waldtanz-partie-uhr--puls')
    expect(within(uhr).getByText('2 Züge bis zur Sieger-Party')).toBeVisible()
    expect(within(uhr).getByText(/Endrundenzüge laufen/)).toBeVisible()
  })

  it('zeigt im Spielende den Sieger-Party-Stern statt Countdown-Kreis', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandImSpielende()} />)

    const uhr = partieUhrBereich()
    expect(uhr).toHaveAttribute('data-partie-uhr-phase', 'sieger-party')
    expect(within(uhr).getByText('Sieger-Party')).toBeVisible()
    expect(within(uhr).getByLabelText('Sieger-Party-Stern')).toBeInTheDocument()
  })

  it('rendert die Spieluhr mit chunky Stitch-Brettrahmen und zentraler Kreisbahn', () => {
    expect(cssBlock('waldtanz-partie-uhr')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-partie-uhr')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-partie-uhr__kreis-hintergrund')).toMatch(/fill:\s*none/)
    expect(cssBlock('waldtanz-partie-uhr__kreis-fortschritt')).toMatch(/stroke:\s*var\(--st-color-primary\)/)
    expect(cssBlockContains('waldtanz-partie-uhr--puls', 'waldtanz-partie-uhr__kreis-fortschritt')).toMatch(/animation:/)
  })
})
