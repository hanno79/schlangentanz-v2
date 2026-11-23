import type { AufgabenDefinition } from './definition';

const MINDEST_ARTEN = 5;

/** A9 Nr. 10 „Schlangenrepertoire“: Spiele min. 5 versch. Arten von Sonderkarten aus (D36). Was in den Schlangen liegt, zählt nicht. */
export const schlangenrepertoire: AufgabenDefinition = {
  name: 'Schlangenrepertoire',
  istErfuellt: (zustand, spielerIndex) => new Set(zustand.spieler[spielerIndex].ausgespielteSonderkarten).size >= MINDEST_ARTEN,
};
