import type { KartenAktion } from '../aktionen/typen';
import type { Kartenart } from '../types';
import type { KartenDefinition } from './register';

/**
 * Eine Karte, deren Regeln ein späterer Task umsetzt: kein mögliches Ziel, jede
 * Aktion mit ihr wird abgelehnt, und der Grund nennt den Task.
 */
export function platzhalter<A extends KartenAktion>(art: Kartenart, aktionstyp: A['typ'] | null, task: string): KartenDefinition<A> {
  const grund = `${art} ist noch nicht umgesetzt (kommt mit ${task}).`;
  return {
    art,
    aktionstyp,
    ziele: () => [],
    pruefe: () => grund,
    betroffene: () => [],
    wirke: () => {
      throw new Error(grund);
    },
  };
}
