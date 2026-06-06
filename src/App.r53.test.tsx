/*
Author: rahn
Datum: 02.06.2026
Version: 1.1
Beschreibung: R53 UI-Test für den manuellen KI-Aktionsbutton ohne neue KI-Strategie.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { SpielAktion, Spielzustand } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function aktionsLabel(aktion: SpielAktion): string {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten':
      return `Neue Schlange starten mit Karte ${aktion.handkartenId}`
    case 'KarteAnlegen':
      return `Karte ${aktion.handkartenId} an Schlange ${aktion.schlangenId} ${aktion.position} anlegen`
    case 'SonderkarteSpielen':
      return `Schlangengrube mit Karte ${aktion.handkartenId} auf ${aktion.zielSpielerId.replace(/^spieler-/, 'Spieler ')} spielen`
    case 'PflichtAbwurf':
      return `Karte ${aktion.handkartenId} abwerfen`
    default:
      return 'Unbekannte Aktion'
  }
}

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

describe('R53 manueller KI-Aktionsbutton', () => {
  it('zeigt im Mensch-Zug keinen KI-Aktionsbutton', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktiverSpielerBereich).getByText('Zugführung: Du bist am Zug.')).toBeInTheDocument()
    expect(within(aktionsBereich).queryByRole('button', { name: 'KI-Aktion ausführen' })).not.toBeInTheDocument()
  })

  it('führt im KI-Zug die nächste legale Engine-Aktion aus und aktualisiert sichtbaren Zustand', () => {
    const kiZustand = wechsleZumKiZug(deterministischerZustand())
    const naechsteKiAktion = ermittleLegaleAktionen(kiZustand)[0]
    if (!naechsteKiAktion || !hatHandkartenId(naechsteKiAktion)) {
      throw new Error('Testsetup erwartet eine KI-Aktion mit handkartenId.')
    }

    render(<App initialZustand={kiZustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(within(aktiverSpielerBereich).getByText('Zugführung: KI ist am Zug.')).toBeInTheDocument()
    expect(within(aktionsBereich).getByRole('button', { name: 'KI-Aktion ausführen' })).toBeInTheDocument()
    expect(within(aktionsBereich).getByRole('button', { name: aktionsLabel(naechsteKiAktion) })).toBeInTheDocument()

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: 'KI-Aktion ausführen' }))

    expect(within(aktionsBereich).getByText('Gespielte Karten: 1/2')).toBeInTheDocument()
    expect(within(aktionsBereich).queryByRole('button', { name: aktionsLabel(naechsteKiAktion) })).not.toBeInTheDocument()
    expect(within(handBereich).queryByText(naechsteKiAktion.handkartenId)).not.toBeInTheDocument()
  })
})
