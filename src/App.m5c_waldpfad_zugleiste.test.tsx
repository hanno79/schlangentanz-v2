/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M5c beweist eine board-nahe Waldpfad-Zugleiste, die Zugreihenfolge und aktuellen Spieler als Spielobjekt statt Debugliste sichtbar macht.
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

describe('M5c Waldpfad-Zugleiste', () => {
  it('zeigt Zugreihenfolge, aktive Spielfigur und KI-Stationen board-nah im Spieltisch', () => {
    render(<App initialZustand={vierSpielerZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const zugpfad = within(spieltisch).getByRole('region', { name: 'Zugpfad' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const stationen = within(zugpfad).getAllByRole('listitem')

    expect(zugpfad).toHaveClass('zugpfad')
    expect(stationen).toHaveLength(4)
    expect(stationen[0]).toHaveClass('zugpfad__station--aktiv')
    expect(within(stationen[0]).getByText('Du')).toBeInTheDocument()
    expect(within(stationen[0]).getByText('am Zug')).toBeInTheDocument()
    expect(within(stationen[0]).getByText('Karten ausspielen')).toBeInTheDocument()
    expect(within(stationen[1]).getByText('KI')).toBeInTheDocument()
    expect(within(zugpfad).getByText('Nächster Halt: Spieler 2')).toBeInTheDocument()
    expect(zugpfad.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    beendeErstenMenschenzug()

    const aktualisierteStationen = within(zugpfad).getAllByRole('listitem')
    expect(aktualisierteStationen[1]).toHaveClass('zugpfad__station--aktiv')
    expect(within(aktualisierteStationen[1]).getByText('KI')).toBeInTheDocument()
    expect(within(aktualisierteStationen[1]).getByText('am Zug')).toBeInTheDocument()
    expect(within(zugpfad).getByText('Nächster Halt: Spieler 3')).toBeInTheDocument()

    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    fireEvent.click(within(aktionen).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' }))

    const stationenNachGegnerzug = within(zugpfad).getAllByRole('listitem')
    expect(stationenNachGegnerzug[0]).toHaveClass('zugpfad__station--aktiv')
    expect(within(zugpfad).getByText('Nächster Halt: Spieler 2')).toBeInTheDocument()
    expect(within(zugpfad).getByText('Gegnerzug abgeschlossen. Du bist wieder dran.')).toBeInTheDocument()

    expect(cssBlock('zugpfad')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('zugpfad')).toMatch(/border-radius:\s*2rem/)
    expect(cssBlock('zugpfad')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('zugpfad__station--aktiv')).toMatch(/transform:\s*translateY\(-3px\)/)
    expect(appCss).toMatch(/\.zugpfad__strecke[\s\S]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(8rem,\s*1fr\)\)/)
  })
})
