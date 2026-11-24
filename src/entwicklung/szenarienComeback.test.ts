import { describe, expect, it } from 'vitest'
import { ermittleAktionen } from '../engine'
import type { Ereignis, Spielzustand } from '../engine'
import { beschrifte } from './beschriftung'
import { SZENARIEN } from './szenarien'
import { erzeuge, klicke } from './szenarienTesthilfe'
import type { Wahl } from './szenarienTesthilfe'

/*
X4: Die Szenarien der Comeback-Karte lassen sich am Entwicklertisch so
durchklicken, wie ihre Erwartung es sagt. Jeder Schritt ist ein Knopf, den die
Engine aufzählt.
*/

const comeback: Wahl = (aktion) => aktion.typ === 'ComebackEinsetzen'
const tauschen: Wahl = (aktion) => aktion.typ === 'ZweiAbwerfenDreiZiehen'
const beenden: Wahl = (aktion) => aktion.typ === 'ZugBeenden'
const verdoppler: Wahl = (aktion) => aktion.typ === 'VerdopplerSpielen'
const typen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)
const knoepfe = (zustand: Spielzustand) => ermittleAktionen(zustand).map((aktion) => aktion.typ)

/** Eine Farbkarte dieser Farbe aus der Hand von Spieler 1, an irgendein Ziel. */
const farbe = (name: string): Wahl => (aktion, zustand) =>
  aktion.typ === 'FarbkarteLegen' && zustand.spieler[0].hand.some((karte) => karte.id === aktion.karteId && karte.typ === 'Farbkarte' && karte.farbe === name)
/** Irgendeine Karte mit Wirkung. */
const karte: Wahl = (aktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'SonderkarteWirkungslosAblegen' && 'karteId' in aktion

describe('X4: Szenarien der Comeback-Karte am Entwicklertisch', () => {
  it('X4: die Szenarien sind da und haben Beschreibung und Erwartung', () => {
    const namen = ['comeback-bedingung', 'comeback-rueckstand-4', 'comeback-abwerfen-ziehen', 'comeback-letzte-karte', 'comeback-verdoppler']
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(namen))
    for (const name of namen) {
      const szenario = SZENARIEN.find((eintrag) => eintrag.name === name)!
      expect(szenario.beschreibung, name).toMatch(/A8\.1/)
      expect(szenario.erwartet.length, name).toBeGreaterThan(40)
    }
  })

  it('A8.1/D46/D47: comeback-bedingung: einsetzen, drei Farbkarten und eine Sonderkarte; der Verdoppler nur wirkungslos', () => {
    const start = erzeuge('comeback-bedingung')
    expect(start.zug.comebackBedingung).toBe(true)
    expect(knoepfe(start)).toContain('ComebackEinsetzen')
    expect(beschrifte(start, ermittleAktionen(start).find((aktion) => aktion.typ === 'ComebackEinsetzen')!)).toBe('ComebackEinsetzen: Comeback-Karte (comeback-01)')
    const eingesetzt = klicke(start, comeback)
    expect(typen(eingesetzt.ereignisse)).toEqual(['ComebackEingesetzt'])
    expect(eingesetzt.zustand.spieler[0].comeback?.verbraucht).toBe(true)
    expect(knoepfe(eingesetzt.zustand)).not.toContain('VerdopplerSpielen')
    const gespielt = klicke(eingesetzt.zustand, farbe('Blau'), farbe('Rot'), farbe('Gelb'), (aktion) => aktion.typ === 'BlockadeLegen')
    expect(gespielt.zustand.zug).toMatchObject({ gespielteFarbkarten: 3, gespielteSonderkarten: 1 })
    expect([...new Set(knoepfe(gespielt.zustand))], 'X5: daneben nur die Risiko-Karte, die keinen Platz braucht').toEqual(['RisikoKarteSpielen', 'ZugBeenden'])
    const naechster = klicke(gespielt.zustand, beenden).zustand
    expect(naechster.zug).toMatchObject({ spielerIndex: 1, zusatzaktionen: [], runde: [] })
  })

  it('A8.1: comeback-rueckstand-4: kein Knopf ComebackEinsetzen', () => {
    const start = erzeuge('comeback-rueckstand-4')
    expect(start.zug.comebackBedingung).toBe(false)
    expect(knoepfe(start)).not.toContain('ComebackEinsetzen')
  })

  it('D49: comeback-abwerfen-ziehen: zehn Knöpfe zum Abwerfen, zweimal tauschen, dann nicht mehr', () => {
    const eingesetzt = klicke(erzeuge('comeback-abwerfen-ziehen'), comeback).zustand
    const tausch = ermittleAktionen(eingesetzt).filter((aktion) => aktion.typ === 'ZweiAbwerfenDreiZiehen')
    expect(tausch).toHaveLength(10)
    expect(beschrifte(eingesetzt, tausch[0])).toMatch(/^ZweiAbwerfenDreiZiehen: .*\(blau-\d+\), .*\(rot-\d+\)$/)
    const einmal = klicke(eingesetzt, tauschen)
    expect(typen(einmal.ereignisse)).toEqual(['KartenAbgeworfen', 'KartenGezogen'])
    expect(einmal.zustand.spieler[0].hand).toHaveLength(6)
    const zweimal = klicke(einmal.zustand, tauschen).zustand
    expect(zweimal.spieler[0].hand).toHaveLength(7)
    expect(knoepfe(zweimal)).not.toContain('ZweiAbwerfenDreiZiehen')
    expect(knoepfe(zweimal)).not.toContain('ZugBeenden')
  })

  it('D49/D57/A10: comeback-letzte-karte: das Abwerfen zieht die letzten zwei Karten, Spieler 1 löst die Schlussrunde aus und spielt weiter', () => {
    const eingesetzt = erzeuge('comeback-letzte-karte')
    expect(eingesetzt.spieler[0].comeback?.verbraucht, 'die Comeback-Karte ist schon eingesetzt').toBe(true)
    expect(knoepfe(eingesetzt)).not.toContain('ComebackEinsetzen')
    expect(knoepfe(eingesetzt).filter((typ) => typ === 'ZweiAbwerfenDreiZiehen')).toHaveLength(10)
    const gezogen = klicke(eingesetzt, tauschen)
    expect(typen(gezogen.ereignisse)).toEqual(['KartenAbgeworfen', 'KartenGezogen', 'SchlussrundeBegonnen'])
    expect(gezogen.ereignisse[1]).toEqual({ typ: 'KartenGezogen', spielerIndex: 0, anzahl: 2 })
    expect(gezogen.zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0 })
    expect(knoepfe(gezogen.zustand)).not.toContain('ZweiAbwerfenDreiZiehen')
    const ende = klicke(gezogen.zustand, farbe('Violett'), farbe('Violett'), beenden, karte, beenden)
    expect(ende.zustand.partiephase).toBe('Beendet')
  })

  it('D47/D48: comeback-verdoppler: nach dem Verdoppler und im zweiten Zug kein Knopf ComebackEinsetzen', () => {
    const start = erzeuge('comeback-verdoppler')
    expect(knoepfe(start)).toContain('ComebackEinsetzen')
    const verdoppelt = klicke(start, verdoppler).zustand
    expect(knoepfe(verdoppelt)).not.toContain('ComebackEinsetzen')
    const zweiter = klicke(verdoppelt, beenden).zustand
    expect(zweiter.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
    expect(knoepfe(zweiter)).not.toContain('ComebackEinsetzen')
  })
})
