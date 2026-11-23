import { farbbestand } from '../jokerGruppen';
import type { AufgabenDefinition } from './definition';

const JE_FARBE = 2;

/**
 * A9 Nr. 1 „Farbenpracht“: von jeder Farbe mindestens zwei Karten in den
 * eigenen Schlangen. D38: gezählt wird über alle vorhandenen Schlangen, eine
 * genügt. Jeder Joker ersetzt eine fehlende Karte einer beliebigen Farbe (A9).
 * „Am Ende des Spiels oder Zugs“: geprüft wird nur am Ende des eigenen Zuges,
 * der letzte Zug in der Schlussrunde ist das Ende des Spiels (Entscheid des
 * Autors vom 23.11.2026); wer sie im selben Zug wieder zerstört, bekommt sie nicht.
 */
export const farbenpracht: AufgabenDefinition = {
  name: 'Farbenpracht',
  pruefzeitpunkt: 'zugende',
  istErfuellt(zustand, spielerIndex) {
    const { jeFarbe, joker } = farbbestand(zustand.spieler[spielerIndex].schlangen);
    const fehlend = jeFarbe.reduce((summe, anzahl) => summe + Math.max(0, JE_FARBE - anzahl), 0);
    return fehlend <= joker;
  },
};
