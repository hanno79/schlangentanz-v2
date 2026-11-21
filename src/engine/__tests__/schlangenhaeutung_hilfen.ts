import { expect } from 'vitest'
import { berechneEndwertung, ermittleAktionen } from '../index'
import type { SchlangenhaeutungSpielenAktion, SpielAktion, Spielzustand } from '../index'
import { gepruefteSchlange } from '../schlangen'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import { handkarte, kartenname } from './legen_hilfen'
import { aktionen, tischMitHaenden } from './zugablauf_hilfen'

export { kartenname as art, schlangenNamen as arten, schlangenKarten as ids } from './legen_hilfen'

/*
Hilfen für die Tests der Schlangenhäutung (E9). Wie in `zugablauf_hilfen.ts`
spielen sie nur, was die Engine aufzählt; selbst gebaut wird eine Häutung nur,
um eine unerlaubte zu zeigen. Die Schlangenhäutung gibt es nur mit Erweiterung
(A7.9), deshalb baut `tisch` immer mit Erweiterung.
*/

/** Eine Hand mit Schlangenhäutung an erster Stelle. */
export const HAEUTUNG: Kartenwahl[] = ['Schlangenhäutung', 'Blau', 'Rot', 'Gelb', 'Grün']

/** Ein Tisch mit Erweiterung; Spieler 1 hält eine Schlangenhäutung, die Mitspieler halten `gegner`. */
export function tisch(spielerzahl = 2, gegner: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot']): Baukasten {
  return tischMitHaenden([HAEUTUNG, ...Array.from({ length: spielerzahl - 1 }, () => gegner)], true)
}

/** Alle aufgezählten Schlangenhäutungen. */
export function haeutungen(zustand: Spielzustand): SchlangenhaeutungSpielenAktion[] {
  return ermittleAktionen(zustand).filter((aktion): aktion is SchlangenhaeutungSpielenAktion => aktion.typ === 'SchlangenhaeutungSpielen')
}

/** Die Id der ersten Schlangenhäutung auf der Hand von `spieler`. */
export function haeutungId(zustand: Spielzustand, spieler = 0): string {
  return handkarte(zustand, spieler, 'Schlangenhäutung')
}

/** Die Handkarten, die die Engine zum wirkungslosen Ablegen anbietet (D13, D25). */
export function wirkungslosAblegbar(zustand: Spielzustand): string[] {
  return aktionen(zustand, 'SonderkarteWirkungslosAblegen').flatMap((aktion) => ('karteId' in aktion ? [aktion.karteId] : []))
}

/** Die Farben, in denen die Karten einer Häutung danach liegen. */
export function farbfolge(zustand: Spielzustand, aktion: SchlangenhaeutungSpielenAktion): string[] {
  const { karten } = gepruefteSchlange(zustand, aktion.schlangenId).schlange
  return aktion.neueReihenfolge.map((id) => kartenname(karten.find((karte) => karte.id === id)!))
}

/** Die Stellen, die eine Häutung in ihrer Schlange neu ordnet, aufsteigend. */
export function stellen(zustand: Spielzustand, aktion: SchlangenhaeutungSpielenAktion): number[] {
  const { karten } = gepruefteSchlange(zustand, aktion.schlangenId).schlange
  return aktion.neueReihenfolge.map((id) => karten.findIndex((karte) => karte.id === id)).sort((a, b) => a - b)
}

/**
 * Die aufgezählte Häutung der ersten Schlangenhäutung des Spielers am Zug in
 * der `schlange`-ten Schlange von `besitzer`, die die Karten an den Stellen ab
 * `von` in die Farbfolge `nachher` bringt.
 */
export function haeutungAuf(zustand: Spielzustand, besitzer: number, von: number, nachher: string[], schlange = 0): SchlangenhaeutungSpielenAktion {
  const schlangenId = zustand.spieler[besitzer].schlangen[schlange].id
  const karteId = haeutungId(zustand, zustand.zug.spielerIndex)
  const erwartet = Array.from({ length: nachher.length }, (_, index) => von + index)
  const passend = haeutungen(zustand).filter(
    (aktion) =>
      aktion.karteId === karteId &&
      aktion.schlangenId === schlangenId &&
      stellen(zustand, aktion).join() === erwartet.join() &&
      farbfolge(zustand, aktion).join() === nachher.join(),
  )
  expect(passend, `Häutung der Stellen ${erwartet.join(', ')} in ${schlangenId} zu ${nachher.join(', ')} ist nicht aufgezählt`).toHaveLength(1)
  return passend[0]
}

/** Eine Häutung, wie sie ein Aufrufer selbst bauen könnte, um eine unerlaubte zu zeigen. */
export function selbstGebaut(zustand: Spielzustand, schlangenId: string, neueReihenfolge: string[]): SpielAktion {
  return { typ: 'SchlangenhaeutungSpielen', spielerId: zustand.spieler[zustand.zug.spielerIndex].id, karteId: haeutungId(zustand, zustand.zug.spielerIndex), schlangenId, neueReihenfolge }
}

/** Die Gruppenpunkte von `spieler` nach A11. */
export function gruppenpunkte(zustand: Spielzustand, spieler: number): number {
  return berechneEndwertung(zustand).spieler[spieler].gruppenPunkte
}
