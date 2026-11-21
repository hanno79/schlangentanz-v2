import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall } from '../../../engine'
import type { Spielzustand } from '../../../engine'

/*
Endstände echter Partien für die Tests der Wertung (O8): Jede Partie beginnt
mit `erstellePartie` aus fester Saat und läuft über die aufgezählten Aktionen
der Engine, mit Zufall gewählt, bis sie beendet ist. Endet eine nicht, ist das
ein Fehler und kein stilles Abschneiden.
*/

/** Sicherung gegen eine Partie, die nie endet; der Dauerlauf der Engine nimmt dieselbe Grenze. */
const HOECHSTENS_SCHRITTE = 5000

export interface Endstand {
  saat: number
  zustand: Spielzustand
}

/** Spielt die Partie aus `saat` mit Zufallszügen bis zum Ende. */
export function spieleBisZumEnde(saat: number, spielerzahl: number, erweiterung: boolean): Spielzustand {
  const wahl = erzeugeZufall(saat ^ 0x0e8d)
  let zustand = erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) })
  for (let schritt = 0; zustand.partiephase !== 'Beendet'; schritt += 1) {
    const aktionen = ermittleAktionen(zustand)
    if (aktionen.length === 0) throw new Error(`spieleBisZumEnde: Saat ${saat} zählt nach ${schritt} Schritten keine Aktion auf.`)
    if (schritt >= HOECHSTENS_SCHRITTE) throw new Error(`spieleBisZumEnde: Saat ${saat} nach ${HOECHSTENS_SCHRITTE} Schritten nicht beendet.`)
    zustand = anwendeAktion(zustand, aktionen[Math.floor(wahl() * aktionen.length)]).zustand
  }
  return zustand
}

/** `anzahl` Endstände mit Saat 1, 2, 3 …, reihum 2, 3 und 4 Spieler, abwechselnd ohne und mit Erweiterung. */
export function endstaende(anzahl: number): Endstand[] {
  return Array.from({ length: anzahl }, (_, index) => {
    const saat = index + 1
    return { saat, zustand: spieleBisZumEnde(saat, 2 + (index % 3), index % 2 === 1) }
  })
}
