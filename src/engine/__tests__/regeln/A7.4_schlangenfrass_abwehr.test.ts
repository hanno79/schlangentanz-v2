import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, ermittleEntscheider, serialisiere } from '../../index'
import type { Ereignis, SchlangenfrassSpielenAktion, SpielAktion, Spielzustand } from '../../index'
import { lageVon, spieleNach } from '../nachrechnen'
import { frass as frassAktion, frassAktionen, ids, MIT_FRASS } from '../schlangenfrass_hilfen'
import {
  ablage,
  durchlassen,
  ereignisseVom,
  farbkarte,
  folge,
  FUENF,
  fuehreAus,
  hand,
  MIT_SCHUTZ,
  reaktion,
  tischMitHaenden as tisch,
  verletzteInvarianten,
  zugBeenden,
} from '../zugablauf_hilfen'

/*
E6, Schlangenfrass c) und die Abwehr (A6 Beispiel 2, A6 Timing, A7.2, D15,
D33, B2): Jeder betroffene Spieler entscheidet einmal, im Uhrzeigersinn ab dem
Angreifer, auch wenn beide Karten von ihm sind. Wer abwehrt, behält seine
Karten; die übrigen werden gefressen, erst wenn alle entschieden haben. Den
Reaktionsablauf selbst prüft `A6_reaktion.test.ts` (E4).
*/

/** Die aufgezählte Option c), die genau diese Karten frisst. */
function frassAuf(zustand: Spielzustand, ...karteIds: string[]): SchlangenfrassSpielenAktion {
  return frassAktion(zustand, 'gegnerischeKarten', ...karteIds)
}

const abwehren = (zustand: Spielzustand): SpielAktion => reaktion(zustand, true)

/**
 * A6 Beispiel 2 am Tisch: Spieler A (Index 0) frisst je eine Karte von B (1)
 * und C (2). Beide halten einen Farbenschutz, damit jeder wählen kann.
 */
function beispielZwei() {
  const start = tisch([MIT_FRASS, MIT_SCHUTZ, MIT_SCHUTZ]).schlange(1, ['Blau', 'Blau', 'Blau']).schlange(2, ['Gelb', 'Gelb', 'Gelb']).zustand()
  const vonB = ids(start, 1)[1]
  const vonC = ids(start, 2)[0]
  const frass = start.spieler[0].hand[0].id
  const schutz = [start.spieler[1].hand[0].id, start.spieler[2].hand[0].id]
  return { start, vonB, vonC, frass, schutz, ansage: frassAuf(start, vonB, vonC) }
}

describe('A6 Beispiel 2: Schlangenfrass mit mehreren Zielen', () => {
  it('A6 Beispiel 2: A sagt an, je eine Karte von B und C; zuerst entscheidet B, dann C; bis dahin wird nichts gefressen', () => {
    const { start, vonB, vonC, frass, ansage } = beispielZwei()
    const angesagt = fuehreAus(start, ansage)
    expect(angesagt.ereignisse).toEqual([
      { typ: 'KarteAngesagt', spielerIndex: 0, karteId: frass, ansage, betroffene: [1, 2] },
      { typ: 'AbwehrGefragt', spielerIndex: 1, karteId: frass },
    ])
    expect(ermittleEntscheider(angesagt.zustand)).toBe(1)
    const nachB = fuehreAus(angesagt.zustand, durchlassen(angesagt.zustand))
    expect(nachB.ereignisse).toEqual([{ typ: 'AbwehrGefragt', spielerIndex: 2, karteId: frass }])
    expect(ermittleEntscheider(nachB.zustand)).toBe(2)
    expect(ids(nachB.zustand, 1), 'A6 Timing: erst nach allen Reaktionen tritt der Effekt ein').toEqual(ids(start, 1))
    expect(ids(nachB.zustand, 2)).toEqual(ids(start, 2))
    expect(ids(nachB.zustand, 1)).toContain(vonB)
    expect(ids(nachB.zustand, 2)).toContain(vonC)
  })

  it.each([
    ['niemand wehrt ab: beide Karten werden gefressen', false, false],
    ['nur B wehrt ab: seine Karte bleibt liegen, die von C wird trotzdem entfernt', true, false],
    ['nur C wehrt ab: seine Karte bleibt liegen, die von B wird entfernt', false, true],
    ['beide wehren ab: keine Karte wird gefressen', true, true],
  ])('A6 Beispiel 2/E6 Kriterium 4: %s', (_fall, bWehrtAb, cWehrtAb) => {
    const { start, vonB, vonC, frass, schutz, ansage } = beispielZwei()
    const { zustand, ereignisse } = folge(start, () => ansage, bWehrtAb ? abwehren : durchlassen, cWehrtAb ? abwehren : durchlassen)
    const abgewehrt = [...(bWehrtAb ? [1] : []), ...(cWehrtAb ? [2] : [])]
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')).toEqual([
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: frass, abgewehrt, ohneWirkung: bWehrtAb && cWehrtAb, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
    expect(ids(zustand, 1).includes(vonB), 'Karte von B liegt noch').toBe(bWehrtAb)
    expect(ids(zustand, 2).includes(vonC), 'Karte von C liegt noch').toBe(cWehrtAb)
    expect(ids(zustand, 1)).toHaveLength(bWehrtAb ? 3 : 2)
    expect(ids(zustand, 2)).toHaveLength(cWehrtAb ? 3 : 2)
    // A6 Beispiel 2, Punkt 4: Schlangenfrass und gefressene Karten auf den Ablagestapel von A, Farbenschutz auf den seines Spielers.
    expect(ablage(zustand, 0)).toEqual([frass, ...(bWehrtAb ? [] : [vonB]), ...(cWehrtAb ? [] : [vonC])])
    expect(ablage(zustand, 1)).toEqual(bWehrtAb ? [schutz[0]] : [])
    expect(ablage(zustand, 2)).toEqual(cWehrtAb ? [schutz[1]] : [])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A6 Beispiel 2, Punkt 5: A füllt am Ende seines Zuges auf; B und C, die abgewehrt haben, erst zu Beginn ihres nächsten Zuges', () => {
    const { start, ansage } = beispielZwei()
    const abgewehrt = folge(start, () => ansage, abwehren, abwehren).zustand
    expect([hand(abgewehrt, 1).length, hand(abgewehrt, 2).length]).toEqual([4, 4])
    const { zustand, ereignisse } = folge(abgewehrt, farbkarte, zugBeenden)
    expect(ereignisseVom(ereignisse, 'KartenGezogen')).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 2 },
      { typ: 'KartenGezogen', spielerIndex: 1, anzahl: 1 },
    ])
    expect(hand(zustand, 2), 'C füllt erst in seinem eigenen Zug auf').toHaveLength(4)
  })
})

describe('D15/F2: zwei Karten desselben Spielers', () => {
  function zweiVonB() {
    const start = tisch([MIT_FRASS, MIT_SCHUTZ, MIT_SCHUTZ]).schlange(1, ['Blau', 'Rot', 'Gelb']).schlange(2, ['Grün']).zustand()
    const [blau, , gelb] = ids(start, 1)
    return { start, blau, gelb, ansage: frassAuf(start, blau, gelb) }
  }

  it('D15/A6: frisst c) zwei Karten von B, entscheidet B einmal; C ist nicht betroffen', () => {
    const { start, ansage } = zweiVonB()
    const angesagt = fuehreAus(start, ansage)
    expect(ereignisseVom(angesagt.ereignisse, 'KarteAngesagt')[0].betroffene).toEqual([1])
    expect(ereignisseVom(angesagt.ereignisse, 'AbwehrGefragt')).toHaveLength(1)
  })

  it('D15: ein Farbenschutz wehrt den ganzen Schlangenfrass für B ab, beide Karten bleiben liegen', () => {
    const { start, ansage } = zweiVonB()
    const { zustand, ereignisse } = folge(start, () => ansage, abwehren)
    expect(ids(zustand, 1)).toEqual(ids(start, 1))
    expect(ereignisseVom(ereignisse, 'Abgewehrt')).toHaveLength(1)
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')[0]).toMatchObject({ abgewehrt: [1], ohneWirkung: true })
    expect(ablage(zustand, 0)).toEqual([ansage.karteId])
    expect(hand(zustand, 1), 'D15: nur ein Farbenschutz ist verbraucht').toHaveLength(4)
  })

  it('D15: lässt B durch, werden beide Karten gefressen', () => {
    const { start, blau, gelb, ansage } = zweiVonB()
    const { zustand } = folge(start, () => ansage, durchlassen)
    expect(ids(zustand, 1)).toEqual([ids(start, 1)[1]])
    expect(ablage(zustand, 0)).toEqual([ansage.karteId, blau, gelb])
  })
})

describe('A6/D33: wer gefragt wird', () => {
  it('A6: im Uhrzeigersinn ab dem Angreifer, auch wenn er nicht Spieler 1 ist', () => {
    const start = tisch([FUENF, FUENF, MIT_FRASS, FUENF]).schlange(0, ['Rot']).schlange(1, ['Blau']).schlange(3, ['Gelb']).amZug(2).zustand()
    const ansage = frassAuf(start, ids(start, 1)[0], ids(start, 3)[0])
    const { ereignisse } = fuehreAus(start, ansage)
    expect(ereignisseVom(ereignisse, 'KarteAngesagt')[0].betroffene).toEqual([3, 1])
    expect(ereignisseVom(ereignisse, 'AbwehrGefragt')).toEqual([{ typ: 'AbwehrGefragt', spielerIndex: 3, karteId: ansage.karteId }])
  })

  it('D33: ein Betroffener ohne Farbenschutz wird gefragt und kann nur durchlassen', () => {
    const start = tisch([MIT_FRASS, FUENF]).schlange(1, ['Blau', 'Rot']).zustand()
    const angesagt = fuehreAus(start, frassAuf(start, ...ids(start, 1))).zustand
    expect(ermittleEntscheider(angesagt)).toBe(1)
    expect(ermittleAktionen(angesagt)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
  })

  it('A6/D10: a) und b) treffen keinen Mitspieler: niemand wird gefragt, auch wenn jeder Farbenschutz hält', () => {
    const start = tisch([MIT_FRASS, MIT_SCHUTZ, MIT_SCHUTZ]).schlange(0, ['Rot', 'Schlangenblockade', 'Rot']).schlange(1, ['Blau']).zustand()
    const eigene = frassAktionen(start).filter((aktion) => aktion.option !== 'gegnerischeKarten')
    expect(eigene).toHaveLength(4)
    for (const aktion of eigene) {
      const { zustand, ereignisse } = fuehreAus(start, aktion)
      expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenVersetzt', 'KarteGespielt'])
      expect(zustand.schwebend).toBeNull()
    }
  })
})

describe('A6 Beispiel 2/E4b: KartenVersetzt meldet, was gefressen ist', () => {
  /** Die gespielte Aktion und alle Ereignisse bis zur Wirkung; jeder Schritt lässt sich aus den Ereignissen nachrechnen. */
  function nachgerechnet(start: Spielzustand, ...wahlen: Array<(jetzt: Spielzustand) => SpielAktion>) {
    let jetzt = start
    const ereignisse: Ereignis[] = []
    for (const waehle of wahlen) {
      const schritt = fuehreAus(jetzt, waehle(jetzt))
      expect(spieleNach(lageVon(jetzt), schritt.ereignisse), 'E2 Kriterium 11: nicht nachrechenbar').toEqual(lageVon(schritt.zustand))
      ereignisse.push(...schritt.ereignisse)
      jetzt = schritt.zustand
    }
    return { zustand: jetzt, ereignisse }
  }

  it('A6 Beispiel 2: auf den Ablagestapel von A kommt zuerst der Schlangenfrass, dann die Karten in Tischreihenfolge, gleich in welcher Reihenfolge die Ansage sie nennt', () => {
    const { start, vonB, vonC, frass, ansage } = beispielZwei()
    const [schlangeB, schlangeC] = [start.spieler[1].schlangen[0].id, start.spieler[2].schlangen[0].id]
    const erwartet = {
      typ: 'KartenVersetzt',
      spielerIndex: 0,
      karteId: frass,
      karten: [
        { karteId: vonB, von: { ort: 'Schlange', spielerIndex: 1, schlangenId: schlangeB, position: 1 }, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
        { karteId: vonC, von: { ort: 'Schlange', spielerIndex: 2, schlangenId: schlangeC, position: 0 }, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 1 } },
      ],
      aufgeloest: [],
    }
    for (const ziele of [ansage.ziele, [...ansage.ziele].reverse()]) {
      const { zustand, ereignisse } = nachgerechnet(start, () => ({ ...ansage, ziele }), durchlassen, durchlassen)
      const ende = ereignisse.slice(-2)
      expect(ende[0]).toEqual(erwartet)
      expect(ende[1]).toMatchObject({ typ: 'AnsageEntschieden', karteId: frass, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } })
      expect(ablage(zustand, 0)).toEqual([frass, vonB, vonC])
    }
  })

  it('A6 Beispiel 2: wehrt B ab, nennt KartenVersetzt nur die Karte von C', () => {
    const { start, vonC, ansage } = beispielZwei()
    const { ereignisse } = nachgerechnet(start, () => ansage, abwehren, durchlassen)
    expect(ereignisseVom(ereignisse, 'KartenVersetzt').map((ereignis) => ereignis.karten.map((karte) => karte.karteId))).toEqual([[vonC]])
  })

  it('A7.4/A7.7: eine gefressene Fusion: ihre Karten gehen von UnterFusion in die Schlange, die Fusion auf den Ablagestapel; eine leer gefressene Schlange steht in aufgeloest', () => {
    const start = tisch([MIT_FRASS, FUENF]).schlange(0, [{ fusion: ['Gelb', 'Gelb'] }]).schlange(1, ['Blau', 'Rot']).zustand()
    const eigene = start.spieler[0].schlangen[0]
    const [links, rechts] = eigene.fusionen[0].unter.map((karte) => karte.id)
    const fusion = eigene.karten[0].id
    const frass = start.spieler[0].hand[0].id
    const eigen = nachgerechnet(start, (jetzt) => frassAktionen(jetzt, 'eigeneKarte')[0])
    expect(ereignisseVom(eigen.ereignisse, 'KartenVersetzt')).toEqual([
      {
        typ: 'KartenVersetzt',
        spielerIndex: 0,
        karteId: frass,
        karten: [
          { karteId: links, von: { ort: 'UnterFusion', spielerIndex: 0, schlangenId: eigene.id, fusionId: fusion, position: 0 }, nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: eigene.id, position: 0 } },
          { karteId: rechts, von: { ort: 'UnterFusion', spielerIndex: 0, schlangenId: eigene.id, fusionId: fusion, position: 1 }, nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: eigene.id, position: 1 } },
          { karteId: fusion, von: { ort: 'Schlange', spielerIndex: 0, schlangenId: eigene.id, position: 0 }, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
        ],
        aufgeloest: [],
      },
    ])
    const fremd = nachgerechnet(start, (jetzt) => frassAuf(jetzt, ...ids(jetzt, 1)), durchlassen)
    expect(ereignisseVom(fremd.ereignisse, 'KartenVersetzt')[0].aufgeloest).toEqual([start.spieler[1].schlangen[0].id])
    expect(fremd.zustand.spieler[1].schlangen).toEqual([])
  })
})

describe('B2/A6: Ansage, Geheimnis, Speichern', () => {
  it('B2: die Ansage nennt nur Karten, die offen in Schlangen liegen, keine Handkarte', () => {
    const { start, ansage } = beispielZwei()
    const { zustand, ereignisse } = fuehreAus(start, ansage)
    const aufHand = new Set(zustand.spieler.flatMap((spieler) => spieler.hand.map((karte) => karte.id)))
    const genannt = JSON.stringify(ereignisse).match(/[a-z]+-\d\d/g) ?? []
    expect(genannt.filter((id) => aufHand.has(id))).toEqual([])
  })

  it('A6/E4 Kriterium 8: Speichern und Laden mitten in der Frage setzt dort fort; das Ergebnis ist dasselbe', () => {
    const { start, ansage } = beispielZwei()
    const angesagt = folge(start, () => ansage, abwehren).zustand
    const geladen = deserialisiere(serialisiere(angesagt))
    expect(ermittleEntscheider(geladen)).toBe(2)
    expect(folge(geladen, durchlassen).zustand).toEqual(folge(angesagt, durchlassen).zustand)
  })
})
