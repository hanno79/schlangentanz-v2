import { describe, expect, it } from 'vitest'
import type { SpielAktion, Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import { beschrifte } from './beschriftung'

/*
E5: Die Knöpfe am Entwicklertisch nennen das Ziel jeder Kartenaktion, für alle
Aktionstypen gleich: Spieler, Schlange mit Stelle oder Seite, Karten mit Namen
und Id, die Option. Farbkarten heissen am Tisch nach ihrem Bild (Gelb ist „Sonnenblatt“,
`kartenTexte.ts`). Die Aktionen hier sind von Hand gebaut, weil Fusion,
Farbendieb, Schlangenfrass und Häutung noch keine Ziele aufzählen.
*/

function tisch(): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: true })
    .hand(0, ['Schlangenblockade', 'Blau'])
    .hand(1, ['Farbenschutz'])
    .schlange(0, ['Gelb', 'Gelb'])
    .schlange(1, ['Rot', 'Grün', 'Violett'])
    .zustand()
}

const handId = (zustand: Spielzustand, spieler: number, stelle: number) => zustand.spieler[spieler].hand[stelle].id
const schlangenId = (zustand: Spielzustand, spieler: number) => zustand.spieler[spieler].schlangen[0].id
const inSchlange = (zustand: Spielzustand, spieler: number, stelle: number) => zustand.spieler[spieler].schlangen[0].karten[stelle].id

describe('E5: Beschriftung der Aktionsknöpfe', () => {
  const zustand = tisch()
  const karteId = handId(zustand, 0, 0)
  const basis = { spielerId: 'spieler-1', karteId }
  const [gelb1, gelb2] = [inSchlange(zustand, 0, 0), inSchlange(zustand, 0, 1)]
  const [rot, gruen, violett] = [0, 1, 2].map((stelle) => inSchlange(zustand, 1, stelle))
  const eigene = schlangenId(zustand, 0)
  const fremde = schlangenId(zustand, 1)

  const FAELLE: [string, SpielAktion, string][] = [
    ['Farbkarte, neue Schlange', { ...basis, typ: 'FarbkarteLegen', ziel: { art: 'neueSchlange' } }, '→ neue Schlange'],
    ['Farbkarte an ein Ende', { ...basis, typ: 'FarbkarteLegen', ziel: { art: 'schlange', schlangenId: fremde, seite: 'ende' } }, `→ ${fremde} ende`],
    ['Regenbogenschlange', { ...basis, typ: 'RegenbogenschlangeLegen', schlangenId: fremde, position: 0 }, `→ ${fremde} · Stelle 0`],
    ['Blockade', { ...basis, typ: 'BlockadeLegen', schlangenId: fremde, position: 2 }, `→ ${fremde} · Stelle 2`],
    ['Fusion', { ...basis, typ: 'FusionLegen', schlangenId: eigene, kartenIds: [gelb1, gelb2] }, `→ ${eigene} · Sonnenblatt (${gelb1}), Sonnenblatt (${gelb2})`],
    [
      'Farbendieb',
      { ...basis, typ: 'FarbendiebSpielen', quelle: { schlangenId: fremde, karteId: rot }, ziel: { art: 'schlange', schlangenId: eigene, position: 1 } },
      `→ ${fremde} Feuerkeim (${rot}) · ${eigene} Stelle 1`,
    ],
    [
      'Schlangenfrass',
      { ...basis, typ: 'SchlangenfrassSpielen', option: 'gegnerischeKarten', ziele: [{ schlangenId: fremde, karteId: rot }, { schlangenId: fremde, karteId: gruen }] },
      `→ gegnerischeKarten · ${fremde} Feuerkeim (${rot}), ${fremde} Waldspross (${gruen})`,
    ],
    ['Schlangengrube', { ...basis, typ: 'SchlangengrubeSpielen', zielSpielerId: 'spieler-2' }, '→ KI-Gegner 1 (spieler-2)'],
    [
      'Schlangenhäutung',
      { ...basis, typ: 'SchlangenhaeutungSpielen', schlangenId: fremde, neueReihenfolge: [violett, rot, gruen] },
      `→ ${fremde} · Mondranke (${violett}), Feuerkeim (${rot}), Waldspross (${gruen})`,
    ],
  ]

  it.each(FAELLE)('A7: %s: der Knopf nennt Karte und Ziel', (_art, aktion, ziel) => {
    expect(beschrifte(zustand, aktion)).toBe(`${aktion.typ}: Schlangenblockade (${karteId}) ${ziel}`)
  })

  it('A5/A6: Aktionen ohne Ziel bleiben kurz; Abwerfen und Reagieren nennen die Karten', () => {
    const blau = handId(zustand, 0, 1)
    const schutz = handId(zustand, 1, 0)
    expect(beschrifte(zustand, { ...basis, typ: 'VerdopplerSpielen' })).toBe(`VerdopplerSpielen: Schlangenblockade (${karteId})`)
    expect(beschrifte(zustand, { ...basis, typ: 'SonderkarteWirkungslosAblegen' })).toBe(`SonderkarteWirkungslosAblegen: Schlangenblockade (${karteId})`)
    expect(beschrifte(zustand, { typ: 'ZugBeenden', spielerId: 'spieler-1' })).toBe('ZugBeenden')
    expect(beschrifte(zustand, { typ: 'UeberhandAbwerfen', spielerId: 'spieler-1', karteIds: [karteId, blau] })).toBe(
      `UeberhandAbwerfen: Schlangenblockade (${karteId}), Wasserwirbel (${blau})`,
    )
    expect(beschrifte(zustand, { typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: schutz })).toBe(`Reagieren: abwehren mit Farbenschutz (${schutz})`)
    expect(beschrifte(zustand, { typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null })).toBe('Reagieren: durchlassen')
  })
})
