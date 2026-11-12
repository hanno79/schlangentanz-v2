import { describe, expect, it } from 'vitest'
import {
  ermittleLegaleAktionen,
  ermittleReaktionsAktionen,
  serialisiere,
  starteAusspielphase,
} from '../engine'
import type { Spielzustand } from '../engine'
import { aufgezaehlteAktionen, phasenSchritte, spieleZufaelligBis, starteEntwicklerPartie } from './partie'
import { erzeugeZufall } from './zufall'

describe('P0.4: Zufall nur als Parameter', () => {
  it('P0.4: gleiche Saat liefert dieselbe Zahlenfolge, andere Saat eine andere', () => {
    const folge = (saat: number) => {
      const zufall = erzeugeZufall(saat)
      return Array.from({ length: 8 }, () => zufall())
    }
    expect(folge(1)).toEqual(folge(1))
    expect(folge(1)).not.toEqual(folge(2))
  })

  it('P0.4: jeder Wert liegt in [0, 1), wie `mischeDeck` es verlangt', () => {
    const zufall = erzeugeZufall(99)
    for (let i = 0; i < 1000; i += 1) {
      const wert = zufall()
      expect(wert).toBeGreaterThanOrEqual(0)
      expect(wert).toBeLessThan(1)
    }
  })
})

describe('P0.4: Partie aus Saat', () => {
  it('P0.4 K1: gleiche Saat und Spielerzahl ergeben eine identische Partie', () => {
    expect(serialisiere(starteEntwicklerPartie(1, 2))).toBe(serialisiere(starteEntwicklerPartie(1, 2)))
  })

  it('P0.4 K1: eine andere Saat ergibt eine andere Partie', () => {
    expect(serialisiere(starteEntwicklerPartie(1, 2))).not.toBe(serialisiere(starteEntwicklerPartie(2, 2)))
  })

  it.each([2, 3, 4])('P0.4: startet mit %i Spielern', (anzahl) => {
    expect(starteEntwicklerPartie(5, anzahl).spieler).toHaveLength(anzahl)
  })
})

describe('P0.4 K2: Aktionen kommen aus der Aufzählung der Engine', () => {
  it('P0.4 K2: in der Ausspielphase sind es genau die legalen Aktionen der Engine', () => {
    const zustand = starteAusspielphase(starteEntwicklerPartie(1, 2))
    const aktionen = aufgezaehlteAktionen(zustand)
    expect(aktionen.length).toBeGreaterThan(0)
    expect(aktionen).toEqual(ermittleLegaleAktionen(zustand))
  })

  it('P0.4 K2: in einem Reaktionsfenster sind es genau die Reaktionsaktionen der Engine', () => {
    const zustand = spieleZufaelligBis(
      starteEntwicklerPartie(3, 3),
      erzeugeZufall(3),
      (z) => z.pendingReaktion !== null,
    )
    expect(zustand.pendingReaktion).not.toBeNull()
    expect(aufgezaehlteAktionen(zustand)).toEqual(ermittleReaktionsAktionen(zustand))
    expect(aufgezaehlteAktionen(zustand).length).toBeGreaterThan(0)
  })
})

describe('P0.4: Phasenschritte je Zugphase', () => {
  function namen(zustand: Spielzustand): string[] {
    return phasenSchritte(zustand).map((schritt) => schritt.name)
  }

  it('P0.4: die Nachziehphase bietet „Ausspielphase starten“, und der Schritt wechselt die Phase', () => {
    const zustand = starteEntwicklerPartie(1, 2)
    expect(namen(zustand)).toEqual(['Ausspielphase starten'])
    expect(phasenSchritte(zustand)[0].fuehreAus(zustand).zugphase).toBe('Ausspielphase')
  })

  it('P0.4: die Ausspielphase bietet „Ausspielphase beenden“; die Engine lehnt es ohne gespielte Karte ab', () => {
    const zustand = starteAusspielphase(starteEntwicklerPartie(1, 2))
    expect(namen(zustand)).toEqual(['Ausspielphase beenden'])
    expect(() => phasenSchritte(zustand)[0].fuehreAus(zustand)).toThrow(/mindestens einer gespielten Karte/)
  })

  it('P0.4: Aufgabenprüfung und Zugabschluss bieten ihre Schritte, das Spielende keinen', () => {
    const start = starteEntwicklerPartie(1, 2)
    expect(namen({ ...start, zugphase: 'Aufgabenpruefung' })).toEqual(['Aufgabenprüfung beenden'])
    expect(namen({ ...start, zugphase: 'Zugabschluss' })).toEqual([
      'Überzählige Handkarten abwerfen',
      'Zug beenden',
    ])
    expect(namen({ ...start, zugphase: 'Spielende' })).toEqual([])
  })
})

describe('P0.4: zufällig weiterspielen (für Szenarien)', () => {
  it('P0.4: ist bei gleicher Saat reproduzierbar', () => {
    const lauf = () =>
      spieleZufaelligBis(starteEntwicklerPartie(7, 2), erzeugeZufall(7), (z) => z.zugphase === 'Zugabschluss')
    expect(serialisiere(lauf())).toBe(serialisiere(lauf()))
  })

  it('P0.4: erreicht das Spielende', () => {
    const ende = spieleZufaelligBis(starteEntwicklerPartie(1, 3), erzeugeZufall(1), (z) => z.zugphase === 'Spielende')
    expect(ende.zugphase).toBe('Spielende')
  })

  /* Die heutige Engine meldet die Schlangenhäutung nur als Hinweis und zählt sie
     nicht auf. Ist sie das Einzige, was ginge, gibt es keinen Knopf; der Tisch
     baut die Aktion nicht selbst (U3). E1 und E9 nehmen sie in die Aufzählung. */
  it('P0.4: hängt eine Partie an der nicht aufgezählten Schlangenhäutung, sagt der Fehler das', () => {
    expect(() =>
      spieleZufaelligBis(starteEntwicklerPartie(6, 2), erzeugeZufall(6), (z) => z.zugphase === 'Spielende'),
    ).toThrow(/nicht aufgezählte \(Schlangenhaeutung\)/)
  })

  it('P0.4: wirft mit Grund, wenn das Ziel nicht erreicht wird', () => {
    expect(() =>
      spieleZufaelligBis(starteEntwicklerPartie(1, 2), erzeugeZufall(1), () => false, 5),
    ).toThrow(/nicht erreicht/)
  })
})
