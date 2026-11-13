import { berechneEndwertung, pruefeInvarianten as engineInvarianten } from '../engine'
import type { InvariantenBefund, Spielzustand } from '../engine'
import { fehlertext } from '../engine/form'
import { pruefeSpeichernUndLaden } from '../engine/serialization'

export { fehlertext }

/*
Die Invarianten der Engine (`engine/invarianten.ts`) und dazu zwei Proben, die
nur am Tisch Sinn ergeben: Die Engine kann den Zustand werten und speichern. Die
beiden fangen den Fehler der Engine und machen ihn zum Befund; der Tisch soll
einen kaputten Zustand zeigen, nicht an ihm sterben.
*/
export function pruefeInvarianten(zustand: Spielzustand): InvariantenBefund[] {
  return [
    ...engineInvarianten(zustand),
    gelingt('Die Wertung lässt sich berechnen', () => {
      berechneEndwertung(zustand)
      return []
    }),
    gelingt('Der Spielstand übersteht Speichern und Laden unverändert', () => pruefeSpeichernUndLaden(zustand)),
  ]
}

function gelingt(name: string, pruefe: () => string[]): InvariantenBefund {
  try {
    const probleme = pruefe()
    return { name, verletzt: probleme.length > 0, detail: probleme.join(' ') }
  } catch (fehler) {
    return { name, verletzt: true, detail: `Die Engine wirft: ${fehlertext(fehler)}` }
  }
}
