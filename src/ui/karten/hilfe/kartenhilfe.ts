import type { Bildkarte } from '../kartenbilder'
import { AUFGABEN_HILFE } from './aufgaben'
import { FARBKARTEN_HILFE } from './farbkarten'
import { SONDERKARTEN_HILFE } from './sonderkarten'
import type { Kartenhilfe } from './typen'
import { ZUSATZKARTEN_HILFE } from './zusatzkarten'

export type { Hilfeabschnitt, Kartenhilfe, Textbaustein } from './typen'

/** Der Text jeder Kartenart: 6 Farbkarten, 10 Sonderkarten, Comeback, Risiko-Belohnung, 15 Aufgaben. */
export const KARTENHILFEN: readonly Kartenhilfe[] = [
  ...FARBKARTEN_HILFE,
  ...SONDERKARTEN_HILFE,
  ...ZUSATZKARTEN_HILFE,
  ...AUFGABEN_HILFE,
]

/** Woran eine Kartenart erkannt wird; das Exemplar (`id`) spielt keine Rolle. */
function kartenart(karte: Bildkarte): string {
  switch (karte.typ) {
    case 'Farbkarte':
      return `Farbkarte:${karte.farbe}`
    case 'Sonderkarte':
    case 'Aufgabenkarte':
      return `${karte.typ}:${karte.name}`
    case 'Comeback':
    case 'Risiko-Belohnung':
      return karte.typ
  }
}

const NACH_KARTENART = new Map(KARTENHILFEN.map((hilfe) => [kartenart(hilfe.karte), hilfe]))

/** Der Text zu einer Karte. Eine Karte ohne Text ist ein Fehler, kein leerer Text. */
export function kartenhilfe(karte: Bildkarte): Kartenhilfe {
  const hilfe = NACH_KARTENART.get(kartenart(karte))
  if (hilfe === undefined) {
    throw new Error(`Kein Kartentext für „${kartenart(karte)}“. Text in src/ui/karten/hilfe/ ergänzen.`)
  }
  return hilfe
}

/** Überschrift des Kartentexts: so, wie man die Karte nennt. */
export function hilfetitel(karte: Bildkarte): string {
  switch (karte.typ) {
    case 'Farbkarte':
      return `Farbkarte ${karte.farbe}`
    case 'Sonderkarte':
      return karte.name
    case 'Aufgabenkarte':
      return `Aufgabe ${karte.name}`
    case 'Comeback':
      return 'Comeback-Karte'
    case 'Risiko-Belohnung':
      return 'Risiko-Belohnungs-Karte'
  }
}
