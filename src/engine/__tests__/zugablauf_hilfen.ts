import { expect } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, pruefeAktion } from '../index'
import type { Aktionstyp, Ereignis, SpielAktion, Spielzustand } from '../index'

/*
Hilfen für die Tests des Zugablaufs (E2). Sie spielen nur, was die Engine
aufzählt, und bauen keine Aktion selbst, ausser ein Test will gerade eine
unerlaubte Aktion zeigen.
*/

export interface Schritt {
  zustand: Spielzustand
  ereignisse: Ereignis[]
}

export function aktionen(zustand: Spielzustand, typ?: Aktionstyp): SpielAktion[] {
  const alle = ermittleAktionen(zustand)
  return typ === undefined ? alle : alle.filter((aktion) => aktion.typ === typ)
}

export function typen(zustand: Spielzustand): Aktionstyp[] {
  return [...new Set(ermittleAktionen(zustand).map((aktion) => aktion.typ))]
}

/** Führt eine Aktion aus, die erlaubt sein muss. */
export function fuehreAus(zustand: Spielzustand, aktion: SpielAktion): Schritt {
  const pruefung = pruefeAktion(zustand, aktion)
  expect(pruefung, `Erwartet erlaubt: ${JSON.stringify(aktion)}`).toEqual({ erlaubt: true })
  return anwendeAktion(zustand, aktion)
}

/** Der Grund, aus dem die Aktion abgelehnt wird; ist sie erlaubt, schlägt der Test fehl. */
export function grund(zustand: Spielzustand, aktion: unknown): string {
  const ergebnis = pruefeAktion(zustand, aktion as SpielAktion)
  if (ergebnis.erlaubt) throw new Error(`Testaufbau: ${JSON.stringify(aktion)} ist erlaubt`)
  expect(() => anwendeAktion(zustand, aktion as SpielAktion)).toThrow(ergebnis.grund)
  return ergebnis.grund
}

/** Die einzige aufgezählte Aktion dieses Typs für diese Karte. */
export function aktionFuer(zustand: Spielzustand, typ: Aktionstyp, karteId: string): SpielAktion {
  const passend = aktionen(zustand, typ).filter((aktion) => 'karteId' in aktion && aktion.karteId === karteId)
  expect(passend.length, `${typ} mit ${karteId} ist nicht aufgezählt`).toBeGreaterThan(0)
  return passend[0]
}

export function zugBeenden(zustand: Spielzustand): SpielAktion {
  const spieler = zustand.spieler[ermittleEntscheider(zustand)!]
  return { typ: 'ZugBeenden', spielerId: spieler.id }
}

/** Spielt die erste aufgezählte Karte und beendet den Zug; bei leerer Hand nur „Zug beenden“. */
export function spieleZug(zustand: Spielzustand): Schritt {
  const ereignisse: Ereignis[] = []
  let jetzt = zustand
  const karte = ermittleAktionen(jetzt).find((aktion) => aktion.typ !== 'ZugBeenden')
  if (karte !== undefined) {
    const schritt = fuehreAus(jetzt, karte)
    jetzt = schritt.zustand
    ereignisse.push(...schritt.ereignisse)
  }
  const ende = fuehreAus(jetzt, zugBeenden(jetzt))
  return { zustand: ende.zustand, ereignisse: [...ereignisse, ...ende.ereignisse] }
}

export function hand(zustand: Spielzustand, spieler: number): string[] {
  return zustand.spieler[spieler].hand.map((karte) => karte.id)
}

export function ablage(zustand: Spielzustand, spieler: number): string[] {
  return zustand.spieler[spieler].ablagestapel.map((karte) => karte.id)
}

export function ereignisseVom<T extends Ereignis['typ']>(ereignisse: Ereignis[], typ: T): Extract<Ereignis, { typ: T }>[] {
  return ereignisse.filter((ereignis): ereignis is Extract<Ereignis, { typ: T }> => ereignis.typ === typ)
}

/** Die aufgezählte Schlangengrube auf den Spieler an Stelle `ziel` (A7.6). */
export function grubeAuf(zustand: Spielzustand, ziel: number): SpielAktion {
  const id = zustand.spieler[ziel].id
  const passend = aktionen(zustand, 'SchlangengrubeSpielen').filter((aktion) => aktion.typ === 'SchlangengrubeSpielen' && aktion.zielSpielerId === id)
  expect(passend.length, `Schlangengrube auf ${id} ist nicht aufgezählt`).toBeGreaterThan(0)
  return passend[0]
}

/** Die aufgezählte Reaktion dessen, der gerade entscheidet: mit dem ersten Farbenschutz abwehren oder durchlassen (A6). */
export function reaktion(zustand: Spielzustand, abwehren: boolean): SpielAktion {
  const passend = aktionen(zustand, 'Reagieren').filter((aktion) => aktion.typ === 'Reagieren' && (aktion.farbenschutzId !== null) === abwehren)
  expect(passend.length, `Reagieren (${abwehren ? 'abwehren' : 'durchlassen'}) ist nicht aufgezählt`).toBeGreaterThan(0)
  return passend[0]
}

/** Die erste aufgezählte Farbkarte, für Züge, in denen es nur darauf ankommt, dass eine Karte gespielt ist. */
export function farbkarte(zustand: Spielzustand): SpielAktion {
  const passend = aktionen(zustand, 'FarbkarteLegen')
  expect(passend.length, 'FarbkarteLegen ist nicht aufgezählt').toBeGreaterThan(0)
  return passend[0]
}

/** Führt nacheinander aus, was jede Wahl aus dem jeweiligen Zustand nimmt, und sammelt alle Ereignisse. */
export function folge(zustand: Spielzustand, ...wahlen: Array<(jetzt: Spielzustand) => SpielAktion>): Schritt {
  let jetzt = zustand
  const ereignisse: Ereignis[] = []
  for (const waehle of wahlen) {
    const schritt = fuehreAus(jetzt, waehle(jetzt))
    jetzt = schritt.zustand
    ereignisse.push(...schritt.ereignisse)
  }
  return { zustand: jetzt, ereignisse }
}
