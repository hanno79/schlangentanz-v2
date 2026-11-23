import type { AbwerfenUndZiehenAktion, Ereignis } from './aktionen/typen';
import { zieheVomStapel } from './stapel';
import type { Spieler, Spielzustand } from './types';
import { legeHandkartenAb } from './zugablauf';
import { zaehleZusatzaktion, zusatzaktionGrenze } from './zuggrenzen';

/*
Die Zusatzaktion „Zwei Karten abwerfen und drei neue vom Nachziehstapel
ziehen“ (A8.1). Sie gehört zu den zwei zusätzlichen Aktionen der Comeback-Karte
und des Schlangenkorbs (D46) und belegt einen ihrer Plätze, ohne als Karte des
Zuges zu zählen (A8.1, `zuggrenzen.ts`). Nach D49 ist sie mit weniger als zwei
Handkarten nicht wählbar, ebenso in der Schlussrunde, weil nichts gezogen
werden kann; zweimal in einem Zug ist erlaubt. Liegen weniger als drei Karten
im Stapel, zieht der Spieler, was da ist; wer so die letzte Karte zieht, spielt
seinen Zug zu Ende (D57), die Schlussrunde beginnt die Aktionsschicht.
*/

/** Der Name der Zusatzaktion in den Plätzen des Zuges (`Zusatzaktion.erlaubt`). */
export const ABWERFEN_UND_ZIEHEN = 'Zwei Karten abwerfen, drei ziehen';

const ABWERFEN = 2;
const ZIEHEN = 3;

/** D49, D46: der Grund, warum die Zusatzaktion für diesen Spieler gerade nicht wählbar ist, gleich mit welchen Karten, oder `null`. */
function gesperrt(zustand: Spielzustand, spieler: Spieler): string | null {
  if (zustand.partiephase !== 'Laufend') return `In der Schlussrunde ist „${ABWERFEN_UND_ZIEHEN}“ nicht wählbar, weil nichts gezogen werden kann (D49).`;
  if (spieler.hand.length < ABWERFEN) return `${spieler.name} hält weniger als zwei Handkarten; „${ABWERFEN_UND_ZIEHEN}“ ist nicht wählbar (D49).`;
  return zusatzaktionGrenze(zustand.zug, ABWERFEN_UND_ZIEHEN);
}

/** Jedes Paar aus zwei Handkarten, in der Reihenfolge der Hand, wenn die Zusatzaktion wählbar ist. */
export function abwerfenUndZiehenAktionen(zustand: Spielzustand, spielerIndex: number): AbwerfenUndZiehenAktion[] {
  // Ohne Zusatzaktion, also fast immer, gibt es nichts aufzuzählen; die Aufzählung prüft das in jedem Schritt zuerst.
  if (zustand.zug.zusatzaktionen.length === 0) return [];
  const spieler = zustand.spieler[spielerIndex];
  if (gesperrt(zustand, spieler) !== null) return [];
  const ids = spieler.hand.map((karte) => karte.id);
  return ids.flatMap((erste, index) => ids.slice(index + 1).map((zweite): AbwerfenUndZiehenAktion => ({ typ: 'AbwerfenUndZiehen', spielerId: spieler.id, karteIds: [erste, zweite] })));
}

/** Der Grund, warum die Aktion nicht geht, oder `null`. Dass der Spieler am Zug ist, prüft die Aktionsschicht. */
export function pruefeAbwerfenUndZiehen(zustand: Spielzustand, spielerIndex: number, aktion: AbwerfenUndZiehenAktion): string | null {
  const spieler = zustand.spieler[spielerIndex];
  const grund = gesperrt(zustand, spieler);
  if (grund !== null) return grund;
  const [erste, zweite] = aktion.karteIds;
  if (erste === zweite) return `Abgeworfen werden zwei verschiedene Handkarten; ${erste} ist doppelt genannt (A8.1).`;
  const fremd = aktion.karteIds.find((id) => !spieler.hand.some((karte) => karte.id === id));
  return fremd === undefined ? null : `Die Karte ${fremd} liegt nicht auf der Hand von ${spieler.name}.`;
}

/** A8.1: Die zwei Karten kommen auf den eigenen Ablagestapel, dann zieht der Spieler bis zu drei; die Aktion belegt eine Zusatzaktion. */
export function werfeAbUndZiehe(zustand: Spielzustand, aktion: AbwerfenUndZiehenAktion, ereignisse: Ereignis[]): void {
  const { spielerIndex } = zustand.zug;
  zaehleZusatzaktion(zustand.zug, ABWERFEN_UND_ZIEHEN);
  legeHandkartenAb(zustand, spielerIndex, aktion.karteIds, ereignisse);
  const anzahl = zieheVomStapel(zustand, spielerIndex, ZIEHEN);
  if (anzahl > 0) ereignisse.push({ typ: 'KartenGezogen', spielerIndex, anzahl });
}
