/*
Author: Claude Code (G-4)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Der Handmodus entscheidet, was ein Klick auf eine Karte bedeutet.

Geprüft wird vor allem die Rangfolge: Überhand geht allem voran, weil die Engine
das Zugende sonst verweigert. Und der Pflichtabwurf darf die normale Auswahl
verdrängen — er entsteht ohnehin nur, wenn es nichts auszuwählen gibt.
*/

import { describe, expect, it } from 'vitest'
import { erstelleSpielzustand, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { ermittleHandModus, handHinweis } from './handModus'

function inPhase(zugphase: Spielzustand['zugphase']): Spielzustand {
  return { ...starteAusspielphase(erstelleSpielzustand(2, () => 0.999999)), zugphase }
}

describe('ermittleHandModus', () => {
  it('ist im Normalfall Auswahl', () => {
    expect(ermittleHandModus(inPhase('Ausspielphase'), 0, false)).toBe('auswahl')
  })

  it('verdeckt die Hand, wenn die KI am Zug ist', () => {
    const zustand = inPhase('Ausspielphase')
    zustand.spieler[zustand.aktiverSpielerIndex].steuerung = 'KI'
    expect(ermittleHandModus(zustand, 0, false)).toBe('verdeckt')
  })

  it('verlangt im Zugabschluss den Abwurf, sobald die Hand zu voll ist', () => {
    expect(ermittleHandModus(inPhase('Zugabschluss'), 2, false)).toBe('ueberhand')
    expect(ermittleHandModus(inPhase('Zugabschluss'), 0, false)).toBe('auswahl')
  })

  it('stellt Überhand über den Pflichtabwurf', () => {
    // Die Engine verweigert das Zugende, solange die Hand über dem Limit liegt.
    expect(ermittleHandModus(inPhase('Zugabschluss'), 1, true)).toBe('ueberhand')
  })

  it('schaltet auf Pflichtabwurf, wenn sonst nichts legal ist', () => {
    expect(ermittleHandModus(inPhase('Ausspielphase'), 0, true)).toBe('abwurfPflicht')
  })

  it('lässt die KI-Hand auch bei Überhand verdeckt', () => {
    const zustand = inPhase('Zugabschluss')
    zustand.spieler[zustand.aktiverSpielerIndex].steuerung = 'KI'
    expect(ermittleHandModus(zustand, 3, false)).toBe('verdeckt')
  })
})

describe('handHinweis', () => {
  it('nennt bei Überhand die geforderte und die gewählte Anzahl', () => {
    expect(handHinweis('ueberhand', 2, 1)).toBe('2 Karte(n) zu viel — wähle 2 zum Abwerfen (1 gewählt)')
  })

  it('erklärt den Pflichtabwurf und lässt die Wahl beim Spieler', () => {
    expect(handHinweis('abwurfPflicht', 0, 0)).toBe('Keine Aktion möglich — wirf eine Karte deiner Wahl ab')
  })

  it('schweigt, wenn nichts zu erklären ist', () => {
    expect(handHinweis('auswahl', 0, 0)).toBeNull()
    expect(handHinweis('verdeckt', 0, 0)).toBeNull()
  })
})
