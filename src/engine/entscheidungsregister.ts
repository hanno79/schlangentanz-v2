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
   * Nur für eine Wahl aus der eigenen Hand des Entscheiders, etwa welche
   * Farbkarte er anlegt (A8.2, D53): Die Wahlen würden eine Handkarte verraten
   * und stehen deshalb nicht in `optionen` (B2); dort steht nur, was jeder sehen
   * darf. Ohne diese Funktion sind die Wahlen genau `optionen`.
   */
  verdeckteWahlen?(zustand: Spielzustand, entscheidung: OffeneEntscheidung): string[];
  /**
   * Die Wirkung der Wahl. Sie darf Karten bewegen (die Engine meldet sie selbst,
   * Plan E4b) und eine weitere Entscheidung verlangen, etwa vom gewählten Gegner.
   */
  loese(zustand: Spielzustand, entscheidung: OffeneEntscheidung, wahl: string): Spielzustand;
}

export const ENTSCHEIDUNGSREGISTER = new Map<string, EntscheidungsDefinition>();

function unbekannt(art: string): string {
  return `Die Entscheidung „${art}“ ist unbekannt; sie steht nicht im Entscheidungsregister.`;
}

/** Die Definition dieser Art; eine unbekannte Art ist ein Fehler, keine leere Wahl. */
export function definitionDerEntscheidung(art: string): EntscheidungsDefinition {
  const definition = ENTSCHEIDUNGSREGISTER.get(art);
  if (definition === undefined) throw new Error(unbekannt(art));
  return definition;
}

/** Was der Entscheider jetzt wählen kann: die offenen `optionen` oder die verdeckten Wahlen seiner Art. */
export function wahlenDer(zustand: Spielzustand, entscheidung: OffeneEntscheidung): readonly string[] {
  return definitionDerEntscheidung(entscheidung.art).verdeckteWahlen?.(zustand, entscheidung) ?? entscheidung.optionen;
}

/**
 * Was an einer Entscheidung nicht stimmt, gleich ob sie verlangt oder geladen
 * wird: unbekannte Art, keine Wahl, eine Option doppelt, ein Spieler ausserhalb
 * des Tisches. Leer, wenn sie gültig ist.
 */
export function befundeDerEntscheidung(entscheidung: OffeneEntscheidung, spielerzahl: number): string[] {
  const { art, optionen, entscheider, ausgeloestVon } = entscheidung;
  const befunde = ENTSCHEIDUNGSREGISTER.has(art) ? [] : [unbekannt(art)];
  if (optionen.length === 0) befunde.push(`Die Entscheidung „${art}“ ist ohne Wahl; entscheiden lässt sich nur zwischen Optionen.`);
  if (new Set(optionen).size !== optionen.length) befunde.push(`Die Entscheidung „${art}“ nennt eine Option mehrfach.`);
  for (const [index, rolle] of [[entscheider, 'Entscheider'], [ausgeloestVon, 'ausgelöst von']] as const) {
    if (!Number.isInteger(index) || index < 0 || index >= spielerzahl) befunde.push(`Die Entscheidung „${art}“ (${rolle}) verweist auf Spieler ${index}, es gibt ${spielerzahl}.`);
  }
  return befunde;
}

/** Trägt diese Arten ein: die Erweiterung beim Laden ihres Moduls (X5), Tests und der Entwicklertisch ihre Test-Entscheidungen; der Rückgabewert trägt sie wieder aus. */
export function trageEntscheidungenEin(definitionen: readonly EntscheidungsDefinition[]): () => void {
  for (const definition of definitionen) ENTSCHEIDUNGSREGISTER.set(definition.art, definition);
  return () => {
    for (const definition of definitionen) ENTSCHEIDUNGSREGISTER.delete(definition.art);
  };
}
