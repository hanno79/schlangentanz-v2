import { describe, expect, it } from 'vitest'
import { serialisiere } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { findeSzenario, SZENARIEN } from './szenarien'

function erzeuge(name: string) {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

describe('E1: Szenarien des Entwicklertischs', () => {
  it('E1: die Szenarien des Tasks sind da: start-2, start-4, start-erweiterung', () => {
    const namen = SZENARIEN.map((szenario) => szenario.name)
    expect(namen).toEqual(expect.arrayContaining(['start-2', 'start-4', 'start-erweiterung']))
  })

  it('P0.4: jedes Szenario hat einen eindeutigen, adressierbaren Namen, Beschreibung und erwartetes Verhalten', () => {
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
        expect(verletzt).toEqual([
          'Jede Spielkarte liegt genau einmal an genau einem Ort',
          'Alle Ids sind eindeutig',
          'Der Spielstand übersteht Speichern und Laden unverändert',
        ])
      } else {
        expect(verletzt, szenario.name).toEqual([])
      }
    }
  })

  it('E1: die Startszenarien stehen dort, wo ihr Name es verspricht', () => {
    const zwei = erzeuge('start-2')
    expect(zwei.spieler).toHaveLength(2)
    expect(zwei.erweiterung).toBe(false)
    expect(zwei.spieler.every((spieler) => spieler.hand.length === 5)).toBe(true)
    expect(erzeuge('start-4').spieler).toHaveLength(4)
    const erweitert = erzeuge('start-erweiterung')
    expect(erweitert.erweiterung).toBe(true)
    expect(erweitert.offeneAufgaben).toHaveLength(3)
    expect(erweitert.spieler.every((spieler) => spieler.comeback !== null && spieler.risikoKarten.length === 2)).toBe(true)
  })

  it('E1: alle-orte legt Karten an jeden Ort, den der Zustand kennt', () => {
    const zustand = erzeuge('alle-orte')
    expect(zustand.spieler.some((spieler) => spieler.schlangen.some((schlange) => schlange.fusionen.length > 0))).toBe(true)
    expect(zustand.spieler.some((spieler) => spieler.ablagestapel.length > 0)).toBe(true)
    expect(zustand.ausliegendeGruben.length).toBeGreaterThan(0)
    expect(zustand.schwebend).not.toBeNull()
    expect(zustand.ausDemSpiel.length).toBeGreaterThan(0)
  })
})
