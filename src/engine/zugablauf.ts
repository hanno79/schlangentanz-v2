import type { Aktionstyp, Ereignis, Kartenort, SonderkarteWirkungslosAblegenAktion } from './aktionen/typen';
import { HANDKARTEN } from './constants';
import { alleKartenorte, istVerdeckt } from './kartenorte';
import type { Spieler, Spielkarte, Spielzustand, Zug } from './types';

/*
Der Zugablauf (A5, A6, A7.6, A7.8, A10): Karten des Zuges zählen, Zug beenden,
Auffüllen, überzählige Karten abwerfen, nach einem Verdoppler den zweiten Zug
beginnen, den Zug weitergeben, bis wieder jemand entscheiden muss, und
Schlangengruben ohne verbleibenden Zug ablegen (D29). Die Aktionsschicht (`aktionen/`) prüft vorher, ob eine
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

type GespielteKarte = { typ: Aktionstyp; spielerId: string; karteId: string };

/**
 * Eine Handkarte wird gespielt, mit oder ohne Wirkung: Sie zählt zum laufenden
 * Zug (A5, D12, D13). Liefert die Karte; sie liegt danach noch auf der Hand.
 */
export function zaehleGespielteKarte(zustand: Spielzustand, aktion: GespielteKarte): Spielkarte {
  const karte = zustand.spieler.find((spieler) => spieler.id === aktion.spielerId)?.hand.find((handkarte) => handkarte.id === aktion.karteId);
  if (karte === undefined) throw new Error(`Die Karte ${aktion.karteId} liegt nicht auf der Hand von ${aktion.spielerId}.`);
  if (karte.typ === 'Farbkarte') zustand.zug.gespielteFarbkarten += 1;
  else zustand.zug.gespielteSonderkarten += 1;
  return karte;
}

/** Die Stelle des Spielers mit dieser Id in `spieler`, -1, wenn es ihn nicht gibt. */
export function spielerIndexVon(zustand: Spielzustand, spielerId: string): number {
  return zustand.spieler.findIndex((spieler) => spieler.id === spielerId);
}

/** Meldet die gespielte Karte, nachdem sie hingelegt ist, mit dem Ort, an dem sie jetzt liegt (Plan E2, Kriterium 11). */
export function meldeGespielteKarte(zustand: Spielzustand, aktion: GespielteKarte, ereignisse: Ereignis[]): void {
  const spielerIndex = spielerIndexVon(zustand, aktion.spielerId);
  ereignisse.push({ typ: 'KarteGespielt', spielerIndex, karteId: aktion.karteId, aktion: aktion.typ, nach: findeKartenort(zustand, aktion.karteId) });
}

/** Wo eine gespielte Karte liegt, ausserhalb der Hände und des Nachziehstapels. Gesucht wird im Zustand, deshalb gilt es für jede Kartenwirkung. */
export function findeKartenort(zustand: Spielzustand, karteId: string): Kartenort {
  const ort = alleKartenorte(zustand).get(karteId);
  if (ort === undefined || istVerdeckt(ort)) {
    throw new Error(`Die gespielte Karte ${karteId} liegt an keinem Ort, den ein Ereignis nennen kann.`);
  }
  return ort;
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

/** A6: Eine gespielte Sonderkarte kommt aus der Hand auf den Ablagestapel dessen, der sie gespielt hat. */
export function legeAufEigenenAblagestapel(zustand: Spielzustand, spielerId: string, karteId: string): void {
  const karte = entnehmeHandkarte(zustand, spielerId, karteId);
  zustand.spieler.find((spieler) => spieler.id === spielerId)!.ablagestapel.push(karte);
}

/** D13, D25: Die Sonderkarte kommt ohne Wirkung auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges. */
export function legeWirkungslosAb(zustand: Spielzustand, aktion: SonderkarteWirkungslosAblegenAktion, ereignisse: Ereignis[]): void {
  zaehleGespielteKarte(zustand, aktion);
  legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId);
  meldeGespielteKarte(zustand, aktion, ereignisse);
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
 * sonst geht es weiter (`schliesseZugAb`).
 */
export function beendeZug(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  const { spielerIndex } = zustand.zug;
  fuelleHandAuf(zustand, spielerIndex, ereignisse);
  const anzahl = ueberzaehligeKarten(zustand.spieler[spielerIndex]);
  if (anzahl > 0) {
    zustand.zug.abschnitt = 'Abwerfen';
    ereignisse.push({ typ: 'AbwerfenVerlangt', spielerIndex, anzahl });
    return;
  }
  schliesseZugAb(zustand, ereignisse);
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
  schliesseZugAb(zustand, ereignisse);
}

/**
 * Nach einem ersten Zug mit Verdoppler spielt derselbe Spieler sofort einen
 * zweiten Zug, der wie ein normaler Zug abläuft (A7.8); aufgefüllt hat er beim
 * Beenden schon. Nach dem zweiten Zug folgt kein weiterer (D11), sondern der
 * Nächste ist dran.
 */
function schliesseZugAb(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  const { spielerIndex, teilzug, verdopplerGespielt } = zustand.zug;
  if (teilzug === 1 && verdopplerGespielt) {
    beginneZug(zustand, spielerIndex, 2, ereignisse);
    return;
  }
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
      // Der Zug bleibt beim Spieler, der zuletzt gespielt hat; am Zug ist niemand mehr (`ermittleEntscheider`).
      zustand.partiephase = 'Beendet';
      ereignisse.push({ typ: 'PartieBeendet' });
      return;
    }
    const grube = zustand.ausliegendeGruben.findIndex((eintrag) => eintrag.vor === naechster);
    if (grube < 0) break;
    const [ausgesessen] = zustand.ausliegendeGruben.splice(grube, 1);
    zustand.spieler[ausgesessen.gespieltVon].ablagestapel.push(ausgesessen.karte);
    ereignisse.push({ typ: 'Ausgesetzt', spielerIndex: naechster, karteId: ausgesessen.karte.id, ablagestapelVon: ausgesessen.gespieltVon });
  }
  beginneZug(zustand, naechster, 1, ereignisse);
  fuelleHandAuf(zustand, naechster, ereignisse);
}

/** Die Mitspieler von `spielerIndex` im Uhrzeigersinn, beginnend mit seinem linken Nachbarn (A5, A6). */
export function mitspielerImUhrzeigersinn(zustand: Spielzustand, spielerIndex: number): number[] {
  const anzahl = zustand.spieler.length;
  return Array.from({ length: anzahl - 1 }, (_, schritt) => (spielerIndex + 1 + schritt) % anzahl);
}

/**
 * A10, D21: Kommt der letzte Zug dieses Spielers in der Schlussrunde noch? Ja für
 * jeden, der nach dem Spieler am Zug und vor dem Auslöser sitzt; ist der Auslöser
 * selbst am Zug, für alle anderen. Nach Spielende für niemanden.
 */
function hatNochLetztenZug(zustand: Spielzustand, spielerIndex: number): boolean {
  const { partiephase, schlussrundeAusloeser: ausloeser, zug } = zustand;
  if (partiephase === 'Beendet' || ausloeser === null) return false;
  const anzahl = zustand.spieler.length;
  // Abstand im Uhrzeigersinn ab dem Spieler am Zug; er selbst und der Auslöser am Zug zählen als ganze Runde.
  const abstand = (index: number) => (index - zug.spielerIndex + anzahl) % anzahl || anzahl;
  return spielerIndex !== zug.spielerIndex && abstand(spielerIndex) < abstand(ausloeser);
}

/**
 * D29: Jede Schlangengrube kostet den Spieler, vor dem sie liegt, einen eigenen
 * Zug (D14); solange die Partie läuft, hat er dafür genug. Hat er für sie keinen
 * Zug mehr, weil die Schlussrunde läuft und sein letzter Zug vorbei oder schon
 * von einer früheren Grube belegt ist, oder weil die Partie beendet ist, kommt
 * sie ohne Wirkung auf den Ablagestapel dessen, der sie gespielt hat (A6).
 */
export function legeGrubenOhneZugAb(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  if (zustand.partiephase === 'Laufend' || zustand.ausliegendeGruben.length === 0) return;
  const belegt = new Set<number>();
  zustand.ausliegendeGruben = zustand.ausliegendeGruben.filter((grube) => {
    if (!belegt.has(grube.vor) && hatNochLetztenZug(zustand, grube.vor)) {
      belegt.add(grube.vor);
      return true;
    }
    zustand.spieler[grube.gespieltVon].ablagestapel.push(grube.karte);
    ereignisse.push({ typ: 'GrubeOhneWirkung', spielerIndex: grube.vor, karteId: grube.karte.id, ablagestapelVon: grube.gespieltVon });
    return false;
  });
}

/** Setzt den frischen Zug und meldet ihn, damit Zustand und Ereignis denselben Teilzug nennen. */
function beginneZug(zustand: Spielzustand, spielerIndex: number, teilzug: 1 | 2, ereignisse: Ereignis[]): void {
  zustand.zug = neuerZug(spielerIndex, teilzug);
  ereignisse.push({ typ: 'ZugBegonnen', spielerIndex, teilzug });
}
