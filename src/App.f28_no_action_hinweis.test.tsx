/*
Author: rahn
Datum: 05.06.2026
Version: 1.1
Beschreibung: F28 UI-Test für die verständliche Spielerführung, wenn keine legale Aktion verfügbar ist.
Änderung [05.07.2026]: H2 — mit leerer Hand ist die Ausspielphase beendbar; die Führung nennt
diesen Schritt jetzt konkret statt eines generischen "keine Aktion"-Hinweises.
*/
/// <reference types="node" />

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function zustandMitLeererHand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const aktiverSpieler = zustand.spieler[0]

  aktiverSpieler.hand = []
  aktiverSpieler.schlangen = []

  return zustand
}

function zustandOhneSpielbareAktionAberMitKarten() {
  // Nicht-leere Hand, aber keine spielbare Aktion: hier bleibt der generische Hinweis korrekt.
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const aktiverSpieler = zustand.spieler[0]
  aktiverSpieler.schlangen = []
  // Zugpflichten künstlich ausgeschöpft, damit keine Karte mehr spielbar ist.
  zustand.zugpflichten = { gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 1, verdopplerBonusAktiv: false, farbenfusionGespielt: false }
  return zustand
}

describe('F28 Spielerführung bei fehlenden legalen Aktionen', () => {
  it('nennt bei leerer Hand die beendbare Ausspielphase als nächsten Schritt', () => {
    render(<App initialZustand={zustandMitLeererHand()} />)

    expect(screen.getAllByText('Nächster Pflichtschritt: Keine Handkarten — Ausspielphase beenden.')[0]).toBeInTheDocument()
  })

  it('zeigt bei ausgeschöpftem Zug und ohne spielbare Aktion eine klare Handlungsinfo', () => {
    render(<App initialZustand={zustandOhneSpielbareAktionAberMitKarten()} />)

    // gespielteKarten > 0 -> Ausspielphase beenden ist der Pflichtschritt.
    expect(screen.getAllByText('Nächster Pflichtschritt: Ausspielphase beenden.')[0]).toBeInTheDocument()
  })
})
