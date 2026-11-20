import { describe, expect, it } from 'vitest'
import type { SpielAktion } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'
import { baukasten } from '../engine/testing/szenario'
import { sichtFuer } from './sicht'
import { erstelleZufallsKi } from './zufallsKi'

const SICHT = sichtFuer(baukasten({ spielerzahl: 2, erweiterung: false }).haendeAuffuellen().zustand(), 0)
const AKTIONEN: SpielAktion[] = ['a', 'b', 'c', 'd'].map((spielerId) => ({ typ: 'ZugBeenden', spielerId }))

/** Eine Zufallsquelle, die immer denselben Wert liefert. */
const immer = (wert: number) => () => wert

describe('K1: die Zufalls-KI', () => {
  it('K1: sie wählt gleichverteilt über die Stelle in der Liste: Wert × Anzahl, abgerundet', () => {
    expect(erstelleZufallsKi(immer(0)).waehle(SICHT, AKTIONEN)).toBe(AKTIONEN[0])
    expect(erstelleZufallsKi(immer(0.5)).waehle(SICHT, AKTIONEN)).toBe(AKTIONEN[2])
    expect(erstelleZufallsKi(immer(0.9999)).waehle(SICHT, AKTIONEN)).toBe(AKTIONEN[3])
    expect(erstelleZufallsKi(immer(0.7)).waehle(SICHT, AKTIONEN.slice(0, 1))).toBe(AKTIONEN[0])
  })

  it('K1: sie heisst Zufalls-KI', () => {
    expect(erstelleZufallsKi(immer(0)).name).toBe('Zufalls-KI')
  })

  it.each([1, -0.1, Number.NaN, 2])('U4: ein Zufallswert %s ausserhalb von 0 bis kleiner 1 wird mit Grund abgelehnt', (wert) => {
    expect(() => erstelleZufallsKi(immer(wert)).waehle(SICHT, AKTIONEN)).toThrow(
      `Zufalls-KI: Ungültiger Zufallswert ${wert}; die Zufallsquelle muss Werte von 0 bis kleiner 1 liefern.`,
    )
  })

  it('K1: ohne Aktion gibt es nichts zu wählen; das ist ein Fehler, kein stiller Ersatz', () => {
    expect(() => erstelleZufallsKi(immer(0)).waehle(SICHT, [])).toThrow('Zufalls-KI: Es gibt keine Aktion zur Auswahl.')
  })

  it('K1 Kriterium 3: gleiche Saat, gleiche Wahlen; andere Saat, andere Wahlen', () => {
    const wahlen = (saat: number) => {
      const ki = erstelleZufallsKi(erzeugeZufall(saat))
      return Array.from({ length: 50 }, () => AKTIONEN.indexOf(ki.waehle(SICHT, AKTIONEN)))
    }
    expect(wahlen(7)).toEqual(wahlen(7))
    expect(wahlen(7)).not.toEqual(wahlen(8))
    expect(new Set(wahlen(7)), 'K1: über 50 Wahlen kommt jede der vier Stellen vor').toEqual(new Set([0, 1, 2, 3]))
  })
})
