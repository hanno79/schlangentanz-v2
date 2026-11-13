import { erstellePartie } from '../engine'
import type { Spielzustand } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'

/** Eine Partie aus Saat, Spielerzahl und Erweiterung. Gleiche Werte, gleiche Partie. */
export function starteEntwicklerPartie(saat: number, spieler: number, erweiterung: boolean): Spielzustand {
  return erstellePartie({ spielerzahl: spieler, erweiterung, zufall: erzeugeZufall(saat) })
}
