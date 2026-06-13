/*
Author: rahn
Datum: 13.06.2026
Version: 1.0
Beschreibung: M5b KI-Zug-Helfer stoppt bei menschlichen Reaktionsentscheidungen.
*/

import { describe, expect, it } from 'vitest'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { spieleKiZuegeBisZumMenschen } from './kiZug'

describe('M5b KI-Zug-Vorspulen', () => {
  it('laesst menschliche Reaktionsentscheidungen offen statt sie automatisch zu beantworten', () => {
    const basis = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const pendingReaktion = {
      typ: 'SchlangengrubeAbwehr' as const,
      angreifenderSpielerIndex: 1,
      zielSpielerIndex: 0,
    }
    const zustand = {
      ...basis,
      aktiverSpielerIndex: 1,
      pendingReaktion,
    }

    const ergebnis = spieleKiZuegeBisZumMenschen(zustand)

    expect(ergebnis.zustand.pendingReaktion).toEqual(pendingReaktion)
    expect(ergebnis.zustand.aktiverSpielerIndex).toBe(1)
    expect(ergebnis.protokoll).toEqual(['Spieler 2: wartet auf eine menschliche Reaktion.'])
  })
})
