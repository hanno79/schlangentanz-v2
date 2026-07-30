/*
Author: rahn
Datum: 02.06.2026
Version: 1.1
Beschreibung: R53/M5b UI-Test für den Gegnerzug-Vorspulbutton ohne neue KI-Strategie.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { SpielAktion, Spielzustand } from './engine'
import { labelFuer } from './testUtils'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

// ÄNDERUNG [30.07.2026]: AP-3 — die lokale Kopie der Label-Logik ist entfallen.
// Sie bildete die Formulierungen der App nach und musste bei jeder Änderung
// mitgezogen werden; jetzt wird dieselbe Auflösung wie in der App benutzt.

function hatHandkartenId(aktion: SpielAktion): aktion is Extract<SpielAktion, { handkartenId: string }> {
  return 'handkartenId' in aktion
}

function wechsleZumKiZug(zustand: Spielzustand): Spielzustand {
  const ersteAktion = ermittleLegaleAktionen(zustand)[0]
  return starteAusspielphase({
    ...anwendeAktion(zustand, ersteAktion),
    aktiverSpielerIndex: 1,
    zugphase: 'Nachziehphase',
    zugpflichten: {
      gespielteKarten: 0,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 0,
    },
  })
}

describe('R53 Gegnerzug-Vorspulbutton', () => {
  it('zeigt im Mensch-Zug keinen Gegnerzug-Vorspulbutton', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktiverSpielerBereich).getByText('Zugführung: Du bist am Zug.')).toBeInTheDocument()
    expect(within(aktionsBereich).queryByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).not.toBeInTheDocument()
  })

  it('spult im KI-Zug die Engine-Aktionen bis zum nächsten Mensch-Zug vor', () => {
    const kiZustand = wechsleZumKiZug(deterministischerZustand())
    const naechsteKiAktion = ermittleLegaleAktionen(kiZustand)[0]
    if (!naechsteKiAktion || !hatHandkartenId(naechsteKiAktion)) {
      throw new Error('Testsetup erwartet eine KI-Aktion mit handkartenId.')
    }

    render(<App initialZustand={kiZustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })
    const gegnerzug = within(aktiverSpielerBereich).getByRole('region', { name: 'Gegnerzug' })

    expect(within(aktiverSpielerBereich).getByText('Zugführung: KI ist am Zug.')).toBeInTheDocument()
    expect(within(aktionsBereich).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).toBeInTheDocument()
    expect(within(aktionsBereich).queryByRole('button', { name: labelFuer(kiZustand, naechsteKiAktion) })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Startkreis mit Karte blau-02/i })).not.toBeInTheDocument()

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' }))

    expect(within(aktiverSpielerBereich).getByText('Zugführung: Du bist am Zug.')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Spielbereich' })).getByText(/Aktiver Spieler: Spieler 1/i)).toBeInTheDocument()
    expect(within(gegnerzug).getByText(new RegExp(`Spieler 2: ${labelFuer(kiZustand, naechsteKiAktion)}`, 'i'))).toBeInTheDocument()
    expect(within(gegnerzug).getByText('Gegnerzug abgeschlossen. Du bist wieder dran.')).toBeInTheDocument()
  })
})
