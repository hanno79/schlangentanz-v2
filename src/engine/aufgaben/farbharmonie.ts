import { MINDEST_FARBGRUPPEN_LAENGE } from '../constants';
import { FARBEN } from '../deck';
import { farbbestand, farbIndex, istJoker } from '../jokerGruppen';
import type { Schlange, Spielkarte } from '../types';
import type { AufgabenDefinition } from './definition';

/*
A9 Nr. 2 „Farbharmonie“: in den eigenen Schlangen mindestens eine Dreiergruppe
jeder Farbe. Eine Gruppe sind mindestens drei nebeneinanderliegende Karten einer
Farbe in einer Schlange (A11), eine längere Gruppe also auch. Jeder Joker zählt
als die Farbe, mit der die Aufgabe erfüllt ist (A9), aber nur als eine: Er
vervollständigt höchstens eine Gruppe. Drei Joker nebeneinander sind eine Gruppe
frei wählbarer Farbe, auch drei Regenbogenschlangen (D31; D32 gilt nur für den
Vielfaltbonus). Andere Sonderkarten und das Ende einer Schlange unterbrechen.

Ob es eine Belegung der Joker gibt, bei der alle sechs Farben eine Gruppe haben,
sucht ein Durchlauf über die Karten, wie `waehleJokerfarben` in `jokerGruppen.ts`,
aber nach Machbarkeit statt nach Punkten. Eine Lage ist die Farbe und Länge (bis 3)
der laufenden Gruppe und die Farben, die schon eine Gruppe haben, gepackt in eine
Zahl; gleiche Lagen werden zusammengelegt, es gibt höchstens 7 × 4 × 64.
*/

const ALLE_FARBEN = (1 << FARBEN.length) - 1;
const LAENGEN = MINDEST_FARBGRUPPEN_LAENGE + 1;
const MASKEN = ALLE_FARBEN + 1;

/** Farbe der laufenden Gruppe (`-1` ohne), ihre Länge (bis 3) und die Farben mit Gruppe als Bitmaske, in einer Zahl. */
function packe(farbe: number, laenge: number, maske: number): number {
  return ((farbe + 1) * LAENGEN + laenge) * MASKEN + maske;
}

function maskeVon(lage: number): number {
  return lage % MASKEN;
}

function unterbreche(lage: number): number {
  return packe(-1, 0, maskeVon(lage));
}

function lege(lage: number, neu: number): number {
  const maske = maskeVon(lage);
  const farbe = Math.floor(lage / MASKEN / LAENGEN) - 1;
  const laenge = farbe === neu ? Math.min(Math.floor(lage / MASKEN) % LAENGEN + 1, MINDEST_FARBGRUPPEN_LAENGE) : 1;
  return packe(neu, laenge, laenge === MINDEST_FARBGRUPPEN_LAENGE ? maske | (1 << neu) : maske);
}

/** Legt in `ziel` die Lagen nach dieser Karte ab: eine Farbkarte setzt ihre Farbe fort, ein Joker jede, jede andere Karte unterbricht. */
function nach(lage: number, karte: Spielkarte, ziel: Set<number>): void {
  if (karte.typ === 'Farbkarte') ziel.add(lege(lage, farbIndex(karte.farbe)));
  else if (istJoker(karte)) FARBEN.forEach((_, farbe) => ziel.add(lege(lage, farbe)));
  else ziel.add(unterbreche(lage));
}

/** Nötig, aber nicht hinreichend: Die Joker füllen alle Lücken bis zu drei Karten je Farbe. */
function genugKarten(schlangen: readonly Schlange[]): boolean {
  const { jeFarbe, joker } = farbbestand(schlangen);
  return jeFarbe.reduce((summe, anzahl) => summe + Math.max(0, MINDEST_FARBGRUPPEN_LAENGE - anzahl), 0) <= joker;
}

/** Gibt es eine Belegung der Joker, bei der jede der sechs Farben in diesen Schlangen eine Gruppe hat? */
function hatGruppeJederFarbe(schlangen: readonly Schlange[]): boolean {
  if (!genugKarten(schlangen)) return false;
  let lagen = new Set([packe(-1, 0, 0)]);
  for (const schlange of schlangen) {
    for (const karte of schlange.karten) {
      const neue = new Set<number>();
      for (const lage of lagen) nach(lage, karte, neue);
      lagen = neue;
    }
    lagen = new Set([...lagen].map(unterbreche));
    if ([...lagen].some((lage) => maskeVon(lage) === ALLE_FARBEN)) return true;
  }
  return false;
}

export const farbharmonie: AufgabenDefinition = {
  name: 'Farbharmonie',
  istErfuellt: (zustand, spielerIndex) => hatGruppeJederFarbe(zustand.spieler[spielerIndex].schlangen),
};
