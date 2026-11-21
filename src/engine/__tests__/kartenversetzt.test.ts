import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Ereignis, FarbkarteInfo, KartenAktion, Schlange, Sonderkartenname, Spielkarte, Spielzustand } from '../index'
import { KARTENREGISTER } from '../karten/register'
import { schlangenIdFuer } from '../schlangen'
import { baukasten } from '../testing/szenario'
import type { Baukasten } from '../testing/szenario'
import { entnehmeHandkarte, legeAufEigenenAblagestapel } from '../zugablauf'
import { lageVon, spieleNach, verrateneHandkarten } from './nachrechnen'
import { ablage, aktionen, durchlassen, ereignisseVom, fuehreAus, hand, verletzteInvarianten } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
E4b, B2, Plan E2 Kriterium 11: Was die Wirkung einer Karte ausser der
gespielten Karte selbst bewegt, meldet die Engine als `KartenVersetzt`. Sie
vergleicht dafür die Orte aller Karten vor und nach der Wirkung, für jede Karte
gleich, ob angesagt (A6) oder sofort. Die Oberfläche bekommt das fertige
Ereignis und vergleicht keine Zustände.

Die Wirkungen hier sind Test-Karten: Ein Spion auf dem Kartenregister gibt
einer Sonderkarte Ziel, Betroffene und Wirkung (wie in E4). Sie decken ab, was
Farbendieb (A7.1), Schlangenfrass (A7.4), Farbenfusion (A7.7) und
Schlangenhäutung (A7.9) bewegen. `spieleNach` rechnet jeden Schritt ohne Wissen
über die Karte nach.
*/

afterEach(() => {
  vi.restoreAllMocks()
})

type Ansage = (zustand: Spielzustand, karteId: string, spielerId: string) => KartenAktion

/** Gibt der Sonderkarte `name` über einen Spion auf dem Register ein Ziel, Betroffene und eine Wirkung. */
function testkarte(name: Sonderkartenname, ansage: Ansage, betroffene: number[], wirkung: (zustand: Spielzustand, aktion: KartenAktion) => void): void {
  const definition = KARTENREGISTER[name]
  vi.spyOn(definition, 'ziele').mockImplementation((zustand, index, karte) => [ansage(zustand, karte.id, zustand.spieler[index].id)])
  vi.spyOn(definition, 'pruefe').mockReturnValue(null)
  vi.spyOn(definition, 'betroffene').mockReturnValue(betroffene)
  vi.spyOn(definition, 'wirke').mockImplementation((zustand, aktion) => {
    wirkung(zustand, aktion)
    return zustand
  })
}

/**
 * Spielt die erste Handkarte von Spieler 1, lässt jeden Betroffenen durch und
 * prüft jeden Schritt: nachrechenbar, keine Handkarte verraten (B2), alle
 * Invarianten erfüllt.
 */
function spiele(start: Spielzustand): Schritt {
  const gespielt = start.spieler[0].hand[0].id
  let jetzt = start
  const ereignisse: Ereignis[] = []
  let aktion = aktionen(jetzt).find((angebot) => angebot.typ !== 'SonderkarteWirkungslosAblegen' && 'karteId' in angebot && angebot.karteId === gespielt)!
  for (;;) {
    const schritt = fuehreAus(jetzt, aktion)
    expect(spieleNach(lageVon(jetzt), schritt.ereignisse), `E4b: ${aktion.typ} lässt sich nicht nachrechnen`).toEqual(lageVon(schritt.zustand))
    expect(verrateneHandkarten(schritt.zustand, schritt.ereignisse), 'B2: ein Ereignis nennt eine Handkarte').toEqual([])
    expect(verletzteInvarianten(schritt.zustand)).toEqual([])
    ereignisse.push(...schritt.ereignisse)
    jetzt = schritt.zustand
    if (jetzt.schwebend === null) return { zustand: jetzt, ereignisse }
    aktion = durchlassen(jetzt)
  }
}

function tisch(karte: Sonderkartenname): Baukasten {
  return baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, [karte, 'Blau']).hand(1, ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot'])
}

function schlangeMit(zustand: Spielzustand, schlangenId: string): Schlange {
  return zustand.spieler.flatMap((spieler) => spieler.schlangen).find((schlange) => schlange.id === schlangenId)!
}

function nimmAusSchlange(zustand: Spielzustand, schlangenId: string, karteId: string): Spielkarte {
  const karten = schlangeMit(zustand, schlangenId).karten
  return karten.splice(karten.findIndex((karte) => karte.id === karteId), 1)[0]
}

function neueSchlange(zustand: Spielzustand, spielerIndex: number, karten: Spielkarte[]): string {
  zustand.schlangenZaehler += 1
  const id = schlangenIdFuer(zustand.schlangenZaehler)
  zustand.spieler[spielerIndex].schlangen.push({ id, karten, fusionen: [] })
  return id
}

const idsIn = (zustand: Spielzustand, schlangenId: string) => schlangeMit(zustand, schlangenId).karten.map((karte) => karte.id)
const versetzt = (ereignisse: Ereignis[]) => ereignisseVom(ereignisse, 'KartenVersetzt')

describe('E4b/A7.1/A7.4: eine Test-Karte versetzt, entfernt und fügt ein', () => {
  /** Spieler 1: schlange-1 [Rot, Gelb]; Spieler 2: schlange-2 [Blau, Rot, Gelb]. Oben auf dem Stapel liegt Grün. */
  function aufbau() {
    const start = tisch('Farbendieb').schlange(0, ['Rot', 'Gelb']).schlange(1, ['Blau', 'Rot', 'Gelb']).stapelOben(['Grün']).zustand()
    const [rotEigen, gelbEigen] = idsIn(start, 'schlange-1')
    const rotFremd = idsIn(start, 'schlange-2')[1]
    const gruen = start.nachziehstapel[0].id
    testkarte('Farbendieb', (_z, karteId, spielerId) => ({ typ: 'FarbendiebSpielen', spielerId, karteId, quelle: { schlangenId: 'schlange-2', karteId: rotFremd }, ziel: { art: 'neueSchlange' } }), [1], (zustand, aktion) => {
      legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
      neueSchlange(zustand, 0, [nimmAusSchlange(zustand, 'schlange-2', rotFremd)])
      zustand.spieler[0].ablagestapel.push(nimmAusSchlange(zustand, 'schlange-1', rotEigen))
      schlangeMit(zustand, 'schlange-1').karten.splice(1, 0, zustand.nachziehstapel.shift()!)
    })
    return { start, rotEigen, gelbEigen, rotFremd, gruen }
  }

  it('E4b/A6: nach der Ansage meldet KartenVersetzt jede bewegte Karte mit altem und neuem Ort, vor AnsageEntschieden', () => {
    const { start, rotEigen, gelbEigen, rotFremd, gruen } = aufbau()
    const gespielt = start.spieler[0].hand[0].id
    const { zustand, ereignisse } = spiele(start)
    expect(idsIn(zustand, 'schlange-1')).toEqual([gelbEigen, gruen])
    expect(ereignisse.slice(-2)).toEqual([
      {
        typ: 'KartenVersetzt',
        spielerIndex: 0,
        karteId: gespielt,
        karten: [
          { karteId: gruen, von: { ort: 'Nachziehstapel' }, nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 1 } },
          { karteId: rotFremd, von: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-2', position: 1 }, nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-3', position: 0 } },
          { karteId: rotEigen, von: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 0 }, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
        ],
        aufgeloest: [],
      },
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: gespielt, abgewehrt: [], ohneWirkung: false, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
  })

  it('E4b/A7.1: die neue Schlange steht mit ihrer Id und ihrem Besitzer im Ereignis', () => {
    const { start, rotFremd } = aufbau()
    const { zustand, ereignisse } = spiele(start)
    const neu = zustand.spieler[0].schlangen.at(-1)!
    expect(neu.id).toBe('schlange-3')
    expect(versetzt(ereignisse)[0].karten.find((eintrag) => eintrag.karteId === rotFremd)?.nach).toEqual({ ort: 'Schlange', spielerIndex: 0, schlangenId: neu.id, position: 0 })
  })

  it('E4b Gegenprobe: ohne KartenVersetzt lässt sich die Wirkung nicht nachrechnen', () => {
    const { start } = aufbau()
    const angesagt = fuehreAus(start, aktionen(start, 'FarbendiebSpielen')[0]).zustand
    const { zustand, ereignisse } = fuehreAus(angesagt, durchlassen(angesagt))
    const ohne = ereignisse.filter((ereignis) => ereignis.typ !== 'KartenVersetzt')
    expect(ohne.length).toBe(ereignisse.length - 1)
    expect(spieleNach(lageVon(angesagt), ohne)).not.toEqual(lageVon(zustand))
  })
})

describe('E4b/A7.4: Schlangenfrass als Test-Karte', () => {
  it('A7.4: die Karten kommen in fester Reihenfolge auf den Ablagestapel des Angreifers, auch über und unter der gespielten Karte', () => {
    const start = tisch('Schlangenfrass').schlange(1, ['Blau', 'Rot', 'Gelb']).zustand()
    const [blau, , gelb] = idsIn(start, 'schlange-1')
    const gespielt = start.spieler[0].hand[0].id
    const ziele = [blau, gelb].map((karteId) => ({ schlangenId: 'schlange-1', karteId }))
    testkarte('Schlangenfrass', (_z, karteId, spielerId) => ({ typ: 'SchlangenfrassSpielen', spielerId, karteId, option: 'gegnerischeKarten', ziele }), [1], (zustand, aktion) => {
      zustand.spieler[0].ablagestapel.push(nimmAusSchlange(zustand, 'schlange-1', gelb))
      legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
      zustand.spieler[0].ablagestapel.push(nimmAusSchlange(zustand, 'schlange-1', blau))
    })
    const { zustand, ereignisse } = spiele(start)
    expect(ablage(zustand, 0)).toEqual([gelb, gespielt, blau])
    expect(versetzt(ereignisse)[0].karten.map((eintrag) => [eintrag.karteId, eintrag.nach])).toEqual([
      [gelb, { ort: 'Ablagestapel', spielerIndex: 0, position: 0 }],
      [blau, { ort: 'Ablagestapel', spielerIndex: 0, position: 1 }],
    ])
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')[0].nach).toEqual({ ort: 'Ablagestapel', spielerIndex: 0, position: 1 })
  })

  it('A7.4/A7.7: eine gefressene Fusion wird durch ihre Karten ersetzt, die linke zuerst', () => {
    const start = tisch('Schlangenfrass').schlange(1, ['Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot']).zustand()
    const fusion = idsIn(start, 'schlange-1')[1]
    const [links, rechts] = schlangeMit(start, 'schlange-1').fusionen[0].unter.map((karte) => karte.id)
    testkarte('Schlangenfrass', (_z, karteId, spielerId) => ({ typ: 'SchlangenfrassSpielen', spielerId, karteId, option: 'gegnerischeKarten', ziele: [{ schlangenId: 'schlange-1', karteId: fusion }] }), [1], (zustand, aktion) => {
      legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
      const schlange = schlangeMit(zustand, 'schlange-1')
      const stelle = schlange.karten.findIndex((karte) => karte.id === fusion)
      const [eintrag] = schlange.fusionen.splice(0, 1)
      zustand.spieler[0].ablagestapel.push(...schlange.karten.splice(stelle, 1, ...eintrag.unter))
    })
    const { zustand, ereignisse } = spiele(start)
    expect(idsIn(zustand, 'schlange-1')).toEqual([idsIn(start, 'schlange-1')[0], links, rechts, idsIn(start, 'schlange-1')[2]])
    expect(versetzt(ereignisse)[0].karten).toEqual([
      { karteId: fusion, von: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 1 }, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
      { karteId: links, von: { ort: 'UnterFusion', spielerIndex: 1, schlangenId: 'schlange-1', fusionId: fusion, position: 0 }, nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 1 } },
      { karteId: rechts, von: { ort: 'UnterFusion', spielerIndex: 1, schlangenId: 'schlange-1', fusionId: fusion, position: 1 }, nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 2 } },
    ])
  })

  it('A7.4: eine leer gefressene Schlange verschwindet, und das Ereignis nennt sie', () => {
    const start = tisch('Schlangenfrass').schlange(1, ['Rot']).schlange(1, ['Blau', 'Gelb']).zustand()
    const [rot] = idsIn(start, 'schlange-1')
    const [blau] = idsIn(start, 'schlange-2')
    const ziele = [{ schlangenId: 'schlange-1', karteId: rot }, { schlangenId: 'schlange-2', karteId: blau }]
    testkarte('Schlangenfrass', (_z, karteId, spielerId) => ({ typ: 'SchlangenfrassSpielen', spielerId, karteId, option: 'gegnerischeKarten', ziele }), [1], (zustand, aktion) => {
      legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
      zustand.spieler[0].ablagestapel.push(nimmAusSchlange(zustand, 'schlange-1', rot), nimmAusSchlange(zustand, 'schlange-2', blau))
      zustand.spieler[1].schlangen = zustand.spieler[1].schlangen.filter((schlange) => schlange.karten.length > 0)
    })
    const { zustand, ereignisse } = spiele(start)
    expect(zustand.spieler[1].schlangen.map((schlange) => schlange.id)).toEqual(['schlange-2'])
    expect(versetzt(ereignisse)[0].aufgeloest).toEqual(['schlange-1'])
  })
})

describe('E4b/A7.7/A7.9: Wirkungen ohne Ansage melden ebenso, vor KarteGespielt', () => {
  it('A7.7: eine Fusion in der eigenen Schlange legt zwei Karten unter sich; die Positionen zählen ohne die gespielte Karte', () => {
    const start = tisch('Farbenfusion').schlange(0, ['Blau', 'Gelb', 'Gelb', 'Rot']).zustand()
    const [, gelb1, gelb2] = idsIn(start, 'schlange-1')
    const gespielt = start.spieler[0].hand[0].id
    testkarte('Farbenfusion', (_z, karteId, spielerId) => ({ typ: 'FusionLegen', spielerId, karteId, schlangenId: 'schlange-1', kartenIds: [gelb1, gelb2] }), [], (zustand, aktion) => {
      const fusion = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId)
      const schlange = schlangeMit(zustand, 'schlange-1')
      const [links, rechts] = schlange.karten.splice(1, 2, fusion) as FarbkarteInfo[]
      schlange.fusionen.push({ karteId: fusion.id, unter: [links, rechts] })
    })
    const { ereignisse } = spiele(start)
    const fusionsort = (position: number) => ({ ort: 'UnterFusion', spielerIndex: 0, schlangenId: 'schlange-1', fusionId: gespielt, position })
    expect(ereignisse).toEqual([
      {
        typ: 'KartenVersetzt',
        spielerIndex: 0,
        karteId: gespielt,
        karten: [
          { karteId: gelb1, von: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 1 }, nach: fusionsort(0) },
          { karteId: gelb2, von: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 2 }, nach: fusionsort(1) },
        ],
        aufgeloest: [],
      },
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: gespielt, aktion: 'FusionLegen', nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 1 } },
    ])
  })

  it('A7.9: beim Umordnen sind nur die Karten genannt, die ihre Reihenfolge zu den übrigen ändern', () => {
    const start = tisch('Schlangenhäutung').schlange(0, ['Blau', 'Rot', 'Gelb', 'Grün']).zustand()
    const [blau, rot, gelb, gruen] = idsIn(start, 'schlange-1')
    testkarte('Schlangenhäutung', (_z, karteId, spielerId) => ({ typ: 'SchlangenhaeutungSpielen', spielerId, karteId, schlangenId: 'schlange-1', neueReihenfolge: [gelb, rot, blau] }), [], (zustand, aktion) => {
      legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
      const schlange = schlangeMit(zustand, 'schlange-1')
      schlange.karten = [gelb, rot, blau, gruen].map((id) => schlange.karten.find((karte) => karte.id === id)!)
    })
    const { zustand, ereignisse } = spiele(start)
    expect(idsIn(zustand, 'schlange-1')).toEqual([gelb, rot, blau, gruen])
    expect(versetzt(ereignisse)[0].karten.map((eintrag) => [eintrag.karteId, eintrag.nach])).toEqual([
      [gelb, { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 0 }],
      [blau, { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 2 }],
    ])
  })

  it('A7.8: eine Wirkung, die ausser der gespielten Karte nichts bewegt, meldet kein KartenVersetzt', () => {
    const start = tisch('Verdoppler').zustand()
    expect(spiele(start).ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteGespielt'])
  })
})

describe('E4b/B2: Karten, die auf eine Hand gehen, bleiben verdeckt', () => {
  it('B2: eine Karte aus der Schlange und eine vom Stapel gehen auf Hände; das Ereignis nennt Ort, aber keine Id', () => {
    const start = tisch('Farbendieb').schlange(0, ['Rot', 'Gelb']).zustand()
    const [rot] = idsIn(start, 'schlange-1')
    testkarte('Farbendieb', (_z, karteId, spielerId) => ({ typ: 'FarbendiebSpielen', spielerId, karteId, quelle: { schlangenId: 'schlange-1', karteId: rot }, ziel: { art: 'neueSchlange' } }), [], (zustand, aktion) => {
      legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
      zustand.spieler[0].hand.push(nimmAusSchlange(zustand, 'schlange-1', rot))
      zustand.spieler[1].hand.push(zustand.nachziehstapel.shift()!)
    })
    const { zustand, ereignisse } = spiele(start)
    expect(hand(zustand, 0)).toContain(rot)
    expect(versetzt(ereignisse)[0].karten).toEqual([
      { karteId: null, von: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 0 }, nach: { ort: 'Hand', spielerIndex: 0 } },
      { karteId: null, von: { ort: 'Nachziehstapel' }, nach: { ort: 'Hand', spielerIndex: 1 } },
    ])
  })

  it('B2: die Reihenfolge verdeckt abgelegter Karten verrät nicht, wie sie im Nachziehstapel liegen', () => {
    const gemeldet = (['erst A', 'erst B'] as const).map((folge) => {
      const start = tisch('Schlangenfrass').schlange(0, ['Rot', 'Gelb', 'Blau']).zustand()
      const [a, b] = idsIn(start, 'schlange-1')
      const ziele = [a, b].map((karteId) => ({ schlangenId: 'schlange-1', karteId }))
      testkarte('Schlangenfrass', (_z, karteId, spielerId) => ({ typ: 'SchlangenfrassSpielen', spielerId, karteId, option: 'eigeneKarte', ziele }), [], (zustand, aktion) => {
        legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
        const karten = (folge === 'erst A' ? [a, b] : [b, a]).map((karteId) => nimmAusSchlange(zustand, 'schlange-1', karteId))
        zustand.nachziehstapel.unshift(...karten)
      })
      const ereignisse = versetzt(spiele(start).ereignisse)
      vi.restoreAllMocks()
      return ereignisse
    })
    expect(gemeldet[0]).toEqual(gemeldet[1])
  })
})
