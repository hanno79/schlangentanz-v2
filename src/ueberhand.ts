/*
Author: Claude Code
Datum: 02.08.2026
Version: 1.0
Beschreibung: Überzählige Handkarten im Zugabschluss — wie viele, und welche.

Diese beiden Fragen wurden an zwei Stellen getrennt beantwortet: in
`src/hooks/usePartie.ts` für den Menschen und noch einmal privat in
`src/kiZug.ts` für die Gegner. Die Formeln sahen verschieden aus
(`hand.slice(-anzahl)` gegen `hand.slice(HANDKARTENLIMIT)`), lieferten aber
dasselbe Ergebnis — bei `anzahl = length - 10` bezeichnen beide dieselben Karten.

Genau das ist die unangenehme Sorte Doppelung: Sie fällt nicht auf, weil nichts
kaputtgeht, und sie fällt auch dann nicht auf, wenn eine der beiden Seiten
irgendwann geändert wird. Dann spielt die KI nach einer anderen Regel als der
Mensch, und niemand sieht es.

Die Datei liegt bewusst unter `src/`, nicht in `hooks/`: `kiZug.ts` gehört der
Logikschicht und darf nicht aus der Hook-Schicht importieren
(engine ← Logik ← Hooks ← Ansicht, siehe `src/reaktionen.ts`).
*/

import { HANDKARTENLIMIT } from './engine'
import type { Spielzustand } from './engine'

/** Wie viele Karten der aktive Spieler über dem Handkartenlimit hält. */
export function ueberhandAnzahl(zustand: Spielzustand): number {
  return Math.max(0, zustand.spieler[zustand.aktiverSpielerIndex].hand.length - HANDKARTENLIMIT)
}

/**
 * Die Karten, die ohne eigene Auswahl abgeworfen würden — die zuletzt
 * gehaltenen.
 *
 * R2.5 lässt dem Menschen die Wahl; das hier ist der Rückfall für den
 * generischen Phasenknopf und für die KI-Gegner, die nicht wählen.
 */
export function ueberhandAbwurfKartenIds(zustand: Spielzustand): string[] {
  const anzahl = ueberhandAnzahl(zustand)
  if (anzahl === 0) return []
  return zustand.spieler[zustand.aktiverSpielerIndex].hand.slice(-anzahl).map((karte) => karte.id)
}
