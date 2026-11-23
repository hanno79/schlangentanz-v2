import { describe, expect, it } from 'vitest'
import { berechneEndwertung, deserialisiere, serialisiere } from '../../index'
import type { Spielzustand } from '../../index'
import { legeAufgabenAus } from '../../testing/aufgaben'
import type { Kartenwahl, Schlangenglied } from '../../testing/szenario'
import { aufgabenEreignisse, aufgabeId, namen } from '../aufgaben_hilfen'
import { erfuellt } from '../aufgaben_c_hilfen'
import { arten, haeutungAuf, HAEUTUNG } from '../schlangenhaeutung_hilfen'
import { aktionen, durchlassen, FUENF, folge, fuehreAus, tischMitHaenden, zugBeenden } from '../zugablauf_hilfen'
import type { Schritt } from '../zugablauf_hilfen'

/*
X2, Paket C, A9 Nr. 12 „Schlangentanz“: „Bilde durch Schlangenhäutung 2 neue
Dreiergruppen.“ Nach D37 (G4) zählt nur eine Häutung, die der Spieler selbst
in einer eigenen Schlange spielt, und beide Gruppen müssen aus derselben
Häutung entstehen. Die Engine hält je Spieler fest, wie viele neue
Dreiergruppen seine beste solche Häutung gebildet hat (Kriterium 7, aus E9
verschoben).

Eine Dreiergruppe ist eine Farbgruppe aus mindestens drei Karten (A11, A7.3
„Dreiergruppe (oder länger)“). Neu ist sie, wenn vor der Häutung keine Gruppe
derselben Farbe eine ihrer Karten enthielt; eine verlängerte oder
stehengebliebene Gruppe ist nicht neu. Regenbogenschlange und Farbenfusion
zählen als die Farbe, mit der die Aufgabe erfüllt ist (A9, A7.3, A7.7), vor
und nach der Häutung dieselbe.
*/

/** A9, Beispiel zu Schlangentanz: die Schlange vorher. */
const BEISPIEL: Kartenwahl[] = ['Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Violett', 'Violett', 'Rot', 'Violett']

/** Spieler 1 hält eine Schlangenhäutung und hat diese Schlangen; offen liegt Schlangentanz. */
function tisch(eigene: Schlangenglied[][], gegner: Schlangenglied[][] = [], hand0: Kartenwahl[] = HAEUTUNG): Spielzustand {
  const bau = tischMitHaenden([hand0, FUENF], true)
  for (const glieder of eigene) bau.schlange(0, glieder)
  for (const glieder of gegner) bau.schlange(1, glieder)
  return bau.aendere((zustand) => legeAufgabenAus(zustand, { offen: ['Schlangentanz', 'Farbkombination', 'Lila Riese'] })).zustand()
}

/** Spieler 1 häutet in seiner `schlange`-ten Schlange ab Stelle `von` zu `nachher`. */
function haeute(zustand: Spielzustand, von: number, nachher: string[], schlange = 0, besitzer = 0): Schritt {
  return fuehreAus(zustand, haeutungAuf(zustand, besitzer, von, nachher, schlange))
}

const zaehler = (zustand: Spielzustand, spieler = 0) => zustand.spieler[spieler].schlangenhaeutungDreiergruppen
const schlangentanzErfuellt = (schritt: Schritt) =>
  aufgabenEreignisse(schritt.ereignisse).some((ereignis) => ereignis.typ === 'AufgabeErfuellt' && ereignis.aufgabeId === aufgabeId('Schlangentanz'))

describe('A9 Nr. 12 „Schlangentanz“: das Beispiel der Website', () => {
  it('A9 Nr. 12/A7.9: Spieler 1 häutet die letzten 5 Karten zu Rot, Rot, Violett, Violett, Violett, bildet zwei neue Dreiergruppen und nimmt „Schlangentanz“', () => {
    const start = tisch([BEISPIEL])
    expect(erfuellt('Schlangentanz', start), 'vorher keine Häutung').toBe(false)
    const schritt = haeute(start, 6, ['Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
    expect(arten(schritt.zustand, 0), 'A9: die Schlange nachher').toEqual(['Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
    expect(zaehler(schritt.zustand), 'X2 Kriterium 7: neue Dreiergruppen dieser Häutung').toBe(2)
    expect(aufgabenEreignisse(schritt.ereignisse)[0]).toEqual({ typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Schlangentanz') })
    expect(namen(schritt.zustand.spieler[0].erfuellteAufgaben)).toEqual(['Schlangentanz'])
  })
})

describe('A9 Nr. 12: Entscheidungstabelle', () => {
  it('A9 Nr. 12: knapp nicht: dieselbe Schlange zu Rot, Violett, Violett, Violett, Rot bildet nur die violette Gruppe', () => {
    const schritt = haeute(tisch([BEISPIEL]), 6, ['Rot', 'Violett', 'Violett', 'Violett', 'Rot'])
    expect(zaehler(schritt.zustand)).toBe(1)
    expect(schlangentanzErfuellt(schritt)).toBe(false)
  })

  it('A9 Nr. 12/A7.3: mit Regenbogenschlange: sie zählt als Gelb, so entstehen Gelb und Blau neu; in der Wertung zählt sie als Braun (A11)', () => {
    const schritt = haeute(tisch([['Braun', 'Braun', 'Regenbogenschlange', 'Blau', 'Gelb', 'Blau', 'Gelb', 'Blau']]), 3, ['Gelb', 'Gelb', 'Blau', 'Blau', 'Blau'])
    expect(zaehler(schritt.zustand), 'A9: die Regenbogenschlange zählt für Schlangentanz als Gelb').toBe(2)
    expect(schlangentanzErfuellt(schritt)).toBe(true)
    // A7.3: Die Farbe ist nie festgelegt; die Wertung wählt die meisten Punkte (Braun 4 statt Gelb 2).
    const joker = berechneEndwertung(schritt.zustand).spieler[0].schlangen[0].joker
    expect(joker.map((eintrag) => eintrag.farbe), 'A11: dieselbe Regenbogenschlange in der Wertung').toEqual(['Braun'])
  })

  it('A9 Nr. 12: Gegenprobe ohne Joker: an Stelle der Regenbogenschlange eine rote Karte, so entsteht nur Blau neu', () => {
    const schritt = haeute(tisch([['Braun', 'Braun', 'Rot', 'Blau', 'Gelb', 'Blau', 'Gelb', 'Blau']]), 3, ['Gelb', 'Gelb', 'Blau', 'Blau', 'Blau'])
    expect(zaehler(schritt.zustand)).toBe(1)
    expect(schlangentanzErfuellt(schritt)).toBe(false)
  })

  it('A9 Nr. 12/A7.7: mit Farbenfusion: die Fusion aus zwei roten Karten zählt als Gelb; ihre roten Karten zählen nicht', () => {
    const schritt = haeute(tisch([['Braun', 'Braun', { fusion: ['Rot', 'Rot'] }, 'Blau', 'Gelb', 'Blau', 'Gelb', 'Blau']]), 3, ['Gelb', 'Gelb', 'Blau', 'Blau', 'Blau'])
    expect(zaehler(schritt.zustand)).toBe(2)
    expect(schlangentanzErfuellt(schritt)).toBe(true)
  })

  it('A9 Nr. 12/A7.5: mit Blockade dazwischen: Rot, Blockade, Rot, Rot ist keine Gruppe, nur Violett entsteht neu', () => {
    const mitBlockade: Kartenwahl[] = [...BEISPIEL.slice(0, 6), 'Schlangenblockade', ...BEISPIEL.slice(6)]
    const schritt = haeute(tisch([mitBlockade]), 7, ['Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
    expect(zaehler(schritt.zustand)).toBe(1)
    expect(schlangentanzErfuellt(schritt)).toBe(false)
  })

  it('A9 Nr. 12/D37: über zwei Schlangen: zwei Häutungen in zwei eigenen Schlangen mit je einer neuen Gruppe genügen nicht', () => {
    const start = tisch([['Rot', 'Rot', 'Blau', 'Rot'], ['Gelb', 'Gelb', 'Blau', 'Gelb']], [], ['Schlangenhäutung', 'Schlangenhäutung', 'Blau', 'Rot', 'Gelb'])
    const erste = haeute(start, 1, ['Rot', 'Rot', 'Blau'], 0)
    expect(zaehler(erste.zustand)).toBe(1)
    const neueSchlange = (zustand: Spielzustand) => aktionen(zustand, 'FarbkarteLegen').find((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'neueSchlange')!
    const wieder = folge(erste.zustand, zugBeenden, neueSchlange, zugBeenden)
    const zweite = haeute(wieder.zustand, 1, ['Gelb', 'Gelb', 'Blau'], 1)
    expect(arten(zweite.zustand, 0, 1)).toEqual(['Gelb', 'Gelb', 'Gelb', 'Blau'])
    expect(zaehler(zweite.zustand), 'D37: je Häutung gezählt, nicht zusammen').toBe(1)
    expect(schlangentanzErfuellt(zweite)).toBe(false)
  })

  it('A9 Nr. 12/D37: eine Häutung in der Schlange des Gegners erfüllt die Aufgabe für niemanden', () => {
    const start = tisch([['Gelb', 'Gelb']], [BEISPIEL])
    const angesagt = fuehreAus(start, haeutungAuf(start, 1, 6, ['Rot', 'Rot', 'Violett', 'Violett', 'Violett']))
    const gewirkt = fuehreAus(angesagt.zustand, durchlassen(angesagt.zustand))
    expect(arten(gewirkt.zustand, 1), 'Testaufbau: die Häutung hat gewirkt').toEqual(['Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
    expect(zaehler(gewirkt.zustand, 0), 'D37: Spieler 1 hat nicht in einer eigenen Schlange gehäutet').toBe(0)
    expect(zaehler(gewirkt.zustand, 1), 'D37: KI-Gegner 1 hat nicht selbst gehäutet').toBe(0)
    const gegnerzug = fuehreAus(gewirkt.zustand, zugBeenden(gewirkt.zustand))
    expect(gegnerzug.zustand.zug.spielerIndex).toBe(1)
    expect(schlangentanzErfuellt(gewirkt) || schlangentanzErfuellt(gegnerzug)).toBe(false)
  })
})

describe('A9 Nr. 12: was eine neue Dreiergruppe ist', () => {
  it('A9 Nr. 12/A11: eine bestehende Gruppe zu verlängern bildet keine neue', () => {
    const schritt = haeute(tisch([['Rot', 'Rot', 'Rot', 'Blau', 'Rot']]), 0, ['Rot', 'Rot', 'Rot', 'Rot', 'Blau'])
    expect(zaehler(schritt.zustand)).toBe(0)
  })

  it('A9 Nr. 12/A11: bleibt die alte Gruppe stehen, zählen nur die zwei neuen daneben', () => {
    const schritt = haeute(tisch([['Gelb', 'Gelb', 'Blau', 'Blau', 'Blau', 'Rot', 'Gelb', 'Rot', 'Rot']]), 2, ['Gelb', 'Blau', 'Blau', 'Blau', 'Rot'])
    expect(arten(schritt.zustand, 0)).toEqual(['Gelb', 'Gelb', 'Gelb', 'Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot'])
    expect(zaehler(schritt.zustand), 'Gelb und Rot neu, Blau stand schon').toBe(2)
    expect(schlangentanzErfuellt(schritt)).toBe(true)
  })

  it('A9 Nr. 12/A7.9: eine neue Gruppe mit einem Nachbarn ausserhalb des Abschnitts zählt', () => {
    const schritt = haeute(tisch([['Gelb', 'Gelb', 'Blau', 'Gelb', 'Blau']]), 2, ['Gelb', 'Blau', 'Blau'])
    expect(zaehler(schritt.zustand)).toBe(1)
  })
})

describe('A9 Nr. 12: erfüllt bleibt erfüllt; gespeichert bleibt gezählt', () => {
  it('A9/A7.3: „Schlangentanz“ bleibt erfüllt und bringt 7 Punkte, obwohl die Regenbogenschlange in der Wertung als Braun zählt', () => {
    const schritt = haeute(tisch([['Braun', 'Braun', 'Regenbogenschlange', 'Blau', 'Gelb', 'Blau', 'Gelb', 'Blau']]), 3, ['Gelb', 'Gelb', 'Blau', 'Blau', 'Blau'])
    const wertung = berechneEndwertung(schritt.zustand).spieler[0]
    expect(wertung.aufgaben?.map((eintrag) => eintrag.name)).toEqual(['Schlangentanz'])
    expect(wertung.aufgabenPunkte).toBe(7)
  })

  it('D35/A9 Nr. 12: als geheime Aufgabe zählt Schlangentanz nach der Häutung verdeckt', () => {
    const start = tischMitHaenden([HAEUTUNG, FUENF], true)
      .schlange(0, BEISPIEL)
      .aendere((zustand) => legeAufgabenAus(zustand, { offen: ['Farbkombination', 'Lila Riese', 'Gelber Schatz'], geheim: [[0, 'Schlangentanz']] }))
      .zustand()
    const schritt = haeute(start, 6, ['Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
    expect(schritt.zustand.spieler[0].geheimeAufgabeErfuellt, 'D35: einmal im eigenen Zug erfüllt').toBe(true)
    expect(aufgabenEreignisse(schritt.ereignisse), 'D35: still, ohne Ereignis').toEqual([])
  })

  it('A9 Nr. 12: Speichern und Laden erhält die Zahl neuer Dreiergruppen', () => {
    const schritt = haeute(tisch([BEISPIEL]), 6, ['Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
    expect(zaehler(deserialisiere(serialisiere(schritt.zustand)))).toBe(2)
  })
})
