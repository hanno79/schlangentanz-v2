import type { Spielkarte } from '../../engine';
import type { Sicht } from '../sicht';
import { wertschluessel } from './bewertung';

/*
Der Folgeschlüssel der Zugsuche (Plan K2): was nach einer ersten Karte am Tisch
liegt, ohne Ids. Varianten, die denselben Tisch ergeben (ein Farbendieb, der
dieselbe Farbe an benachbarte Stellen derselben Reihe legt, oder eine von drei
gleichen Farbkarten an dasselbe Ende), sind derselbe Zug und werden nur einmal
vertieft (Prüfprotokoll K2, Iteration 3, Mangel 1).

Seit X3 führt der Zug die gespielten Karten mit Id (`verwendet`) und
Zusatzaktionen, die nur für bestimmte Karten gelten können (D43). Der Schlüssel
beschreibt beides ohne Ids: je belegtem Platz die Art der Karte und für welche
Zusatzaktion sie in Frage kam, je Zusatzaktion, für welche Handkarten sie noch
gilt (Prüfprotokoll X3, Iteration 1, Mangel 1).
*/

function kartenart(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? karte.farbe : karte.name;
}

/** Der Zug ohne Karten-Ids. */
function zugschluessel(sicht: Sicht): string {
  const { verwendet, zusatzaktionen, ...uebrig } = sicht.zug;
  const giltFuer = (nurKarten: string[] | null, karteId: string | null) => nurKarten === null || (karteId !== null && nurKarten.includes(karteId));
  const belegt = verwendet.map((eintrag) => JSON.stringify([eintrag.art, eintrag.kartenart, zusatzaktionen.map((zusatz) => giltFuer(zusatz.nurKarten, eintrag.karteId))])).sort();
  const frei = zusatzaktionen.map(({ quelle, erlaubt, nurKarten }) => [
    quelle,
    erlaubt,
    nurKarten === null ? null : sicht.hand.filter((karte) => nurKarten.includes(karte.id)).map(kartenart).sort(),
  ]);
  return JSON.stringify([uebrig, belegt, frei]);
}

/** Was nach einer ersten Karte am Tisch liegt, ohne Ids: Schlangen aller Spieler, die eigene Hand (Farben und Namen), ausliegende Gruben und der Zug. */
export function folgeschluessel(sicht: Sicht): string {
  const schlangen = sicht.spieler.map((spieler) => wertschluessel(spieler.schlangen)).join('/');
  const hand = sicht.hand.map(kartenart).sort().join(',');
  const gruben = sicht.ausliegendeGruben.map((grube) => grube.vor).join(',');
  return `${schlangen}#${hand}#${gruben}#${zugschluessel(sicht)}`;
}
