/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M5g macht den KI-Gegnerzug direkt am Waldtanz-Brett steuerbar statt nur im Aktionsdock darunter.
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

describe('M5g KI-Zugbühne brettnah', () => {
  it('zeigt den Gegnerzug als Brettobjekt direkt nach dem Spielerrahmen und spielt KI-Zuege dort weiter', () => {
    render(<App initialZustand={vierSpielerZustand()} />)
    beendeErstenMenschenzug()

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const spielerrahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gegnerzug = within(spieltisch).getByRole('region', { name: 'Gegnerzug' })
    const zugkompass = within(spieltisch).getByRole('region', { name: 'Zugkompass' })

    expect(gegnerzug).toHaveClass('ki-zug-buehne--brettnah')
    expect(spielerrahmen.compareDocumentPosition(gegnerzug) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(gegnerzug.compareDocumentPosition(zugkompass) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(gegnerzug).getByText('Spieler 2 wartet auf den Gegnerzug.')).toBeInTheDocument()

    const brettButton = within(gegnerzug).getByRole('button', { name: 'Gegnerzug am Brett abspielen' })
    fireEvent.click(brettButton)

    expect(within(gegnerzug).getByText('Gegnerzug abgeschlossen. Du bist wieder dran.')).toBeInTheDocument()
    expect(within(gegnerzug).getByText(/Spieler 2: .*Neue Schlange starten/i)).toBeInTheDocument()
    expect(within(gegnerzug).queryByRole('button', { name: 'Gegnerzug am Brett abspielen' })).not.toBeInTheDocument()
    expect(within(spieltisch).getByText('Du — Spieler 1')).toBeInTheDocument()

    expect(cssBlock('ki-zug-buehne--brettnah')).toMatch(/display:\s*grid/)
    expect(cssBlock('ki-zug-buehne--brettnah')).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto/)
    expect(cssBlock('ki-zug-buehne__button')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('ki-zug-buehne__button')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('ki-zug-buehne__button')).toMatch(/color:\s*var\(--st-color-border-strong\)/)
    // AENDERUNG 22.06.2026: M1cx fuegt die Spielerplakette ein, die --st-color-on-secondary-container
    // (Stitch-Token fuer Schrift auf Sekundaer-Container-Hintergrund) legitim verwendet.
    // Die fruehere defensive Negativ-Pruefung ist damit obsolet.
    expect(appCss).toMatch(/--st-color-on-secondary-container:\s*#[0-9a-fA-F]{3,6}/)
  })
})
