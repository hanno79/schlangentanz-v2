import { berechneEndwertung, erzeugeZufall } from '../../engine'
import type { Spielzustand } from '../../engine'
import { STRATEGIEN } from '../strategien'
import type { Ki } from '../strategien/strategie'
import type { PartieOptionen } from './stellungen'
import { erstelleSolideKiK2 } from './k2stand/solideKi'

/*
Partien für die Tests von K3: die solide KI an Stelle 0 gegen die solide KI im
Stand von K2 an allen übrigen Stellen, 2 bis 4 Spieler, mit und ohne Erweiterung.
*/

/** `anzahl` Partien ab `ersteSaat`, Spielerzahl und Erweiterung im Wechsel. */
export function partienK3gegenK2(anzahl: number, ersteSaat: number): PartieOptionen[] {
  return Array.from({ length: anzahl }, (_, nummer) => ({ spielerzahl: 2 + (nummer % 3), erweiterung: nummer % 2 === 1, saat: ersteSaat + nummer }))
}

/**
 * Die KIs einer solchen Partie, jede mit eigener, aus der Partiesaat abgeleiteter Saat.
 * Die solide KI kommt aus der Registry (Importgrenze, U5); diese Datei ist kein Test.
 */
export function kisK3gegenK2({ spielerzahl, saat }: PartieOptionen): Ki[] {
  return Array.from({ length: spielerzahl }, (_, sitz) => (sitz === 0 ? STRATEGIEN.solideKi(erzeugeZufall(saat * 3 + 1)) : erstelleSolideKiK2(erzeugeZufall(saat * 5 + sitz))))
}

/** Die Punkte, die der Spieler bei Spielende jetzt hätte (A11). */
export function endpunkte(zustand: Spielzustand, sitz: number): number {
  return berechneEndwertung(zustand).spieler[sitz].summe
}
