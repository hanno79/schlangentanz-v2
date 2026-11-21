import { describe, expect, it } from 'vitest'
import { ermittleAktionen } from '../../engine'
import type { SchlangenhaeutungSpielenAktion, SpielAktion, Spielzustand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { auswahlstand, passendeReihenfolge, waehle } from './auswahl'
import type { Auswahl, Wahl } from './auswahl'
import { abschnittsLagen, abschnittZwischen, angeboteneEnden } from './haeutungsauswahl'

/*
O7: Die Schlangenhäutung wird in zwei Stufen gewählt. Erst Schlange und
Abschnitt, angeboten nur, was die Engine aufzählt; dann ordnet der Mensch die
Karten, und `passendeReihenfolge` findet die aufgezählte Aktion, deren
Farbfolge seiner Anordnung gleicht. Gebaut wird dabei keine Aktion (U3).
*/

const istHaeutung = (aktion: SpielAktion): aktion is SchlangenhaeutungSpielenAktion => aktion.typ === 'SchlangenhaeutungSpielen'

/** Die Ids einer Schlange am Tisch von vorn nach hinten. */
function kartenIds(zustand: Spielzustand, schlangenId: string): string[] {
  const schlange = zustand.spieler.flatMap((spieler) => spieler.schlangen).find((eintrag) => eintrag.id === schlangenId)!
  return schlange.karten.map((karte) => karte.id)
}

function farbeVon(zustand: Spielzustand): (karteId: string) => string {
  const farben = new Map(
    zustand.spieler.flatMap((spieler) => spieler.schlangen.flatMap((schlange) => schlange.karten)).map((karte) => [karte.id, karte.typ === 'Farbkarte' ? karte.farbe : karte.name]),
  )
  return (karteId) => farben.get(karteId)!
}

/** Szenario `haeutung`: Karte und Schlange gewählt. */
function bisZurSchlange(schlangenId: string) {
  const zustand = erzeugeSzenario('haeutung')
  const aktionen = ermittleAktionen(zustand)
  const karte: Wahl = { art: 'karte', karteId: zustand.spieler[0].hand[0].id }
  const auswahl = waehle(aktionen, waehle(aktionen, [], karte), { art: 'schlange', schlangenId })
  return { zustand, aktionen, auswahl, ids: kartenIds(zustand, schlangenId) }
}

/** Die Abschnitte, die die Engine in dieser Schlange nennt, als Stellen „von-bis“. */
function abschnitteDerEngine(aktionen: readonly SpielAktion[], schlangenId: string, ids: readonly string[]): string[] {
  const stellen = aktionen
    .filter(istHaeutung)
    .filter((aktion) => aktion.schlangenId === schlangenId)
    .map((aktion) => {
      const lage = aktion.neueReihenfolge.map((id) => ids.indexOf(id))
      return `${Math.min(...lage)}-${Math.max(...lage)}`
    })
  return [...new Set(stellen)].sort()
}

describe('O7 K2: Wählbar sind nur die Abschnitte, die die Engine nennt', () => {
  it('O7 K2/A7.9: nach Karte und Schlange bietet die Auswahl genau die Abschnitte der Engine an, jeden einmal', () => {
    const { aktionen, auswahl, ids } = bisZurSchlange('schlange-1')
    const { angebote, fertig } = auswahlstand(aktionen, auswahl)
    expect(fertig).toBeNull()
    expect(angebote.every((wahl) => wahl.art === 'abschnitt'), 'nach der Schlange kommt der Abschnitt').toBe(true)
    const lagen = abschnittsLagen(angebote, ids)
    expect(lagen.map((lage) => `${lage.von}-${lage.bis}`).sort()).toEqual(abschnitteDerEngine(aktionen, 'schlange-1', ids))
    expect(lagen).toHaveLength(6)
  })

  it('O7 K2/D26: in einer Schlange mit genau drei Karten gibt es einen Abschnitt; seine Enden sind die erste und die letzte Karte', () => {
    const { aktionen, auswahl, ids } = bisZurSchlange('schlange-2')
    const lagen = abschnittsLagen(auswahlstand(aktionen, auswahl).angebote, ids)
    expect(lagen.map((lage) => [lage.von, lage.bis])).toEqual([[0, 2]])
    expect([...angeboteneEnden(lagen, null)].sort()).toEqual([ids[0], ids[2]].sort())
  })

  it('O7 K1: ohne erstes Ende ist jedes Ende eines Abschnitts angeboten, danach nur die Enden, die mit ihm einen Abschnitt bilden', () => {
    const { aktionen, auswahl, ids } = bisZurSchlange('schlange-1')
    const lagen = abschnittsLagen(auswahlstand(aktionen, auswahl).angebote, ids)
    expect([...angeboteneEnden(lagen, null)].sort()).toEqual([...ids].sort())
    expect([...angeboteneEnden(lagen, ids[0])].sort(), 'ab Karte 1: Abschnitte bis Karte 3, 4 und 5').toEqual([ids[2], ids[3], ids[4]].sort())
    expect([...angeboteneEnden(lagen, ids[2])].sort(), 'Karte 3 ist Ende von 1–3 und Anfang von 3–5').toEqual([ids[0], ids[4]].sort())
    expect(abschnittZwischen(lagen, ids[4], ids[1])?.wahl, 'die Reihenfolge der beiden Enden spielt keine Rolle').toEqual(abschnittZwischen(lagen, ids[1], ids[4])?.wahl)
    expect(abschnittZwischen(lagen, ids[0], ids[1]), 'zwei Karten sind kein Abschnitt').toBeUndefined()
  })

  it('O7: ein angebotener Abschnitt, der nicht lückenlos in der gezeigten Schlange liegt, ist ein Fehler und kein stiller Ersatz', () => {
    const { aktionen, auswahl, ids } = bisZurSchlange('schlange-1')
    const angebote = auswahlstand(aktionen, auswahl).angebote
    expect(() => abschnittsLagen(angebote, ids.slice(0, 4)), 'Karte 5 fehlt').toThrow(/Abschnitt/)
    expect(() => abschnittsLagen(angebote, [ids[0], ids[3], ids[1], ids[2], ids[4]]), 'Karte 4 steht an zweiter Stelle').toThrow(/Abschnitt/)
  })
})

describe('O7 K1/U3: Beim Bestätigen wählt die Auswahl die aufgezählte Aktion mit der Farbfolge der Anordnung', () => {
  /** Szenario `haeutung`, Abschnitt Karte 1 bis 5 der eigenen Schlange (Blau, Rot, Gelb, Rot, Gelb). */
  function ganzerAbschnitt() {
    const { zustand, aktionen, auswahl, ids } = bisZurSchlange('schlange-1')
    const lage = abschnittZwischen(abschnittsLagen(auswahlstand(aktionen, auswahl).angebote, ids), ids[0], ids[4])!
    const mitAbschnitt: Auswahl = waehle(aktionen, auswahl, lage.wahl)
    return { zustand, aktionen, auswahl: mitAbschnitt, ids, angebote: auswahlstand(aktionen, mitAbschnitt).angebote }
  }

  it('O7 K1/A7.9 Beispiel 1: Gelb, Gelb, Blau, Rot, Rot ergibt genau die Aktion der Engine, dasselbe Objekt', () => {
    const { zustand, aktionen, auswahl, ids, angebote } = ganzerAbschnitt()
    const [blau, rot1, gelb1, rot2, gelb2] = ids
    const wahl = passendeReihenfolge(angebote, [gelb1, gelb2, blau, rot1, rot2], farbeVon(zustand))
    expect(wahl?.art).toBe('reihenfolge')
    const fertig = auswahlstand(aktionen, [...auswahl, wahl!]).fertig
    expect(aktionen.includes(fertig!), 'die Auswahl liefert eine Aktion der Engine, keine Abschrift').toBe(true)
    expect(istHaeutung(fertig!) ? fertig.neueReihenfolge.map(farbeVon(zustand)) : []).toEqual(['Gelb', 'Gelb', 'Blau', 'Rot', 'Rot'])
  })

  it('O7/A11: liegen gleichfarbige Karten anders als in der aufgezählten Aktion, zählt die Farbfolge', () => {
    const { zustand, angebote, ids } = ganzerAbschnitt()
    const [blau, rot1, gelb1, rot2, gelb2] = ids
    const vorn = passendeReihenfolge(angebote, [gelb1, gelb2, blau, rot1, rot2], farbeVon(zustand))
    const getauscht = passendeReihenfolge(angebote, [gelb2, gelb1, blau, rot2, rot1], farbeVon(zustand))
    expect(getauscht).not.toBeNull()
    expect(getauscht).toBe(vorn)
  })

  it('O7 D26/F13: dieselbe Farbfolge wie vorher ergibt keine Aktion, auch wenn zwei gleichfarbige Karten getauscht sind', () => {
    const { zustand, angebote, ids } = ganzerAbschnitt()
    const [blau, rot1, gelb1, rot2, gelb2] = ids
    expect(passendeReihenfolge(angebote, ids, farbeVon(zustand)), 'unverändert').toBeNull()
    expect(passendeReihenfolge(angebote, [blau, rot2, gelb1, rot1, gelb2], farbeVon(zustand)), 'Rot mit Rot getauscht').toBeNull()
    expect(passendeReihenfolge(angebote, [blau, rot1, gelb2, rot2, gelb1], farbeVon(zustand)), 'Gelb mit Gelb getauscht').toBeNull()
  })

  it('O7: jede Anordnung mit neuer Farbfolge findet genau eine angebotene Reihenfolge', () => {
    const { zustand, angebote, ids } = ganzerAbschnitt()
    const farbe = farbeVon(zustand)
    const bisher = ids.map(farbe).join()
    const anordnungen = (frei: string[]): string[][] => (frei.length === 0 ? [[]] : frei.flatMap((id) => anordnungen(frei.filter((andere) => andere !== id)).map((rest) => [id, ...rest])))
    let gefunden = 0
    for (const anordnung of anordnungen(ids)) {
      const wahl = passendeReihenfolge(angebote, anordnung, farbe)
      if (anordnung.map(farbe).join() === bisher) expect(wahl, anordnung.join()).toBeNull()
      else {
        expect(wahl, anordnung.join()).not.toBeNull()
        expect(wahl!.karteIds.map(farbe), anordnung.join()).toEqual(anordnung.map(farbe))
        gefunden += 1
      }
    }
    expect(gefunden).toBe(120 - 4)
  })

  it('O7: eine Anordnung mit einer Karte ausserhalb des Abschnitts ist ein Fehler', () => {
    const { zustand, angebote, ids } = ganzerAbschnitt()
    const fremd = zustand.spieler[1].schlangen[0].karten[0].id
    expect(() => passendeReihenfolge(angebote, [fremd, ...ids.slice(1)], farbeVon(zustand))).toThrow(/Abschnitt/)
  })
})
