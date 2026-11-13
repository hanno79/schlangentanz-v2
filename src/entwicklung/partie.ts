import { erstellePartie, ermittleAktionen } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'

/** Eine Partie aus Saat, Spielerzahl und Erweiterung. Gleiche Werte, gleiche Partie. */
export function starteEntwicklerPartie(saat: number, spieler: number, erweiterung: boolean): Spielzustand {
  return erstellePartie({ spielerzahl: spieler, erweiterung, zufall: erzeugeZufall(saat) })
}

/** Alles, was die Engine in diesem Zustand als Aktion aufzählt. Der Tisch baut nie selbst eine (U3). */
export function aufgezaehlteAktionen(zustand: Spielzustand): SpielAktion[] {
  return ermittleAktionen(zustand)
}
