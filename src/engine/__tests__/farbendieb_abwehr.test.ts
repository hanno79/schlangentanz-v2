import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, ermittleEntscheider, serialisiere } from '../index'
import type { Ereignis, FarbendiebSpielenAktion, Spielzustand } from '../index'
import { dauerlauf, dauerlaufPartien } from '../testing/dauerlauf'
import type { SchrittPruefer } from '../testing/dauerlauf'
import type { Kartenwahl } from '../testing/szenario'
import { diebId, karteIn, schlangenVon, stiehl } from './farbendieb_hilfen'
import {
  ablage,
  durchlassen,
  ereignisseVom,
  farbkarte,
  folge,
  FUENF,
  fuehreAus,
  grund,
  hand,
  MIT_SCHUTZ,
  reaktion,
  tischMitHaenden as tisch,
  verletzteInvarianten,
  zugBeenden,
} from './zugablauf_hilfen'

/*
E8, der Farbendieb mit dem Reaktionsablauf aus E4 (A7.1 „Kann durch
Farbenschutz abgewehrt werden“, A6, A7.2, D10, D33): Betroffen ist der Besitzer
der Schlange, aus der gestohlen wird. Wehrt er ab, bleibt seine Karte liegen, und
der Farbendieb liegt auf dem Ablagestapel des Diebs. Dazu ein Dauerlauf, der
jeden gespielten Farbendieb nachrechnet.
*/

const DIEB: Kartenwahl[] = ['Farbendieb', 'Blau', 'Rot', 'Gelb', 'Grün']

/** Drei Spieler: A stiehlt, B hält Farbenschutz, C nicht; B und C haben je eine Schlange. */
function dreiSpieler(): Spielzustand {
  return tisch([DIEB, MIT_SCHUTZ, FUENF]).schlange(0, ['Rot']).schlange(1, ['Grün', 'Grün', 'Grün']).schlange(2, ['Blau', 'Gelb']).zustand()
}

const anDasEnde = (zustand: Spielzustand) => ({ art: 'schlange' as const, schlangenId: zustand.spieler[0].schlangen[0].id, position: 1 })

describe('A7.1, A7.2: der Farbendieb kann durch Farbenschutz abgewehrt werden (E8 Kriterium 3)', () => {
  it('A7.1/A7.2: B wehrt ab; seine Karte bleibt liegen, der Farbendieb liegt auf dem Ablagestapel von A, der Farbenschutz auf dem von B', () => {
    const start = dreiSpieler()
    const dieb = diebId(start, 0)
    const schutz = start.spieler[1].hand[0].id
    const { zustand, ereignisse } = folge(start, (jetzt) => stiehl(jetzt, karteIn(jetzt, 1, 0, 0), anDasEnde(jetzt)), (jetzt) => reaktion(jetzt, true))
    expect(schlangenVon(zustand, 1), 'A7.2: B bleibt unberührt').toEqual([['Grün', 'Grün', 'Grün']])
    expect(zustand.spieler[1].schlangen).toEqual(start.spieler[1].schlangen)
    expect(schlangenVon(zustand, 0)).toEqual([['Rot']])
    expect(ablage(zustand, 0)).toEqual([dieb])
    expect(ablage(zustand, 1)).toEqual([schutz])
    expect(hand(zustand, 1), 'A6: wer abwehrt, zieht nicht gleich nach').toHaveLength(4)
    expect(ereignisse.slice(2)).toEqual([
      { typ: 'Abgewehrt', spielerIndex: 1, karteId: schutz, gegen: dieb },
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: dieb, abgewehrt: [1], ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
    expect(ermittleEntscheider(zustand), 'A5: A spielt seinen Zug weiter').toBe(0)
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A6/B2: abgewehrt lässt sich der Farbendieb nicht auf ein anderes Ziel lenken', () => {
    const start = dreiSpieler()
    const angesagt = fuehreAus(start, stiehl(start, karteIn(start, 1, 0, 0), anDasEnde(start))).zustand
    const umlenken = stiehl(start, karteIn(start, 2, 0, 0), anDasEnde(start))
    expect(grund(angesagt, umlenken)).toMatch(/schwebt noch.*\(A6\)/)
    const abgewehrt = fuehreAus(angesagt, reaktion(angesagt, true)).zustand
    expect(ermittleAktionen(abgewehrt).map((aktion) => aktion.typ)).not.toContain('FarbendiebSpielen')
    expect(grund(abgewehrt, umlenken)).toMatch(/nicht auf der Hand/)
  })

  it('A7.2: wer Farbenschutz hält und durchlässt, verliert die Karte und behält den Farbenschutz', () => {
    const start = dreiSpieler()
    const gruen = karteIn(start, 1, 0, 2)
    const { zustand } = folge(start, (jetzt) => stiehl(jetzt, gruen, anDasEnde(jetzt)), (jetzt) => reaktion(jetzt, false))
    expect(schlangenVon(zustand, 1)).toEqual([['Grün', 'Grün']])
    expect(karteIn(zustand, 0, 0, 1)).toBe(gruen)
    expect(hand(zustand, 1)).toEqual(hand(start, 1))
  })
})

describe('A6, D33: Ansage und Betroffene beim Farbendieb', () => {
  it('A6/D33: betroffen ist nur der Besitzer der Schlange, aus der gestohlen wird; er wird gefragt, auch ohne Farbenschutz, B mit Farbenschutz nicht', () => {
    const start = dreiSpieler()
    const dieb = diebId(start, 0)
    const ansage = stiehl(start, karteIn(start, 2, 0, 1), anDasEnde(start))
    const { zustand, ereignisse } = fuehreAus(start, ansage)
    expect(ereignisse).toEqual([
      { typ: 'KarteAngesagt', spielerIndex: 0, karteId: dieb, ansage, betroffene: [2] },
      { typ: 'AbwehrGefragt', spielerIndex: 2, karteId: dieb },
    ])
    expect(ermittleEntscheider(zustand)).toBe(2)
    expect(ermittleAktionen(zustand), 'D33: ohne Farbenschutz nur durchlassen').toEqual([{ typ: 'Reagieren', spielerId: 'spieler-3', farbenschutzId: null }])
  })

  it('A6: die Wirkung tritt erst nach der Entscheidung ein; bis dahin schwebt der Farbendieb, und die Schlangen sind unverändert', () => {
    const start = dreiSpieler()
    const ansage = stiehl(start, karteIn(start, 1, 0, 0), anDasEnde(start))
    const { zustand } = fuehreAus(start, ansage)
    expect(zustand.schwebend).toMatchObject({ aktion: ansage, ausstehend: [1], abgewehrt: [] })
    expect(zustand.spieler.map((spieler) => spieler.schlangen)).toEqual(start.spieler.map((spieler) => spieler.schlangen))
    expect(ablage(zustand, 0)).toEqual([])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A6/E4 Kriterium 8: Speichern und Laden mitten in der Frage setzt genau dort fort; danach wird gestohlen', () => {
    const start = dreiSpieler()
    const gruen = karteIn(start, 1, 0, 0)
    const angesagt = fuehreAus(start, stiehl(start, gruen, anDasEnde(start))).zustand
    const geladen = deserialisiere(serialisiere(angesagt))
    expect(geladen).toEqual(angesagt)
    const { zustand } = fuehreAus(geladen, durchlassen(geladen))
    expect(karteIn(zustand, 0, 0, 1)).toBe(gruen)
  })
})

/** Was der Dauerlauf an Farbendieben sah. */
interface Diebe {
  gestohlen: number
  abgewehrt: number
  neueSchlange: number
  schlangeVerschwunden: number
}

/** Die Schlange mit dieser Id und ihr Besitzer, oder `null`. */
function schlangeMit(zustand: Spielzustand, schlangenId: string) {
  for (const [besitzer, spieler] of zustand.spieler.entries()) {
    const schlange = spieler.schlangen.find((eintrag) => eintrag.id === schlangenId)
    if (schlange !== undefined) return { besitzer, schlange }
  }
  return null
}

/**
 * Rechnet jeden entschiedenen Farbendieb nach (A7.1, A7.2, D2, D17): Abgewehrt
 * bleibt alles liegen; sonst liegt die gestohlene Farbkarte in einer Schlange des
 * Diebs an der angesagten Stelle und nicht mehr beim Gegner. Der Farbendieb
 * liegt auf dem Ablagestapel des Diebs.
 */
function diebPruefer(zaehler: Diebe): SchrittPruefer {
  let laufend: { ansage: FarbendiebSpielenAktion; vorher: Spielzustand } | null = null
  return (vorher, _aktion, { zustand, ereignisse }) => {
    for (const ereignis of ereignisse) {
      if (ereignis.typ === 'KarteAngesagt' && ereignis.ansage.typ === 'FarbendiebSpielen') laufend = { ansage: ereignis.ansage, vorher }
      if (ereignis.typ !== 'AnsageEntschieden' || laufend === null || ereignis.karteId !== laufend.ansage.karteId) continue
      const { ansage } = laufend
      const quelleVorher = schlangeMit(laufend.vorher, ansage.quelle.schlangenId)
      laufend = null
      const dieb = ereignis.spielerIndex
      if (!zustand.spieler[dieb].ablagestapel.some((karte) => karte.id === ansage.karteId)) return 'A7.1: Der Farbendieb liegt nicht auf dem Ablagestapel des Diebs.'
      const gestohlen = quelleVorher?.schlange.karten.find((karte) => karte.id === ansage.quelle.karteId)
      if (quelleVorher === null || gestohlen?.typ !== 'Farbkarte' || quelleVorher.besitzer === dieb) return `D2/A7.1: angesagt war ${JSON.stringify(ansage.quelle)}.`
      const quelleNachher = schlangeMit(zustand, ansage.quelle.schlangenId)
      const nochDa = quelleNachher?.schlange.karten.some((karte) => karte.id === gestohlen.id) ?? false
      if (ereignis.ohneWirkung) {
        zaehler.abgewehrt += 1
        if (!nochDa) return 'A7.2: Abgewehrt, aber die Karte ist trotzdem weg.'
        continue
      }
      zaehler.gestohlen += 1
      if (nochDa) return 'A7.1: Die gestohlene Karte liegt noch beim Gegner.'
      if (quelleNachher === null) zaehler.schlangeVerschwunden += 1
      const ziel = ansage.ziel.art === 'neueSchlange' ? zustand.spieler[dieb].schlangen.at(-1) : schlangeMit(zustand, ansage.ziel.schlangenId)?.schlange
      const stelle = ansage.ziel.art === 'neueSchlange' ? 0 : ansage.ziel.position
      if (ansage.ziel.art === 'neueSchlange') zaehler.neueSchlange += 1
      if (ziel?.karten[stelle]?.id !== gestohlen.id || !zustand.spieler[dieb].schlangen.includes(ziel)) return `D17: Die Karte liegt nicht an der angesagten Stelle ${JSON.stringify(ansage.ziel)}.`
    }
    return null
  }
}

describe('A7.1, D17: Dauerlauf mit dem Farbendieb (Plan 3.6, Punkt 7)', () => {
  it('A7.1/D2/D17: 120 Zufallspartien mit 2, 3 und 4 Spielern enden; jeder Farbendieb wirkt wie angesagt', () => {
    const zaehler: Diebe = { gestohlen: 0, abgewehrt: 0, neueSchlange: 0, schlangeVerschwunden: 0 }
    const partien = [...dauerlaufPartien(60, false, 701), ...dauerlaufPartien(60, true, 801)]
    const ergebnisse = dauerlauf(partien, { neuerPruefer: () => diebPruefer(zaehler) })
    const nichtBeendet = ergebnisse.filter((ergebnis) => ergebnis.ausgang !== 'beendet')
    expect(nichtBeendet.map((ergebnis) => `${ergebnis.ausgang}: ${ergebnis.detail}`)).toEqual([])
    expect(zaehler.gestohlen, 'gestohlene Karten im Dauerlauf').toBeGreaterThan(50)
    expect(zaehler.abgewehrt, 'abgewehrte Farbendiebe im Dauerlauf').toBeGreaterThan(0)
    expect(zaehler.neueSchlange, 'D17: neue Schlangen aus gestohlenen Karten').toBeGreaterThan(0)
    expect(zaehler.schlangeVerschwunden, 'letzte Karten einer Schlange gestohlen').toBeGreaterThan(0)
  }, 120_000)
})

describe('A6, B2: der Farbendieb verrät keine Handkarte', () => {
  it('B2/D33: Angreifer und Unbeteiligte sehen dieselben Ereignisse, ob das Ziel Farbenschutz hält und durchlässt oder keinen hält', () => {
    const mit = tisch([DIEB, MIT_SCHUTZ]).schlange(0, ['Rot']).schlange(1, ['Blau']).zustand()
    const ohne = tisch([DIEB, ['Violett', 'Blau', 'Rot', 'Gelb', 'Grün']]).schlange(0, ['Rot']).schlange(1, ['Blau']).zustand()
    const spiele = (start: Spielzustand): Ereignis[] =>
      folge(start, (jetzt) => stiehl(jetzt, karteIn(jetzt, 1, 0, 0), anDasEnde(jetzt)), durchlassen, farbkarte, zugBeenden).ereignisse
    const [mitEreignissen, ohneEreignisse] = [spiele(mit), spiele(ohne)]
    expect(ereignisseVom(mitEreignissen, 'AbwehrGefragt')).toEqual(ereignisseVom(ohneEreignisse, 'AbwehrGefragt'))
    expect(ereignisseVom(mitEreignissen, 'AnsageEntschieden')).toEqual(ereignisseVom(ohneEreignisse, 'AnsageEntschieden'))
    expect(mitEreignissen.map((ereignis) => ereignis.typ)).toEqual(ohneEreignisse.map((ereignis) => ereignis.typ))
  })
})
