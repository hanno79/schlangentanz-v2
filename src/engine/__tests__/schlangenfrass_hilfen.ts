import { expect } from 'vitest'
import type { SchlangenfrassSpielenAktion, Spielzustand } from '../index'
import type { Kartenwahl } from '../testing/szenario'
import { aktionen } from './zugablauf_hilfen'

/*
Hilfen für die Tests des Schlangenfrass (E6). Sie wählen nur, was die Engine
aufzählt.
*/

export type Option = SchlangenfrassSpielenAktion['option']

export const MIT_FRASS: Kartenwahl[] = ['Schlangenfrass', 'Blau', 'Rot', 'Gelb', 'Grün']

/** Alle aufgezählten Schlangenfrass-Aktionen, auf Wunsch nur die einer Option. */
export function frassAktionen(zustand: Spielzustand, option?: Option): SchlangenfrassSpielenAktion[] {
  return aktionen(zustand, 'SchlangenfrassSpielen').filter(
    (aktion): aktion is SchlangenfrassSpielenAktion => aktion.typ === 'SchlangenfrassSpielen' && (option === undefined || aktion.option === option),
  )
}

/** Die aufgezählte Aktion dieser Option, die genau diese Karten frisst, in beliebiger Reihenfolge. */
export function frass(zustand: Spielzustand, option: Option, ...karteIds: string[]): SchlangenfrassSpielenAktion {
  const gesucht = [...karteIds].sort().join(',')
  const passend = frassAktionen(zustand, option).find((aktion) => aktion.ziele.map((ziel) => ziel.karteId).sort().join(',') === gesucht)
  expect(passend, `Schlangenfrass ${option} auf ${karteIds.join(', ')} ist nicht aufgezählt`).toBeDefined()
  return passend!
}

/** Die Ids der Karten in der `nummer`-ten Schlange des Spielers; leer, wenn es sie nicht gibt. */
export function ids(zustand: Spielzustand, spieler: number, nummer = 0): string[] {
  return zustand.spieler[spieler].schlangen[nummer]?.karten.map((karte) => karte.id) ?? []
}

/** Die Id des ersten Schlangenfrass auf der Hand des Spielers. */
export function frassId(zustand: Spielzustand, spieler = 0): string {
  return zustand.spieler[spieler].hand.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass')!.id
}
