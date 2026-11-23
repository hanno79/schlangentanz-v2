import { MAX_SCHLANGEN_PRO_SPIELER } from '../constants';
import { aufgabenGlieder } from '../jokerGruppen';
import type { Schlange } from '../types';
import type { AufgabenDefinition } from './definition';

/*
A9 Nr. 5 „Vielfaltskönig“: „Habe in jeder deiner Schlangen min. 4 versch.
Farben.“ Es braucht zwei Schlangen mit je mindestens vier Farben (D38), so
viele Schlangen, wie ein Spieler haben darf (A5). Die Farben dürfen irgendwo in
der Schlange liegen.

Jeder Joker zählt als eine Farbe, die der Schlange noch fehlt (A9); die Karten
unter einer Farbenfusion zählen nicht einzeln, eine andere Sonderkarte ist
keine Farbe.
*/

const MINDEST_FARBEN = 4;

/** Die Farben der Farbkarten und je Joker eine, die noch fehlt; für den Vergleich mit 4 schadet es nicht, dass es mehr als 6 sein können. */
function farbenIn(schlange: Schlange): number {
  const glieder = aufgabenGlieder(schlange);
  const farben = new Set(glieder.filter((glied) => glied !== 'Joker' && glied !== 'Sonderkarte'));
  return farben.size + glieder.filter((glied) => glied === 'Joker').length;
}

export const vielfaltskoenig: AufgabenDefinition = {
  name: 'Vielfaltskönig',
  istErfuellt: (zustand, spielerIndex) => {
    const { schlangen } = zustand.spieler[spielerIndex];
    return schlangen.length >= MAX_SCHLANGEN_PRO_SPIELER &&schlangen.every((schlange) => farbenIn(schlange) >= MINDEST_FARBEN);
  },
};
