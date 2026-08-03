// Spieler-Grenzen
export const SPIELER_MIN = 2;
export const SPIELER_MAX = 4;

// KI-Gegner-Grenzen (Einzelspieler-Modus): exakt ein Mensch-Platz weniger als Gesamtgrenzen
export const KI_GEGNER_MIN = SPIELER_MIN - 1;
export const KI_GEGNER_MAX = SPIELER_MAX - 1;

// Handkarten
export const STARTHANDKARTEN = 5;
/*
ÄNDERUNG [03.08.2026]: 10 → 5.

Die Normquelle sagt im Zugschritt c): „Wenn du mehr als **5** Karten auf der Hand
hast, lege überzählige Karten auf deinen persönlichen Ablagestapel." Eine Zehn
kommt in der ganzen Anleitung nicht vor; sie stammt vermutlich aus dem
überholten Dart-Backlog (siehe `docs/DART_BACKLOG_SOURCE.md`).

**Am Spielverlauf ändert das nichts**, weil das Limit mit beiden Zahlen nicht
greift: Man zieht auf 5 auf, und jede gespielte Karte wird nach R2.3a höchstens
wieder ausgeglichen — über 5 kommt niemand. Falsch war die *Anzeige*: Das Brett
zeigte „5/10 Karten" und damit eine Zahl ohne Regelgrundlage. Die
Überhand-Maschinerie bleibt als Absicherung bestehen, nicht weil sie im Alltag
greift.

ÄNDERUNG [03.08.2026, Codex-Review]: Hier stand zuvor, der aktive Spieler halte
am Zugende „höchstens 4" Karten. Seit R2.3a stimmt das nicht mehr — wer eine
Sonderkarte spielt, zieht sofort nach und steht wieder bei 5.
*/
export const HANDKARTENLIMIT = 5;
export const MINDESTHANDKARTEN = 5;

// Schlangen
export const MAX_SCHLANGEN_PRO_SPIELER = 2;
export const MAX_KARTEN_PRO_ZUG = 2;

// Kartenmaterial laut Spec (R1.1)
export const FARBKARTEN_GESAMT = 78;
export const SONDERKARTEN_GESAMT = 32;
export const BASIS_KARTEN_GESAMT = FARBKARTEN_GESAMT + SONDERKARTEN_GESAMT;
export const AUFGABENKARTEN_GESAMT = 14;
export const ERWEITERUNG_KARTEN = 31;
export const KARTEN_GESAMT = BASIS_KARTEN_GESAMT + ERWEITERUNG_KARTEN;

// Offene Aufgabenkarten zu Spielbeginn
export const OFFENE_AUFGABEN_START = 3;

// Farbgruppen (R3.3)
export const MINDEST_FARBGRUPPEN_LAENGE = 3;
