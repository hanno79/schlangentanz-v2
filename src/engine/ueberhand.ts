/*
Author: Claude Code
Datum: 02.08.2026
Version: 2.0
Beschreibung: Überzählige Handkarten im Zugabschluss — wie viele, und welche.

R2.5: Am Zugende darf ein Spieler höchstens `HANDKARTENLIMIT` Karten halten.
Diese beiden Fragen fielen dabei an vier Stellen getrennt an — in `turnState.ts`
selbst, in der Zustandsschicht der Oberfläche, in der KI-Automatik und noch
einmal in zwei Engine-Tests. Die Formeln sahen verschieden aus
(`hand.slice(-anzahl)` gegen `hand.slice(HANDKARTENLIMIT)`), lieferten aber
dasselbe Ergebnis.

Das ist die unangenehme Sorte Doppelung: Sie fällt nicht auf, weil nichts
kaputtgeht, und sie fällt auch dann nicht auf, wenn später eine Seite geändert
wird. Dann wirft die KI andere Karten ab als der Mensch, und niemand sieht es.

Die Datei liegt in `engine/` und nicht darüber, weil `turnState.ts` selbst einer
der Rechner war. Läge sie eine Schicht höher, müsste die Engine ihre eigene
Regel weiterhin nachrechnen — und genau eine der vier Kopien bliebe stehen.
*/

import { HANDKARTENLIMIT } from './constants';
import type { Spielzustand } from './types';

/** Wie viele Karten der aktive Spieler über dem Handkartenlimit hält. */
export function ueberhandAnzahl(zustand: Pick<Spielzustand, 'spieler' | 'aktiverSpielerIndex'>): number {
  return Math.max(0, zustand.spieler[zustand.aktiverSpielerIndex].hand.length - HANDKARTENLIMIT);
}

/**
 * Die Karten, die ohne eigene Auswahl abgeworfen würden — die zuletzt
 * gehaltenen.
 *
 * R2.5 lässt dem Menschen die Wahl; das hier ist der Rückfall für den
 * generischen Phasenknopf und für die KI-Gegner, die nicht wählen.
 */
export function ueberhandAbwurfKartenIds(
  zustand: Pick<Spielzustand, 'spieler' | 'aktiverSpielerIndex'>,
): string[] {
  const anzahl = ueberhandAnzahl(zustand);
  if (anzahl === 0) return [];
  return zustand.spieler[zustand.aktiverSpielerIndex].hand.slice(-anzahl).map((karte) => karte.id);
}
