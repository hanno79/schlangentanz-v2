/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R52 UI-Test für verständliche Zugführung bei Mensch- und KI-Spielern.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R52 Zugführung für Mensch und KI', () => {
  it('zeigt dem Menschen den eigenen Zug und markiert nach Zugwechsel den KI-Zug klar', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktiverSpielerBereich).getByText('Zugführung: Du bist am Zug.')).toBeInTheDocument()
    expect(within(aktiverSpielerBereich).queryByText('Nächster Schritt: KI-Aktion ausführen.')).not.toBeInTheDocument()

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Neue Schlange starten mit Karte blau-01/i }))
    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Ausspielphase beenden/i }))
    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Aufgabenprüfung beenden/i }))
    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Zug beenden/i }))

    expect(within(aktiverSpielerBereich).getByText('Zugführung: KI ist am Zug.')).toBeInTheDocument()
    expect(within(aktionsBereich).getByRole('button', { name: /Gegnerzüge bis zu deinem Zug abspielen/i })).toBeInTheDocument()
    expect(within(aktiverSpielerBereich).queryByText('Empfohlene Aktion: Neue Schlange starten mit Karte blau-02')).not.toBeInTheDocument()
    expect(within(aktiverSpielerBereich).queryByText(/Nächste legale Aktion:/)).not.toBeInTheDocument()
  })
})
