import { FARBEN } from '../deck';
import { irgendeineStrecke } from '../jokerGruppen';
import type { ReihenGlied } from '../jokerGruppen';
import type { AufgabenDefinition } from './definition';

/*
A9 Nr. 6 „Farbwechsler“: „Habe in einer Schlange mindestens 4 verschiedene
Farben, die direkt aufeinander folgen. Es müssen nicht einzelne Farben
aufeinander folgen. Es gelten auch Reihen.“ Eine Reihe gleicher Farbe zählt als
eine Farbe der Folge (X2, Kriterium 6): Blau-Blau, Rot, Gelb-Gelb, Grün sind vier
Farben direkt hintereinander, Blau, Rot, Gelb, Rot, Grün nicht. Eine andere
Sonderkarte unterbricht die Folge (A9).

Ein Joker zählt als die Farbe, mit der die Aufgabe erfüllt ist (A9): Er
verlängert eine Reihe oder beginnt eine neue in beliebiger Farbe. Statt alle
Belegungen durchzuprobieren, hält die Prüfung nach jeder Karte nur fest, welche
Farben die letzten Reihen ohne Wiederholung haben (höchstens drei, die laufende
zuletzt); gleiche Stände werden einmal weitergeführt. Die Laufzeit wächst mit
der Kartenzahl, nicht mit 6^Joker.

Ein Stand ist eine Zahl zur Basis 7 mit drei Stellen: die Einerstelle ist die
Farbe der laufenden Reihe, die nächste die der Reihe davor und so fort; eine
Farbe ist ihre Stelle in `FARBEN` plus 1, 0 heisst „keine Reihe“. Drei Stellen
genügen: Eine vierte Farbe ohne Wiederholung erfüllt die Aufgabe schon.
*/

const BASIS = FARBEN.length + 1;

/** Der Stand nach einer Karte der Farbe `farbe` (1 bis 6), oder `null`, wenn damit vier Farben ohne Wiederholung aufeinander folgen. */
function weiter(stand: number, farbe: number): number | null {
  const laufend = stand % BASIS;
  const davor = Math.floor(stand / BASIS) % BASIS;
  const zuvor = Math.floor(stand / BASIS ** 2);
  if (laufend === farbe) return stand;
  // Wiederholt die neue Reihe eine Farbe, beginnt die Folge ohne Wiederholung erst nach ihr.
  if (davor === farbe) return farbe + BASIS * laufend;
  if (zuvor === farbe) return farbe + BASIS * laufend + BASIS ** 2 * davor;
  if (zuvor !== 0) return null;
  return farbe + BASIS * stand;
}

const ALLE_FARBEN = FARBEN.map((_, index) => index + 1);

function hatWechsel(strecke: readonly ReihenGlied[]): boolean {
  let staende = new Set([0]);
  for (const glied of strecke) {
    const naechste = new Set<number>();
    const farben = glied === 'Joker' ? ALLE_FARBEN : [FARBEN.indexOf(glied) + 1];
    for (const stand of staende) {
      for (const farbe of farben) {
        const neu = weiter(stand, farbe);
        if (neu === null) return true;
        naechste.add(neu);
      }
    }
    staende = naechste;
  }
  return false;
}

export const farbwechsler: AufgabenDefinition = {
  name: 'Farbwechsler',
  istErfuellt: (zustand, spielerIndex) => irgendeineStrecke(zustand.spieler[spielerIndex].schlangen, hatWechsel),
};
