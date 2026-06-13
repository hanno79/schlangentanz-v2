/**
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: M5b beweist, dass KI-Gegner nicht mehr manuell wie ein Button-Click-Simulator gespielt werden müssen, sondern als sichtbarer Gegnerzug bis zum nächsten menschlichen Zug vorgespult werden.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

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

describe('M5b Gegnerzüge vorspulen', () => {
  it('spielt mehrere KI-Gegner als zusammenhängenden Gegnerzug bis der Mensch wieder am Zug ist', () => {
    render(<App initialZustand={vierSpielerZustand()} />)
    beendeErstenMenschenzug()

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    const gegnerzug = within(aktiverSpieler).getByRole('region', { name: 'Gegnerzug' })

    expect(within(aktiverSpieler).getByText('Zugführung: KI ist am Zug.')).toBeInTheDocument()
    expect(within(aktionen).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).toBeInTheDocument()
    expect(within(aktionen).queryByRole('button', { name: /KI-Aktion ausführen/i })).not.toBeInTheDocument()
    expect(within(gegnerzug).getByText('Spieler 2 wartet auf den Gegnerzug.')).toBeInTheDocument()

    fireEvent.click(within(aktionen).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' }))

    expect(within(aktiverSpieler).getByText('Zugführung: Du bist am Zug.')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Spielbereich' })).getByText(/Aktiver Spieler: Spieler 1/i)).toBeInTheDocument()
    expect(within(gegnerzug).getByText('Gegnerzug abgeschlossen. Du bist wieder dran.')).toBeInTheDocument()
    expect(within(gegnerzug).getByText(/Spieler 2: .*Neue Schlange starten/i)).toBeInTheDocument()
    expect(within(gegnerzug).getByText(/Spieler 3: .*Neue Schlange starten/i)).toBeInTheDocument()
    expect(within(gegnerzug).getByText(/Spieler 4: .*Neue Schlange starten/i)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Spielerübersicht' })).getByText(/Spieler 2: \d+ Handkarten, 1 Schlange/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Spielerübersicht' })).getByText(/Spieler 3: \d+ Handkarten, 1 Schlange/)).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Spielerübersicht' })).getByText(/Spieler 4: \d+ Handkarten, 1 Schlange/)).toBeInTheDocument()
  })
})
