import { MAX_SCHLANGEN_PRO_SPIELER } from '../../engine';
import type { Farbkartenziel, Spielkarte } from '../../engine';
import type { Sicht, Stellung } from '../sicht';
import { bewerte } from './bewertung';
import type { Wertungsmerker } from './bewertung';
import { folgeSicht } from './vorauswahl';
import type { Aufgabenpruefung } from './vorauswahl';

/*
Geschätzte Ausgänge für Aktionen, deren Ergebnis eine verdeckte Karte bestimmt: die
Risiko-Karten (`risiko.ts`) und das verdeckte Ziehen (`ziehen.ts`, Plan K4). Was die
Karte sein wird, weiss die KI nicht (B2, K2.7). Sie rechnet deshalb nicht auf dem einen
erratenen Zustand der Suche, dessen Karten zufällig gut oder schlecht sein können,
sondern mittelt über STICHPROBE Karten, gleichmässig über die nach Id geordneten
ungesehenen Karten verteilt (`Stellung.ungesehen`). Die Auswahl hängt so nur von der
Sicht ab und verbraucht keinen Zufall der KI, der sonst das Erraten der übrigen
Schritte verschöbe. Bewertet wird jede geschätzte Sicht wie in der Zugsuche, ohne
Simulation; jede Bewertung zählt (Kriterium 8).
*/

/** Über wie viele Karten oder Kartensätze je Ausgang gemittelt wird. */
export const STICHPROBE = 3;

export interface Schaetzrechnung {
  /** Die Wurzel der Suche: Was der Spieler nicht sieht. */
  stellung: Stellung;
  merker: Wertungsmerker;
  /** Was die Aufgaben einer geschätzten Sicht beitragen, wie in der Zugsuche. */
  aufgaben: Aufgabenpruefung;
  /** Zählt jede Bewertung (Kriterium 8). */
  zaehle: () => void;
}

/** Die Bewertung einer geschätzten Sicht, wie die Zugsuche sie rechnet; jede zählt. */
export function schaetzwert(rechnung: Schaetzrechnung): (stand: Sicht) => number {
  return (stand) => {
    rechnung.zaehle();
    return bewerte(stand, rechnung.merker) + rechnung.aufgaben(stand.spieler[stand.ich]);
  };
}

/** `anzahl` verschiedene Karten aus `karten`, gleichmässig verteilt; `versatz` zwischen 0 und 1 verschiebt die Stellen. */
export function verteilt<T>(karten: readonly T[], anzahl: number, versatz = 0.5): T[] {
  const stellen = new Set(Array.from({ length: Math.min(anzahl, karten.length) }, (_, nummer) => Math.floor(((nummer + versatz) * karten.length) / anzahl) % karten.length));
  return [...stellen].map((stelle) => karten[stelle]);
}

/** STICHPROBE Sätze von je `anzahl` Karten aus `karten`, jeder an anderen Stellen. */
export function kartensaetze<T>(karten: readonly T[], anzahl: number): T[][] {
  return Array.from({ length: STICHPROBE }, (_, nummer) => verteilt(karten, anzahl, (nummer + 0.5) / STICHPROBE));
}

export function mittel(werte: readonly number[]): number {
  return werte.reduce((summe, wert) => summe + wert, 0) / werte.length;
}

/** Die Sicht mit `dazu` auf der Hand und ohne die Karten `weg`. */
export function mitHand(sicht: Sicht, dazu: readonly Spielkarte[], weg: ReadonlySet<string> = new Set()): Sicht {
  return { ...sicht, hand: [...sicht.hand.filter((karte) => !weg.has(karte.id)), ...dazu] };
}

/** Der Eintrag mit dem höchsten Wert; bei Gleichstand der frühere, damit die Wahl nur von der Reihenfolge der Sicht abhängt. */
export function hoechster<T>(eintraege: readonly T[], wertVon: (eintrag: T) => number): T | undefined {
  return eintraege.reduce<T | undefined>((bisher, eintrag) => (bisher === undefined || wertVon(eintrag) > wertVon(bisher) ? eintrag : bisher), undefined);
}

/**
 * Die geschätzte Sicht, nachdem die Farbkarte `karte` der Hand an ihrer besten Stelle
 * liegt: an einem Ende einer eigenen Schlange oder, mit `neueSchlange`, als neue Schlange
 * (A5); `undefined` für eine Sonderkarte.
 */
export function besteAnlage(wert: (stand: Sicht) => number, stand: Sicht, karte: Spielkarte, neueSchlange: boolean): { stand: Sicht; wert: number } | undefined {
  if (karte.typ !== 'Farbkarte') return undefined;
  const eigen = stand.spieler[stand.ich];
  const ziele: Farbkartenziel[] = [
    ...eigen.schlangen.flatMap((schlange) => (['anfang', 'ende'] as const).map((seite): Farbkartenziel => ({ art: 'schlange', schlangenId: schlange.id, seite }))),
    ...(neueSchlange && eigen.schlangen.length < MAX_SCHLANGEN_PRO_SPIELER ? [{ art: 'neueSchlange' } as const] : []),
  ];
  const anlagen = ziele.map((ziel) => {
    const nachher = folgeSicht(stand, { typ: 'FarbkarteLegen', spielerId: eigen.id, karteId: karte.id, ziel });
    return { stand: nachher, wert: wert(nachher) };
  });
  return hoechster(anlagen, (anlage) => anlage.wert);
}
