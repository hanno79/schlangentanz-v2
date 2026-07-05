/**
 * Author: rahn
 * Datum: 05.07.2026
 * Version: 1.0
 * Beschreibung: Audit-Fix H2 (UI) — Ein menschlicher Spieler, der seinen Zug im
 * Endspurt mit leerer Hand beginnt, muss die Ausspielphase über die sichtbare
 * Phasenaktion beenden können, statt in einem UI-Deadlock zu stecken.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'
import type { Spielzustand } from './engine'

function endspurtMenschLeereHand(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.5)
  zustand.nachziehstapel = []
  zustand.spielphase = 'Endspurt'
  zustand.endrunde = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [0] }
  zustand.aktiverSpielerIndex = 0
  zustand.zugphase = 'Ausspielphase'
  zustand.zugpflichten = { gespielteKarten: 0, gespielteFarbkarten: 0, gespielteSonderkarten: 0, verdopplerBonusAktiv: false, farbenfusionGespielt: false }
  zustand.spieler[0].hand = []
  return zustand
}

describe('H2 UI — leere Hand im Endspurt', () => {
  it('bietet dem Menschen eine Ausspielphase-beenden-Aktion an', () => {
    render(<App initialZustand={endspurtMenschLeereHand()} />)
    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    expect(within(aktionen).getByRole('button', { name: /Ausspielphase beenden/i })).toBeInTheDocument()
  })
})
