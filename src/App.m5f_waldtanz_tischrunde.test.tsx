/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M5f koppelt den Waldtanz-Spielerrahmen an Zugpfad und KI-Vorspulen, damit die Tischrunde über mehrere Züge spielnah sichtbar bleibt.
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

function beendeErstenMenschenzug() {
  const aktionen = screen.getByRole('region', { name: 'Aktionen' })
  fireEvent.click(within(aktionen).getByRole('button', { name: /Neue Schlange starten mit Karte blau-01/i }))
  fireEvent.click(within(aktionen).getByRole('button', { name: /Ausspielphase beenden/i }))
  fireEvent.click(within(aktionen).getByRole('button', { name: /Aufgabenprüfung beenden/i }))
  fireEvent.click(within(aktionen).getByRole('button', { name: /Zug beenden/i }))
}

function spielerrahmen() {
  return within(screen.getByRole('region', { name: 'Spieltisch' })).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
}

describe('M5f Waldtanz-Tischrunde', () => {
  it('zeigt alle Gegner, den nächsten Halt und den KI-Rückkehrstatus direkt im Spielerrahmen', () => {
    render(<App initialZustand={vierSpielerZustand()} />)

    let rahmen = spielerrahmen()
    const gegnerliste = within(rahmen).getByRole('list', { name: 'Gegner am Tisch' })
    const gegner = Array.from(gegnerliste.children) as HTMLElement[]

    expect(within(rahmen).getByText('Tischrunde: 4 Spieler')).toBeInTheDocument()
    expect(within(rahmen).getByText('Nächster Zug: Spieler 2')).toBeInTheDocument()
    expect(gegner).toHaveLength(3)
    expect(within(gegner[0]).getByText('Gegner: Spieler 2')).toBeInTheDocument()
    expect(within(gegner[0]).getByText('nächster Zug')).toBeInTheDocument()
    expect(within(gegner[1]).getByText('Gegner: Spieler 3')).toBeInTheDocument()
    expect(within(gegner[2]).getByText('Gegner: Spieler 4')).toBeInTheDocument()
    expect(within(rahmen).getByText('Du — Spieler 1')).toBeInTheDocument()

    beendeErstenMenschenzug()

    rahmen = spielerrahmen()
    expect(within(rahmen).getByText('Tischrunde: 4 Spieler')).toBeInTheDocument()
    expect(within(rahmen).getByText('Nächster Zug: Spieler 3')).toBeInTheDocument()
    expect(within(rahmen).getByText('Aktiv — Spieler 2')).toBeInTheDocument()
    expect(within(rahmen).getByText('Gegner: Spieler 1')).toBeInTheDocument()
    expect(within(rahmen).getByText('Gegner: Spieler 3')).toBeInTheDocument()
    expect(within(rahmen).getByText('nächster Zug')).toBeInTheDocument()

    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    fireEvent.click(within(aktionen).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' }))

    rahmen = spielerrahmen()
    expect(within(rahmen).getByText('Du — Spieler 1')).toBeInTheDocument()
    expect(within(rahmen).getByText('Gegnerzug zurück bei dir')).toBeInTheDocument()
    expect(within(rahmen).getByText('Nächster Zug: Spieler 2')).toBeInTheDocument()

    expect(cssBlock('waldtanz-spielerrahmen__gegnerliste')).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*9rem\),\s*1fr\)\)/)
    expect(cssBlock('waldtanz-spielerrahmen__plakette--naechster')).toMatch(/transform:\s*translateY\(-3px\) rotate\(1deg\)/)
    expect(cssBlock('waldtanz-spielerrahmen__plakette--naechster')).toMatch(/background:\s*var\(--st-color-tertiary-container,\s*#ffbcaa\)/)
    expect(appCss).toMatch(/\.waldtanz-spielerrahmen__statusband[\s\S]*box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
  })
})
