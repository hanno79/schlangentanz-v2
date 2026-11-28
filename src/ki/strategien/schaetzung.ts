import { MAX_SCHLANGEN_PRO_SPIELER } from '../../engine';
import type { Farbkartenziel, SpielAktion, Spielkarte } from '../../engine';
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
Schritte verschöbe. Jede gezogene Karte fehlt danach im Stapel; wer die letzte zieht,
löst die Schlussrunde aus (`nachZiehen`). Bewertet wird jede geschätzte Sicht wie in
der Zugsuche, ohne Simulation; jede Bewertung zählt (Kriterium 8).
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

/** Wo eine Karte der Hand hin darf: eine Farbkarte auch als neue Schlange (A5), eine Regenbogenschlange an jede Stelle einer eigenen Schlange (A7.3). */
export interface Anlageart {
  neueSchlange: boolean;
  regenbogen: boolean;
}

/** Die Aktionen, mit denen `karte` der Hand in eine eigene Schlange kommt (siehe `Anlageart`); sonst keine. */
function anlagen(stand: Sicht, karte: Spielkarte, art: Anlageart): SpielAktion[] {
  const eigen = stand.spieler[stand.ich];
  const spielerId = eigen.id;
  if (karte.typ === 'Sonderkarte') {
    if (!art.regenbogen || karte.name !== 'Regenbogenschlange') return [];
    return eigen.schlangen.flatMap((schlange) => Array.from({ length: schlange.karten.length + 1 }, (_, position): SpielAktion => ({ typ: 'RegenbogenschlangeLegen', spielerId, karteId: karte.id, schlangenId: schlange.id, position })));
  }
  const ziele: Farbkartenziel[] = [
    ...eigen.schlangen.flatMap((schlange) => (['anfang', 'ende'] as const).map((seite): Farbkartenziel => ({ art: 'schlange', schlangenId: schlange.id, seite }))),
    ...(art.neueSchlange && eigen.schlangen.length < MAX_SCHLANGEN_PRO_SPIELER ? [{ art: 'neueSchlange' } as const] : []),
  ];
  return ziele.map((ziel): SpielAktion => ({ typ: 'FarbkarteLegen', spielerId, karteId: karte.id, ziel }));
}

/** Die geschätzte Sicht, nachdem `karte` der Hand an ihrer besten Stelle in einer eigenen Schlange liegt (`anlagen`); `undefined`, wenn sie dort nicht hin darf. */
export function besteAnlage(wert: (stand: Sicht) => number, stand: Sicht, karte: Spielkarte, art: Anlageart): { stand: Sicht; wert: number } | undefined {
  const moeglich = anlagen(stand, karte, art).map((aktion) => {
    const nachher = folgeSicht(stand, aktion);
    return { stand: nachher, wert: wert(nachher) };
  });
  return hoechster(moeglich, (anlage) => anlage.wert);
}

/**
 * Die Sicht, nachdem der Spieler `anzahl` Karten vom Stapel gezogen oder aufgedeckt hat.
 * Zieht er die letzte, spielt er seinen Zug zu Ende, dann beginnt die Schlussrunde, in
 * der er keinen Zug mehr hat (A10, D55, D57); das Auffüllen fällt dann weg.
 */
export function nachZiehen(sicht: Sicht, anzahl: number): Sicht {
  const rest = Math.max(0, sicht.nachziehstapelGroesse - anzahl);
  if (rest > 0 || sicht.partiephase !== 'Laufend') return { ...sicht, nachziehstapelGroesse: rest };
  return { ...sicht, nachziehstapelGroesse: 0, partiephase: 'Schlussrunde', schlussrundeAusloeser: sicht.ich };
}

/** Die Sicht mit `karten` vom Stapel auf der Hand (`mitHand`, `nachZiehen`). */
export function mitGezogenen(sicht: Sicht, karten: readonly Spielkarte[], weg: ReadonlySet<string> = new Set()): Sicht {
  return nachZiehen(mitHand(sicht, karten, weg), karten.length);
}
