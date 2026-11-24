import { farbbestand } from '../jokerGruppen';
import type { AufgabenDefinition } from './definition';

const MINDESTENS = 5;

/**
 * A9 Nr. 3 „Farbkombination“: 5 oder mehr Karten der gleichen Farbe in einer
 * Schlange. D41: irgendwo in derselben Schlange, auch getrennte Gruppen zählen
 * zusammen. Jeder Joker der Schlange zählt als diese Farbe (A9).
 */
export const farbkombination: AufgabenDefinition = {
  name: 'Farbkombination',
  istErfuellt(zustand, spielerIndex) {
    return zustand.spieler[spielerIndex].schlangen.some((schlange) => {
      const { jeFarbe, joker } = farbbestand([schlange]);
      return Math.max(...jeFarbe) + joker >= MINDESTENS;
    });
  },
};
