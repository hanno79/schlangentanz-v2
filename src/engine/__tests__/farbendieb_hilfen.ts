import { expect } from 'vitest'
import type { FarbendiebSpielenAktion, Spielzustand } from '../index'
import { aktionen } from './zugablauf_hilfen'

/*
Hilfen für die Tests des Farbendiebs (E8). Wie in `zugablauf_hilfen.ts` spielen
sie nur, was die Engine aufzählt.
*/

export type Diebesziel = FarbendiebSpielenAktion['ziel']

/** Alle aufgezählten Farbendieb-Aktionen. */
export function diebstaehle(zustand: Spielzustand): FarbendiebSpielenAktion[] {
  return aktionen(zustand, 'FarbendiebSpielen').filter((aktion): aktion is FarbendiebSpielenAktion => aktion.typ === 'FarbendiebSpielen')
}

/** Die aufgezählte Aktion, die die Karte `karteId` stiehlt und nach `ziel` legt. */
export function stiehl(zustand: Spielzustand, karteId: string, ziel: Diebesziel): FarbendiebSpielenAktion {
  const passend = diebstaehle(zustand).filter((aktion) => aktion.quelle.karteId === karteId && JSON.stringify(aktion.ziel) === JSON.stringify(ziel))
  expect(passend, `FarbendiebSpielen mit ${karteId} nach ${JSON.stringify(ziel)} ist nicht aufgezählt`).toHaveLength(1)
  return passend[0]
}

/** Die Id der Karte an `stelle` in der `schlange`-ten Schlange von `spieler`. */
export function karteIn(zustand: Spielzustand, spieler: number, schlange: number, stelle: number): string {
  return zustand.spieler[spieler].schlangen[schlange].karten[stelle].id
}

/** Die Schlangen eines Spielers als Folge von Farben und Namen der Sonderkarten. */
export function schlangenVon(zustand: Spielzustand, spieler: number): string[][] {
  return zustand.spieler[spieler].schlangen.map((schlange) => schlange.karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)))
}

/** Die Id des ersten Farbendiebs auf der Hand von `spieler`. */
export function diebId(zustand: Spielzustand, spieler: number): string {
  const karte = zustand.spieler[spieler].hand.find((eintrag) => eintrag.typ === 'Sonderkarte' && eintrag.name === 'Farbendieb')
  if (karte === undefined) throw new Error(`Testaufbau: Spieler ${spieler} hält keinen Farbendieb`)
  return karte.id
}
