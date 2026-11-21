import { berechneEndwertung } from '../../engine'
import type { KettenWertung, SpielerWertung, Spielzustand } from '../../engine'
import { menschIndex, schlangeAnsicht } from './tischAnsicht'
import type { Person, SchlangeAnsicht } from './tischAnsicht'

/*
Was die Wertung nach Spielende zeigt (Plan O8). Jede Zahl kommt aus der
Endwertung der Engine (A11, D22): Gruppen je Schlange, die Farbe jedes Jokers,
Vielfaltbonus, Kette, Aufgaben, Summe und Sieger. Hier wird nichts gerechnet,
nur geordnet: absteigend nach der Summe der Engine, bei Gleichstand in der
Sitzordnung, mit Platz und mit „du“ für den Menschen.

Diese Sicht steht bewusst nicht in `tischAnsicht`: Nach Spielende werden die
geheimen Aufgaben aufgedeckt (A9), während der Partie darf die Sicht des Tischs
sie nie enthalten (O3, Kriterium 6).
*/

export interface ErgebnisEintrag {
  person: Person
  /** 1 für die höchste Summe; Punktgleiche teilen sich den Platz. */
  platz: number
  /** Unter den Gewinnern der Engine (D22). */
  sieger: boolean
  /** Die Wertung der Engine, unverändert; nach Spielende gehört die Kette immer dazu. */
  wertung: SpielerWertung & { kette: KettenWertung }
  /** Die Schlangen mit den Gruppen dieser Wertung, zum Zeichnen wie am Tisch. */
  schlangen: SchlangeAnsicht[]
}

export interface ErgebnisAnsicht {
  sieger: Person[]
  hoechstePunktzahl: number
  rangliste: ErgebnisEintrag[]
  /** Dein Eintrag in der Rangliste. */
  du: ErgebnisEintrag
}

/**
 * Die Wertung nach Spielende. Wirft, solange die Partie läuft: Eine Endwertung
 * gibt es erst danach (A10, A11). Wirft auch, wenn nicht genau ein Mensch am
 * Tisch sitzt (B2) oder der Endwertung eine Kette fehlt.
 */
export function ergebnisAnsicht(zustand: Spielzustand): ErgebnisAnsicht {
  if (zustand.partiephase !== 'Beendet') {
    throw new Error(`Ergebnis: Die Partie läuft noch (Partiephase ${zustand.partiephase}); gewertet wird erst nach Spielende (A10, A11).`)
  }
  const mensch = menschIndex(zustand)
  const endwertung = berechneEndwertung(zustand)
  const eintraege = endwertung.spieler.map((wertung, index): ErgebnisEintrag => {
    const spieler = zustand.spieler[index]
    const { kette } = wertung
    if (kette === null) throw new Error(`Ergebnis: Der Endwertung von ${spieler.name} fehlt die längste Farbkette (A11).`)
    return {
      person: { name: spieler.name, ich: index === mensch },
      platz: 1 + endwertung.spieler.filter((andere) => andere.summe > wertung.summe).length,
      sieger: endwertung.gewinner.includes(wertung.spielerId),
      wertung: { ...wertung, kette },
      schlangen: spieler.schlangen.map((schlange, nummer) => schlangeAnsicht(schlange, wertung.schlangen[nummer].gruppen)),
    }
  })
  // `sort` ist stabil: Punktgleiche bleiben in der Sitzordnung.
  const rangliste = [...eintraege].sort((a, b) => a.platz - b.platz)
  return {
    sieger: eintraege.filter((eintrag) => eintrag.sieger).map((eintrag) => eintrag.person),
    hoechstePunktzahl: endwertung.hoechstePunktzahl,
    rangliste,
    du: eintraege[mensch],
  }
}
