import type { Aktionstyp, Ereignis, SonderkarteWirkungslosAblegenAktion } from './aktionen/typen';
import { HANDKARTEN } from './constants';
import type { Spieler, Spielkarte, Spielzustand, Zug } from './types';

/*
Der Zugablauf (A5, A6, A7.6, A10): Karten des Zuges zählen, Zug beenden,
Auffüllen, überzählige Karten abwerfen und den Zug weitergeben, bis wieder
jemand entscheiden muss. Die Aktionsschicht (`aktionen/`) prüft vorher, ob eine
Aktion erlaubt ist; die Funktionen hier verändern den übergebenen Zustand, den
`anwendeAktion` vorher kopiert hat, und schreiben mit, was geschieht.

Was die einzelnen Karten bewirken, steht im Kartenregister, nicht hier.
*/

/** Ein frischer Zug ohne gespielte Karte. */
export function neuerZug(spielerIndex: number, teilzug: 1 | 2 = 1): Zug {
  return {
    spielerIndex,
    teilzug,
    gespielteFarbkarten: 0,
    gespielteSonderkarten: 0,
    verdopplerGespielt: false,
    farbenfusionGespielt: false,
    abschnitt: 'Ausspielen',
  };
}

/** A5, D12: Je Zug höchstens eine Farbkarte und eine Sonderkarte. Der Grund, warum diese Karte nicht mehr geht, oder `null`. */
export function kartengrenze(zug: Zug, karte: Spielkarte): string | null {
  const gespielt = karte.typ === 'Farbkarte' ? zug.gespielteFarbkarten : zug.gespielteSonderkarten;
  if (gespielt === 0) return null;
  return `In diesem Zug ist schon eine ${karte.typ} gespielt; je Zug höchstens eine Farbkarte und eine Sonderkarte (A5, D12).`;
}

/** A5, D12: Mindestens eine Karte je Zug; wer keine Karte hält, darf gleich beenden. */
export function darfZugBeenden(zug: Zug, spieler: Spieler): boolean {
  return zug.gespielteFarbkarten + zug.gespielteSonderkarten > 0 || spieler.hand.length === 0;
}

/**
 * Eine Handkarte wird gespielt, mit oder ohne Wirkung: Sie zählt zum laufenden
 * Zug (A5, D12, D13), und das Ereignis wird gemeldet. Liefert die Karte; sie
 * liegt danach noch auf der Hand.
 */
export function vermerkeGespielteKarte(
  zustand: Spielzustand,
  aktion: { typ: Aktionstyp; spielerId: string; karteId: string },
  ereignisse: Ereignis[],
): Spielkarte {
  const spielerIndex = zustand.spieler.findIndex((spieler) => spieler.id === aktion.spielerId);
  const karte = zustand.spieler[spielerIndex]?.hand.find((handkarte) => handkarte.id === aktion.karteId);
  if (karte === undefined) throw new Error(`Die Karte ${aktion.karteId} liegt nicht auf der Hand von ${aktion.spielerId}.`);
  if (karte.typ === 'Farbkarte') zustand.zug.gespielteFarbkarten += 1;
  else zustand.zug.gespielteSonderkarten += 1;
  ereignisse.push({ typ: 'KarteGespielt', spielerIndex, karteId: karte.id, aktion: aktion.typ });
  return karte;
}

/**
 * Nimmt eine Karte aus der Hand und gibt sie zurück. Die Kartendateien legen die
 * gespielte Karte damit dorthin, wo ihre Wirkung sie hinlegt (Schlange,
 * Ablagestapel, vor einen Mitspieler).
 */
export function entnehmeHandkarte(zustand: Spielzustand, spielerId: string, karteId: string): Spielkarte {
  const spieler = zustand.spieler.find((eintrag) => eintrag.id === spielerId);
  const index = spieler === undefined ? -1 : spieler.hand.findIndex((karte) => karte.id === karteId);
  if (spieler === undefined || index < 0) throw new Error(`Die Karte ${karteId} liegt nicht auf der Hand von ${spielerId}.`);
  return spieler.hand.splice(index, 1)[0];
}

/** D13, D25: Die Sonderkarte kommt ohne Wirkung auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges. */
export function legeWirkungslosAb(zustand: Spielzustand, aktion: SonderkarteWirkungslosAblegenAktion, ereignisse: Ereignis[]): void {
  vermerkeGespielteKarte(zustand, aktion, ereignisse);
  const karte = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
  zustand.spieler.find((spieler) => spieler.id === aktion.spielerId)!.ablagestapel.push(karte);
}

/**
 * A5: Zieht vom Nachziehstapel, bis der Spieler 5 Handkarten hat. Zieht er die
 * letzte Karte, beginnt die Schlussrunde, und er ist ihr Auslöser (A10).
 */
export function fuelleHandAuf(zustand: Spielzustand, spielerIndex: number, ereignisse: Ereignis[]): void {
  const spieler = zustand.spieler[spielerIndex];
  const gezogen = zustand.nachziehstapel.splice(0, Math.max(0, HANDKARTEN - spieler.hand.length));
  if (gezogen.length === 0) return;
  spieler.hand.push(...gezogen);
  ereignisse.push({ typ: 'KartenGezogen', spielerIndex, anzahl: gezogen.length });
  if (zustand.nachziehstapel.length === 0 && zustand.partiephase === 'Laufend') {
    zustand.partiephase = 'Schlussrunde';
    zustand.schlussrundeAusloeser = spielerIndex;
    ereignisse.push({ typ: 'SchlussrundeBegonnen', ausloeser: spielerIndex });
  }
}

/** A5: Wie viele Karten der Spieler über 5 hält. */
export function ueberzaehligeKarten(spieler: Spieler): number {
  return Math.max(0, spieler.hand.length - HANDKARTEN);
}

/**
 * A5 „Zug beenden“: auffüllen auf 5, in der Schlussrunde ohne Nachziehen (A10).
 * Hält der Spieler danach mehr als 5 Karten, wählt er, welche er ablegt;
 * sonst ist der Nächste dran.
 */
export function beendeZug(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  const { spielerIndex } = zustand.zug;
  fuelleHandAuf(zustand, spielerIndex, ereignisse);
  if (ueberzaehligeKarten(zustand.spieler[spielerIndex]) > 0) {
    zustand.zug.abschnitt = 'Abwerfen';
    return;
  }
  gibZugWeiter(zustand, ereignisse);
}

/**
 * A5: Die gewählten überzähligen Karten kommen auf den eigenen Ablagestapel,
 * dann ist der Nächste dran. Sie landen in der Reihenfolge der Hand, damit jede
 * Schreibweise derselben Wahl dasselbe ergibt wie die aufgezählte Aktion.
 */
export function werfeUeberhandAb(zustand: Spielzustand, karteIds: readonly string[], ereignisse: Ereignis[]): void {
  const { spielerIndex } = zustand.zug;
  const spieler = zustand.spieler[spielerIndex];
  const gewaehlt = new Set(karteIds);
  const abgeworfen = spieler.hand.filter((karte) => gewaehlt.has(karte.id));
  spieler.hand = spieler.hand.filter((karte) => !gewaehlt.has(karte.id));
  spieler.ablagestapel.push(...abgeworfen);
  ereignisse.push({ typ: 'KartenAbgeworfen', spielerIndex, karteIds: abgeworfen.map((karte) => karte.id) });
  gibZugWeiter(zustand, ereignisse);
}

/**
 * Gibt den Zug im Uhrzeigersinn weiter (A5), bis wieder jemand entscheiden muss:
 *
 * - Wäre in der Schlussrunde der Auslöser wieder dran, ist die Partie beendet (A10).
 * - Wer eine Schlangengrube vor sich hat, setzt aus: kein Ziehen, kein Spielen;
 *   die Grube kommt danach auf den Ablagestapel dessen, der sie gespielt hat
 *   (A7.6, A6). Jede Grube kostet einen eigenen Zug (D14); in der Schlussrunde
 *   ist es sein letzter (D21).
 * - Sonst beginnt sein Zug, und er füllt auf 5 auf (A5 „Kartenhand prüfen“).
 */
function gibZugWeiter(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  let naechster = zustand.zug.spielerIndex;
  for (;;) {
    naechster = (naechster + 1) % zustand.spieler.length;
    if (zustand.partiephase === 'Schlussrunde' && naechster === zustand.schlussrundeAusloeser) {
      zustand.partiephase = 'Beendet';
      zustand.zug = neuerZug(naechster);
      ereignisse.push({ typ: 'PartieBeendet' });
      return;
    }
    const grube = zustand.ausliegendeGruben.findIndex((eintrag) => eintrag.vor === naechster);
    if (grube < 0) break;
    const [ausgesessen] = zustand.ausliegendeGruben.splice(grube, 1);
    zustand.spieler[ausgesessen.gespieltVon].ablagestapel.push(ausgesessen.karte);
    ereignisse.push({ typ: 'Ausgesetzt', spielerIndex: naechster });
  }
  zustand.zug = neuerZug(naechster);
  ereignisse.push({ typ: 'ZugBegonnen', spielerIndex: naechster, teilzug: 1 });
  fuelleHandAuf(zustand, naechster, ereignisse);
}
