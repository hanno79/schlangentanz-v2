import type { KartenAktion } from '../aktionen/typen';
import type { Kartenart } from '../types';
import type { KartenDefinition } from './register';

const PLATZHALTER = new WeakSet<KartenDefinition>();

/** Ist dieser Registereintrag noch ein Platzhalter? So erkennen Tests, welche Karten umgesetzt sind, ohne Liste von Hand. */
export function istPlatzhalter(definition: KartenDefinition): boolean {
  return PLATZHALTER.has(definition);
}

/**
 * Eine Karte, deren Regeln ein späterer Task umsetzt: kein mögliches Ziel, jede
 * Aktion mit ihr wird abgelehnt, und der Grund nennt den Task.
 */
export function platzhalter<A extends KartenAktion>(art: Kartenart, aktionstyp: A['typ'] | null, task: string): KartenDefinition<A> {
  const grund = `${art} ist noch nicht umgesetzt (kommt mit ${task}).`;
  const definition: KartenDefinition<A> = {
    art,
    aktionstyp,
    ziele: () => [],
    pruefe: () => grund,
    betroffene: () => [],
    wirke: () => {
      throw new Error(grund);
    },
  };
  PLATZHALTER.add(definition);
  return definition;
}
