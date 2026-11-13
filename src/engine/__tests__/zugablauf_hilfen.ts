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
