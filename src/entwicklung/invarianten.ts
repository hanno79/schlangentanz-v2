import { berechneSpielzustandGesamtwertung, deserialisiere, pruefeInvarianten as engineInvarianten, serialisiere } from '../engine'
import type { InvariantenBefund, Spielzustand } from '../engine'

export type Invariante = InvariantenBefund

/*
Die Invarianten der Engine (`engine/invarianten.ts`) und dazu zwei Proben, die
nur am Tisch Sinn ergeben: Die Engine kann den Zustand werten und speichern. Die
beiden fangen den Fehler der Engine und machen ihn zum Befund; der Tisch soll
einen kaputten Zustand zeigen, nicht an ihm sterben.
*/
export function pruefeInvarianten(zustand: Spielzustand): Invariante[] {
  return [
    ...engineInvarianten(zustand),
    gelingt('Die Wertung lässt sich berechnen', () => {
      berechneSpielzustandGesamtwertung(zustand)
      return []
    }),
    gelingt('Der Spielstand übersteht Speichern und Laden unverändert', () => {
      const gespeichert = serialisiere(zustand)
      return serialisiere(deserialisiere(gespeichert)) === gespeichert ? [] : ['Nach dem Laden weicht der Zustand ab.']
    }),
  ]
}

function gelingt(name: string, pruefe: () => string[]): Invariante {
  try {
    const probleme = pruefe()
    return { name, verletzt: probleme.length > 0, detail: probleme.join(' ') }
  } catch (fehler) {
    return { name, verletzt: true, detail: `Die Engine wirft: ${fehlertext(fehler)}` }
  }
}

/** Text eines gefangenen Fehlers; ein geworfener Nicht-Error-Wert bleibt als Text sichtbar. */
export function fehlertext(fehler: unknown): string {
  return fehler instanceof Error ? fehler.message : String(fehler)
}
