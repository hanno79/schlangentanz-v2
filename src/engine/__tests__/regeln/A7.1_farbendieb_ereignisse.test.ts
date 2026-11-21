import { describe, expect, it } from 'vitest'
import type { SpielAktion, Spielzustand } from '../../index'
import { DIEB, diebId, karteIn, stiehl } from '../farbendieb_hilfen'
import { lageVon, spieleNach, verrateneHandkarten } from '../nachrechnen'
import { durchlassen, ereignisseVom, folge, FUENF, MIT_SCHUTZ, reaktion, tischMitHaenden as tisch } from '../zugablauf_hilfen'
import type { Schritt } from '../zugablauf_hilfen'

/*
E8, Plan E2 Kriterium 11, E4b: Was der Farbendieb bewegt, meldet die Engine als
`KartenVersetzt`: die gestohlene Karte mit Herkunft beim Gegner und Ziel beim
Dieb, auch eine neue Schlange mit ihrer Id (D17) und eine Schlange, die durch
den Diebstahl leer wird. Die Oberfläche rechnet daraus die neue Lage nach, ohne
Zustände zu vergleichen.
*/

/** Führt die Schritte aus und prüft jeden: nachrechenbar, keine Handkarte verraten (B2). */
function nachgerechnet(start: Spielzustand, ...wahlen: Array<(jetzt: Spielzustand) => SpielAktion>): Schritt {
  let jetzt = start
  const ereignisse: Schritt['ereignisse'] = []
  for (const waehle of wahlen) {
    const schritt = folge(jetzt, waehle)
    expect(spieleNach(lageVon(jetzt), schritt.ereignisse), 'E2 Kriterium 11: der Schritt lässt sich nicht nachrechnen').toEqual(lageVon(schritt.zustand))
    expect(verrateneHandkarten(schritt.zustand, schritt.ereignisse), 'B2: ein Ereignis nennt eine Handkarte').toEqual([])
    ereignisse.push(...schritt.ereignisse)
    jetzt = schritt.zustand
  }
  return { zustand: jetzt, ereignisse }
}

describe('A7.1, D17: KartenVersetzt meldet die gestohlene Karte (E4b)', () => {
  it('A7.1: in eine eigene Schlange: Herkunft in der Schlange des Gegners, Ziel an der angesagten Stelle; danach AnsageEntschieden', () => {
    const start = tisch([DIEB, FUENF]).schlange(0, ['Rot', 'Rot']).schlange(1, ['Gelb', 'Blau', 'Gelb']).zustand()
    const [eigene, fremde] = [start.spieler[0].schlangen[0].id, start.spieler[1].schlangen[0].id]
    const blau = karteIn(start, 1, 0, 1)
    const dieb = diebId(start, 0)
    const { ereignisse } = nachgerechnet(start, (jetzt) => stiehl(jetzt, blau, { art: 'schlange', schlangenId: eigene, position: 1 }), durchlassen)
    expect(ereignisseVom(ereignisse, 'KartenVersetzt')).toEqual([
      {
        typ: 'KartenVersetzt',
        spielerIndex: 0,
        karteId: dieb,
        karten: [{ karteId: blau, von: { ort: 'Schlange', spielerIndex: 1, schlangenId: fremde, position: 1 }, nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: eigene, position: 1 } }],
        aufgeloest: [],
      },
    ])
    expect(ereignisse.map((ereignis) => ereignis.typ).slice(-2)).toEqual(['KartenVersetzt', 'AnsageEntschieden'])
  })

  it('D17/F4: ohne eigene Schlange nennt `nach` die neue Schlange mit ihrer Id; die leer gewordene Schlange des Gegners steht in `aufgeloest`', () => {
    const start = tisch([DIEB, FUENF]).schlange(1, ['Grün']).zustand()
    const fremde = start.spieler[1].schlangen[0].id
    const gruen = karteIn(start, 1, 0, 0)
    const { zustand, ereignisse } = nachgerechnet(start, (jetzt) => stiehl(jetzt, gruen, { art: 'neueSchlange' }), durchlassen)
    const neue = zustand.spieler[0].schlangen[0].id
    expect(neue).not.toBe(fremde)
    expect(ereignisseVom(ereignisse, 'KartenVersetzt')).toEqual([
      {
        typ: 'KartenVersetzt',
        spielerIndex: 0,
        karteId: diebId(start, 0),
        karten: [{ karteId: gruen, von: { ort: 'Schlange', spielerIndex: 1, schlangenId: fremde, position: 0 }, nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: neue, position: 0 } }],
        aufgeloest: [fremde],
      },
    ])
  })

  it('A7.2: abgewehrt bewegt der Farbendieb nichts ausser sich selbst: kein KartenVersetzt', () => {
    const start = tisch([DIEB, MIT_SCHUTZ]).schlange(0, ['Rot']).schlange(1, ['Blau']).zustand()
    const blau = karteIn(start, 1, 0, 0)
    const { ereignisse } = nachgerechnet(start, (jetzt) => stiehl(jetzt, blau, { art: 'schlange', schlangenId: jetzt.spieler[0].schlangen[0].id, position: 0 }), (jetzt) => reaktion(jetzt, true))
    expect(ereignisseVom(ereignisse, 'KartenVersetzt')).toEqual([])
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')).toMatchObject([{ ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } }])
  })
})
