/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bi beweist den Material-HUD-Vertical: Material und Aufgaben wirkt als Stitch-Materialrucksack statt Debugliste.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('M1bi Waldtanz-Materialrucksack', () => {
  it('zeigt Materialwerte als körperlichen Rucksack vor Aufgabenkarten und Debugdetails', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const rucksack = within(material).getByRole('region', { name: 'Waldtanz-Materialrucksack' })
    const aufgabenkarten = within(material).getByRole('region', { name: 'Aufgabenkarten' })
    const debug = within(material).getByRole('complementary', { name: 'Entwicklungsdaten: Karten und Aufgaben' })

    expect(material).toHaveClass('waldtanz-hud--material')
    expect(rucksack).toHaveClass('materialrucksack')
    expect(within(rucksack).getByRole('heading', { name: 'Materialrucksack' })).toBeVisible()
    expect(within(rucksack).getByText(/Nachziehstapel/)).toBeVisible()
    expect(within(rucksack).getByText(/Ablage/)).toBeVisible()
    expect(within(rucksack).getByText(/Aufgabenstapel/)).toBeVisible()
    expect(within(rucksack).getByText(/Offene Aufgaben/)).toBeVisible()
    expect(within(rucksack).getByText(/Sonderkarten-Zauber/)).toBeVisible()

    expect(rucksack.compareDocumentPosition(aufgabenkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(aufgabenkarten.compareDocumentPosition(debug) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    expect(debug).toHaveTextContent('Karten im Nachziehstapel:')
    expect(debug).toHaveTextContent('Aktuelle Aufgaben:')
    expect(appCss).toMatch(/\.materialrucksack\s*\{[^}]*border:\s*var\(--st-border-width-chunky\)\s+solid\s+var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.materialrucksack\s*\{[^}]*border-radius:\s*var\(--st-radius-xl\)/s)
    expect(appCss).toMatch(/\.materialrucksack\s*\{[^}]*box-shadow:\s*var\(--st-shadow-hard\)/s)
    expect(appCss).toMatch(/\.materialrucksack__chip\s*\{[^}]*border:\s*2px\s+solid\s+var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.materialrucksack__icon\s*\{[^}]*background:\s*var\(--st-color-secondary-container\)/s)
  })
})
