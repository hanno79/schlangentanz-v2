import type { AufgabenkarteInfo, Spielkarte } from '../../engine'

/*
Wie eine Karte heisst, wenn man sie vorliest: Alt-Text des Bildes und
zugänglicher Name eines Knopfs, der eine Karte trägt. An einer Stelle, damit
dieselbe Karte überall gleich angesagt wird.
*/

export const RUECKSEITE_NAME = 'Verdeckte Karte'

export const punkteText = (punkte: number): string => (punkte === 1 ? '1 Punkt' : `${punkte} Punkte`)

export function kartenname(karte: Spielkarte | AufgabenkarteInfo): string {
  switch (karte.typ) {
    case 'Farbkarte':
      return `Farbkarte ${karte.farbe}, ${punkteText(karte.punkte)}`
    case 'Sonderkarte':
      return `Sonderkarte ${karte.name}`
    case 'Aufgabenkarte':
      return `Aufgabe ${karte.name}, ${punkteText(karte.punkte)}: ${karte.bedingung}`
  }
}

/** Kurz, wie man die Karte im Satz nennt: „Rot“, „Farbendieb“, „Lila Riese“. */
export function kartenkurzname(karte: Spielkarte | AufgabenkarteInfo): string {
  return karte.typ === 'Farbkarte' ? karte.farbe : karte.name
}
