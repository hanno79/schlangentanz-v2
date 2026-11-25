import { HANDKARTEN } from '../../engine';
import type { AufgabenkarteInfo } from '../../engine';
import type { Sicht, SpielerSicht } from '../sicht';

/*
Was die Erweiterung zur Bewertung der soliden KI beiträgt (Plan K4). Ohne
Erweiterung ist jeder Beitrag 0, und die Bewertung bleibt, wie sie war.

- Aufgaben: Die erfüllten offenen Aufgaben jedes Spielers liegen offen vor ihm
  (A9) und zählen ihre Punkte, die eigene geheime, sobald sie erfüllt ist (D35).
  Fremde geheime Aufgaben sieht niemand (B2); sie zählen nicht.
- Auslage: Eine unbenutzte Comeback-Karte und jede Risiko-Karte sind etwas wert,
  solange sie sich noch einsetzen lassen (A8.1, A8.2, D55). Wer sie einsetzt, gibt
  diesen Wert her; so nutzt die KI sie nur, wenn die Bewertung dadurch steigt
  (Kriterium 2).
- Aufgaben in der Zugsuche: Was der Spieler in einer Stellung erfüllt, aber noch nicht
  eingelöst hat, etwa „Farbenpracht“ vor dem Zugende (D59), zählt mit
  (`Stellung.erfuellbar`). Löst die Simulation eine Aufgabe ein, deckt die Engine die
  nächste vom erratenen Aufgabenstapel auf; was dann noch eingelöst wird, ist geraten
  und zählt nicht (`aufgabenkorrektur`).
- Hand: Mehr als 5 Handkarten bleiben am Ende des eigenen Zuges nicht liegen; der
  Spieler wirft die überzähligen ab (A5, A8.2). Von einer grösseren Hand zählen
  deshalb nur die fünf wertvollsten Karten. Ohne Erweiterung hat niemand mehr als 5.
- Auffüllen: Weniger als 5 Handkarten füllt der Spieler am Ende seines Zuges vom Stapel
  auf (A5); jede fehlende Karte zählt so viel wie eine unbekannte. Erst damit lässt sich
  vergleichen, ob es sich lohnt, zusätzlich zu ziehen (Risiko-Karte, Korb, Comeback)
  oder Karten auszuspielen, die das Auffüllen ohnehin ersetzt. Im Basis-Spiel ändert
  keine Aktion die Hand ausser dem Ausspielen; dort bleibt die Bewertung, wie sie war.
*/

/** Eine Comeback-Karte, die noch nicht eingesetzt ist (A8.1). */
const COMEBACK_HALTEN = 1;
/** Eine Risiko-Karte, die noch in der Auslage liegt (A8.2). */
const RISIKOKARTE_HALTEN = 0.6;

/** Die Punkte der erfüllten Aufgaben, die die Sicht von diesem Spieler zeigt (A9, D35). */
export function aufgabenpunkteVon(sicht: Sicht, index: number): number {
  const offene = punkte(sicht.spieler[index].erfuellteAufgaben);
  const geheime = index === sicht.ich && sicht.geheimeAufgabeErfuellt && sicht.geheimeAufgabe !== null ? sicht.geheimeAufgabe.punkte : 0;
  return offene + geheime;
}

/** Was die Auslage eines Spielers noch wert ist; `ausblick` sagt, wie sehr seine Zukunft zählt. Risiko-Karten gehen nur, solange die Partie läuft (D55). */
export function auslagewert(sicht: Sicht, index: number, ausblick: number): number {
  const { comeback, risikoKarten } = sicht.spieler[index];
  const comebackWert = comeback !== null && !comeback.verbraucht ? COMEBACK_HALTEN * ausblick : 0;
  const risikoWert = sicht.partiephase === 'Laufend' ? RISIKOKARTE_HALTEN * risikoKarten.length * ausblick : 0;
  return comebackWert + risikoWert;
}

/** Was das Auffüllen am Zugende bringt (A5): je fehlende Karte `kartenwert`, soweit der Stapel reicht und noch Züge kommen. */
export function auffuellwert(sicht: Sicht, ausblick: number, kartenwert: number): number {
  const fehlend = Math.min(Math.max(0, HANDKARTEN - sicht.hand.length), sicht.nachziehstapelGroesse);
  return ausblick > 0 ? fehlend * kartenwert : 0;
}

/** Die Summe der Haltewerte einer Hand; von mehr als 5 Karten zählen die fünf wertvollsten (A5). */
export function handsumme<T>(hand: readonly T[], wertVon: (karte: T) => number): number {
  if (hand.length <= HANDKARTEN) return hand.reduce((summe, karte) => summe + wertVon(karte), 0);
  return hand
    .map(wertVon)
    .sort((a, b) => b - a)
    .slice(0, HANDKARTEN)
    .reduce((summe, wert) => summe + wert, 0);
}

function punkte(aufgaben: readonly AufgabenkarteInfo[]): number {
  return aufgaben.reduce((summe, aufgabe) => summe + aufgabe.punkte, 0);
}

/**
 * Was zur Bewertung einer Stellung der Zugsuche hinzukommt: die bekannten Aufgaben, die
 * der Spieler dort erfüllt und noch nicht hat, abzüglich der eingelösten, die die
 * Simulation erst vom erratenen Aufgabenstapel aufgedeckt hat.
 */
export function aufgabenkorrektur(eigen: SpielerSicht, erfuellbar: readonly AufgabenkarteInfo[], bekannt: ReadonlySet<string>): number {
  return punkte(erfuellbar.filter((aufgabe) => bekannt.has(aufgabe.id))) - geratenePunkte(eigen, bekannt);
}

/** Die Punkte eingelöster Aufgaben, die die Simulation erst vom erratenen Aufgabenstapel aufgedeckt hat; sie zählen nirgends. */
export function geratenePunkte(eigen: SpielerSicht, bekannt: ReadonlySet<string>): number {
  return punkte(eigen.erfuellteAufgaben.filter((aufgabe) => !bekannt.has(aufgabe.id)));
}
