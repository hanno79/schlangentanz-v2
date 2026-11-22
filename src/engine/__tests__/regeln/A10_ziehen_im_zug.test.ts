import { afterEach, describe, expect, it, vi } from 'vitest'
import { ermittleEntscheider, pruefeInvarianten } from '../../index'
import type { Spielzustand } from '../../index'
import { deckeAuf, zieheVomStapel } from '../../stapel'
import { baukasten } from '../../testing/szenario'
import { verlangeTestwahl } from '../../testing/testentscheidung'
import { entscheidung, mitTestentscheidungen, spieleTestkarte, testkarte, TESTKARTE, typenDer } from '../rahmen_hilfen'
import { ereignisseVom, folge, fuehreAus, hand, spieleZug, zugBeenden } from '../zugablauf_hilfen'

/*
X3, Kriterium 2: Karten mitten im Zug ziehen und offen aufdecken (`stapel.ts`),
für A8.1 („drei neue vom Nachziehstapel ziehen“), A8.2 („deckst du die oberste
Karte vom Nachziehstapel auf“) und A7.10 („Ziehe 3 zusätzliche Karten“). Wer
dabei die letzte Karte nimmt, ändert nichts daran, wer die Schlussrunde
auslöst: der Spieler am Zug (A10, D55, auch D43 und D49). Er spielt seinen Zug
zu Ende, dann hat jeder andere noch einen Zug. Keine Karte geht verloren.
*/

afterEach(() => {
  vi.restoreAllMocks()
})

/** Drei Spieler, Spieler 1 hält die Test-Karte und Blau; im Nachziehstapel liegen noch `stapel` Karten. */
function tisch(stapel: number): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: true })
    .hand(0, [TESTKARTE, 'Blau'])
    .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
    .hand(2, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
    .stapelBehalten(stapel)
    .zustand()
}

describe('A10/D55: wer mitten im Zug die letzte Karte zieht', () => {
  it('A10/D49: zieht der Spieler am Zug mehr, als im Stapel liegt, bekommt er, was da ist; die Schlussrunde beginnt, er ist ihr Auslöser', () => {
    testkarte((zustand, spielerIndex) => {
      expect(zieheVomStapel(zustand, spielerIndex, 3), 'zieheVomStapel: gezogen wird, was da ist').toBe(2)
    })
    const schritt = spieleTestkarte(tisch(2))
    expect(typenDer(schritt.ereignisse)).toEqual(['KartenVersetzt', 'KarteGespielt', 'SchlussrundeBegonnen'])
    expect(ereignisseVom(schritt.ereignisse, 'SchlussrundeBegonnen')).toEqual([{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }])
    expect(schritt.zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0, nachziehstapel: [] })
    expect(hand(schritt.zustand, 0)).toHaveLength(3)
  })

  it('A10: er spielt seinen Zug zu Ende; danach hat jeder andere genau einen Zug ohne Nachziehen, dann ist Schluss', () => {
    testkarte((zustand, spielerIndex) => {
      zieheVomStapel(zustand, spielerIndex, 3)
    })
    const gezogen = spieleTestkarte(tisch(2)).zustand
    expect(ermittleEntscheider(gezogen), 'A10: der Auslöser ist weiter am Zug').toBe(0)
    const blau = gezogen.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte')!.id
    const gelegt = fuehreAus(gezogen, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: blau, ziel: { art: 'neueSchlange' } })
    const ende = folge(gelegt.zustand, zugBeenden)
    const weiter = [spieleZug(ende.zustand)]
    weiter.push(spieleZug(weiter[0].zustand))
    const alle = [...ende.ereignisse, ...weiter.flatMap((schritt) => schritt.ereignisse)]
    expect(ereignisseVom(alle, 'KartenGezogen'), 'A10: in der Schlussrunde zieht niemand').toEqual([])
    expect(ereignisseVom(alle, 'ZugBegonnen').map((ereignis) => ereignis.spielerIndex)).toEqual([1, 2])
    expect(weiter[1].zustand.partiephase).toBe('Beendet')
  })

  it('D55: nimmt ein begünstigter Gegner die letzte Karte, löst trotzdem der Spieler am Zug die Schlussrunde aus', () => {
    const austragen = mitTestentscheidungen()
    try {
      testkarte((zustand, spielerIndex) => verlangeTestwahl(zustand, spielerIndex, zustand.spieler[spielerIndex].ablagestapel.at(-1)!.id))
      const gefragt = entscheidung(spieleTestkarte(tisch(2)).zustand, 'spieler-3').zustand
      expect(gefragt.nachziehstapel, 'eine Karte ist aufgedeckt, eine liegt noch').toHaveLength(1)
      const schritt = entscheidung(gefragt, 'stapel')
      expect(ereignisseVom(schritt.ereignisse, 'SchlussrundeBegonnen')).toEqual([{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }])
      expect(schritt.zustand.schlussrundeAusloeser).toBe(0)
      expect(hand(schritt.zustand, 2)).toHaveLength(6)
      expect(ermittleEntscheider(schritt.zustand), 'A10: der Auslöser spielt seinen Zug zu Ende').toBe(0)
    } finally {
      austragen()
    }
  })

  it('A10/D55: wird die letzte Karte offen aufgedeckt, beginnt die Schlussrunde sofort, ausgelöst vom Spieler am Zug', () => {
    const austragen = mitTestentscheidungen()
    try {
      testkarte((zustand, spielerIndex) => verlangeTestwahl(zustand, spielerIndex, zustand.spieler[spielerIndex].ablagestapel.at(-1)!.id))
      const schritt = spieleTestkarte(tisch(1))
      expect(typenDer(schritt.ereignisse)).toEqual(['KartenVersetzt', 'KarteGespielt', 'SchlussrundeBegonnen', 'EntscheidungVerlangt'])
      expect(schritt.zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0 })
      expect(schritt.zustand.aufgedeckt).toHaveLength(1)
    } finally {
      austragen()
    }
  })

  it('A10/D55: aus leerem Stapel zieht und deckt niemand etwas auf; nichts ändert sich', () => {
    const leer = baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, ['Blau']).schlussrunde(0).zustand()
    const kopie = structuredClone(leer)
    expect(zieheVomStapel(kopie, 0, 3)).toBe(0)
    expect(deckeAuf(kopie)).toBeNull()
    expect(kopie).toEqual(leer)
  })

  it('A10: ohne Ziehen mitten im Zug bleibt alles wie bisher: wer zu Zugbeginn beim Auffüllen die letzte Karte zieht, ist der Auslöser', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']).hand(1, ['Blau']).stapelBehalten(2).zustand()
    const gespielt = fuehreAus(start, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: start.spieler[0].hand[0].id, ziel: { art: 'neueSchlange' } }).zustand
    const ende = fuehreAus(gespielt, zugBeenden(gespielt))
    expect(ereignisseVom(ende.ereignisse, 'SchlussrundeBegonnen')).toEqual([{ typ: 'SchlussrundeBegonnen', ausloeser: 1 }])
  })
})

describe('A4/X3 Kriterium 2: Kartenerhaltung beim Ziehen und Aufdecken', () => {
  it('A4: eine aufgedeckte Karte liegt genau einmal im Spiel; fehlt sie, meldet die Invariante das', () => {
    const zustand = structuredClone(tisch(5))
    const karte = deckeAuf(zustand)!
    expect(zustand.aufgedeckt).toEqual([karte])
    expect(zustand.nachziehstapel).toHaveLength(4)
    const verloren = structuredClone(zustand)
    verloren.aufgedeckt = []
    const befund = pruefeInvarianten(verloren).find((eintrag) => eintrag.name === 'Jede Spielkarte liegt genau einmal an genau einem Ort')!
    expect(befund.verletzt).toBe(true)
    expect(befund.detail).toContain(karte.id)
  })

  it('X3: eine aufgedeckte Karte wartet auf eine Entscheidung; liegt sie ohne offene Entscheidung da, meldet die Invariante das', () => {
    const zustand = structuredClone(tisch(5))
    deckeAuf(zustand)
    const befund = pruefeInvarianten(zustand).find((eintrag) => eintrag.name === 'Eine aufgedeckte Karte wartet auf eine Entscheidung')!
    expect(befund.verletzt).toBe(true)
  })

  it('B2: gezogene Karten nennt kein Ereignis; die aufgedeckte nennt es mit Id und Platz', () => {
    testkarte((zustand, spielerIndex) => {
      zieheVomStapel(zustand, (spielerIndex + 1) % 3, 2)
    })
    const start = tisch(5)
    const oberste = start.nachziehstapel.slice(0, 2).map((karte) => karte.id)
    const schritt = spieleTestkarte(start)
    const versetzt = ereignisseVom(schritt.ereignisse, 'KartenVersetzt')[0]
    expect(versetzt.karten).toEqual([
      { karteId: null, von: { ort: 'Nachziehstapel' }, nach: { ort: 'Hand', spielerIndex: 1 } },
      { karteId: null, von: { ort: 'Nachziehstapel' }, nach: { ort: 'Hand', spielerIndex: 1 } },
    ])
    for (const id of oberste) expect(JSON.stringify(schritt.ereignisse)).not.toContain(id)
  })
})
