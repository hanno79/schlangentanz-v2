/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ac beweist den Stitch-inspirierten Arenastein: zentrale Brettobjekte liegen auf einer greifbaren Waldlichtungs-Spielfläche.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function arenasteinZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
}

describe('M1ac Waldtanz-Arenastein', () => {
  it('bündelt Ablage, Zugspur, Aufgaben und Schlangenbereich auf einem zentralen Arenastein vor der Handkartenleiste', () => {
    const zustand = arenasteinZustand()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const ablage = within(arenastein).getByRole('region', { name: 'Waldtanz-Ablage' })
    const aufgabentafel = within(arenastein).getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const schlangenbereich = within(arenastein).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(arenastein).toHaveClass('waldtanz-arenastein')
    expect(within(arenastein).getByText('Leuchtender Waldstein')).toBeInTheDocument()
    expect(within(arenastein).getByText('Magische Zielkreise leuchten im Brett.')).toBeInTheDocument()
    expect(ablage.compareDocumentPosition(aufgabentafel) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(aufgabentafel.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(arenastein.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    const steinCss = cssBlock('waldtanz-arenastein')
    expect(steinCss).toMatch(/radial-gradient/)
    expect(steinCss).toMatch(/border:\s*4px solid var\(--st-color-border-strong\)/)
    expect(steinCss).toMatch(/box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/)
    expect(steinCss).toMatch(/border-radius:\s*min\(4rem, 12vw\)/)
  })
})
