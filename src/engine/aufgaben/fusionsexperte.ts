import type { AufgabenDefinition } from './definition';

const MINDEST_FUSIONEN = 2;

/**
 * A9 Nr. 7 „Fusionsexperte“: Habe eine Schlange mit mindestens 2 Farbfusionen.
 * Beide liegen in derselben eigenen Schlange; welche Farbe sie hätten, spielt
 * keine Rolle.
 */
export const fusionsexperte: AufgabenDefinition = {
  name: 'Fusionsexperte',
  istErfuellt: (zustand, spielerIndex) =>
    // Je Farbenfusion in der Schlange ein Eintrag in `fusionen` (A7.7).
    zustand.spieler[spielerIndex].schlangen.some((schlange) => schlange.fusionen.length >= MINDEST_FUSIONEN),
};
