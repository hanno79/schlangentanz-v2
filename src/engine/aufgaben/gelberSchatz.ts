import { laengsteReihe } from '../jokerGruppen';
import type { Farbe } from '../types';
import type { AufgabenDefinition } from './definition';

/**
 * Eine Aufgabe, die in einer eigenen Schlange eine Reihe aus mindestens
 * `mindestens` nebeneinanderliegenden Karten der Farbe `farbe` verlangt. Joker
 * zählen als diese Farbe, eine Farbenfusion als eine Karte (D41); jede andere
 * Sonderkarte unterbricht die Reihe (A9). Auch für „Lila Riese“.
 */
export function reihenaufgabe(name: string, farbe: Farbe, mindestens: number): AufgabenDefinition {
  return {
    name,
    istErfuellt: (zustand, spielerIndex) => zustand.spieler[spielerIndex].schlangen.some((schlange) => laengsteReihe(schlange, farbe) >= mindestens),
  };
}

/** A9 Nr. 14 „Gelber Schatz“: eine Gruppe aus mindestens 6 gelben Karten; Joker zählen als Gelb (D41). */
export const gelberSchatz = reihenaufgabe('Gelber Schatz', 'Gelb', 6);
