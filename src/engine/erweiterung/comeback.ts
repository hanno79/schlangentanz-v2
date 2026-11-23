import type { ComebackEinsetzenAktion, Ereignis, SpielAktion, ZweiAbwerfenDreiZiehenAktion } from '../aktionen/typen';
import { zieheVomStapel } from '../stapel';
import type { Spieler, Spielzustand } from '../types';
import { meldeZugerweiterung, zaehleZusatzaktion, zugerweiterungGesperrt, zusatzaktionGrenze } from '../zuggrenzen';
import type { Zusatzaktion } from '../zuggrenzen';

/*
Die Comeback-Karte (A8.1, Erweiterung). Jeder Spieler hat eine offen vor sich
(A4). Liegt seine längste Schlange zu Beginn seines Zuges mindestens 5 Karten
hinter der längsten auf dem Tisch, darf er sie in diesem Zug einsetzen,
irgendwann im Zug (D48). Dafür zählt jede Karte einer Schlange eins, auch eine
Sonderkarte, und eine Farbenfusion samt ihren zwei Karten ebenso; wer keine
Schlange hat, hat die Länge 0 (D48). Die Engine stellt die Bedingung zu Beginn
des Zuges fest und hält sie im Zug fest (`zug.comebackBedingung`); was danach im
Zug geschieht, ändert sie nicht mehr.

Der Einsatz zählt nicht als reguläre Aktion (A8.1). Er meldet die
Zugerweiterung der Runde mit zwei Zusatzaktionen an, je eine Farbkarte, eine
Sonderkarte oder „Zwei Karten abwerfen, drei ziehen“, auch zweimal dieselbe
(A8.1, D46). Wo die Grenzen des Zuges stehen, sagt `zuggrenzen.ts`: Verdoppler,
Comeback und die zugerweiternden Boni des Schlangenkorbs schliessen sich aus,
deshalb gibt es im zweiten Zug nach einem Verdoppler kein Comeback (D47, D48),
und pro Zug bleibt es bei einer Farbenfusion (D46, D56). Danach ist die Karte
umgedreht und nie wieder aktivierbar (A8.1).

„Zwei Karten abwerfen, drei ziehen“ (D49): Die zwei Karten kommen auf den
eigenen Ablagestapel, dann zieht der Spieler bis zu drei; liegen weniger im
Stapel, zieht er, was da ist. Zieht er die letzte Karte, spielt er seinen Zug zu
Ende und darf dabei auch die eben gezogenen Karten spielen, danach beginnt die
Schlussrunde (A10, D57); in der Schlussrunde ist die Aktion nicht wählbar. Die
Aktion spielt keine Karte und zählt nicht als Karte des Zuges.
*/

/** A8.1, D46, D49: der Name der Zusatzaktion ohne Karte, wie er in `Zusatzaktion.erlaubt` und `Verwendung.art` steht. */
export const ZWEI_ABWERFEN_DREI_ZIEHEN = 'Zwei Karten abwerfen, drei ziehen';

/** A8.1: Um so viele Karten muss die längste eigene Schlange mindestens zurückliegen. */
const RUECKSTAND = 5;

/** D49: So viele Karten werden abgeworfen und gezogen. */
const ABWERFEN = 2;
const ZIEHEN = 3;

/** A8.1, D46: die beiden Zusatzaktionen der Comeback-Karte. */
const ZUSATZAKTION: Zusatzaktion = { quelle: 'Comeback', erlaubt: ['Farbkarte', 'Sonderkarte', ZWEI_ABWERFEN_DREI_ZIEHEN], nurKarten: null };

/** D48: die längste Schlange des Spielers; jede Karte zählt eins, eine Fusion steht schon als eine Karte da; ohne Schlange 0. */
function laengsteSchlange(spieler: Spieler): number {
  return Math.max(0, ...spieler.schlangen.map((schlange) => schlange.karten.length));
}

/**
 * A8.1, D48: Liegt die längste Schlange dieses Spielers jetzt mindestens 5
 * Karten hinter der längsten auf dem Tisch? Nur mit Erweiterung; die Engine
 * fragt es zu Beginn des Zuges (`zugablauf.ts`).
 */
export function comebackBedingungErfuellt(zustand: Spielzustand, spielerIndex: number): boolean {
  if (!zustand.erweiterung) return false;
  const amTisch = Math.max(...zustand.spieler.map(laengsteSchlange));
  return amTisch - laengsteSchlange(zustand.spieler[spielerIndex]) >= RUECKSTAND;
}

/** A8.1: Der Grund, warum der Spieler am Zug diese Comeback-Karte jetzt nicht einsetzen darf, oder `null`. */
export function pruefeComebackEinsetzen(zustand: Spielzustand, spielerIndex: number, comebackId: string): string | null {
  const spieler = zustand.spieler[spielerIndex];
  const { comeback } = spieler;
  if (comeback === null) return 'In einer Partie ohne Erweiterung gibt es keine Comeback-Karte (A4, A8.1).';
  if (comeback.karte.id !== comebackId) return `Die Karte ${comebackId} ist nicht die Comeback-Karte von ${spieler.name}; jeder setzt nur seine eigene ein (A8.1).`;
  if (comeback.verbraucht) {
    return `Die Comeback-Karte von ${spieler.name} ist schon eingesetzt und umgedreht; sie lässt sich nicht erneut aktivieren, auch wenn die Bedingung wieder erfüllt ist (A8.1).`;
  }
  const gesperrt = zugerweiterungGesperrt(zustand.zug);
  if (gesperrt !== null) return gesperrt;
  if (!zustand.zug.comebackBedingung) {
    return `Die Comeback-Karte geht nur, wenn zu Beginn des eigenen Zuges die längste eigene Schlange mindestens 5 Karten kürzer war als die längste auf dem Tisch; zu Beginn dieses Zuges war das bei ${spieler.name} nicht so (A8.1, D48).`;
  }
  return null;
}

/** A8.1: Die Karte wird umgedreht, und der Zug bekommt seine zwei Zusatzaktionen. */
export function setzeComebackEin(zustand: Spielzustand, spielerIndex: number, ereignisse: Ereignis[]): void {
  const { comeback } = zustand.spieler[spielerIndex];
  if (comeback === null) throw new Error('Ohne Comeback-Karte gibt es nichts einzusetzen (A8.1).');
  meldeZugerweiterung(zustand.zug, 'Comeback', [ZUSATZAKTION, ZUSATZAKTION]);
  comeback.verbraucht = true;
  ereignisse.push({ typ: 'ComebackEingesetzt', spielerIndex, karteId: comeback.karte.id });
}

/** D49: Der Grund, warum „Zwei Karten abwerfen, drei ziehen“ jetzt gar nicht wählbar ist, gleich mit welchen Karten, oder `null`. */
function tauschGesperrt(zustand: Spielzustand, spielerIndex: number): string | null {
  const grenze = zusatzaktionGrenze(zustand.zug, ZWEI_ABWERFEN_DREI_ZIEHEN);
  if (grenze !== null) return grenze;
  if (zustand.partiephase === 'Schlussrunde') return `„${ZWEI_ABWERFEN_DREI_ZIEHEN}“ ist in der Schlussrunde nicht wählbar: Es gibt nichts mehr zu ziehen (D49).`;
  if (zustand.spieler[spielerIndex].hand.length < ABWERFEN) {
    return `„${ZWEI_ABWERFEN_DREI_ZIEHEN}“ ist mit weniger als zwei Handkarten nicht wählbar; dann bleibt eine andere Zusatzaktion (D49).`;
  }
  return null;
}

/** D49: Der Grund, warum der Spieler am Zug genau diese zwei Karten jetzt nicht abwerfen darf, oder `null`. */
export function pruefeZweiAbwerfenDreiZiehen(zustand: Spielzustand, spielerIndex: number, karteIds: readonly string[]): string | null {
  const gesperrt = tauschGesperrt(zustand, spielerIndex);
  if (gesperrt !== null) return gesperrt;
  const spieler = zustand.spieler[spielerIndex];
  if (new Set(karteIds).size !== karteIds.length) return `Beim Abwerfen ist eine Karte doppelt genannt; „${ZWEI_ABWERFEN_DREI_ZIEHEN}“ wirft zwei verschiedene Handkarten ab (D49).`;
  const fremd = karteIds.find((id) => !spieler.hand.some((karte) => karte.id === id));
  if (fremd !== undefined) return `Die Karte ${fremd} liegt nicht auf der Hand von ${spieler.name}.`;
  return null;
}

/**
 * D49: Die zwei Karten kommen in der Reihenfolge der Hand auf den eigenen
 * Ablagestapel, damit jede Schreibweise derselben Wahl dasselbe ergibt; dann
 * zieht der Spieler bis zu drei. Ist der Stapel danach leer, beginnt die
 * Schlussrunde (`anwendeAktion`, D57).
 */
export function werfeZweiAbZieheDrei(zustand: Spielzustand, spielerIndex: number, karteIds: readonly string[], ereignisse: Ereignis[]): void {
  zaehleZusatzaktion(zustand.zug, ZWEI_ABWERFEN_DREI_ZIEHEN);
  const spieler = zustand.spieler[spielerIndex];
  const gewaehlt = new Set(karteIds);
  const abgeworfen = spieler.hand.filter((karte) => gewaehlt.has(karte.id));
  spieler.hand = spieler.hand.filter((karte) => !gewaehlt.has(karte.id));
  spieler.ablagestapel.push(...abgeworfen);
  ereignisse.push({ typ: 'KartenAbgeworfen', spielerIndex, karteIds: abgeworfen.map((karte) => karte.id) });
  const anzahl = zieheVomStapel(zustand, spielerIndex, ZIEHEN);
  if (anzahl > 0) ereignisse.push({ typ: 'KartenGezogen', spielerIndex, anzahl });
}

/** Die Aktionen der Comeback-Karte, die der Spieler am Zug jetzt hat: den Einsatz und jede Wahl von zwei Handkarten, in der Reihenfolge der Hand. */
export function comebackAktionen(zustand: Spielzustand, spielerIndex: number): SpielAktion[] {
  const spieler = zustand.spieler[spielerIndex];
  const aktionen: SpielAktion[] = [];
  if (spieler.comeback !== null && pruefeComebackEinsetzen(zustand, spielerIndex, spieler.comeback.karte.id) === null) {
    const einsetzen: ComebackEinsetzenAktion = { typ: 'ComebackEinsetzen', spielerId: spieler.id, comebackId: spieler.comeback.karte.id };
    aktionen.push(einsetzen);
  }
  if (tauschGesperrt(zustand, spielerIndex) !== null) return aktionen;
  spieler.hand.forEach((erste, stelle) => {
    for (const zweite of spieler.hand.slice(stelle + 1)) {
      const tausch: ZweiAbwerfenDreiZiehenAktion = { typ: 'ZweiAbwerfenDreiZiehen', spielerId: spieler.id, karteIds: [erste.id, zweite.id] };
      aktionen.push(tausch);
    }
  });
  return aktionen;
}
