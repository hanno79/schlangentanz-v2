import { FARBEN } from '../deck';
import { irgendeineStrecke } from '../jokerGruppen';
import type { ReihenGlied } from '../jokerGruppen';
import type { AufgabenDefinition } from './definition';

/*
A9 Nr. 4 „Farbvielfalt“: „Bilde eine Kette aus je einer Karte aller 6 Farben.“
Eine Kette sind Karten direkt hintereinander in einer Schlange; „je einer
Karte“ heisst: sechs Karten, von jeder Farbe genau eine. Eine andere
Sonderkarte unterbricht die Kette (A9).

Ein Joker zählt als die Farbe, die noch fehlt (A9, Beispiel; A7.3, Beispiel).
Sechs Karten nebeneinander bilden die Kette also genau dann, wenn keine Farbe
unter ihren Farbkarten doppelt vorkommt; die Joker füllen die übrigen.
*/

const KETTENLAENGE = FARBEN.length;

function hatKette(strecke: readonly ReihenGlied[]): boolean {
  for (let start = 0; start + KETTENLAENGE <= strecke.length; start++) {
    const farben = strecke.slice(start, start + KETTENLAENGE).filter((glied) => glied !== 'Joker');
    if (new Set(farben).size === farben.length) return true;
  }
  return false;
}

export const farbvielfalt: AufgabenDefinition = {
  name: 'Farbvielfalt',
  istErfuellt: (zustand, spielerIndex) => irgendeineStrecke(zustand.spieler[spielerIndex].schlangen, hatKette),
};
