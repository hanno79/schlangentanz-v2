/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F14 UI-Test für eine erste echte Spielerführung im aktiven Spielerbereich.
*/
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F14 Spielerführung', () => {
  it('bündelt Pflichtschritt und empfohlene Aktion als verständliche nächste Handlung', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })

    expect(within(spielerfuehrung).getByText('Spielerführung')).toBeInTheDocument()
    expect(within(spielerfuehrung).getByText('Dein nächster Schritt')).toBeInTheDocument()
    expect(within(spielerfuehrung).getByText('Eine spielbare Aktion auswählen.')).toBeInTheDocument()
    expect(within(spielerfuehrung).getByText('Empfohlene Aktion')).toBeInTheDocument()
    expect(within(spielerfuehrung).getByText('Neue Schlange starten mit Wasserwirbel')).toBeInTheDocument()
    expect(within(spielerfuehrung).getByText('Klicke unten auf die empfohlene Aktion, um deinen Zug fortzusetzen.')).toBeInTheDocument()

    expect(screen.getAllByText('Nächster Pflichtschritt: Eine spielbare Aktion auswählen.')[0]).toBeInTheDocument()
    expect(within(aktiverSpielerBereich).getByText('Empfohlene Aktion: Neue Schlange starten mit Wasserwirbel')).toBeInTheDocument()
    expect(within(aktiverSpielerBereich).queryByText(/Nächste legale Aktion:/)).not.toBeInTheDocument()
    expect(appCss).toContain('.spielerfuehrung')
    expect(appCss).toContain('.spielerfuehrung__karte')
  })

  it('blendet die Klick-Führung aus, wenn die KI am Zug ist', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Neue Schlange starten mit Wasserwirbel/i }))
    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Ausspielphase beenden/i }))
    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Aufgabenprüfung beenden/i }))
    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Zug beenden/i }))

    expect(within(aktiverSpielerBereich).getByText('Zugführung: KI ist am Zug.')).toBeInTheDocument()
    expect(within(aktiverSpielerBereich).queryByRole('region', { name: 'Spielerführung' })).not.toBeInTheDocument()
  })

  it('führt menschliche Spieler auch bei reinen Phasenaktionen weiter', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Neue Schlange starten mit Wasserwirbel/i }))

    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })
    expect(within(spielerfuehrung).getByText('Ausspielphase beenden.')).toBeInTheDocument()
    expect(within(spielerfuehrung).getByText('Ausspielphase beenden')).toBeInTheDocument()
    expect(within(aktionsBereich).getByRole('button', { name: /Ausspielphase beenden/i })).toBeInTheDocument()
  })
})
