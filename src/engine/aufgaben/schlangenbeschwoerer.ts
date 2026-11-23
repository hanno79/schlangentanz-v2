import type { AufgabenDefinition } from './definition';
import { sonderkartenInSchlangen } from './sonderkartenZaehler';

const MINDEST_SONDERKARTEN = 4;

/** A9 Nr. 8 „Schlangenbeschwörer“: Habe min. 4 Sonderkarten in deinen Schlangen, über beide Schlangen gezählt. */
export const schlangenbeschwoerer: AufgabenDefinition = {
  name: 'Schlangenbeschwörer',
  istErfuellt: (zustand, spielerIndex) => sonderkartenInSchlangen(zustand.spieler[spielerIndex]).length >= MINDEST_SONDERKARTEN,
};
