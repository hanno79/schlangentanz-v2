import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider } from '../engine'
import type { Ereignis, SchlangenhaeutungSpielenAktion, SpielAktion, Spielkarte, Spielzustand } from '../engine'
import { beschrifte } from './beschriftung'
import { SZENARIEN } from './szenarien'
import { abwehren, durchlassen, erzeuge, klicke } from './szenarienTesthilfe'
import type { Wahl } from './szenarienTesthilfe'

/*
E9: Die Szenarien `haeutung` und `haeutung-nicht-moeglich` lassen sich am
Entwicklertisch so durchklicken, wie ihre Erwartung es sagt. Jeder Schritt hier
ist ein Knopf, den die Engine aufzählt; gesucht wird er über seine Beschriftung.
*/

const haeutung = (aktion: SpielAktion): aktion is SchlangenhaeutungSpielenAktion => aktion.typ === 'SchlangenhaeutungSpielen'

/** Der Knopf, der den Abschnitt der Schlange in diese Farbfolge bringt. */
function knopf(zustand: Spielzustand, schlangenId: string, farben: string[]): Wahl {
  const karten = zustand.spieler.flatMap((spieler) => spieler.schlangen).find((eintrag) => eintrag.id === schlangenId)!.karten
  return (aktion) =>
    haeutung(aktion) && aktion.schlangenId === schlangenId && aktion.neueReihenfolge.map((id) => art(karten.find((karte) => karte.id === id)!)).join() === farben.join()
}

const typen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)
const art = (karte: Spielkarte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)
const schlange = (zustand: Spielzustand, spieler: number, nummer = 0) => zustand.spieler[spieler].schlangen[nummer].karten.map(art)
const ablagen = (zustand: Spielzustand) => zustand.spieler.map((spieler) => spieler.ablagestapel.map(art))

describe('E9: Szenarien der Schlangenhäutung', () => {
  it('E9: die Szenarien des Tasks sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['haeutung', 'haeutung-nicht-moeglich']))
  })

  it('A7.9 Beispiel 1/D25: haeutung: 54 Knöpfe in der eigenen, 2 in der gegnerischen Schlange; Gelb, Gelb, Blau, Rot, Rot wirkt sofort', () => {
    const start = erzeuge('haeutung')
    const knoepfe = ermittleAktionen(start).filter(haeutung)
    expect(knoepfe.filter((aktion) => aktion.schlangenId === 'schlange-1')).toHaveLength(54)
    expect(knoepfe.filter((aktion) => aktion.schlangenId === 'schlange-2')).toHaveLength(2)
    expect(ermittleAktionen(start).filter((aktion) => aktion.typ === 'SonderkarteWirkungslosAblegen')).toEqual([])
    const { zustand, ereignisse } = klicke(start, knopf(start, 'schlange-1', ['Gelb', 'Gelb', 'Blau', 'Rot', 'Rot']))
    expect(typen(ereignisse)).toEqual(['KartenVersetzt', 'KarteGespielt'])
    expect(ereignisse[1]).toMatchObject({ nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } })
    expect(schlange(zustand, 0)).toEqual(['Gelb', 'Gelb', 'Blau', 'Rot', 'Rot'])
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect([...new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))], 'X5: mit Erweiterung auch die Risiko-Karte').toEqual(['FarbkarteLegen', 'RisikoKarteSpielen', 'ZugBeenden'])
  })

  it('D10/A7.2: haeutung: in schlange-2 angesagt, KI-Gegner 1 wehrt ab; seine Schlange bleibt', () => {
    const start = erzeuge('haeutung')
    const angesagt = klicke(start, knopf(start, 'schlange-2', ['Violett', 'Braun', 'Braun']))
    expect(typen(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(angesagt.ereignisse[0]).toMatchObject({ betroffene: [1] })
    expect(ermittleAktionen(angesagt.zustand).map((aktion) => beschrifte(angesagt.zustand, aktion))).toEqual([
      expect.stringMatching(/^Reagieren: abwehren mit Farbenschutz/),
      'Reagieren: durchlassen',
    ])
    const abwehr = klicke(angesagt.zustand, abwehren)
    expect(typen(abwehr.ereignisse)).toEqual(['Abgewehrt', 'AnsageEntschieden'])
    expect(schlange(abwehr.zustand, 1)).toEqual(['Braun', 'Violett', 'Braun'])
    expect(ablagen(abwehr.zustand)).toEqual([['Schlangenhäutung'], ['Farbenschutz']])
  })

  it('D9: haeutung: durchgelassen liegt schlange-2 in der Folge des Knopfes', () => {
    const start = erzeuge('haeutung')
    const angesagt = klicke(start, knopf(start, 'schlange-2', ['Violett', 'Braun', 'Braun']))
    const durch = klicke(angesagt.zustand, durchlassen)
    expect(typen(durch.ereignisse)).toEqual(['KartenVersetzt', 'AnsageEntschieden'])
    expect(schlange(durch.zustand, 1)).toEqual(['Violett', 'Braun', 'Braun'])
    expect(ablagen(durch.zustand)).toEqual([['Schlangenhäutung'], []])
  })

  it('A7.9 Beispiel 2/D26/D13: haeutung-nicht-moeglich: kein Abschnitt, nur wirkungslos ablegen; die Schlangen bleiben', () => {
    const start = erzeuge('haeutung-nicht-moeglich')
    expect(ermittleAktionen(start).filter(haeutung)).toEqual([])
    const ablegen = ermittleAktionen(start).filter((aktion) => aktion.typ === 'SonderkarteWirkungslosAblegen')
    expect(ablegen.map((aktion) => beschrifte(start, aktion))).toEqual([expect.stringMatching(/^SonderkarteWirkungslosAblegen: Schlangenhäutung/)])
    const { zustand } = anwendeAktion(start, ablegen[0])
    expect(ablagen(zustand)).toEqual([['Schlangenhäutung'], []])
    expect(zustand.spieler.map((spieler) => spieler.schlangen)).toEqual(start.spieler.map((spieler) => spieler.schlangen))
    expect([...new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))], 'X5: mit Erweiterung auch die Risiko-Karte').toEqual(['FarbkarteLegen', 'RisikoKarteSpielen', 'ZugBeenden'])
  })
})
