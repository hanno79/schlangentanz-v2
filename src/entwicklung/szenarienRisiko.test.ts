import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, ermittleEntscheider, serialisiere } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { SZENARIEN } from './szenarien'
import { beschrifte } from './beschriftung'
import { erzeuge, klicke } from './szenarienTesthilfe'
import type { Wahl } from './szenarienTesthilfe'

/*
X5: Die Szenarien der Risiko-Belohnungs-Karten lassen sich am Entwicklertisch
so durchklicken, wie ihre Erwartung es sagt (A8.2, D50 bis D55). Jeder Schritt
ist ein Knopf, den die Engine aufzählt.
*/

const risiko = (nummer: number, benannt: (zustand: Spielzustand) => string | null = () => null): Wahl => (aktion, zustand) =>
  aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === nummer && aktion.benannt === benannt(zustand)
const waehle = (wahl: string): Wahl => (aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === wahl
const handkarte = (farbe: string) => (zustand: Spielzustand) => zustand.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe)!.id
const schlangenkarte = (stelle: number) => (zustand: Spielzustand) => zustand.spieler[0].schlangen[0].karten[stelle].id
const farbkarte: Wahl = (aktion) => aktion.typ === 'FarbkarteLegen'
const beenden: Wahl = (aktion) => aktion.typ === 'ZugBeenden'
const typen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)
const wahlen = (zustand: Spielzustand) => ermittleAktionen(zustand).flatMap((aktion: SpielAktion) => (aktion.typ === 'Entscheiden' ? [aktion.wahl] : []))

describe('X5: Szenarien der Risiko-Belohnungs-Karten am Entwicklertisch', () => {
  it('X5: die Szenarien sind da und beschrieben', () => {
    const namen = ['risiko-erfolg', 'risiko-misserfolg', 'risiko-letzte-karte', 'risiko-schlussrunde']
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(namen))
    for (const szenario of SZENARIEN.filter((eintrag) => namen.includes(eintrag.name))) expect(szenario.erwartet.length).toBeGreaterThan(100)
  })

  it('A8.2: risiko-erfolg: jede Risiko-Aktion hat einen Knopf mit lesbarer Beschriftung; Aktion 1 bringt drei Karten, danach keine zweite Risiko-Karte (D50)', () => {
    const start = erzeuge('risiko-erfolg')
    const knoepfe = ermittleAktionen(start).filter((aktion) => aktion.typ === 'RisikoKarteSpielen')
    expect(knoepfe.map((aktion) => beschrifte(start, aktion))).toContain('RisikoKarteSpielen: Aktion 1 (Zusätzliche Karten ziehen) mit risiko-belohnung-01')
    expect(knoepfe).toHaveLength(6)
    const gezogen = klicke(start, risiko(1))
    expect(typen(gezogen.ereignisse)).toEqual(['KartenVersetzt', 'RisikoKarteGespielt', 'KartenVersetzt'])
    expect(gezogen.zustand.spieler[0].hand).toHaveLength(7)
    expect(ermittleAktionen(gezogen.zustand).some((aktion) => aktion.typ === 'RisikoKarteSpielen'), 'D50').toBe(false)
  })

  it('D52: risiko-erfolg, Aktion 2: die zusätzliche Farbkarte nur an ein Ende der eigenen Schlange', () => {
    const start = erzeuge('risiko-erfolg')
    const offen = klicke(start, risiko(2, handkarte('Rot'))).zustand
    const eigene = offen.spieler[0].schlangen[0].id
    expect(wahlen(offen).every((wahl) => wahl.includes(` ${eigene} `))).toBe(true)
    const gelegt = klicke(offen, waehle(`${handkarte('Rot')(start)} ${eigene} ende`))
    expect(gelegt.zustand.spieler[0].schlangen[0].karten.at(-1)?.id).toBe(handkarte('Rot')(start))
  })

  it('D53: risiko-erfolg, Aktion 3: gleicher Punktewert tauscht, anderer legt davor oder dahinter', () => {
    const start = erzeuge('risiko-erfolg')
    const tausch = klicke(start, risiko(3, schlangenkarte(0))).zustand
    expect(wahlen(tausch)).toContain('kein Tausch')
    const seite = klicke(start, risiko(3, schlangenkarte(1))).zustand
    expect(wahlen(seite)).toEqual(['davor', 'dahinter'])
  })

  it('D54: risiko-erfolg, Aktion 4: eigener Ablagestapel oder Nachziehstapel', () => {
    const offen = klicke(erzeuge('risiko-erfolg'), risiko(4)).zustand
    expect(wahlen(offen)).toEqual(['ablagestapel-0', 'ablagestapel-1', 'stapel'])
    expect(deserialisiere(serialisiere(offen)), 'Speichern und Laden mitten in der Entscheidung').toEqual(offen)
  })

  it('A8.2/D52: risiko-misserfolg: Spieler 1 wählt den Gegner, der Gegner wählt selbst; danach spielt Spieler 1 weiter', () => {
    const start = erzeuge('risiko-misserfolg')
    const verloren = klicke(start, risiko(2, handkarte('Blau')))
    expect(verloren.zustand.spieler[0].ablagestapel.at(-1)?.typ).toBe('Sonderkarte')
    expect(wahlen(verloren.zustand)).toEqual(['spieler-2', 'spieler-3'])
    const gegner = klicke(verloren.zustand, waehle('spieler-2')).zustand
    expect(ermittleEntscheider(gegner)).toBe(1)
    expect(wahlen(gegner)).toEqual(['geplante', 'stapel'])
    const genommen = klicke(gegner, waehle('geplante')).zustand
    expect(genommen.spieler[1].hand.map((karte) => karte.id)).toContain(handkarte('Blau')(start))
    expect(ermittleEntscheider(genommen)).toBe(0)
    const vierte = klicke(start, risiko(4), waehle('spieler-3')).zustand
    expect(wahlen(vierte), 'D54: KI-Gegner 2 hat einen leeren Ablagestapel').toEqual(['stapel'])
  })

  it('D55: risiko-letzte-karte: zieht der Gegner die letzte Karte, löst Spieler 1 die Schlussrunde aus', () => {
    const start = erzeuge('risiko-letzte-karte')
    const gezogen = klicke(start, risiko(2, handkarte('Blau')), waehle('spieler-2'), waehle('stapel'))
    expect(gezogen.ereignisse.filter((ereignis) => ereignis.typ === 'SchlussrundeBegonnen')).toEqual([{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }])
    const ende = klicke(gezogen.zustand, farbkarte, beenden, farbkarte, beenden, farbkarte, beenden)
    expect(ende.zustand.partiephase).toBe('Beendet')
  })

  it('D55: risiko-schlussrunde: in der Schlussrunde gibt es keinen Risiko-Knopf', () => {
    const start = erzeuge('risiko-schlussrunde')
    expect(start.partiephase).toBe('Schlussrunde')
    expect(start.spieler[0].risikoKarten).toHaveLength(2)
    expect(ermittleAktionen(start).some((aktion) => aktion.typ === 'RisikoKarteSpielen')).toBe(false)
  })
})
