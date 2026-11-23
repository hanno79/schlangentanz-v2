import { zugOhneIds } from '../../engine';
import type { Sicht } from '../sicht';
import { wertschluessel } from './bewertung';

/*
Der Folgeschlüssel der Zugsuche (Plan K2): was nach einer ersten Karte am Tisch
liegt, ohne Ids. Varianten, die denselben Tisch ergeben (ein Farbendieb, der
dieselbe Farbe an benachbarte Stellen derselben Reihe legt, oder eine von drei
gleichen Farbkarten an dasselbe Ende), sind derselbe Zug und werden nur einmal
vertieft (Prüfprotokoll K2, Iteration 3, Mangel 1).

Seit X3 führt der Zug die gespielten Karten mit Id und Zusatzaktionen, die nur
für bestimmte Karten gelten können (D43). Wie der Zug ohne Ids aussieht, sagt
die Engine (`zugOhneIds`), weil sie die Regel kennt, welche Karte welchen Platz
belegen kann (Prüfprotokoll X3, Iteration 1, Mangel 1).
*/

/** Was nach einer ersten Karte am Tisch liegt, ohne Ids: Schlangen aller Spieler, die eigene Hand (Farben und Namen), ausliegende Gruben und der Zug. */
export function folgeschluessel(sicht: Sicht): string {
  const schlangen = sicht.spieler.map((spieler) => wertschluessel(spieler.schlangen)).join('/');
  const hand = sicht.hand.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)).sort().join(',');
  const gruben = sicht.ausliegendeGruben.map((grube) => grube.vor).join(',');
  return `${schlangen}#${hand}#${gruben}#${zugOhneIds(sicht.zug, sicht.hand)}`;
}
