/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bg macht den Spielstatus als sonnige Brett-HUD-Leiste statt nur Debugdaten sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bg Waldtanz-Sonnenstand', () => {
  it('zeigt Spielphase, aktiven Spieler und Kartenzug als board-nahe Sonnenstand-Leiste vor den Debugdetails', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.zugpflichten.gespielteKarten = 1
    render(<App initialZustand={zustand} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const sonnenstand = within(spielstatus).getByRole('group', { name: 'Waldtanz-Sonnenstand' })
    const debugDetails = within(spielstatus).getByText('Spielphase').closest('details')
    expect(debugDetails).toBeInstanceOf(HTMLDetailsElement)
    const spielphaseDetails = debugDetails as HTMLDetailsElement
    const zugfortschritt = within(spielstatus).getByRole('region', { name: 'Zugfortschritt' })

    expect(sonnenstand).toHaveClass('waldtanz-sonnenstand')
    expect(within(sonnenstand).getByText('Sonnenstand')).toHaveClass('waldtanz-sonnenstand__eyebrow')
    expect(within(sonnenstand).getByText('Karten ausspielen')).toHaveClass('waldtanz-sonnenstand__phase')
    expect(within(sonnenstand).getByText('Spieler 1 am Zug')).toBeVisible()
    expect(within(sonnenstand).getByText('3 Spieler am Tisch')).toBeVisible()
    expect(within(sonnenstand).getByText('Zugkarten: 1/2')).toBeVisible()
    expect(within(sonnenstand).getByText('Laufende Partie')).toBeVisible()
    expect(sonnenstand.compareDocumentPosition(spielphaseDetails) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(spielphaseDetails.compareDocumentPosition(zugfortschritt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('legt den Stitch-CSS-Vertrag fuer die sonnige Statusleiste ab', () => {
    const block = cssBlock('.waldtanz-sonnenstand')
    const phaseBlock = cssBlock('.waldtanz-sonnenstand__phase')
    const chipBlock = cssBlock('.waldtanz-sonnenstand__chip')

    expect(block).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(block).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(block).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(block).toMatch(/background:[\s\S]*radial-gradient\(circle at 14% 18%/)
    expect(phaseBlock).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(chipBlock).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(chipBlock).toMatch(/border-radius:\s*999px/)
  })
})
