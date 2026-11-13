import { describe, expect, it } from 'vitest'
import { ermittleAktionen, serialisiere } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'
import { aufgezaehlteAktionen, starteEntwicklerPartie } from './partie'

describe('P0.4: Zufall nur als Parameter', () => {
  it('P0.4: gleiche Saat liefert dieselbe Zahlenfolge, andere Saat eine andere', () => {
    const folge = (saat: number) => {
      const zufall = erzeugeZufall(saat)
      return Array.from({ length: 8 }, () => zufall())
    }
    expect(folge(1)).toEqual(folge(1))
    expect(folge(1)).not.toEqual(folge(2))
  })

  it('P0.4: jeder Wert liegt in [0, 1), wie das Mischen es verlangt', () => {
    const zufall = erzeugeZufall(99)
    for (let i = 0; i < 1000; i += 1) {
      const wert = zufall()
      expect(wert).toBeGreaterThanOrEqual(0)
      expect(wert).toBeLessThan(1)
    }
  })
})

describe('E1: Partie aus Saat, Spielerzahl und Erweiterung', () => {
  it('P0.4 K1: gleiche Saat und Spielerzahl ergeben eine identische Partie', () => {
    expect(serialisiere(starteEntwicklerPartie(1, 2, false))).toBe(serialisiere(starteEntwicklerPartie(1, 2, false)))
  })

  it('P0.4 K1: eine andere Saat ergibt eine andere Partie', () => {
    expect(serialisiere(starteEntwicklerPartie(1, 2, false))).not.toBe(serialisiere(starteEntwicklerPartie(2, 2, false)))
  })

  it.each([2, 3, 4])('P0.4: startet mit %i Spielern', (anzahl) => {
    expect(starteEntwicklerPartie(5, anzahl, false).spieler).toHaveLength(anzahl)
  })

  it('E1: die Erweiterung schaltet die Engine selbst', () => {
    expect(starteEntwicklerPartie(5, 2, true).erweiterung).toBe(true)
    expect(starteEntwicklerPartie(5, 2, false).erweiterung).toBe(false)
  })
})

describe('E1: Aktionen kommen aus der Aufzählung der Engine', () => {
  it('E1: der Tisch zeigt genau, was ermittleAktionen liefert', () => {
    const zustand = starteEntwicklerPartie(1, 2, true)
    expect(aufgezaehlteAktionen(zustand)).toEqual(ermittleAktionen(zustand))
  })
})
