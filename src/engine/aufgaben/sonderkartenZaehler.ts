import { neueDreiergruppen } from '../jokerGruppen';
import type { Sonderkartenname, SonderkarteInfo, Spieler, Spielkarte, Spielzustand } from '../types';

/*
Was die Aufgaben über Sonderkarten zählen (A9 Nr. 8 bis 10 und 12).

In den Schlangen zählt jede Sonderkarte, die dort liegt, gleich wer sie gelegt
hat („Habe … in deinen Schlangen“); eine Farbenfusion ist eine Sonderkarte, die
zwei Karten darunter sind Farbkarten (A9 „Wichtig für Sonderkarten“, A7.7).

Ausgespielt ist jede Sonderkarte, die der Spieler aus der Hand gespielt hat,
auch ein Farbenschutz zur Abwehr, eine wirkungslos abgelegte und eine
abgewehrte (D36). Gemerkt wird das beim Ausspielen, also schon, solange die
Karte angesagt ist.

Für „Schlangentanz“ zählt nur eine Häutung, die der Spieler selbst in einer
eigenen Schlange spielt, und beide Gruppen kommen aus derselben Häutung (D37).
Festgehalten wird deshalb je Spieler die höchste Zahl neuer Dreiergruppen
einer einzelnen solchen Häutung, nicht die Summe.

Beides führt die Engine nur mit Erweiterung, denn nur dann gibt es Aufgaben
(D34); ohne sie bleibt eine Partie, wie sie war.
*/

/** Die Sonderkarten in den Schlangen des Spielers; eine Farbenfusion ist eine Karte. */
export function sonderkartenInSchlangen(spieler: Readonly<Spieler>): SonderkarteInfo[] {
  return spieler.schlangen.flatMap((schlange) => schlange.karten.filter((karte): karte is SonderkarteInfo => karte.typ === 'Sonderkarte'));
}

/** D36: Der Spieler hat diese Sonderkarte aus der Hand gespielt. */
export function merkeAusgespielteSonderkarte(zustand: Spielzustand, spieler: Spieler, name: Sonderkartenname): void {
  if (zustand.erweiterung) spieler.ausgespielteSonderkarten.push(name);
}

/**
 * D37: Spieler `spielerIndex` hat in der Schlange von `besitzer` gehäutet; die
 * Karten lagen vorher wie `vorher` und liegen jetzt wie `nachher`.
 */
export function merkeHaeutung(zustand: Spielzustand, spielerIndex: number, besitzer: number, vorher: readonly Spielkarte[], nachher: readonly Spielkarte[]): void {
  if (!zustand.erweiterung || spielerIndex !== besitzer) return;
  const spieler = zustand.spieler[spielerIndex];
  spieler.schlangenhaeutungDreiergruppen = Math.max(spieler.schlangenhaeutungDreiergruppen, neueDreiergruppen(vorher, nachher));
}
