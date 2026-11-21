import { describe, expect, it } from 'vitest'
import { ermittleAktionen } from '../index'
import type { Ereignis, Spielzustand } from '../index'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import {
  ablage,
  aktionen,
  durchlassen,
  ereignisseVom,
  farbkarte,
  folge,
  FUENF,
  fuehreAus,
  grubeAuf,
  grund,
  hand,
  MIT_GRUBE,
  MIT_SCHUTZ,
  reaktion,
  spieleZug,
  tischMitHaenden as tisch,
  typen,
  verletzteInvarianten,
  zugBeenden,
} from './zugablauf_hilfen'

/*
E4, die Schlangengrube durch Spielen (A7.6 mit beiden Beispielen, D14, D18,
D21, D29, A10): Sie trifft einen Mitspieler, bleibt vor ihm liegen, bis er für
sie ausgesetzt hat, und geht dann auf den Ablagestapel dessen, der sie gespielt
hat. Hat er für sie keinen Zug mehr, geht sie ohne Wirkung dorthin. Den
allgemeinen Reaktionsablauf prüft `reaktion.test.ts`, das Aussetzen mit schon
liegender Grube `zugablauf_schlussrunde.test.ts` (E2).
*/

/** Grube auf `ziel`, der Getroffene lässt durch, eine Farbkarte, Zug beenden: der Zug des Angreifers ohne Abwehr. */
function grubeUndEnde(zustand: Spielzustand, ziel: number) {
  return folge(zustand, (jetzt) => grubeAuf(jetzt, ziel), durchlassen, farbkarte, zugBeenden)
}

function grubenId(zustand: Spielzustand, spieler: number): string {
  return zustand.spieler[spieler].hand.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube')!.id
}

describe('A7.6: die Schlangengrube wählt einen Mitspieler', () => {
  it('A7.6: angeboten ist jeder Mitspieler im Uhrzeigersinn, nie der Spieler selbst', () => {
    const zustand = tisch([FUENF, MIT_GRUBE, FUENF, FUENF]).amZug(1).zustand()
    const ziele = aktionen(zustand, 'SchlangengrubeSpielen').map((aktion) => aktion.typ === 'SchlangengrubeSpielen' && aktion.zielSpielerId)
    expect(ziele).toEqual(['spieler-3', 'spieler-4', 'spieler-1'])
    expect(typen(zustand), 'D25: mit möglichem Ziel lässt sie sich nicht wirkungslos ablegen').not.toContain('SonderkarteWirkungslosAblegen')
  })

  it('A7.6: auf sich selbst oder einen unbekannten Spieler wird sie abgelehnt, mit Grund', () => {
    const zustand = tisch([MIT_GRUBE, FUENF]).zustand()
    const karteId = grubenId(zustand, 0)
    expect(grund(zustand, { typ: 'SchlangengrubeSpielen', spielerId: 'spieler-1', karteId, zielSpielerId: 'spieler-1' })).toMatch(/Mitspieler.*\(A7\.6\)/)
    expect(grund(zustand, { typ: 'SchlangengrubeSpielen', spielerId: 'spieler-1', karteId, zielSpielerId: 'spieler-9' })).toMatch(/spieler-9/)
  })
})

describe('A7.6: die beiden Beispiele der Website', () => {
  it('A7.6 Beispiel 1: B hat keinen Farbenschutz und setzt seinen nächsten Zug komplett aus; danach liegt die Grube auf dem Ablagestapel von A', () => {
    const start = tisch([MIT_GRUBE, FUENF, FUENF]).zustand()
    const grube = grubenId(start, 0)
    const angesagt = folge(start, (jetzt) => grubeAuf(jetzt, 1), durchlassen)
    expect(angesagt.ereignisse).toEqual([
      expect.objectContaining({ typ: 'KarteAngesagt', spielerIndex: 0, karteId: grube, betroffene: [1] }),
      { typ: 'AbwehrGefragt', spielerIndex: 1, karteId: grube },
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: grube, abgewehrt: [], ohneWirkung: false, nach: { ort: 'VorSpieler', spielerIndex: 1 } },
    ])
    expect(angesagt.zustand.ausliegendeGruben).toEqual([{ karte: start.spieler[0].hand[0], gespieltVon: 0, vor: 1 }])
    const { zustand, ereignisse } = folge(angesagt.zustand, farbkarte, zugBeenden)
    expect(ereignisseVom(ereignisse, 'Ausgesetzt')).toEqual([{ typ: 'Ausgesetzt', spielerIndex: 1, karteId: grube, ablagestapelVon: 0 }])
    expect(hand(zustand, 1), 'A7.6: während des Aussetzens weder ziehen noch spielen').toEqual(hand(start, 1))
    expect(zustand.zug.spielerIndex).toBe(2)
    expect(ablage(zustand, 0)).toEqual([grube])
    expect(zustand.ausliegendeGruben).toEqual([])
  })

  it('A7.6 Beispiel 2: B wehrt mit Farbenschutz ab; die Grube liegt ohne Wirkung auf dem Ablagestapel, B spielt seinen Zug normal', () => {
    const start = tisch([MIT_GRUBE, MIT_SCHUTZ]).zustand()
    const grube = grubenId(start, 0)
    const schutz = start.spieler[1].hand[0].id
    const abgewehrt = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, true))
    expect(abgewehrt.ereignisse.slice(2)).toEqual([
      { typ: 'Abgewehrt', spielerIndex: 1, karteId: schutz, gegen: grube },
      { typ: 'AnsageEntschieden', spielerIndex: 0, karteId: grube, abgewehrt: [1], ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0 } },
    ])
    expect(ablage(abgewehrt.zustand, 0)).toEqual([grube])
    expect(ablage(abgewehrt.zustand, 1)).toEqual([schutz])
    expect(abgewehrt.zustand.ausliegendeGruben).toEqual([])
    const weiter = folge(abgewehrt.zustand, farbkarte, zugBeenden)
    expect(ereignisseVom(weiter.ereignisse, 'Ausgesetzt')).toEqual([])
    expect(weiter.zustand.zug.spielerIndex).toBe(1)
    expect(typen(weiter.zustand)).toContain('FarbkarteLegen')
  })

  it('A7.6: wer Farbenschutz hält, darf die Grube auch durchlassen; dann setzt er aus und behält den Farbenschutz', () => {
    const start = tisch([MIT_GRUBE, MIT_SCHUTZ, FUENF]).zustand()
    const durch = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, false), farbkarte, zugBeenden)
    expect(ereignisseVom(durch.ereignisse, 'Ausgesetzt').map((ereignis) => ereignis.spielerIndex)).toEqual([1])
    expect(hand(durch.zustand, 1)).toContain(start.spieler[1].hand[0].id)
  })
})

describe('D14, D18: mehrere Gruben, Abwehr vor dem Aussetzen', () => {
  it('D14/F1: zwei Gruben von zwei Mitspielern auf denselben Spieler kosten ihn zwei Züge; jede geht an ihren Spieler', () => {
    const start = tisch([MIT_GRUBE, MIT_GRUBE, FUENF]).zustand()
    const [vonA, vonB] = [grubenId(start, 0), grubenId(start, 1)]
    let zustand = grubeUndEnde(start, 2).zustand
    const zweite = grubeUndEnde(zustand, 2)
    zustand = zweite.zustand
    expect(ereignisseVom(zweite.ereignisse, 'Ausgesetzt')).toEqual([{ typ: 'Ausgesetzt', spielerIndex: 2, karteId: vonA, ablagestapelVon: 0 }])
    const dritte = folge(zustand, farbkarte, zugBeenden, farbkarte, zugBeenden)
    expect(ereignisseVom(dritte.ereignisse, 'Ausgesetzt')).toEqual([{ typ: 'Ausgesetzt', spielerIndex: 2, karteId: vonB, ablagestapelVon: 1 }])
    expect(dritte.zustand.zug.spielerIndex).toBe(0)
    expect(ablage(dritte.zustand, 1)).toContain(vonB)
  })

  it('E4 Grenzfall: zu zweit mehrmals hintereinander setzt der Gegner jedes Mal aus, und der Angreifer ist gleich wieder dran', () => {
    let zustand = tisch([['Schlangengrube', 'Schlangengrube', 'Schlangengrube', 'Blau', 'Rot'], FUENF]).stapelOben(['Gelb', 'Gelb', 'Gelb', 'Gelb']).zustand()
    const ausgesetzt: number[] = []
    for (let runde = 0; runde < 3; runde += 1) {
      const schritt = folge(zustand, (jetzt) => grubeAuf(jetzt, 1), durchlassen, zugBeenden)
      ausgesetzt.push(...ereignisseVom(schritt.ereignisse, 'Ausgesetzt').map((ereignis) => ereignis.spielerIndex))
      zustand = schritt.zustand
      expect(zustand.zug.spielerIndex, `Runde ${runde}: Spieler 1 ist gleich wieder dran`).toBe(0)
    }
    expect(ausgesetzt).toEqual([1, 1, 1])
    expect(ablage(zustand, 0)).toHaveLength(3)
    expect(hand(zustand, 1)).toHaveLength(5)
  })

  it('D18/F5: wer schon eine Grube vor sich hat, darf vor dem ausgesetzten Zug noch mit Farbenschutz abwehren', () => {
    const start = tisch([FUENF, MIT_GRUBE, MIT_SCHUTZ]).grube(0, 2).amZug(1).zustand()
    const abwehr = folge(start, (jetzt) => grubeAuf(jetzt, 2), (jetzt) => reaktion(jetzt, true))
    expect(ereignisseVom(abwehr.ereignisse, 'Abgewehrt').map((ereignis) => ereignis.spielerIndex)).toEqual([2])
    expect(abwehr.zustand.ausliegendeGruben.map((grube) => grube.gespieltVon)).toEqual([0])
    const weiter = folge(abwehr.zustand, farbkarte, zugBeenden)
    expect(ereignisseVom(weiter.ereignisse, 'Ausgesetzt').map((ereignis) => ereignis.spielerIndex)).toEqual([2])
    expect(hand(weiter.zustand, 2), 'D18: kein Auffüllen im ausgesetzten Zug').toHaveLength(4)
  })
})

describe('D21, D29, A10: die Schlangengrube in der Schlussrunde', () => {
  /** Drei Spieler in der Schlussrunde, ausgelöst von Spieler 1; am Zug ist `amZug`. Der Rest des Stapels liegt danach auf den Ablagestapeln. */
  function schlussrunde(haende: Kartenwahl[][], amZug: number, vorher: (bau: Baukasten) => Baukasten = (bau) => bau): Baukasten {
    return vorher(tisch(haende)).schlussrunde(0).amZug(amZug)
  }

  it('D21/F8: trifft sie in der Schlussrunde einen Spieler, der noch einen Zug hätte, setzt er aus und hat keinen letzten Zug mehr', () => {
    const start = schlussrunde([FUENF, MIT_GRUBE, FUENF], 1).zustand()
    const { zustand, ereignisse } = grubeUndEnde(start, 2)
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteAngesagt', 'AbwehrGefragt', 'AnsageEntschieden', 'KarteGespielt', 'Ausgesetzt', 'PartieBeendet'])
    expect(zustand.partiephase).toBe('Beendet')
    expect(zustand.ausliegendeGruben).toEqual([])
  })

  it('D21: er darf sich in der Schlussrunde mit Farbenschutz verteidigen und spielt dann seinen letzten Zug', () => {
    const start = schlussrunde([FUENF, MIT_GRUBE, MIT_SCHUTZ], 1).zustand()
    const abwehr = folge(start, (jetzt) => grubeAuf(jetzt, 2), (jetzt) => reaktion(jetzt, true), farbkarte, zugBeenden)
    expect(abwehr.zustand.zug.spielerIndex).toBe(2)
    expect(abwehr.zustand.partiephase).toBe('Schlussrunde')
    expect(spieleZug(abwehr.zustand).zustand.partiephase).toBe('Beendet')
  })

  it('D29/F8a: auf einen Spieler, der seinen letzten Zug schon gemacht hat, ist sie erlaubt und geht ohne Wirkung auf den Ablagestapel', () => {
    const start = schlussrunde([FUENF, FUENF, MIT_GRUBE], 2).zustand()
    const grube = grubenId(start, 2)
    expect(aktionen(start, 'SchlangengrubeSpielen'), 'D29: auch der Auslöser und wer schon gespielt hat, sind Ziele').toHaveLength(2)
    const { zustand, ereignisse } = folge(start, (jetzt) => grubeAuf(jetzt, 1), durchlassen)
    expect(ereignisse.slice(2)).toEqual([
      { typ: 'AnsageEntschieden', spielerIndex: 2, karteId: grube, abgewehrt: [], ohneWirkung: false, nach: { ort: 'VorSpieler', spielerIndex: 1 } },
      { typ: 'GrubeOhneWirkung', spielerIndex: 1, karteId: grube, ablagestapelVon: 2 },
    ])
    expect(zustand.ausliegendeGruben).toEqual([])
    expect(ablage(zustand, 2).at(-1)).toBe(grube)
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('D29/A10: auch auf den Auslöser geht sie ohne Wirkung ab; er darf sie mit einem zuletzt gezogenen Farbenschutz abwehren', () => {
    const ohneSchutz = schlussrunde([FUENF, MIT_GRUBE, FUENF], 1).zustand()
    expect(ereignisseVom(folge(ohneSchutz, (jetzt) => grubeAuf(jetzt, 0), durchlassen).ereignisse, 'GrubeOhneWirkung').map((ereignis) => ereignis.spielerIndex)).toEqual([0])
    const mitSchutz = schlussrunde([MIT_SCHUTZ, MIT_GRUBE, FUENF], 1).zustand()
    const abwehr = folge(mitSchutz, (jetzt) => grubeAuf(jetzt, 0), (jetzt) => reaktion(jetzt, true))
    expect(ereignisseVom(abwehr.ereignisse, 'Abgewehrt').map((ereignis) => ereignis.spielerIndex)).toEqual([0])
    expect(ablage(abwehr.zustand, 0).at(-1)).toBe(mitSchutz.spieler[0].hand[0].id)
  })

  it('D14/D29: liegt vor ihm schon eine Grube für seinen letzten Zug, geht eine zweite ohne Wirkung ab', () => {
    const start = schlussrunde([FUENF, MIT_GRUBE, FUENF], 1, (bau) => bau.grube(0, 2)).zustand()
    const { ereignisse } = folge(start, (jetzt) => grubeAuf(jetzt, 2), durchlassen)
    expect(ereignisseVom(ereignisse, 'GrubeOhneWirkung')).toEqual([{ typ: 'GrubeOhneWirkung', spielerIndex: 2, karteId: grubenId(start, 1), ablagestapelVon: 1 }])
  })

  it('D14/D21/D29: beginnt die Schlussrunde mit zwei Gruben vor einem Spieler, kostet die erste seinen letzten Zug, die zweite geht ohne Wirkung ab', () => {
    const start = tisch([FUENF, FUENF, FUENF]).grube(0, 2).grube(1, 2).stapelBehalten(1).zustand()
    const [erste, zweite] = start.ausliegendeGruben.map((grube) => grube.karte.id)
    const ereignisse: Ereignis[] = []
    let zustand = start
    while (zustand.partiephase !== 'Beendet') {
      const schritt = spieleZug(zustand)
      ereignisse.push(...schritt.ereignisse)
      zustand = schritt.zustand
    }
    expect(ereignisse.filter((ereignis) => ['SchlussrundeBegonnen', 'GrubeOhneWirkung', 'Ausgesetzt', 'PartieBeendet'].includes(ereignis.typ))).toEqual([
      { typ: 'SchlussrundeBegonnen', ausloeser: 0 },
      { typ: 'GrubeOhneWirkung', spielerIndex: 2, karteId: zweite, ablagestapelVon: 1 },
      { typ: 'Ausgesetzt', spielerIndex: 2, karteId: erste, ablagestapelVon: 0 },
      { typ: 'PartieBeendet' },
    ])
  })

  it('A10/D29: eine Grube vor einem Spieler ohne weiteren Zug liegt bei Spielende nicht mehr aus; sie ging ohne Wirkung an den, der sie spielte', () => {
    const start = tisch([FUENF, FUENF]).grube(1, 0).schlussrunde(0).amZug(1).zustand()
    const grube = start.ausliegendeGruben[0].karte.id
    const { zustand, ereignisse } = spieleZug(start)
    expect(zustand.partiephase).toBe('Beendet')
    expect(ereignisse).toContainEqual({ typ: 'GrubeOhneWirkung', spielerIndex: 0, karteId: grube, ablagestapelVon: 1 })
    expect(zustand.ausliegendeGruben).toEqual([])
    expect(ablage(zustand, 1)).toContain(grube)
  })

  it('E4 Grenzfall: Abwehr mit der letzten Handkarte in der Schlussrunde; der letzte Zug mit leerer Hand lässt sich beenden', () => {
    const start = schlussrunde([FUENF, MIT_GRUBE, ['Farbenschutz']], 1).zustand()
    const abwehr = folge(start, (jetzt) => grubeAuf(jetzt, 2), (jetzt) => reaktion(jetzt, true), farbkarte, zugBeenden)
    expect(abwehr.zustand.zug.spielerIndex).toBe(2)
    expect(hand(abwehr.zustand, 2)).toEqual([])
    expect(ermittleAktionen(abwehr.zustand), 'E2 Kriterium 12: auch mit leerer Hand gibt es eine Aktion').toEqual([{ typ: 'ZugBeenden', spielerId: 'spieler-3' }])
    expect(fuehreAus(abwehr.zustand, zugBeenden(abwehr.zustand)).zustand.partiephase).toBe('Beendet')
  })
})
