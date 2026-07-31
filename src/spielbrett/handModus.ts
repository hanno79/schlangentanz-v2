/*
Author: Claude Code (G-4)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Was bedeutet ein Klick auf eine Handkarte gerade?

Die Hand kann vier Dinge sein, und der Spieler muss auf einen Blick erkennen,
welches davon gilt. Ohne diese Unterscheidung wird derselbe Klick mal Auswahl,
mal Abwurf — das ist die Art Mehrdeutigkeit, die Spieler Karten verlieren lässt.

Die Modi schließen einander aus, und zwar nicht durch Konvention, sondern durch
die Engine:

- **abwurfPflicht** entsteht ausschließlich, wenn `ermittleLegaleAktionen` sonst
  *nichts* liefert (`legalActions.ts:1080`). Wenn also Pflichtabwurf-Aktionen da
  sind, gibt es garantiert keine Auswahl zu treffen.
- **ueberhand** gilt nur im Zugabschluss und blockiert dort alles andere: Die
  Engine wirft beim Zugende, solange die Hand über dem Limit liegt
  (`turnState.ts:1534`).
*/

import type { Spielzustand } from '../engine'

export type HandModus =
  /** KI ist am Zug — die Hand ist verdeckt und nicht bedienbar. */
  | 'verdeckt'
  /** Zugabschluss mit zu vielen Karten: n aus m wählen, dann bestätigen. */
  | 'ueberhand'
  /** Keine Aktion legal: eine Karte abwerfen — welche, entscheidet der Spieler. */
  | 'abwurfPflicht'
  /** Normalfall: eine Karte zum Ausspielen wählen. */
  | 'auswahl'

export function ermittleHandModus(
  zustand: Spielzustand,
  ueberhand: number,
  hatPflichtAbwurf: boolean,
): HandModus {
  if (zustand.spieler[zustand.aktiverSpielerIndex].steuerung === 'KI') return 'verdeckt'
  if (zustand.zugphase === 'Zugabschluss' && ueberhand > 0) return 'ueberhand'
  if (hatPflichtAbwurf) return 'abwurfPflicht'
  return 'auswahl'
}

/** Erklärt dem Spieler, was die Hand gerade von ihm will. */
export function handHinweis(modus: HandModus, ueberhand: number, gewaehlt: number): string | null {
  switch (modus) {
    case 'verdeckt':
      return null
    case 'ueberhand':
      return `${ueberhand} Karte(n) zu viel — wähle ${ueberhand} zum Abwerfen (${gewaehlt} gewählt)`
    case 'abwurfPflicht':
      return 'Keine Aktion möglich — wirf eine Karte deiner Wahl ab'
    case 'auswahl':
      return null
  }
}
