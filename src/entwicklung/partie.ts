import { erstellePartie } from '../engine'
import type { Spielzustand } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'

/** Eine Partie aus Saat, Spielerzahl und Erweiterung. Gleiche Werte, gleiche Partie. */
export function starteEntwicklerPartie(saat: number, spieler: number, erweiterung: boolean): Spielzustand {
  return erstellePartie({ spielerzahl: spieler, erweiterung, zufall: erzeugeZufall(saat) })
}

/** Das höchste Bit einer 32-Bit-Saat; alle Szenarien des Tisches mischen mit kleineren Saaten. */
const EIGENER_BEREICH = 2 ** 31

/**
 * Die Saat für den Zufall der KI beim Schritt `schritt` (U5: eigene Saat, unabhängig
 * von der Partie). Gleicher Schritt, gleiche Saat, damit ein KI-Schritt wiederholbar
 * ist. Sie ist nie die Partiesaat: Mischte die KI beim Erraten mit derselben Saat
 * wie die Partie, erriete sie Stapel und Hände (P0.3d). Deshalb liegt sie im oberen
 * Bereich der 32-Bit-Saaten, in dem keine Saat eines Szenarios liegt, und weicht
 * einer Partiesaat dort aus.
 */
export function kiSaatAmTisch(schritt: number, partiesaat: number | null): number {
  const gemischt = (Math.imul((schritt + 1) ^ 0x5bd1e995, 0x9e3779b1) ^ Math.imul(partiesaat ?? 0, 0x85ebca6b)) >>> 0
  const saat = (gemischt | EIGENER_BEREICH) >>> 0
  return saat === partiesaat ? (saat ^ 1) >>> 0 : saat
}

/**
 * Die Saaten der KI-Gegner unter `/spiel?seed=` (O6): eine je Gegner, in der
 * Reihenfolge der Sitze, aus `kiSaatAmTisch` und deshalb nie die Partiesaat (U5).
 * Gleiche Partiesaat, gleiche Gegner; so lässt sich eine Partie nachspielen (Z1, K5).
 * Die Werte liegen in [0, 1), wie `erstelleGegner` sie von `Math.random` kennt.
 */
export function kiSaatquelle(partiesaat: number): () => number {
  let sitz = 0
  return () => kiSaatAmTisch(sitz++, partiesaat) / 2 ** 32
}
