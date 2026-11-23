import type { KartenAktion, SonderkarteWirkungslosAblegenAktion } from './aktionen/typen';
import type { Kartenart, Spieler, Spielkarte, Spielzustand, Zug } from './types';

/*
Die Grenzen eines Zuges, an einer Stelle (X3, Kriterium 1).

- Grundregel: je Zug mindestens eine Karte, höchstens eine Farbkarte und eine
  Sonderkarte, in beliebiger Reihenfolge (A5, D12). Das gilt in jedem Teilzug,
  auch im zweiten Zug nach einem Verdoppler (A7.8).
- Zusatzaktionen kommen obendrauf, auch mehrmals dieselbe Art (A8.1, D46). Eine
  Zusatzaktion nennt, wofür sie gilt: eine Farbkarte, eine Sonderkarte oder eine
  eigene Aktion wie „zwei abwerfen, drei ziehen“ (A8.1), wahlweise nur für
  bestimmte Karten, etwa die mit dem Korb gezogenen (D43). Erlaubt ist jede
  Folge von Karten und Aktionen, die sich so auf die Plätze des Zuges verteilen
  lässt, dass jeder Platz höchstens eine nimmt; die Reihenfolge des Spielens
  spielt keine Rolle. Eine Zusatzaktion, die keine Karte spielt, zählt nicht als
  Karte des Zuges (A8.1 „zählt nicht als reguläre Aktion“).
- Was trotzdem bleibt: je Zug nur eine Farbenfusion (A7.7, D27, D46), auch
  wenn ein Gegner die erste abgewehrt hat oder sie wirkungslos abgelegt ist (D56,
  „gespielt ist gespielt“, D13), und ein
  Verdoppler wirkt nur, solange in dieser Runde keine andere zugerweiternde
  Wirkung gilt (A7.8, D11, D46, D47). Er bleibt dann spielbar, aber nur
  wirkungslos (D23, D25).
- Je Runde gibt es höchstens eine Zugerweiterung aus Verdoppler,
  Comeback-Karte und den zugerweiternden Boni des Schlangenkorbs (D47);
  Risiko-Karten zählen nicht dazu, gehen aber selbst nur einmal je Runde (D50).
  Eine Runde ist der eigene Zug samt zweitem Zug nach einem Verdoppler (D50);
  deshalb gibt es im zweiten Zug kein Comeback (D47, D48).

Comeback, Risiko-Belohnung und Schlangenkorb melden ihre Zugerweiterung und
Zusatzaktionen hier an (X4 bis X6); die Karten selbst prüfen keine dieser
Grenzen.
*/

export type Zugerweiterung = 'Verdoppler' | 'Comeback' | 'Schlangenkorb';

const BENANNT: Readonly<Record<Zugerweiterung, string>> = {
  Verdoppler: 'der Verdoppler',
  Comeback: 'die Comeback-Karte',
  Schlangenkorb: 'ein zugerweiternder Bonus des Schlangenkorbs',
};

/** Ein zusätzlicher Platz im Zug (A8.1, A7.10, D46). */
export interface Zusatzaktion {
  /** Wer ihn gewährt hat, etwa „Comeback“. */
  quelle: string;
  /** Wofür er gilt: „Farbkarte“, „Sonderkarte“ oder der Name einer eigenen Aktion. */
  erlaubt: string[];
  /** Nur für diese Karten (D43); `null`: für jede Karte. */
  nurKarten: string[] | null;
}

/** Was in diesem Teilzug einen Platz belegt: eine gespielte Karte (`art` ist ihr Typ) oder eine eigene Aktion (ihr Name, ohne Karte). */
export interface Verwendung {
  art: string;
  karteId: string | null;
  /** Welche Karte es war, Farbkarte oder der Name der Sonderkarte; bei einer eigenen Aktion `null`. */
  kartenart: Kartenart | null;
}

/** Die Felder des Zuges, die dieser Rahmen führt. */
export interface Zugrahmen {
  /** Zusätzliche Plätze dieses Teilzugs. */
  zusatzaktionen: Zusatzaktion[];
  /** Was in diesem Teilzug gespielt oder genutzt ist, in der Reihenfolge. */
  verwendet: Verwendung[];
  /** Was in dieser Runde schon gewirkt hat und je Runde nur einmal geht (D47, D50); bleibt im zweiten Zug nach einem Verdoppler stehen. */
  runde: string[];
}

/** Ein frischer Rahmen für einen neuen Teilzug; im zweiten Zug nach einem Verdoppler läuft die Runde weiter (D50). */
export function neuerRahmen(runde: readonly string[] = []): Zugrahmen {
  return { zusatzaktionen: [], verwendet: [], runde: [...runde] };
}

/** Die Plätze des Teilzugs: eine Farbkarte, eine Sonderkarte (A5, D12) und die Zusatzaktionen. */
function plaetze(zug: Zugrahmen): Zusatzaktion[] {
  return [{ quelle: 'Zug', erlaubt: ['Farbkarte'], nurKarten: null }, { quelle: 'Zug', erlaubt: ['Sonderkarte'], nurKarten: null }, ...zug.zusatzaktionen];
}

function passt(platz: Zusatzaktion, verwendung: Verwendung): boolean {
  if (!platz.erlaubt.includes(verwendung.art)) return false;
  return platz.nurKarten === null || (verwendung.karteId !== null && platz.nurKarten.includes(verwendung.karteId));
}

/** Lässt sich jede Verwendung einem eigenen Platz zuordnen? Paarung über verlängernde Wege; die Mengen sind klein. */
function zuordenbar(platzliste: readonly Zusatzaktion[], verwendungen: readonly Verwendung[]): boolean {
  const belegtVon: Array<number | null> = platzliste.map(() => null);
  const unterbringen = (index: number, besucht: Set<number>): boolean =>
    platzliste.some((platz, stelle) => {
      if (besucht.has(stelle) || !passt(platz, verwendungen[index])) return false;
      besucht.add(stelle);
      const bisher = belegtVon[stelle];
      if (bisher !== null && !unterbringen(bisher, besucht)) return false;
      belegtVon[stelle] = index;
      return true;
    });
  return verwendungen.every((_, index) => unterbringen(index, new Set()));
}

function hatPlatz(zug: Zugrahmen, verwendung: Verwendung): boolean {
  // Ohne Zusatzaktion gibt es nur die beiden Plätze des Zuges; belegt ist einer, wenn seine Art schon gespielt ist.
  if (zug.zusatzaktionen.length === 0) return (verwendung.art === 'Farbkarte' || verwendung.art === 'Sonderkarte') && !zug.verwendet.some((eintrag) => eintrag.art === verwendung.art);
  return zuordenbar(plaetze(zug), [...zug.verwendet, verwendung]);
}

/** A5, D12, D46: Der Grund, warum diese Handkarte in diesem Teilzug keinen Platz mehr hat, oder `null`. */
export function kartengrenze(zug: Zugrahmen, karte: Spielkarte): string | null {
  if (hatPlatz(zug, { art: karte.typ, karteId: karte.id, kartenart: null })) return null;
  if (zug.zusatzaktionen.length === 0) return `In diesem Zug ist schon eine ${karte.typ} gespielt; je Zug höchstens eine Farbkarte und eine Sonderkarte (A5, D12).`;
  return `In diesem Zug ist schon eine ${karte.typ} gespielt, und keine zusätzliche Aktion ist für ${karte.id} frei (A5, D12, D46).`;
}

/** A8.1, D46: Der Grund, warum die eigene Aktion `name` in diesem Teilzug keinen Platz hat, oder `null`. */
export function zusatzaktionGrenze(zug: Zugrahmen, name: string): string | null {
  return hatPlatz(zug, { art: name, karteId: null, kartenart: null }) ? null : `Für „${name}“ ist in diesem Zug keine zusätzliche Aktion frei (A8.1, D46).`;
}

/** A8.1: Die eigene Aktion `name` belegt einen Platz; sie zählt nicht als Karte des Zuges. Ohne Platz ein Fehler. */
export function zaehleZusatzaktion(zug: Zugrahmen, name: string): void {
  const grund = zusatzaktionGrenze(zug, name);
  if (grund !== null) throw new Error(grund);
  zug.verwendet.push({ art: name, karteId: null, kartenart: null });
}

type GespielteKarte = KartenAktion | SonderkarteWirkungslosAblegenAktion;

/**
 * Eine Handkarte wird gespielt, mit oder ohne Wirkung: Sie belegt einen Platz
 * im Teilzug (A5, D12, D13). Liefert die Karte; sie liegt danach noch auf der
 * Hand. Ob sie Platz hat, hat die Aktionsschicht vorher geprüft.
 */
export function zaehleGespielteKarte(zustand: Spielzustand, aktion: GespielteKarte): Spielkarte {
  const karte = zustand.spieler.find((spieler) => spieler.id === aktion.spielerId)?.hand.find((handkarte) => handkarte.id === aktion.karteId);
  if (karte === undefined) throw new Error(`Die Karte ${aktion.karteId} liegt nicht auf der Hand von ${aktion.spielerId}.`);
  const { zug } = zustand;
  zug.verwendet.push({ art: karte.typ, karteId: karte.id, kartenart: karte.typ === 'Farbkarte' ? 'Farbkarte' : karte.name });
  if (karte.typ === 'Farbkarte') zug.gespielteFarbkarten += 1;
  else zug.gespielteSonderkarten += 1;
  return karte;
}

/**
 * Für Szenarien und Zufallszustände: Der Teilzug zählt zusätzlich so viele schon
 * gespielte Karten, ohne dass eine Karte bewegt wird. Sie stehen mit erfundener
 * Id im Rahmen, damit Zähler und Rahmen übereinstimmen (`zaehlerPassen`).
 */
export function zaehleSchonGespielt(zug: Zug, farbkarten: number, sonderkarten: number): void {
  const gezaehlt = (art: 'Farbkarte' | 'Sonderkarte', anzahl: number): Verwendung[] =>
    Array.from({ length: anzahl }, (_, nummer) => ({ art, karteId: `gespielt-${art}-${zug.verwendet.length + nummer + 1}`, kartenart: null }));
  zug.verwendet.push(...gezaehlt('Farbkarte', farbkarten));
  zug.verwendet.push(...gezaehlt('Sonderkarte', sonderkarten));
  zug.gespielteFarbkarten += farbkarten;
  zug.gespielteSonderkarten += sonderkarten;
}

/** A5, D12: Mindestens eine Karte je Zug; eine Zusatzaktion ohne Karte zählt nicht (A8.1). Wer keine Karte hält, darf gleich beenden. */
export function darfZugBeenden(zug: Zugrahmen, spieler: Spieler): boolean {
  return zug.verwendet.some((verwendung) => verwendung.karteId !== null) || spieler.hand.length === 0;
}

function istZugerweiterung(eintrag: string): eintrag is Zugerweiterung {
  return Object.hasOwn(BENANNT, eintrag);
}

/** Die Zugerweiterung dieser Runde (D47); im zweiten Zug nach einem Verdoppler steht dort der Verdoppler (`neuerZug`). */
function zugerweiterungDerRunde(zug: Zug): Zugerweiterung | null {
  return zug.runde.find(istZugerweiterung) ?? null;
}

/** D47: Der Grund, warum in dieser Runde keine Zugerweiterung mehr geht, oder `null`. */
export function zugerweiterungGesperrt(zug: Zug): string | null {
  const vorhanden = zugerweiterungDerRunde(zug);
  if (vorhanden === null) return null;
  return `In dieser Runde wirkt schon ${BENANNT[vorhanden]}; Verdoppler, Comeback-Karte und die zugerweiternden Boni des Schlangenkorbs schliessen sich aus (A7.8, D47).`;
}

/** D47: Meldet die Zugerweiterung dieser Runde samt ihren Zusatzaktionen an; ist schon eine da, ein Fehler. */
export function meldeZugerweiterung(zug: Zug, art: Zugerweiterung, zusatzaktionen: readonly Zusatzaktion[]): void {
  const grund = zugerweiterungGesperrt(zug);
  if (grund !== null) throw new Error(grund);
  zug.runde.push(art);
  zug.zusatzaktionen.push(...structuredClone(zusatzaktionen));
  if (art === 'Verdoppler') zug.verdopplerGespielt = true;
}

/** D50: Der Grund, warum `name` in dieser Runde nicht mehr geht, oder `null`. */
export function einmalJeRundeGesperrt(zug: Zugrahmen, name: string): string | null {
  if (!zug.runde.includes(name)) return null;
  return `„${name}“ geht je Runde nur einmal und ist in dieser Runde schon genutzt; eine Runde ist der eigene Zug samt zweitem Zug nach einem Verdoppler (D50).`;
}

/** D50: Merkt sich, dass `name` in dieser Runde genutzt ist; war es schon, ein Fehler. */
export function merkeEinmalJeRunde(zug: Zugrahmen, name: string): void {
  const grund = einmalJeRundeGesperrt(zug, name);
  if (grund !== null) throw new Error(grund);
  zug.runde.push(name);
}

const NUR_EINE_FUSION = 'Pro Zug nur eine Farbenfusion (A7.7); in diesem Zug ist schon eine gespielt.';
const ZWEITER_ZUG =
  'Im zweiten Zug nach einem Verdoppler gibt ein weiterer Verdoppler keinen weiteren Zug (A7.8, D11); er lässt sich nur wirkungslos auf den eigenen Ablagestapel legen (D23).';

/**
 * Der Grund, warum diese Karte in diesem Zug keine Wirkung haben kann, oder
 * `null`. Dann hat sie kein mögliches Ziel und lässt sich wirkungslos ablegen
 * (D13, D25): die zweite Farbenfusion eines Zuges (A7.7, D27, D46, D56) und ein
 * Verdoppler neben einer anderen Zugerweiterung (A7.8, D11, D46, D47).
 */
export function wirkungsgrenze(zug: Zug, karte: Spielkarte): string | null {
  if (karte.typ !== 'Sonderkarte') return null;
  // D56: Eine Fusion ist verbraucht, sobald sie gespielt ist, auch abgewehrt oder wirkungslos abgelegt (D13).
  if (karte.name === 'Farbenfusion' && zug.verwendet.some((verwendung) => verwendung.kartenart === 'Farbenfusion')) return NUR_EINE_FUSION;
  if (karte.name !== 'Verdoppler') return null;
  if (zug.teilzug === 2) return ZWEITER_ZUG;
  const vorhanden = zugerweiterungDerRunde(zug);
  if (vorhanden === null) return null;
  return `Der Verdoppler wirkt nicht, weil in dieser Runde schon ${BENANNT[vorhanden]} wirkt; er lässt sich nicht mit anderen zugerweiternden Effekten kombinieren (A7.8, D46, D47) und nur wirkungslos auf den eigenen Ablagestapel legen (D23).`;
}

/** Die gezählten Karten passen zu den Zählern des Zuges; sonst der Befund (für die Invarianten). */
export function zaehlerPassen(zug: Zug): string | null {
  const zaehle = (art: string) => zug.verwendet.filter((verwendung) => verwendung.art === art && verwendung.karteId !== null).length;
  const farbe = zaehle('Farbkarte');
  const sonder = zaehle('Sonderkarte');
  if (farbe === zug.gespielteFarbkarten && sonder === zug.gespielteSonderkarten) return null;
  return `Der Zug zählt ${zug.gespielteFarbkarten} Farb- und ${zug.gespielteSonderkarten} Sonderkarten, verwendet sind ${farbe} und ${sonder}.`;
}

/**
 * B2: Der Zug, wie ihn `spielerIndex` sehen darf. Gilt eine Zusatzaktion nur für
 * bestimmte Karten, etwa die mit dem Korb verdeckt gezogenen (D43), nennt sie
 * keine, die auf einer fremden Hand liegt; welche es sind, sieht nur ihr Besitzer.
 */
export function zugInSicht(zustand: Spielzustand, spielerIndex: number): Zug {
  const fremd = new Set(zustand.spieler.flatMap((spieler, index) => (index === spielerIndex ? [] : spieler.hand.map((karte) => karte.id))));
  const { zug } = zustand;
  return {
    ...zug,
    zusatzaktionen: zug.zusatzaktionen.map((zusatz) => (zusatz.nurKarten === null ? zusatz : { ...zusatz, nurKarten: zusatz.nurKarten.filter((id) => !fremd.has(id)) })),
  };
}
