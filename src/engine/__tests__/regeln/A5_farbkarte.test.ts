import { describe, expect, it } from 'vitest'
import { ermittleEntscheider, werteSchlangen } from '../../index'
import type { FarbkarteLegenAktion, Spielzustand } from '../../index'
import type { Kartenwahl } from '../../testing/szenario'
import { schlangenKarten as ids } from '../legen_hilfen'
import { aktionen, fuehreAus, FUENF, grund, hand, MIT_SCHUTZ, tischMitHaenden as tisch, verletzteInvarianten as verletzt } from '../zugablauf_hilfen'

/*
E5, Farbkarte in jede Schlange (A5, D9, D10, D19): Eine Farbkarte geht an
beide Enden jeder Schlange am Tisch, auch einer gegnerischen, und als neue
Schlange nur für den, der sie spielt. Gegen eine Farbkarte gibt es keine Abwehr.
Was eine eigene Schlange mit Farbkarten angeht, prüft schon
`A5_ausspielen.test.ts` (E2).
*/

/** Die aufgezählten Ziele der Farbkarte `karteId`. */
function ziele(zustand: Spielzustand, karteId: string): FarbkarteLegenAktion['ziel'][] {
  return aktionen(zustand, 'FarbkarteLegen').flatMap((aktion) => (aktion.typ === 'FarbkarteLegen' && aktion.karteId === karteId ? [aktion.ziel] : []))
}

/** Die aufgezählte Aktion, die die Farbkarte `karteId` an diese Seite der Schlange legt. */
function anlegen(zustand: Spielzustand, karteId: string, schlangenId: string, seite: 'anfang' | 'ende'): FarbkarteLegenAktion {
  const passend = aktionen(zustand, 'FarbkarteLegen').find(
    (aktion): aktion is FarbkarteLegenAktion =>
      aktion.typ === 'FarbkarteLegen' && aktion.karteId === karteId && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === schlangenId && aktion.ziel.seite === seite,
  )
  expect(passend, `FarbkarteLegen ${karteId} → ${schlangenId} ${seite} ist nicht aufgezählt`).toBeDefined()
  return passend!
}

const ROT: Kartenwahl[] = ['Rot']

describe('E5 Kriterium 1, D9/A5: eine Farbkarte geht an beide Enden jeder Schlange', () => {
  it('D9/A5: aufgezählt sind die neue eigene Schlange und beide Enden jeder Schlange am Tisch, auch der Mitspieler', () => {
    const zustand = tisch([ROT, FUENF, FUENF, FUENF]).schlange(0, ['Blau']).schlange(1, ['Gelb', 'Gelb']).schlange(3, ['Grün']).schlange(3, ['Braun']).zustand()
    const rot = zustand.spieler[0].hand[0].id
    const erwartet = ['schlange-1', 'schlange-2', 'schlange-3', 'schlange-4'].flatMap((schlangenId) =>
      (['anfang', 'ende'] as const).map((seite) => ({ art: 'schlange', schlangenId, seite })),
    )
    expect(ziele(zustand, rot)).toEqual([{ art: 'neueSchlange' }, ...erwartet])
  })

  it('D9: an das Ende einer gegnerischen Schlange: die Karte liegt dort, die Schlange gehört weiter dem Gegner', () => {
    const start = tisch([ROT, FUENF]).schlange(1, ['Blau', 'Gelb']).zustand()
    const rot = start.spieler[0].hand[0].id
    const vorher = ids(start, 1)
    const { zustand, ereignisse } = fuehreAus(start, anlegen(start, rot, 'schlange-1', 'ende'))
    expect(ids(zustand, 1)).toEqual([...vorher, rot])
    expect(zustand.spieler[0].schlangen, 'D19: der Spieler bekommt dabei keine Schlange').toEqual([])
    expect(hand(zustand, 0)).not.toContain(rot)
    expect(ereignisse).toEqual([
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: rot, aktion: 'FarbkarteLegen', nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 2 } },
    ])
    expect(verletzt(zustand)).toEqual([])
  })

  it('D9: an den Anfang einer gegnerischen Schlange, bei drei Spielern auch in die des übernächsten', () => {
    const start = tisch([ROT, FUENF, FUENF]).schlange(1, ['Blau']).schlange(2, ['Gelb', 'Violett']).zustand()
    const rot = start.spieler[0].hand[0].id
    const vorher = ids(start, 2)
    const { zustand, ereignisse } = fuehreAus(start, anlegen(start, rot, 'schlange-2', 'anfang'))
    expect(ids(zustand, 2)).toEqual([rot, ...vorher])
    expect(ids(zustand, 1), 'D9: die andere Schlange bleibt, wie sie war').toEqual(ids(start, 1))
    expect(ereignisse[0]).toMatchObject({ typ: 'KarteGespielt', nach: { ort: 'Schlange', spielerIndex: 2, schlangenId: 'schlange-2', position: 0 } })
    expect(verletzt(zustand)).toEqual([])
  })

  it('A5: endet die gegnerische Schlange mit einer Farbenfusion oder einer Blockade, kommt die Farbkarte dahinter; die Fusion bleibt eine Einheit', () => {
    const start = tisch([['Rot', 'Blau'], FUENF]).schlange(1, ['Schlangenblockade', 'Gelb', { fusion: ['Grün', 'Grün'] }]).zustand()
    const [rot] = start.spieler[0].hand.map((karte) => karte.id)
    const vorher = start.spieler[1].schlangen[0]
    const { zustand } = fuehreAus(start, anlegen(start, rot, 'schlange-1', 'ende'))
    expect(ids(zustand, 1)).toEqual([...vorher.karten.map((karte) => karte.id), rot])
    expect(zustand.spieler[1].schlangen[0].fusionen).toEqual(vorher.fusionen)
    expect(verletzt(zustand)).toEqual([])
  })

  it('A5: eine Farbkarte geht nur an ein Ende, nicht an eine Stelle in der Mitte', () => {
    const zustand = tisch([ROT, FUENF]).schlange(1, ['Blau', 'Gelb']).zustand()
    const rot = zustand.spieler[0].hand[0].id
    expect(ziele(zustand, rot).every((ziel) => ziel.art === 'neueSchlange' || ziel.seite === 'anfang' || ziel.seite === 'ende')).toBe(true)
    expect(grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: rot, ziel: { art: 'schlange', schlangenId: 'schlange-1', position: 1 } })).toMatch(
      /FarbkarteLegen: Feld ziel ist ungültig/,
    )
  })

  it('A5/U12: eine Schlange, die es nicht gibt, wird mit Grund abgelehnt', () => {
    const zustand = tisch([ROT, FUENF]).schlange(1, ['Blau']).zustand()
    const rot = zustand.spieler[0].hand[0].id
    expect(grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: rot, ziel: { art: 'schlange', schlangenId: 'schlange-9', seite: 'ende' } })).toMatch(
      /Die Schlange schlange-9 gibt es nicht/,
    )
  })
})

describe('E5 Kriterium 1, D19/A5: eine neue Schlange beginnt jeder nur für sich', () => {
  it('D19: die neue Schlange gehört dem, der die Farbkarte spielt, auch wenn nur der Gegner eine Schlange hat', () => {
    const start = tisch([ROT, FUENF]).schlange(1, ['Blau']).zustand()
    const rot = start.spieler[0].hand[0].id
    const neu = aktionen(start, 'FarbkarteLegen').find((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'neueSchlange')!
    const { zustand } = fuehreAus(start, neu)
    expect(zustand.spieler[0].schlangen.map((schlange) => schlange.karten.map((karte) => karte.id))).toEqual([[rot]])
    expect(zustand.spieler[1].schlangen, 'D19: der Gegner bekommt keine neue Schlange').toEqual(start.spieler[1].schlangen)
  })

  it('D19: eine neue Schlange für einen Mitspieler lässt sich nicht einmal angeben', () => {
    const zustand = tisch([ROT, FUENF]).zustand()
    const rot = zustand.spieler[0].hand[0].id
    expect(
      grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: rot, ziel: { art: 'neueSchlange', spielerId: 'spieler-2' } }),
    ).toMatch(/Feld ziel ist ungültig/)
  })

  it('A5/D19: mit zwei eigenen Schlangen ist eine dritte abgelehnt; an jede Schlange am Tisch darf er weiter anlegen', () => {
    const zustand = tisch([ROT, FUENF]).schlange(0, ['Blau']).schlange(0, ['Gelb']).schlange(1, ['Grün']).zustand()
    const rot = zustand.spieler[0].hand[0].id
    expect(ziele(zustand, rot).map((ziel) => (ziel.art === 'schlange' ? `${ziel.schlangenId} ${ziel.seite}` : ziel.art))).toEqual([
      'schlange-1 anfang',
      'schlange-1 ende',
      'schlange-2 anfang',
      'schlange-2 ende',
      'schlange-3 anfang',
      'schlange-3 ende',
    ])
    expect(grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: rot, ziel: { art: 'neueSchlange' } })).toMatch(/höchstens 2 Schlangen \(A5\)/)
    expect(fuehreAus(zustand, anlegen(zustand, rot, 'schlange-3', 'ende')).zustand.spieler[0].schlangen).toHaveLength(2)
  })
})

describe('E5 Kriterium 1, D10/A6: gegen eine Farbkarte gibt es keine Abwehr', () => {
  it('D10/A6: in die Schlange eines Gegners mit Farbenschutz: niemand wird gefragt, die Karte wirkt sofort', () => {
    const start = tisch([ROT, MIT_SCHUTZ]).schlange(1, ['Blau']).zustand()
    const rot = start.spieler[0].hand[0].id
    const { zustand, ereignisse } = fuehreAus(start, anlegen(start, rot, 'schlange-1', 'anfang'))
    expect(zustand.schwebend).toBeNull()
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteGespielt'])
    expect(ermittleEntscheider(zustand), 'A6: es entscheidet weiter der Spieler am Zug').toBe(0)
    expect(hand(zustand, 1), 'D10: der Farbenschutz bleibt auf der Hand des Gegners').toEqual(hand(start, 1))
    expect(aktionen(zustand, 'Reagieren')).toEqual([])
  })
})

describe('E5 Grenzfall: eine Farbkarte vollendet eine gegnerische Gruppe', () => {
  it('D9/A11: Rot an Rot-Rot des Gegners ergibt seine rote Dreiergruppe; die Punkte gehören dem Gegner', () => {
    const start = tisch([ROT, FUENF]).schlange(1, ['Rot', 'Rot']).zustand()
    const rot = start.spieler[0].hand[0].id
    expect(werteSchlangen(start.spieler[1].schlangen, false).gruppenPunkte).toBe(0)
    const { zustand } = fuehreAus(start, anlegen(start, rot, 'schlange-1', 'ende'))
    expect(werteSchlangen(zustand.spieler[1].schlangen, false).gruppenPunkte, 'A11: Rot×3 bringt dem Gegner 3 Punkte').toBe(3)
    expect(werteSchlangen(zustand.spieler[0].schlangen, false).gruppenPunkte).toBe(0)
  })
})
