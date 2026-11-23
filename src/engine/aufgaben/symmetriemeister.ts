import { aufgabenGlieder } from '../jokerGruppen';
import type { AufgabenGlied } from '../jokerGruppen';
import type { AufgabenDefinition } from './definition';

/*
A9 Nr. 13 „Symmetriemeister“: „Habe eine Schlange mit min. 8 Karten, bei der
die erste Hälfte das Spiegelbild der zweiten ist.“ Die ganze Schlange liest sich
von hinten wie von vorn. Bei ungerader Kartenzahl ist die mittlere Karte die
Achse und gehört zu keiner Hälfte (D39). Eine Farbenfusion ist eine Karte, die
Karten darunter zählen nicht einzeln (A9).

Ein Joker zählt als die Farbe seines Gegenstücks auf der anderen Seite (A9,
D39); jeder Joker hat genau eines. Liegt eine andere Sonderkarte in der
Schlange, auch als Achse, ist die Aufgabe nicht erfüllt (D39).
*/

const MINDEST_KARTEN = 8;

function istSpiegelbild(glieder: readonly AufgabenGlied[]): boolean {
  if (glieder.length < MINDEST_KARTEN || glieder.includes('Sonderkarte')) return false;
  for (let vorn = 0, hinten = glieder.length - 1; vorn < hinten; vorn++, hinten--) {
    const links = glieder[vorn];
    const rechts = glieder[hinten];
    if (links !== rechts && links !== 'Joker' && rechts !== 'Joker') return false;
  }
  return true;
}

export const symmetriemeister: AufgabenDefinition = {
  name: 'Symmetriemeister',
  istErfuellt: (zustand, spielerIndex) => zustand.spieler[spielerIndex].schlangen.some((schlange) => istSpiegelbild(aufgabenGlieder(schlange))),
};
