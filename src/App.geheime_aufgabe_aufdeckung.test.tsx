/**
 * Author: rahn
 * Datum: 05.07.2026
 * Version: 1.0
 * Beschreibung: Audit-Fix K4 (UI) — Bei Spielende werden die geheimen Aufgaben aller
 * Spieler in der Wertung aufgedeckt (Name + Erfüllungsstatus). Während der Partie
 * bleiben fremde geheime Aufgaben verborgen (vgl. C1).
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'
import type { Spielzustand } from './engine'

function spielendeZustand(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.5)
  zustand.nachziehstapel = []
  zustand.spielphase = 'Beendet'
  zustand.zugphase = 'Spielende'
  zustand.endrunde = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [] }
  zustand.spieler[0].geheimeAufgabeErfuellt = true
  return zustand
}

describe('K4 UI — geheime Aufgaben bei Spielende aufdecken', () => {
  it('zeigt Name und Erfüllungsstatus der geheimen Aufgaben aller Spieler', () => {
    const zustand = spielendeZustand()
    render(<App initialZustand={zustand} />)
    const aufdeckung = screen.getByRole('list', { name: 'Aufgedeckte geheime Aufgaben' })
    expect(within(aufdeckung).getByText(new RegExp(zustand.spieler[0].geheimeAufgabe.name))).toBeInTheDocument()
    expect(within(aufdeckung).getAllByText(/erfüllt|nicht erfüllt/).length).toBe(2)
  })
})
