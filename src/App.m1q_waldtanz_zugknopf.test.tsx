/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1q macht den naechsten Phasenschritt als grossen Waldtanz-Zugknopf statt als kleinen Listenbutton sichtbar.
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

function vierSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
}

function zugkompass() {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
  return within(spieltisch).getByRole('region', { name: 'Zugkompass' })
}

describe('M1q Waldtanz-Zugknopf', () => {
  it('hebt den naechsten Phasenschritt als goldenen End-Turn-Button board-nah hervor', () => {
    render(<App initialZustand={vierSpielerZustand()} />)

    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    fireEvent.click(within(aktionen).getByRole('button', { name: /Neue Schlange starten mit Wasserwirbel/i }))

    const kompass = zugkompass()
    const hauptaktion = within(kompass).getByRole('button', { name: 'Weiter zur Aufgabenprüfung' })

    expect(hauptaktion).toHaveClass('zugkompass__hauptaktion')
    expect(within(hauptaktion).getByText('Zugknopf')).toBeInTheDocument()
    expect(within(hauptaktion).getByText('Weiter zur Aufgabenprüfung')).toBeInTheDocument()
    expect(within(hauptaktion).getByText('→')).toBeInTheDocument()
    expect(within(aktionen).getByRole('button', { name: 'Ausspielphase beenden' })).toBeVisible()

    fireEvent.click(hauptaktion)
    expect(within(zugkompass()).getByRole('button', { name: 'Weiter zum Zugabschluss' })).toHaveClass('zugkompass__hauptaktion')

    expect(cssBlock('zugkompass__hauptaktion')).toMatch(/justify-self:\s*end/)
    expect(cssBlock('zugkompass__hauptaktion')).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(cssBlock('zugkompass__hauptaktion')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('zugkompass__hauptaktion')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('zugkompass__hauptaktion')).toMatch(/max-width:\s*100%/)
    expect(cssBlock('zugkompass__hauptaktion')).toMatch(/min-width:\s*0/)
    expect(cssBlock('zugkompass__hauptaktion-label')).toMatch(/overflow-wrap:\s*anywhere/)
    expect(cssBlock('zugkompass__hauptaktion:active')).toMatch(/transform:\s*translateY\(4px\)/)
  })
})
