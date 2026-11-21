import { isDeepStrictEqual } from 'node:util'
import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, ermittleEntscheider, serialisiere } from '../../index'
import type { Ereignis, SchlangenhaeutungSpielenAktion, Spielkarte, Spielzustand } from '../../index'
import { findeSchlange, gepruefteSchlange } from '../../schlangen'
import { dauerlauf, dauerlaufPartien } from '../../testing/dauerlauf'
import type { SchrittPruefer } from '../../testing/dauerlauf'
import { spielerIndexVon } from '../../zugablauf'
import { lageVon, spieleNach, verrateneHandkarten } from '../nachrechnen'
import { ablage, durchlassen, ereignisseVom, folge, fuehreAus, grund, hand, MIT_SCHUTZ, reaktion, tischMitHaenden, verletzteInvarianten } from '../zugablauf_hilfen'
import { art, arten, HAEUTUNG, haeutungAuf, haeutungen, haeutungId, ids, tisch } from '../schlangenhaeutung_hilfen'

/*
E9, die Schlangenhäutung in jeder Schlange am Tisch (D9) und mit dem
Reaktionsablauf aus E4: In der Schlange eines Mitspielers trifft sie ihn, und er
darf mit Farbenschutz abwehren (A6, A7.2, D10, D33). Was sie umordnet, meldet die
Engine als `KartenVersetzt` (E4b); der gemeinsame Nachrechentest rechnet jede
Umordnung nach, auch mit Fusionen in der Schlange. Dazu ein Dauerlauf.
*/

/** Drei Spieler: A häutet, B hält Farbenschutz, C nicht; jeder hat eine Schlange. */
function dreiSpieler(): Spielzustand {
  return tischMitHaenden([HAEUTUNG, MIT_SCHUTZ, ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun']], true)
    .schlange(0, ['Grün', 'Braun', 'Violett'])
    .schlange(1, ['Blau', 'Rot', 'Gelb', 'Rot'])
    .schlange(2, ['Gelb', 'Blau', 'Gelb'])
    .zustand()
}

/** Prüft einen Schritt: nachrechenbar aus den Ereignissen allein (E4b), keine Handkarte verraten (B2), alle Invarianten erfüllt. */
function erwarteNachrechenbar(vorher: Spielzustand, nachher: Spielzustand, ereignisse: Ereignis[]): void {
  expect(spieleNach(lageVon(vorher), ereignisse), 'E4b: die Häutung lässt sich aus den Ereignissen nicht nachrechnen').toEqual(lageVon(nachher))
  expect(verrateneHandkarten(nachher, ereignisse), 'B2: ein Ereignis nennt eine Handkarte').toEqual([])
  expect(verletzteInvarianten(nachher)).toEqual([])
}

describe('D9: die Schlangenhäutung geht in jede Schlange am Tisch', () => {
  it('D9: aufgezählt sind die Abschnitte in der eigenen und in allen gegnerischen Schlangen', () => {
    const zustand = dreiSpieler()
    expect([...new Set(haeutungen(zustand).map((aktion) => aktion.schlangenId))]).toEqual(['schlange-1', 'schlange-2', 'schlange-3'])
  })

  it('A6/D10: in der eigenen Schlange wirkt sie sofort; niemand wird gefragt, auch wenn Mitspieler Farbenschutz halten', () => {
    const start = dreiSpieler()
    const karte = haeutungId(start)
    const [gruen, braun, violett] = ids(start, 0)
    const { zustand, ereignisse } = fuehreAus(start, haeutungAuf(start, 0, 0, ['Violett', 'Braun', 'Grün']))
    expect(zustand.schwebend).toBeNull()
    const stelle = (position: number) => ({ ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position }) as const
    expect(ereignisse, 'E4b: genannt sind nur die Karten, die ihre Reihenfolge ändern; die Häutung liegt danach auf dem Ablagestapel').toEqual([
      {
        typ: 'KartenVersetzt',
        spielerIndex: 0,
        karteId: karte,
        karten: [
          { karteId: violett, von: stelle(2), nach: stelle(0) },
          { karteId: gruen, von: stelle(0), nach: stelle(2) },
        ],
        aufgeloest: [],
      },
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: karte, aktion: 'SchlangenhaeutungSpielen', nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
    expect(ids(zustand, 0)).toEqual([violett, braun, gruen])
    erwarteNachrechenbar(start, zustand, ereignisse)
  })
})

describe('D10, A6, A7.2: in der Schlange eines Mitspielers ist die Häutung abwehrbar (Kriterium 4)', () => {
  it('A6/D33: angesagt mit Ziel; betroffen ist nur der Besitzer der Schlange, gefragt auch ohne Farbenschutz', () => {
    const start = dreiSpieler()
    const karte = haeutungId(start)
    const ansage = haeutungAuf(start, 2, 0, ['Gelb', 'Gelb', 'Blau'])
    const { zustand, ereignisse } = fuehreAus(start, ansage)
    expect(ereignisse).toEqual([
      { typ: 'KarteAngesagt', spielerIndex: 0, karteId: karte, ansage, betroffene: [2] },
      { typ: 'AbwehrGefragt', spielerIndex: 2, karteId: karte },
    ])
    expect(ermittleEntscheider(zustand)).toBe(2)
    expect(ermittleAktionen(zustand), 'D33: ohne Farbenschutz nur durchlassen').toEqual([{ typ: 'Reagieren', spielerId: 'spieler-3', farbenschutzId: null }])
    expect(zustand.spieler.map((spieler) => spieler.schlangen), 'A6: bis zur Entscheidung bleibt alles liegen').toEqual(start.spieler.map((spieler) => spieler.schlangen))
  })

  it('A7.2: B wehrt ab; seine Schlange bleibt, wie sie war, die Häutung liegt beim Angreifer, der Farbenschutz bei B, der nicht nachzieht', () => {
    const start = dreiSpieler()
    const karte = haeutungId(start)
    const schutz = start.spieler[1].hand[0].id
    const angesagt = fuehreAus(start, haeutungAuf(start, 1, 0, ['Rot', 'Rot', 'Gelb', 'Blau']))
    const { zustand, ereignisse } = fuehreAus(angesagt.zustand, reaktion(angesagt.zustand, true))
    expect(zustand.spieler[1].schlangen).toEqual(start.spieler[1].schlangen)
    expect(ablage(zustand, 0)).toEqual([karte])
    expect(ablage(zustand, 1)).toEqual([schutz])
    expect(hand(zustand, 1), 'A6: wer abwehrt, zieht nicht gleich nach').toHaveLength(4)
    expect(ereignisse).toEqual([
      { typ: 'Abgewehrt', spielerIndex: 1, karteId: schutz, gegen: karte },
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: karte, abgewehrt: [1], ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
    expect(ereignisseVom(ereignisse, 'KartenVersetzt'), 'abgewehrt bewegt sich nichts').toEqual([])
    erwarteNachrechenbar(angesagt.zustand, zustand, ereignisse)
  })

  it('A6: lässt B durch, ist sein Abschnitt neu geordnet; die Häutung liegt beim Angreifer, B behält seinen Farbenschutz', () => {
    const start = dreiSpieler()
    const karte = haeutungId(start)
    const angesagt = fuehreAus(start, haeutungAuf(start, 1, 0, ['Rot', 'Rot', 'Gelb', 'Blau']))
    const { zustand, ereignisse } = fuehreAus(angesagt.zustand, reaktion(angesagt.zustand, false))
    expect(arten(zustand, 1)).toEqual(['Rot', 'Rot', 'Gelb', 'Blau'])
    expect(ablage(zustand, 0)).toEqual([karte])
    expect(hand(zustand, 1)).toEqual(hand(start, 1))
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenVersetzt', 'AnsageEntschieden'])
    expect(ereignisse[1]).toMatchObject({ abgewehrt: [], ohneWirkung: false, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } })
    erwarteNachrechenbar(angesagt.zustand, zustand, ereignisse)
  })

  it('A6/B2: das Ziel steht mit der Ansage fest; solange die Häutung schwebt, gibt es keine andere Häutung', () => {
    const start = dreiSpieler()
    const ansage = haeutungAuf(start, 1, 0, ['Rot', 'Rot', 'Gelb', 'Blau'])
    const andere = haeutungAuf(start, 2, 0, ['Gelb', 'Gelb', 'Blau'])
    const { zustand } = fuehreAus(start, ansage)
    expect(zustand.schwebend).toMatchObject({ aktion: ansage, ausstehend: [1], abgewehrt: [] })
    expect(grund(zustand, andere)).toMatch(/schwebt noch.*\(A6\)/)
  })

  it('A6/E4 Kriterium 8: Speichern und Laden mitten in der Frage setzt genau dort fort; danach wirkt die Häutung', () => {
    const start = dreiSpieler()
    const angesagt = fuehreAus(start, haeutungAuf(start, 2, 0, ['Gelb', 'Gelb', 'Blau'])).zustand
    const geladen = deserialisiere(serialisiere(angesagt))
    expect(geladen).toEqual(angesagt)
    expect(arten(fuehreAus(geladen, durchlassen(geladen)).zustand, 2)).toEqual(['Gelb', 'Gelb', 'Blau'])
  })

  it('B2/D33: Angreifer und Unbeteiligte sehen dieselben Ereignisse, ob das Ziel Farbenschutz hält und durchlässt oder keinen hält', () => {
    const mit = tisch(2, MIT_SCHUTZ).schlange(1, ['Blau', 'Rot', 'Gelb']).zustand()
    const ohne = tisch(2, ['Violett', 'Blau', 'Rot', 'Gelb', 'Grün']).schlange(1, ['Blau', 'Rot', 'Gelb']).zustand()
    const spiele = (start: Spielzustand): Ereignis[] => folge(start, (jetzt) => haeutungAuf(jetzt, 1, 0, ['Gelb', 'Rot', 'Blau']), durchlassen).ereignisse
    expect(spiele(mit)).toEqual(spiele(ohne))
  })
})

describe('E4b: jede Umordnung lässt sich nachrechnen, auch mit Fusionen in der Schlange', () => {
  it('E4b/A7.7: Fusionen vor, zwischen und hinter den Abschnitten bleiben liegen; jede aufgezählte Häutung ist nachrechenbar', () => {
    const start = tisch(2, MIT_SCHUTZ)
      .schlange(0, [{ fusion: ['Rot', 'Rot'] }, 'Blau', 'Gelb', 'Grün', { fusion: ['Blau', 'Blau'] }, 'Violett', 'Braun', 'Rot', 'Gelb'])
      .schlange(1, ['Grün', { fusion: ['Gelb', 'Gelb'] }, 'Braun', 'Blau', 'Violett', 'Schlangenblockade'])
      .zustand()
    const angebote = haeutungen(start)
    expect(new Set(angebote.map((aktion) => aktion.schlangenId)), 'beide Schlangen haben Abschnitte').toEqual(new Set(['schlange-1', 'schlange-2']))
    for (const aktion of angebote) {
      let { zustand, ereignisse } = fuehreAus(start, aktion)
      let vorher = start
      if (zustand.schwebend !== null) {
        vorher = zustand
        ;({ zustand, ereignisse } = fuehreAus(zustand, durchlassen(zustand)))
      }
      erwarteNachrechenbar(vorher, zustand, ereignisse)
      const fusionen = (jetzt: Spielzustand) => jetzt.spieler.map((spieler) => spieler.schlangen.map((schlange) => schlange.fusionen))
      expect(fusionen(zustand), 'A7.7: unter den Fusionen ändert sich nichts').toEqual(fusionen(start))
    }
  })
})

/** Was der Dauerlauf an Schlangenhäutungen sah. */
interface Haeutungen {
  gewirkt: number
  abgewehrt: number
  beimGegner: number
  mitFusion: number
}

const idsVon = (karten: readonly Spielkarte[]) => karten.map((karte) => karte.id)

/**
 * Rechnet jede entschiedene Schlangenhäutung nach (A7.9, D26, A7.2, E4b): Aus den
 * Ereignissen allein entsteht die neue Lage. Abgewehrt bleibt die Schlange
 * gleich; sonst liegen genau die angesagten Karten in der angesagten Folge an den
 * Stellen, die sie vorher belegten, die Farbfolge ist eine andere, und alles
 * übrige liegt wie vorher. Die Häutung liegt auf dem Ablagestapel des Spielers.
 */
function haeutungsPruefer(zaehler: Haeutungen): SchrittPruefer {
  let laufend: { ansage: SchlangenhaeutungSpielenAktion; vorher: Spielzustand } | null = null
  return (vorher, aktion, { zustand, ereignisse }) => {
    let entschieden: { ansage: SchlangenhaeutungSpielenAktion; vorher: Spielzustand; ohneWirkung: boolean } | null = null
    for (const ereignis of ereignisse) {
      if (ereignis.typ === 'KarteAngesagt' && ereignis.ansage.typ === 'SchlangenhaeutungSpielen') laufend = { ansage: ereignis.ansage, vorher }
      if (ereignis.typ === 'KarteGespielt' && aktion.typ === 'SchlangenhaeutungSpielen') entschieden = { ansage: aktion, vorher, ohneWirkung: false }
      if (ereignis.typ === 'AnsageEntschieden' && laufend !== null && ereignis.karteId === laufend.ansage.karteId) {
        entschieden = { ...laufend, ohneWirkung: ereignis.ohneWirkung }
        laufend = null
      }
    }
    if (entschieden === null) return null
    const nachgerechnet = spieleNach(lageVon(vorher), ereignisse)
    if (!isDeepStrictEqual(nachgerechnet, lageVon(zustand))) return 'E4b: Die Häutung lässt sich aus den Ereignissen nicht nachrechnen.'
    const { ansage, ohneWirkung } = entschieden
    const spieler = spielerIndexVon(zustand, ansage.spielerId)
    if (zustand.spieler[spieler].ablagestapel.at(-1)?.id !== ansage.karteId) return 'A6: Die Häutung liegt nicht oben auf dem Ablagestapel des Spielers.'
    const { besitzer, schlange: { karten: alt } } = gepruefteSchlange(entschieden.vorher, ansage.schlangenId)
    const neu = findeSchlange(zustand, ansage.schlangenId)?.schlange.karten
    if (neu === undefined) return 'A7.9: Die Schlange ist verschwunden.'
    if (besitzer !== spieler) zaehler.beimGegner += 1
    if (ohneWirkung) {
      zaehler.abgewehrt += 1
      return isDeepStrictEqual(idsVon(neu), idsVon(alt)) ? null : 'A7.2: Abgewehrt, aber die Schlange ist verändert.'
    }
    zaehler.gewirkt += 1
    if (alt.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenfusion')) zaehler.mitFusion += 1
    const abschnitt = new Set(ansage.neueReihenfolge)
    const stellen = alt.flatMap((karte, stelle) => (abschnitt.has(karte.id) ? [stelle] : []))
    const erwartet = idsVon(alt)
    stellen.forEach((stelle, index) => {
      erwartet[stelle] = ansage.neueReihenfolge[index]
    })
    if (!isDeepStrictEqual(idsVon(neu), erwartet)) return 'A7.9: Die Schlange liegt nicht wie angesagt.'
    if (stellen.length < 3 || stellen.length > 5 || stellen.at(-1)! - stellen[0] !== stellen.length - 1) return 'A7.9: Der Abschnitt ist nicht 3 bis 5 aufeinanderfolgende Karten.'
    if (stellen.some((stelle) => alt[stelle].typ !== 'Farbkarte')) return 'A7.9: Eine Sonderkarte wurde neu geordnet.'
    const farben = (karten: Spielkarte[]) => stellen.map((stelle) => art(karten[stelle])).join()
    return farben(alt) === farben(neu) ? 'D26: Die Farbfolge im Abschnitt ist gleich geblieben.' : null
  }
}

describe('A7.9, D26: Dauerlauf mit der Schlangenhäutung (Plan 3.6, Punkt 7)', () => {
  it('A7.9/D9/D10: 40 Zufallspartien mit Erweiterung und 2, 3 und 4 Spielern enden; jede Häutung wirkt wie angesagt und ist nachrechenbar', () => {
    const zaehler: Haeutungen = { gewirkt: 0, abgewehrt: 0, beimGegner: 0, mitFusion: 0 }
    const ergebnisse = dauerlauf(dauerlaufPartien(40, true, 901), { neuerPruefer: () => haeutungsPruefer(zaehler) })
    const nichtBeendet = ergebnisse.filter((ergebnis) => ergebnis.ausgang !== 'beendet')
    expect(nichtBeendet.map((ergebnis) => `${ergebnis.ausgang}: ${ergebnis.detail}`)).toEqual([])
    expect(zaehler.gewirkt, 'gewirkte Häutungen im Dauerlauf').toBeGreaterThan(20)
    expect(zaehler.beimGegner, 'D9: Häutungen in gegnerischen Schlangen').toBeGreaterThan(0)
    expect(zaehler.abgewehrt, 'A7.2: abgewehrte Häutungen').toBeGreaterThan(0)
    expect(zaehler.mitFusion, 'Häutungen in Schlangen mit Farbenfusion').toBeGreaterThan(0)
  }, 180_000)
})
