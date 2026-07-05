/**
 * Author: rahn
 * Datum: 05.07.2026
 * Version: 1.0
 * Beschreibung: Audit-Fix H3 — Verdeckte Informationen: Ist ein KI-Gegner am Zug,
 * dürfen weder dessen Handkarten (Farbe/Typ/Name/Id) noch dessen geheime Aufgabe
 * sichtbar sein. Die angezeigte "Persönliche Quest" gehört immer dem Menschen.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'
import type { Spielzustand } from './engine'

function kiAmZug(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  zustand.aktiverSpielerIndex = 1 // KI
  zustand.zugphase = 'Ausspielphase'
  zustand.spieler[1].hand = [
    { typ: 'Farbkarte', id: 'ki-leak-blau', farbe: 'Blau', punkte: 1 },
    { typ: 'Sonderkarte', id: 'ki-leak-frass', name: 'Schlangenfrass' },
  ]
  zustand.spieler[0].geheimeAufgabe = { typ: 'Aufgabenkarte', id: 'mensch-geheim', name: 'MenschQuest', punkte: 3, bedingung: 'MENSCH-GEHEIM-MARKER' }
  zustand.spieler[1].geheimeAufgabe = { typ: 'Aufgabenkarte', id: 'ki-geheim', name: 'KiQuest', punkte: 3, bedingung: 'KI-GEHEIM-MARKER' }
  return zustand
}

describe('H3 — verdeckte KI-Informationen', () => {
  it('verbirgt die KI-Handkarten (nur verdeckte Rücken + Anzahl)', () => {
    render(<App initialZustand={kiAmZug()} />)
    expect(screen.getByLabelText('Verdeckte Handkarten')).toBeInTheDocument()
    expect(screen.getByText('2 Handkarten verdeckt')).toBeInTheDocument()
    // Keine konkreten Kartendaten der KI im DOM.
    expect(screen.queryByText(/ki-leak-blau/)).toBeNull()
    expect(screen.queryByText(/ki-leak-frass/)).toBeNull()
    expect(screen.queryByText('Farbkarte Blau')).toBeNull()
  })

  it('zeigt die geheime Aufgabe des Menschen, nicht die der aktiven KI', () => {
    render(<App initialZustand={kiAmZug()} />)
    expect(screen.queryAllByText(/MENSCH-GEHEIM-MARKER/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/KI-GEHEIM-MARKER/)).toBeNull()
  })
})
