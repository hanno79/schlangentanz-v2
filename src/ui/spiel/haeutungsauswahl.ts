import type { Wahl } from './auswahl'

/*
Der Abschnitt der Schlangenhäutung (O7), wie der Mensch ihn antippt: erst eine
Karte an einem Ende, dann die am anderen. Welche Abschnitte es gibt, sagen die
Angebote der Auswahl und damit die Aktionen der Engine (U3); hier steht nur,
wo sie in der gezeigten Schlange liegen. Eine Regel steht hier keine.
*/

export type AbschnittWahl = Extract<Wahl, { art: 'abschnitt' }>

export interface AbschnittLage {
  wahl: AbschnittWahl
  /** Erste und letzte Stelle in der Schlange, ab 0. */
  von: number
  bis: number
  /** Die Karten an beiden Enden, vorn zuerst. */
  enden: readonly [string, string]
}

/**
 * Die angebotenen Abschnitte mit ihren Stellen in der Schlange, deren Karten
 * `kartenIds` von vorn nach hinten nennt. Liegt ein Abschnitt dort nicht
 * lückenlos, passen Angebote und gezeigte Schlange nicht zusammen: ein Fehler.
 */
export function abschnittsLagen(angebote: readonly Wahl[], kartenIds: readonly string[]): AbschnittLage[] {
  return angebote
    .filter((wahl): wahl is AbschnittWahl => wahl.art === 'abschnitt')
    .map((wahl) => {
      const stellen = wahl.karteIds.map((id) => kartenIds.indexOf(id))
      const von = Math.min(...stellen)
      const bis = Math.max(...stellen)
      if (stellen.includes(-1) || bis - von !== stellen.length - 1) {
        throw new Error(`Der Abschnitt ${wahl.karteIds.join(', ')} liegt nicht lückenlos in der gezeigten Schlange ${wahl.schlangenId}.`)
      }
      return { wahl, von, bis, enden: [kartenIds[von], kartenIds[bis]] as const }
    })
}

/**
 * Die Karten, die jetzt als Ende angeboten sind: ohne erstes Ende jedes Ende
 * eines Abschnitts, sonst das andere Ende jedes Abschnitts, der dort endet.
 */
export function angeboteneEnden(lagen: readonly AbschnittLage[], erstesEnde: string | null): Set<string> {
  if (erstesEnde === null) return new Set(lagen.flatMap((lage) => lage.enden))
  return new Set(lagen.flatMap(({ enden: [vorn, hinten] }) => (vorn === erstesEnde ? [hinten] : hinten === erstesEnde ? [vorn] : [])))
}

/** Der Abschnitt mit diesen beiden Enden, gleich in welcher Reihenfolge; `undefined`, wenn keiner angeboten ist. */
export function abschnittZwischen(lagen: readonly AbschnittLage[], a: string, b: string): AbschnittLage | undefined {
  return lagen.find(({ enden: [vorn, hinten] }) => (vorn === a && hinten === b) || (vorn === b && hinten === a))
}
