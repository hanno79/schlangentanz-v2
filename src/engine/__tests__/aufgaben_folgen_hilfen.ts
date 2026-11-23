import { expect } from 'vitest'
import { AUFGABENREGISTER } from '../aufgabenKarten'
import type { Schlangenglied } from '../testing/szenario'
import { tisch } from './wertung_hilfe'

/*
Hilfen für die Tests der Aufgaben aus X2, Paket B (Folgen und Muster):
Farbvielfalt, Vielfaltskönig, Farbwechsler, Schlangenbändiger und
Symmetriemeister. Jede Stellung kommt aus dem Szenario-Baukasten, also aus
echtem Material; geprüft wird über das Register, so wie der Rahmen die Aufgabe
findet (X1).

Eine Entscheidungstabelle (X2, Kriterium 2) nennt je Zeile, welche der
Pflichtstellungen sie belegt, die Schlangen von Spieler 1 und ob die Aufgabe
erfüllt ist.
*/

/** Die sechs Stellungen, die jede Entscheidungstabelle mindestens einmal hat (X2, Kriterium 2). */
export const PFLICHTSTELLUNGEN = ['erfüllt', 'knapp nicht', 'Regenbogenschlange', 'Farbenfusion', 'Blockade dazwischen', 'zwei Schlangen'] as const

export type Art = (typeof PFLICHTSTELLUNGEN)[number] | 'weitere'

export interface Stellung {
  art: Art
  stellung: string
  /** Die Schlangen von Spieler 1, jede als Liste ihrer Glieder. */
  schlangen: Schlangenglied[][]
  erfuellt: boolean
}

export const RB = 'Regenbogenschlange'
export const BLOCKADE = 'Schlangenblockade'

/** Ist die Aufgabe `name` für Spieler 1 mit diesen Schlangen erfüllt? */
export function istErfuellt(name: string, schlangen: Schlangenglied[][]): boolean {
  const definition = AUFGABENREGISTER.get(name)
  if (definition === undefined) throw new Error(`Testaufbau: Eine Aufgabe ${name} gibt es in A9 nicht`)
  return definition.istErfuellt(tisch(true, [schlangen]), 0)
}

/** Prüft eine Zeile der Entscheidungstabelle mit einer Meldung, die Aufgabe, Stellung und Erwartung nennt. */
export function pruefeStellung(name: string, { stellung, schlangen, erfuellt }: Stellung): void {
  expect(istErfuellt(name, schlangen), `${name}.istErfuellt bei „${stellung}“ (${JSON.stringify(schlangen)}): erwartet ${erfuellt}`).toBe(erfuellt)
}

/** Die Pflichtstellungen, die in der Tabelle fehlen. */
export function fehlendeStellungen(tabelle: readonly Stellung[]): string[] {
  return PFLICHTSTELLUNGEN.filter((art) => !tabelle.some((zeile) => zeile.art === art))
}

/** Die langsamste von `laeufe` Prüfungen in Millisekunden, nach einem Aufwärmlauf. */
export function langsamstePruefung(name: string, schlangen: Schlangenglied[][], laeufe = 50): number {
  const definition = AUFGABENREGISTER.get(name)!
  const zustand = tisch(true, [schlangen])
  definition.istErfuellt(zustand, 0)
  let langsamste = 0
  for (let lauf = 0; lauf < laeufe; lauf += 1) {
    const start = performance.now()
    definition.istErfuellt(zustand, 0)
    langsamste = Math.max(langsamste, performance.now() - start)
  }
  return langsamste
}
