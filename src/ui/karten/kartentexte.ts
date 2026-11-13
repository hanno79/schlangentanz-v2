import type { Bildkarte } from './kartenbilder'

/*
Wie eine Karte heisst, wenn man sie vorliest: Alt-Text des Bildes und
zugänglicher Name eines Knopfs, der eine Karte trägt. An einer Stelle, damit
dieselbe Karte überall gleich angesagt wird.
*/

export const RUECKSEITE_NAME = 'Verdeckte Karte'

export const punkteText = (punkte: number): string => (punkte === 1 ? '1 Punkt' : `${punkte} Punkte`)

export function kartenname(karte: Bildkarte): string {
  switch (karte.typ) {
    case 'Farbkarte':
      return `Farbkarte ${karte.farbe}, ${punkteText(karte.punkte)}`
    case 'Sonderkarte':
      return `Sonderkarte ${karte.name}`
    case 'Aufgabenkarte':
      return `Aufgabe ${karte.name}, ${punkteText(karte.punkte)}: ${karte.bedingung}`
    case 'Comeback':
      return 'Comeback-Karte'
    case 'Risiko-Belohnung':
      return 'Risiko-Belohnungs-Karte'
  }
}

/** Kurz, wie man die Karte im Satz nennt: „Rot“, „Farbendieb“, „Lila Riese“. */
export function kartenkurzname(karte: Bildkarte): string {
  switch (karte.typ) {
    case 'Farbkarte':
      return karte.farbe
    case 'Comeback':
    case 'Risiko-Belohnung':
      return karte.typ
    default:
      return karte.name
  }
}
