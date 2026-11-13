/** A2: 2–4 Spieler. */
export const SPIELER_MIN = 2;
export const SPIELER_MAX = 4;

/** B2: ein Mensch gegen 1, 2 oder 3 KI-Gegner. */
export const KI_GEGNER_MIN = SPIELER_MIN - 1;
export const KI_GEGNER_MAX = SPIELER_MAX - 1;

/** A4/A5: 5 Handkarten zu Beginn, aufgefüllt wird auf 5. */
export const HANDKARTEN = 5;

/** A5: höchstens 2 Schlangen je Spieler. */
export const MAX_SCHLANGEN_PRO_SPIELER = 2;

/** A4: 3 offene Aufgabenkarten. */
export const OFFENE_AUFGABEN = 3;

/** A11: Eine Farbgruppe hat mindestens drei Karten. */
export const MINDEST_FARBGRUPPEN_LAENGE = 3;

/**
 * Eine Lücke in einer Schlange der Länge `laenge`: `0` ist vor der ersten Karte,
 * `laenge` hinter der letzten.
 */
export function istGueltigeEinfuegePosition(wert: unknown, laenge: number): boolean {
  return Number.isInteger(wert) && (wert as number) >= 0 && (wert as number) <= laenge;
}
