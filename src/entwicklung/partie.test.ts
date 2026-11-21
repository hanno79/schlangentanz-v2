import { describe, expect, it } from 'vitest'
import { serialisiere } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'
import { sichtFuer, bestimmeZustand } from '../ki/sicht'
import { kiSaatAmTisch, starteEntwicklerPartie } from './partie'

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

describe('U5: die KI am Entwicklertisch hat eine eigene Saat, unabhängig von der Partie', () => {
  /** Wie viele der obersten fünf Karten des Nachziehstapels der Rahmen mit dieser KI-Saat richtig errät. */
  function erratenOben(saat: number, kiSaat: number): number {
    const partie = starteEntwicklerPartie(saat, 2, false)
    const geraten = bestimmeZustand(sichtFuer(partie, 0), erzeugeZufall(kiSaat))
    return partie.nachziehstapel.slice(0, 5).filter((karte, stelle) => geraten.nachziehstapel[stelle]?.id === karte.id).length
  }

  it('U5: für keine Saat und keinen Schritt ist die KI-Saat die Partiesaat', () => {
    const saaten = [0, 1, 2, 7, 4185, 2 ** 31 - 1, 2 ** 31, 2 ** 32 - 1, ...Array.from({ length: 500 }, (_, nummer) => (nummer * 2654435761) >>> 0)]
    for (const saat of saaten) {
      for (const schritt of [0, 1, 2, 3, saat % 1000, saat]) {
        const kiSaat = kiSaatAmTisch(schritt, saat)
        expect(kiSaat, `U5: Saat ${saat}, Schritt ${schritt}`).not.toBe(saat)
        expect(Number.isInteger(kiSaat) && kiSaat >= 2 ** 31 && kiSaat < 2 ** 32, 'U5: eine 32-Bit-Saat mit gesetztem höchstem Bit').toBe(true)
      }
    }
  })

  it('U5: auch eine Saat, die die Mischung auf die Partiesaat abbilden würde, wird verschoben', () => {
    for (const schritt of [0, 1, 5, 99]) {
      const ohneGrenze = kiSaatAmTisch(schritt, null)
      expect(kiSaatAmTisch(schritt, ohneGrenze), 'U5: fällt die Mischung auf die Partiesaat, kommt eine andere heraus').not.toBe(ohneGrenze)
    }
  })

  it('U5: gleicher Schritt, gleiche KI-Saat; ein anderer Schritt, eine andere', () => {
    expect(kiSaatAmTisch(3, 1)).toBe(kiSaatAmTisch(3, 1))
    expect(kiSaatAmTisch(3, 1)).not.toBe(kiSaatAmTisch(4, 1))
  })

  it('U5 Gegenprobe: mit der Partiesaat als KI-Saat errät der Rahmen den Stapel genau, mit der eigenen Saat nicht', () => {
    for (const saat of [1, 2, 3, 4, 5]) {
      expect(erratenOben(saat, saat), `U5: Saat ${saat}, gleiche Saat`).toBe(5)
      expect(erratenOben(saat, kiSaatAmTisch(saat, saat)), `U5: Saat ${saat}, eigene KI-Saat`).toBeLessThan(5)
    }
  })
})
