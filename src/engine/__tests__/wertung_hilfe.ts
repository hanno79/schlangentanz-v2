import { berechneEndwertung } from '../index'
import type { Endwertung, SpielerWertung, Spielzustand } from '../index'
import { gibErfuellteAufgabe, legeGeheimeAufgabe } from '../testing/aufgaben'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Schlangenglied } from '../testing/szenario'

/*
Hilfen für die Wertungstests (E10). Jeder Zustand kommt aus dem Szenario-Baukasten,
also aus echtem Material, und erfüllt jede Invariante.
*/

/** Je Spieler seine Schlangen, jede als Liste ihrer Glieder. */
export type Auslage = Schlangenglied[][][]

export function tisch(erweiterung: boolean, auslage: Auslage, weiter: (bau: Baukasten) => Baukasten = (bau) => bau): Spielzustand {
  let bau = baukasten({ spielerzahl: Math.max(2, auslage.length), erweiterung })
  auslage.forEach((schlangen, spieler) => {
    for (const glieder of schlangen) bau = bau.schlange(spieler, glieder)
  })
  return weiter(bau).zustand()
}

export function endwertung(erweiterung: boolean, auslage: Auslage, weiter?: (bau: Baukasten) => Baukasten): Endwertung {
  return berechneEndwertung(tisch(erweiterung, auslage, weiter))
}

/** Die Endwertung von Spieler 1, der nur diese eine Schlange hat. */
export function eineSchlange(glieder: Schlangenglied[], erweiterung = false): SpielerWertung {
  return endwertung(erweiterung, [[glieder]]).spieler[0]
}

/** Die Farbe jedes Jokers dieses Spielers, in der Reihenfolge der Schlangen und Karten. */
export function jokerfarben(wertung: SpielerWertung): Array<string | null> {
  return wertung.schlangen.flatMap((schlange) => schlange.joker.map((joker) => joker.farbe))
}

/** Die Gruppen des Spielers als `Farbe×Länge=Punkte`, gut lesbar in einer Erwartung. */
export function gruppen(wertung: SpielerWertung): string[] {
  return wertung.schlangen.flatMap((schlange) => schlange.gruppen.map((g) => `${g.farbe}×${g.laenge}=${g.punkte}`))
}

/** Gibt Spieler `spieler` die Aufgabe `name` als erfüllte offene Aufgabe (Schnittstelle zu X1/X2). */
export function erfuellt(spieler: number, name: string): (bau: Baukasten) => Baukasten {
  return (bau) => bau.aendere((z) => gibErfuellteAufgabe(z, spieler, name))
}

/** Legt Spieler `spieler` die Aufgabe `name` als geheime Aufgabe hin, erfüllt oder nicht. */
export function geheim(spieler: number, name: string, erfuelltJa: boolean): (bau: Baukasten) => Baukasten {
  return (bau) => bau.aendere((z) => legeGeheimeAufgabe(z, spieler, name, erfuelltJa))
}

export function nacheinander(...schritte: Array<(bau: Baukasten) => Baukasten>): (bau: Baukasten) => Baukasten {
  return (bau) => schritte.reduce((b, schritt) => schritt(b), bau)
}
