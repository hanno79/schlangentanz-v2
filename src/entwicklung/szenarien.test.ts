import { describe, expect, it } from 'vitest'
import { serialisiere } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { aufgezaehlteAktionen } from './partie'
import { findeSzenario, SZENARIEN } from './szenarien'

function erzeuge(name: string) {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

describe('P0.4: Szenarien des Entwicklertischs', () => {
  it('P0.4: jedes Szenario hat einen eindeutigen, adressierbaren Namen, Beschreibung und erwartetes Verhalten', () => {
    expect(SZENARIEN.length).toBeGreaterThanOrEqual(6)
    expect(new Set(SZENARIEN.map((s) => s.name)).size).toBe(SZENARIEN.length)
    for (const szenario of SZENARIEN) {
      expect(szenario.name).toMatch(/^[a-z0-9-]+$/)
      expect(szenario.beschreibung.length, szenario.name).toBeGreaterThan(10)
      expect(szenario.erwartet.length, szenario.name).toBeGreaterThan(10)
    }
  })

  it('P0.4: findeSzenario kennt nur vorhandene Namen', () => {
    expect(findeSzenario('gibtsnicht')).toBeUndefined()
    expect(findeSzenario(SZENARIEN[0].name)).toBe(SZENARIEN[0])
  })

  it('P0.4: jedes Szenario ist reproduzierbar', () => {
    for (const szenario of SZENARIEN) {
      expect(serialisiere(szenario.erzeuge()), szenario.name).toBe(serialisiere(szenario.erzeuge()))
    }
  })

  it('P0.4: nur das absichtlich kaputte Szenario verletzt eine Invariante', () => {
    for (const szenario of SZENARIEN) {
      const verletzt = pruefeInvarianten(szenario.erzeuge()).filter((i) => i.verletzt).map((i) => i.name)
      if (szenario.name === 'kaputt-doppelte-karte') {
        expect(verletzt).toEqual(['Jede Spielkarte liegt genau einmal im Spiel'])
      } else {
        expect(verletzt, szenario.name).toEqual([])
      }
    }
  })

  it('P0.4: die Szenarien stehen dort, wo ihr Name es verspricht', () => {
    expect(erzeuge('partiebeginn').zugphase).toBe('Nachziehphase')
    expect(erzeuge('ausspielphase').zugphase).toBe('Ausspielphase')
    expect(aufgezaehlteAktionen(erzeuge('ausspielphase')).length).toBeGreaterThan(0)
    expect(erzeuge('vier-spieler').spieler).toHaveLength(4)
    expect(erzeuge('reaktionsfenster').pendingReaktion).not.toBeNull()
    expect(erzeuge('zugabschluss').zugphase).toBe('Zugabschluss')
    expect(erzeuge('endspurt').spielphase).toBe('Endspurt')
    expect(erzeuge('spielende').zugphase).toBe('Spielende')
  })
})
