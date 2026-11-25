// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { MESSLAEUFE, MESSLAEUFE_ERWEITERUNG, mindestSiege, pruefeErgebnis } from './staerke_k5'

/*
K5, Entscheid des Orchestrators vom 25.11.2026: Die Schwellen der Messläufe sind
nach der ersten Messung festgeschrieben als das Grössere aus der Schwelle des Plans
und 99 % der gemessenen Siege, abgerundet. Dieser Test läuft im Gate `npm test`;
er spielt keine Partie, sondern prüft die Schwellen und ihre Auswertung.
*/

const LAEUFE = [MESSLAEUFE.zufall, MESSLAEUFE.erste, MESSLAEUFE.vier, MESSLAEUFE_ERWEITERUNG.zufall, MESSLAEUFE_ERWEITERUNG.erste, MESSLAEUFE_ERWEITERUNG.vier]

describe('K5: festgeschriebene Schwellen der Messläufe', () => {
  it('K5: die erste Messung steht im Test, ohne Erweiterung 500, 500, 300, mit Erweiterung 500, 500, 292 Siege', () => {
    expect(LAEUFE.map((lauf) => lauf.gemessen)).toEqual([500, 500, 300, 500, 500, 292])
  })

  it('K5: jede Schwelle ist max(Plan, abgerundet 99 % der gemessenen Siege): 495, 495, 297, 495, 495, 289', () => {
    expect(LAEUFE.map(mindestSiege), 'K5: mindestSiege je Messlauf').toEqual([495, 495, 297, 495, 495, 289])
  })

  it('K5: liegen 99 % der Messung unter dem Plan, gilt der Plan (401 gemessen, 80 % von 500 verlangt: 400)', () => {
    expect(mindestSiege({ ...MESSLAEUFE.zufall, gemessen: 401 })).toBe(400)
    expect(mindestSiege({ ...MESSLAEUFE.vier, gemessen: 100 }), 'K5: 50 % von 300').toBe(150)
  })

  it('K5: jede Schwelle liegt über dem Plan und nicht über der Messung', () => {
    for (const lauf of LAEUFE) {
      expect(mindestSiege(lauf), `K5 Kriterium ${lauf.kriterium}: Schwelle gegen Plan`).toBeGreaterThanOrEqual(Math.ceil(lauf.planAnteil * lauf.partien))
      expect(mindestSiege(lauf), `K5 Kriterium ${lauf.kriterium}: Schwelle gegen Messung`).toBeLessThanOrEqual(lauf.gemessen)
    }
  })
})

describe('K5: Auswertung eines Messlaufs (Gegenproben)', () => {
  const lauf = MESSLAEUFE_ERWEITERUNG.vier

  it('K5: genau die Schwelle an Siegen besteht, ebenso die gemessenen 292', () => {
    expect(() => pruefeErgebnis(lauf, { siege: 289, nichtBeendet: [] })).not.toThrow()
    expect(() => pruefeErgebnis(lauf, { siege: 292, nichtBeendet: [] })).not.toThrow()
  })

  it('K5: ein Sieg unter der Schwelle ist rot und nennt die Zahlen', () => {
    expect(() => pruefeErgebnis(lauf, { siege: 288, nichtBeendet: [] })).toThrow(/K5 Kriterium 5: zu wenige Siege der soliden KI.*288 Siege.*mindestens 289/)
  })

  it('K5: eine Schwelle über dem Messwert ist rot: mit 300 statt 292 gemessenen Siegen verlangt der Lauf 297, und 292 reichen nicht', () => {
    expect(() => pruefeErgebnis({ ...lauf, gemessen: 300 }, { siege: 292, nichtBeendet: [] })).toThrow(/mindestens 297/)
  })

  it('K5 Kriterium 4: eine Partie, die nicht endet, ist rot, auch bei genug Siegen', () => {
    expect(() => pruefeErgebnis(lauf, { siege: 300, nichtBeendet: ['Saat 1: schrittgrenze nach 5000 Schritten'] })).toThrow(/K5 Kriterium 4/)
  })
})
