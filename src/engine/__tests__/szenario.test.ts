import { describe, expect, it } from 'vitest'
import { deserialisiere, pruefeInvarianten, serialisiere } from '../index'
import type { Spielkarte } from '../index'
import { baukasten } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'

function art(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? karte.farbe : karte.name
}

describe('A1/A4: Szenario-Baukasten baut nur aus echtem Material', () => {
  it('A4: ein leerer Tisch hat alles Material im Nachziehstapel, leere Hände und erfüllt jede Invariante', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).zustand()
    expect(zustand.nachziehstapel).toHaveLength(108)
    expect(zustand.spieler.map((spieler) => spieler.hand)).toEqual([[], []])
    expect(pruefeInvarianten(zustand).filter((befund) => befund.verletzt)).toEqual([])
  })

  it('A4: Hand, Schlange, Fusion, Ablage, Grube und „aus dem Spiel“ nehmen ihre Karten vom Nachziehstapel', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: true })
      .hand(0, ['Farbenschutz', 'Grün'])
      .schlange(1, ['Rot', 'Regenbogenschlange', { fusion: ['Braun', 'Braun'] }])
      .ablage(2, ['Farbendieb', 'Blau'])
      .grube(2, 0)
      .ausDemSpiel(['Schlangenkorb des Glücks'])
      .zustand()

    expect(zustand.spieler[0].hand.map(art)).toEqual(['Farbenschutz', 'Grün'])
    const [schlange] = zustand.spieler[1].schlangen
    expect(schlange.karten.map(art)).toEqual(['Rot', 'Regenbogenschlange', 'Farbenfusion'])
    expect(schlange.fusionen[0].karteId).toBe(schlange.karten[2].id)
    expect(schlange.fusionen[0].unter.map(art)).toEqual(['Braun', 'Braun'])
    expect(zustand.spieler[2].ablagestapel.map(art)).toEqual(['Farbendieb', 'Blau'])
    expect(zustand.ausliegendeGruben.map((grube) => [grube.gespieltVon, grube.vor])).toEqual([[2, 0]])
    expect(zustand.nachziehstapel).toHaveLength(112 - 2 - 5 - 2 - 1 - 1)
    expect(pruefeInvarianten(zustand).filter((befund) => befund.verletzt)).toEqual([])
  })

  it('A1: es gibt nur so viele Karten, wie das Material hat', () => {
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).ablage(0, ['Schlangengrube', 'Schlangengrube', 'Schlangengrube', 'Schlangengrube'])).toThrow(
      /Schlangengrube/,
    )
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Schlangenhäutung'])).toThrow(/Schlangenhäutung/)
    expect(() => baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, [{ id: 'gibt-es-nicht' }])).toThrow(/gibt-es-nicht/)
  })

  it('A1: ein Aufruf, der an fehlendem Material scheitert, nimmt auch keine der anderen Karten', () => {
    const bau = baukasten({ spielerzahl: 2, erweiterung: false })
    expect(() => bau.hand(0, ['Grün', 'Schlangenhäutung'])).toThrow(/Schlangenhäutung/)
    expect(() => bau.schlange(1, ['Blau', { fusion: ['Rot', 'Grün'] }, 'Schlangenhäutung'])).toThrow()
    const zustand = bau.zustand()
    expect(zustand.nachziehstapel).toHaveLength(108)
    expect(zustand.spieler.map((spieler) => [spieler.hand.length, spieler.schlangen.length])).toEqual([
      [0, 0],
      [0, 0],
    ])
    expect(zustand.schlangenZaehler).toBe(0)
  })

  it('A1: eine bestimmte Karte lässt sich über ihre Id wählen, aber nur einmal', () => {
    const bau = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, [{ id: 'gruen-09' }])
    expect(bau.zustand().spieler[0].hand.map((karte) => karte.id)).toEqual(['gruen-09'])
    expect(() => bau.hand(1, [{ id: 'gruen-09' }])).toThrow(/gruen-09/)
  })

  it('A5: Schlangen bekommen eindeutige Ids, auch über Spieler hinweg', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .schlange(0, ['Blau'])
      .schlange(1, ['Rot'])
      .schlange(0, ['Gelb'])
      .zustand()
    const ids = zustand.spieler.flatMap((spieler) => spieler.schlangen.map((schlange) => schlange.id))
    expect(new Set(ids).size).toBe(3)
    expect(zustand.schlangenZaehler).toBe(3)
  })

  it('A4: Hände auffüllen gibt jedem reihum bis 5 Karten von oben; stapelOben legt Karten nach oben', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .hand(0, ['Blau', 'Blau'])
      .stapelOben(['Grün', 'Verdoppler'])
      .haendeAuffuellen()
      .zustand()
    expect(zustand.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 5])
    expect(art(zustand.spieler[0].hand[2])).toBe('Grün')
    expect(art(zustand.spieler[1].hand[0])).toBe('Verdoppler')
  })

  it('A10: stapelBehalten lässt n Karten im Nachziehstapel und legt den Rest reihum auf die Ablagestapel', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: false }).haendeAuffuellen().stapelBehalten(2).zustand()
    expect(zustand.nachziehstapel).toHaveLength(2)
    const abgelegt = zustand.spieler.map((spieler) => spieler.ablagestapel.length)
    expect(abgelegt.reduce((summe, n) => summe + n, 0)).toBe(108 - 15 - 2)
    expect(Math.max(...abgelegt) - Math.min(...abgelegt)).toBeLessThanOrEqual(1)
  })

  it('A5/A10: Zug, Teilzug, Schlussrunde und Ende lassen sich setzen', () => {
    const zustand = baukasten({ spielerzahl: 4, erweiterung: false }).amZug(2, 2).schlussrunde(1).zustand()
    expect(zustand.zug).toMatchObject({ spielerIndex: 2, teilzug: 2 })
    expect(zustand.partiephase).toBe('Schlussrunde')
    expect(zustand.schlussrundeAusloeser).toBe(1)
  })

  it('A6: eine schwebende Karte samt angesagter Aktion lässt sich bauen', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: false })
      .schwebend(1, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-3' }), [2])
      .zustand()
    expect(zustand.schwebend).toEqual({
      karte: { typ: 'Sonderkarte', id: 'schlangengrube-01', name: 'Schlangengrube' },
      aktion: { typ: 'SchlangengrubeSpielen', spielerId: 'spieler-2', karteId: 'schlangengrube-01', zielSpielerId: 'spieler-3' },
      ausstehend: [2],
      abgewehrt: [],
    })
  })

  it('A4: ein Zustand, der eine Invariante verletzt, wird nicht herausgegeben', () => {
    const bau = baukasten({ spielerzahl: 2, erweiterung: false }).aendere((zustand) => {
      zustand.spieler[0].hand.push(zustand.nachziehstapel[0])
    })
    expect(() => bau.zustand()).toThrow(/Jede Spielkarte liegt genau einmal an genau einem Ort/)
  })

  it('A1: mit Zufallsquelle ist der Stapel gemischt, und gleiche Saat ergibt denselben Tisch', () => {
    const mit = (saat: number) => baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(saat) }).haendeAuffuellen().zustand()
    expect(mit(4)).toEqual(mit(4))
    expect(mit(4)).not.toEqual(mit(5))
    const ohne = baukasten({ spielerzahl: 2, erweiterung: true }).zustand()
    expect(ohne.nachziehstapel.slice(0, 3).map(art)).toEqual(['Blau', 'Blau', 'Blau'])
  })

  it('A4: was der Baukasten baut, übersteht Speichern und Laden', () => {
    const zustand = baukasten({ spielerzahl: 4, erweiterung: true })
      .schlange(3, ['Violett', 'Schlangenblockade', 'Violett'])
      .grube(0, 3)
      .haendeAuffuellen()
      .amZug(3)
      .zustand()
    expect(deserialisiere(serialisiere(zustand))).toEqual(zustand)
  })
})
