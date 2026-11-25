import { describe, expect, it } from 'vitest'
import type { SpielAktion } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { sichtFuer } from '../sicht'
import { erstelleErsteAktionKi } from './ersteAktionKi'
import { STRATEGIEN } from './index'

const SICHT = sichtFuer(baukasten({ spielerzahl: 2, erweiterung: false }).haendeAuffuellen().zustand(), 0)
const AKTIONEN: SpielAktion[] = ['a', 'b', 'c'].map((spielerId) => ({ typ: 'ZugBeenden', spielerId }))

/** Eine Zufallsquelle, die nie gefragt werden darf: Die KI braucht keinen Zufall. */
const nie = () => {
  throw new Error('Die KI „erste erlaubte Aktion“ fragt den Zufall.')
}

describe('K5: die KI „erste erlaubte Aktion“', () => {
  it('K5: sie wählt immer die erste angebotene Aktion und braucht keinen Zufall', () => {
    const ki = erstelleErsteAktionKi(nie)
    expect(ki.waehle(SICHT, AKTIONEN)).toBe(AKTIONEN[0])
    expect(ki.waehle(SICHT, AKTIONEN.slice(1))).toBe(AKTIONEN[1])
    expect(ki.waehle(SICHT, AKTIONEN.slice(2))).toBe(AKTIONEN[2])
  })

  it('K5: sie heisst „Erste erlaubte Aktion“', () => {
    expect(erstelleErsteAktionKi(nie).name).toBe('Erste erlaubte Aktion')
  })

  it('K5: ohne Aktion gibt es nichts zu wählen; das ist ein Fehler, kein stiller Ersatz', () => {
    expect(() => erstelleErsteAktionKi(nie).waehle(SICHT, [])).toThrow('Erste erlaubte Aktion: Es gibt keine Aktion zur Auswahl.')
  })

  it('U5: STRATEGIEN.ersteAktion ist ihre Fabrik', () => {
    expect(STRATEGIEN.ersteAktion).toBe(erstelleErsteAktionKi)
  })
})
