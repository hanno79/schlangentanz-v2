import type { Bildkarte } from '../kartenbilder'
import { kartenkurzname, kartenname } from '../kartentexte'
import { AUFGABEN_HILFE } from './aufgaben'
import { FARBKARTEN_HILFE } from './farbkarten'
import { SONDERKARTEN_HILFE } from './sonderkarten'
import type { Kartenhilfe } from './typen'
import { ZUSATZKARTEN_HILFE } from './zusatzkarten'

export type { Ergaenzung, Hilfeabschnitt, Kartenhilfe, Kartenreihe, Textbaustein } from './typen'
export { AUFGABEN_HILFE, FARBKARTEN_HILFE, SONDERKARTEN_HILFE, ZUSATZKARTEN_HILFE }

/** Der Text jeder Kartenart: 6 Farbkarten, 10 Sonderkarten, Comeback, Risiko-Belohnung, 15 Aufgaben. */
export const KARTENHILFEN: readonly Kartenhilfe[] = [
  ...FARBKARTEN_HILFE,
  ...SONDERKARTEN_HILFE,
  ...ZUSATZKARTEN_HILFE,
  ...AUFGABEN_HILFE,
]

/** Woran eine Kartenart erkannt wird; das Exemplar (`id`) spielt keine Rolle. */
const kartenart = (karte: Bildkarte) => `${karte.typ}:${kartenkurzname(karte)}`

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
    case 'Risiko-Belohnung':
      return kartenname(karte)
  }
}

const FUSION = /^\S+ \+ Farbenfusion \+ \S+$/

/**
 * Die Karte zu einem Namen aus einer Kartenreihe der Spielanleitung: eine Farbe
 * („Blau“), eine Sonderkarte („Schlangenblockade“) oder eine Farbenfusion mit
 * den Karten darunter („Gelb + Farbenfusion + Gelb“).
 */
export function reihenkarte(name: string): Bildkarte {
  const gesucht = FUSION.test(name) ? 'Farbenfusion' : name
  const treffer = [...FARBKARTEN_HILFE, ...SONDERKARTEN_HILFE].find(({ karte }) => kartenkurzname(karte) === gesucht)
  if (treffer === undefined) throw new Error(`Keine Karte „${name}“ für eine Kartenreihe. Name in src/ui/karten/hilfe/ prüfen.`)
  return treffer.karte
}

/** Steht unter dem Bild der Karte noch, was sie zeigt? Bei einer Farbenfusion die Karten darunter. */
export const reiheMitUnterschrift = (name: string) => FUSION.test(name)
