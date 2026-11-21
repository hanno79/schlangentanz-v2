import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen } from '../engine'
import type { SpielAktion } from '../engine'
import { abwehren, durchlassen, erzeuge, klicke, waehle } from './szenarienTesthilfe'
import type { Wahl } from './szenarienTesthilfe'

/*
R1: Die gemeinsame Klickhilfe der Szenariotests. Sie klickt nur Knöpfe, die die
Engine aufzählt, wie der Entwicklertisch.
*/

const typ = (gesucht: SpielAktion['typ']) => (aktion: SpielAktion) => aktion.typ === gesucht

describe('R1: Klickhilfe der Szenariotests', () => {
  it('R1: erzeuge baut das genannte Szenario; ein unbekannter Name ist ein Fehler im Testaufbau', () => {
    expect(ermittleAktionen(erzeuge('schlangengrube')).some(typ('SchlangengrubeSpielen')), 'erzeuge: schlangengrube bietet die Grube an').toBe(true)
    expect(() => erzeuge('gibt-es-nicht')).toThrow('Szenario gibt-es-nicht fehlt')
  })

  it('R1: klicke wendet nacheinander je den ersten passenden Knopf an und sammelt alle Ereignisse', () => {
    const start = erzeuge('schlangengrube')
    const ersterSchritt = anwendeAktion(start, ermittleAktionen(start).find(typ('SchlangengrubeSpielen'))!)
    const zweiterSchritt = anwendeAktion(ersterSchritt.zustand, ermittleAktionen(ersterSchritt.zustand).find(durchlassen)!)
    expect(klicke(start, typ('SchlangengrubeSpielen'), durchlassen)).toEqual({
      zustand: zweiterSchritt.zustand,
      ereignisse: [...ersterSchritt.ereignisse, ...zweiterSchritt.ereignisse],
    })
  })

  it('R1: jede Wahl sieht den Zustand, in dem sie klickt', () => {
    const start = erzeuge('schlangengrube')
    expect(start.schwebend, 'klicke: am Start ist nichts angesagt').toBeNull()
    const gesehen: boolean[] = []
    const merke: Wahl = (aktion, zustand) => {
      gesehen.push(zustand.schwebend !== null)
      return aktion.typ === 'Reagieren'
    }
    klicke(start, typ('SchlangengrubeSpielen'), merke)
    expect(gesehen.length, 'klicke: die zweite Wahl wurde gefragt').toBeGreaterThan(0)
    expect(gesehen.every(Boolean), 'klicke: die zweite Wahl sieht die angesagte Grube, nicht den Start').toBe(true)
  })

  it('R1: waehle nimmt den n-ten passenden Knopf, ab 1', () => {
    const start = erzeuge('fusion-eigen')
    const fusionen = ermittleAktionen(start).filter(typ('FusionLegen'))
    expect(fusionen.length, 'waehle: fusion-eigen hat mehrere Fusionsknöpfe').toBeGreaterThan(1)
    expect(waehle(start, typ('FusionLegen'))).toEqual(fusionen[0])
    expect(waehle(start, typ('FusionLegen'), 2)).toEqual(fusionen[1])
  })

  it('R1: fehlt ein passender Knopf, ist das ein Fehler im Testaufbau', () => {
    const start = erzeuge('fusion-eigen')
    expect(() => klicke(start, abwehren)).toThrow('Testaufbau: kein passender Knopf')
    expect(() => waehle(start, typ('FusionLegen'), 99)).toThrow('Testaufbau: kein passender Knopf Nr. 99')
  })
})
