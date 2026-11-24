import { describe, expect, it } from 'vitest'
import { ermittleAktionen } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { beschrifte } from './beschriftung'
import { SZENARIEN } from './szenarien'
import { durchlassen, abwehren, erzeuge, klicke } from './szenarienTesthilfe'
import type { Wahl } from './szenarienTesthilfe'

/*
X6: Die Szenarien des Schlangenkorbs lassen sich am Entwicklertisch so
durchklicken, wie ihre Erwartung es sagt. Jeder Schritt ist ein Knopf, den die
Engine aufzählt; der Tisch beschriftet jeden Knopf.
*/

const NAMEN = ['korb-ziehen', 'korb-tauschen', 'korb-entfernen', 'korb-aktionen', 'korb-letzte-karten', 'korb-zweiter-zug']

const bonus = (art: string): Wahl => (aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === art
const karteDerArt = (art: string): Wahl => (aktion, zustand) =>
  'karteId' in aktion &&
  aktion.typ !== 'SonderkarteWirkungslosAblegen' &&
  zustand.spieler[0].hand.some((karte) => karte.id === aktion.karteId && (karte.typ === 'Farbkarte' ? karte.farbe : karte.name) === art)
const beenden: Wahl = (aktion) => aktion.typ === 'ZugBeenden'

function boni(zustand: Spielzustand): string[] {
  return [...new Set(ermittleAktionen(zustand).flatMap((aktion) => (aktion.typ === 'SchlangenkorbSpielen' ? [aktion.bonus.art] : [])))]
}

function typen(zustand: Spielzustand): SpielAktion['typ'][] {
  return [...new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))]
}

describe('X6: Szenarien des Schlangenkorbs am Entwicklertisch', () => {
  it('X6: die Szenarien sind da und jeder Knopf hat eine Beschriftung', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(NAMEN))
    // Dazu die Lage nach „zwei zusätzliche Aktionen“, in der 15 Knöpfe „ZweiAbwerfenDreiZiehen“ stehen.
    const nachBonus = klicke(erzeuge('korb-aktionen'), bonus('aktionen')).zustand
    for (const [name, zustand] of [...NAMEN.map((eintrag) => [eintrag, erzeuge(eintrag)] as const), ['korb-aktionen nach dem Bonus', nachBonus] as const]) {
      const texte = ermittleAktionen(zustand).map((aktion) => beschrifte(zustand, aktion))
      expect(texte.length, name).toBeGreaterThan(0)
      expect(new Set(texte).size, `${name}: jeder Knopf heisst anders`).toBe(texte.length)
    }
    const start = erzeuge('korb-ziehen')
    const ziehen = ermittleAktionen(start).find((aktion) => bonus('ziehen')(aktion, start))
    expect(ziehen && beschrifte(start, ziehen), 'der Knopf nennt den Bonus').toMatch(/→ ziehen$/)
  })

  it('D43: korb-ziehen: drei gezogen, der Verdoppler nur wirkungslos, Rot und Gelb zusätzlich zu Blau', () => {
    const start = erzeuge('korb-ziehen')
    expect(boni(start)).toEqual(['ziehen', 'tauschen', 'aktionen'])
    const gezogen = klicke(start, bonus('ziehen')).zustand
    expect(gezogen.spieler[0].hand).toHaveLength(4)
    expect(ermittleAktionen(gezogen).some((aktion) => aktion.typ === 'VerdopplerSpielen')).toBe(false)
    const gespielt = klicke(gezogen, karteDerArt('Blau'), karteDerArt('Rot'), karteDerArt('Gelb')).zustand
    expect(gespielt.zug).toMatchObject({ gespielteFarbkarten: 3, gespielteSonderkarten: 1 })
    // Keine Handkarte mehr; „Zug beenden“ ist angeboten, daneben höchstens die Risiko-Karte aus der Auslage (X5).
    expect(ermittleAktionen(gespielt).filter((aktion) => 'karteId' in aktion)).toEqual([])
    expect(typen(gespielt)).toContain('ZugBeenden')
  })

  it('D44: korb-tauschen: Gelb an den Platz von Rot, Rot auf die Hand', () => {
    const start = erzeuge('korb-tauschen')
    const [, rot] = start.spieler[0].schlangen[0].karten
    const getauscht = klicke(start, (aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'tauschen' && aktion.bonus.tausch.length === 1 && aktion.bonus.tausch[0].karteId === rot.id).zustand
    expect(getauscht.spieler[0].hand.map((karte) => karte.id)).toContain(rot.id)
    expect(getauscht.spieler[0].schlangen[0].karten[1].typ).toBe('Farbkarte')
    expect(getauscht.ausDemSpiel.map((karte) => karte.id)).toEqual([start.spieler[0].hand[0].id])
  })

  it('D45: korb-entfernen: eigene Blockade ohne Frage; beim Gegner gefragt, mit Farbenschutz abgewehrt', () => {
    const start = erzeuge('korb-entfernen')
    const ziele = ermittleAktionen(start).flatMap((aktion) => (aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'entfernen' ? [aktion.bonus.ziel.karteId] : []))
    expect(ziele).toHaveLength(3)
    const eigene = klicke(start, (aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'entfernen' && aktion.bonus.ziel.karteId.startsWith('schlangenblockade'))
    expect(eigene.zustand.spieler[0].ablagestapel.map((karte) => karte.id)).toEqual([ziele[0]])
    const fusion = (aktion: SpielAktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'entfernen' && aktion.bonus.ziel.karteId.startsWith('farbenfusion')
    const abgewehrt = klicke(start, fusion, abwehren)
    expect(abgewehrt.ereignisse.find((ereignis) => ereignis.typ === 'AnsageEntschieden')).toMatchObject({ ohneWirkung: true, nach: { ort: 'AusDemSpiel' } })
    const durch = klicke(start, fusion, durchlassen).zustand
    expect(durch.spieler[1].schlangen[0].fusionen).toEqual([])
    expect(durch.spieler[0].ablagestapel.map((karte) => karte.id)).toEqual([ziele[2]])
  })

  it('D46/D49: korb-aktionen: drei Farbkarten, eine Fusion nur einmal, Verdoppler nur wirkungslos, abwerfen und ziehen', () => {
    const start = erzeuge('korb-aktionen')
    const frei = klicke(start, bonus('aktionen')).zustand
    expect(typen(frei)).toContain('ZweiAbwerfenDreiZiehen')
    expect(ermittleAktionen(frei).some((aktion) => aktion.typ === 'VerdopplerSpielen')).toBe(false)
    const drei = klicke(frei, karteDerArt('Blau'), karteDerArt('Rot'), karteDerArt('Gelb')).zustand
    expect(drei.zug.gespielteFarbkarten).toBe(3)
    const fusion = klicke(frei, (aktion) => aktion.typ === 'FusionLegen').zustand
    expect(ermittleAktionen(fusion).some((aktion) => aktion.typ === 'FusionLegen')).toBe(false)
    const gezogen = klicke(frei, (aktion) => aktion.typ === 'ZweiAbwerfenDreiZiehen')
    expect(gezogen.ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenAbgeworfen', 'KartenGezogen'])
  })

  it('D43/D57: korb-letzte-karten: die zwei letzten Karten gezogen, Schlussrunde vom Spieler am Zug, die Karten sind spielbar', () => {
    const start = erzeuge('korb-letzte-karten')
    const gezogen = klicke(start, bonus('ziehen'))
    expect(gezogen.zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0 })
    const gespielt = klicke(gezogen.zustand, karteDerArt('Rot'), karteDerArt('Gelb'), beenden)
    expect(gespielt.ereignisse.some((ereignis) => ereignis.typ === 'KartenGezogen')).toBe(false)
  })

  it('D47: korb-zweiter-zug: im zweiten Zug nach dem Verdoppler nur Tausch und Entfernen', () => {
    const start = erzeuge('korb-zweiter-zug')
    expect(start.zug.teilzug).toBe(2)
    expect(boni(start)).toEqual(['tauschen', 'entfernen'])
  })
})
