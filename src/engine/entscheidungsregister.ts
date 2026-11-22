import type { OffeneEntscheidung, Spielzustand } from './types';

/*
Das Register der Entscheidungen (X3). Eine Wirkung, die eine Wahl braucht,
verlangt eine Entscheidung (`verlangeEntscheidung` in `reaktion.ts`); was die
Wahl dann bewirkt, steht hier unter ihrer Art, so wie die Wirkung einer Karte im
Kartenregister steht. Comeback, Risiko-Belohnung und Schlangenkorb tragen ihre
Arten ein, wenn sie kommen (X4 bis X6); Tests und der Entwicklertisch tragen
Test-Entscheidungen ein (`testing/testentscheidung.ts`) und Tests danach wieder
aus.
*/

export interface EntscheidungsDefinition {
  readonly art: string;
  /**
   * Die Wirkung der Wahl. Sie darf Karten bewegen (die Engine meldet sie selbst,
   * Plan E4b) und eine weitere Entscheidung verlangen, etwa vom gewählten Gegner.
   */
  loese(zustand: Spielzustand, entscheidung: OffeneEntscheidung, wahl: string): Spielzustand;
}

export const ENTSCHEIDUNGSREGISTER = new Map<string, EntscheidungsDefinition>();

/** Die Definition dieser Art; eine unbekannte Art ist ein Fehler, keine leere Wahl. */
export function definitionDerEntscheidung(art: string): EntscheidungsDefinition {
  const definition = ENTSCHEIDUNGSREGISTER.get(art);
  if (definition === undefined) throw new Error(`Die Entscheidung „${art}“ ist unbekannt; sie steht nicht im Entscheidungsregister.`);
  return definition;
}
