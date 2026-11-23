import type { Ereignis } from './aktionen/typen';
import type { Spielkarte, Spielzustand } from './types';

/*
Karten mitten im Zug vom Nachziehstapel nehmen (X3): verdeckt auf eine Hand
ziehen, etwa „drei neue vom Nachziehstapel ziehen“ (A8.1), „Ziehe 3 zusätzliche
Karten“ (A7.10) oder die oberste Karte für einen begünstigten Gegner (A8.2),
und offen aufdecken, wie bei der Risikoprüfung (A8.2). Gemeldet wird beides von
der Wirkung, in der es geschieht: Was sie bewegt, meldet die Engine als
`KartenVersetzt` (Plan E4b), verdeckt gezogene Karten ohne Id (B2).

Ist der Stapel danach leer, beginnt die Schlussrunde, ausgelöst vom Spieler am
Zug, gleich wer die letzte Karte genommen hat (A10, D55). Das prüft die
Aktionsschicht nach jeder Aktion (`beginneSchlussrundeBeiLeeremStapel`).
*/

/** Zieht bis zu `anzahl` Karten verdeckt auf die Hand des Spielers; liefert, wie viele es waren. Aus leerem Stapel zieht niemand (D43, D49). */
export function zieheVomStapel(zustand: Spielzustand, spielerIndex: number, anzahl: number): number {
  const spieler = zustand.spieler[spielerIndex];
  if (spieler === undefined) throw new Error(`Spieler ${spielerIndex} gibt es nicht; ziehen kann nur ein Spieler am Tisch.`);
  const gezogen = zustand.nachziehstapel.splice(0, Math.max(0, anzahl));
  spieler.hand.push(...gezogen);
  return gezogen.length;
}

/** Deckt die oberste Karte offen auf (A8.2); sie wartet dann auf eine Entscheidung. Bei leerem Stapel `null` (D55). */
export function deckeAuf(zustand: Spielzustand): Spielkarte | null {
  const karte = zustand.nachziehstapel.shift();
  if (karte === undefined) return null;
  zustand.aufgedeckt.push(karte);
  return karte;
}

/** A10, D55: Ist der Nachziehstapel leer und die Partie läuft noch, beginnt die Schlussrunde; Auslöser ist der Spieler am Zug. */
export function beginneSchlussrundeBeiLeeremStapel(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  if (zustand.partiephase !== 'Laufend' || zustand.nachziehstapel.length > 0) return;
  zustand.partiephase = 'Schlussrunde';
  zustand.schlussrundeAusloeser = zustand.zug.spielerIndex;
  ereignisse.push({ typ: 'SchlussrundeBegonnen', ausloeser: zustand.zug.spielerIndex });
}
