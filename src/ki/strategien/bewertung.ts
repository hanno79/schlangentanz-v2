import { KETTENBONUS, hatNochLetztenZug, istJoker, laengsteFarbkette, werteSchlangen } from '../../engine';
import type { Farbe, Schlange, Spielkarte } from '../../engine';
import type { Sicht, SpielerSicht } from '../sicht';

/*
Die Bewertung einer Stellung für die solide KI (Plan K2, Vorgehen): der eigene
Zwischenstand plus Aussichten, minus der stärkste Gegner. Bewertet wird allein
die Sicht des Spielers, also nur, was er am Tisch sieht.

- Zwischenstand: Farbgruppen und Vielfaltbonus, so wie die Engine sie zählt
  (`werteSchlangen`, A11). Eine Farbenfusion ist darin ein Platz und bringt die
  Summe der beiden Karten darunter (D30), eine Gruppe nur aus Regenbogenschlangen
  bringt 0 Punkte und keine Farbe für den Vielfaltbonus (D31, D32).
- Längste Farbkette: erst ab 3 Farbkarten (D24); wer die längste hat, bekommt
  den Kettenbonus, bei Gleichstand jeder (A11).
- Aussichten: Reihen an den offenen Enden der Schlangen (ein Paar ist eine
  Karte von einer Gruppe entfernt), die Karten auf der eigenen Hand und ein
  zweiter Zug nach einem Verdoppler. Wer keinen Zug mehr hat (A10), hat keine
  Aussichten mehr.
- Schlangengruben: Wer noch aussetzen muss, verliert einen Zug (A7.6), in der
  Schlussrunde seinen letzten (D21).

Die Gewichte sind Schätzungen in Punkten; sie entscheiden nur zwischen Zügen,
die die Engine erlaubt.
*/

/** Unterhalb dieses Abstands gelten zwei Bewertungen als gleich (Zugsuche und Abwehr). */
export const GLEICH = 1e-9;
/** Was eine Handkarte eines Gegners im Mittel wert ist; seine Karten sieht die KI nicht. */
const HANDKARTE_GEGNER = 0.4;
/** Ein Zug, den ein Spieler wegen einer Schlangengrube aussetzt (A7.6). */
const AUSGESETZTER_ZUG = 2;
/** Der zweite Zug nach einem Verdoppler (A7.8). */
const ZWEITER_ZUG = 2.5;
/** Wie stark die übrigen Gegner neben dem stärksten zählen. */
const UEBRIGE_GEGNER = 0.1;
/** Ein Farbenschutz schützt auch nach dem letzten eigenen Zug noch (A6, A10). */
const FARBENSCHUTZ_NACH_LETZTEM_ZUG = 0.8;
/** Jede fertige Gruppe zählt etwas über ihre Punkte hinaus: Sie steht, ein Paar muss erst noch vollendet werden. */
const FERTIGE_GRUPPE = 0.5;

/** Was die Schlangen eines Spielers wert sind, ohne Hand und Kettenbonus. */
interface Schlangenwert {
  /** Farbgruppen und Vielfaltbonus (A11, D30 bis D32). */
  punkte: number;
  gruppen: number;
  /** Aussichten an den offenen Enden. */
  aussicht: number;
  /** Die längste Kette ab 3 Farbkarten (A11, D24), 0 ohne. */
  kette: number;
}

/**
 * Der Wert gleicher Schlangen, für eine Suche gemerkt: Eine Aktion ändert meist nur
 * eine Schlange, und die Wertung der übrigen kostet sonst bei jeder Stellung neu.
 * Schlüssel sind die Schlangen ohne Ids (`wertschluessel`); die Erweiterung ist in
 * einer Suche fest. Den Schlüssel einer Liste von Schlangen, die sich nicht ändert,
 * merkt er sich ebenfalls; Sichten der Simulation ändern sich nie.
 */
export interface Wertungsmerker {
  werte: Map<string, Schlangenwert>;
  schluessel: WeakMap<readonly Schlange[], string>;
}

export function neuerMerker(): Wertungsmerker {
  return { werte: new Map(), schluessel: new WeakMap() };
}

/** Was an einer Karte für den Wert zählt: die Farbe, der Name einer Sonderkarte, bei einer Fusion die Punkte darunter (A7.7, D30). */
function wertzeichen(schlange: Schlange, karte: Spielkarte): string {
  if (karte.typ === 'Farbkarte') return karte.farbe;
  if (karte.name !== 'Farbenfusion') return karte.name;
  const unter = schlange.fusionen.find((fusion) => fusion.karteId === karte.id)?.unter ?? [];
  return `F${unter.reduce((summe, farbkarte) => summe + farbkarte.punkte, 0)}`;
}

/** Die Schlangen eines Spielers als Text, ohne Ids: Gleicher Text, gleicher Wert. */
export function wertschluessel(schlangen: readonly Schlange[]): string {
  return schlangen.map((schlange) => schlange.karten.map((karte) => wertzeichen(schlange, karte)).join(',')).join('|');
}

/** Was die Schlangen eines Spielers wert sind: Punkte wie die Wertung, fertige Gruppen, Aussichten und die längste Kette. */
function schlangenwert(schlangen: Schlange[], erweiterung: boolean, merker: Wertungsmerker): Schlangenwert {
  const schluessel = merker.schluessel.get(schlangen) ?? wertschluessel(schlangen);
  merker.schluessel.set(schlangen, schluessel);
  const bekannt = merker.werte.get(schluessel);
  if (bekannt !== undefined) return bekannt;
  const wertung = werteSchlangen(schlangen, erweiterung);
  const neu = {
    punkte: wertung.gruppenPunkte + (wertung.vielfaltBonus ?? 0),
    gruppen: wertung.schlangen.reduce((summe, schlange) => summe + schlange.gruppen.length, 0),
    aussicht: schlangen.reduce((summe, schlange) => summe + aussichtVon(schlange), 0),
    kette: laengsteFarbkette({ schlangen }),
  };
  merker.werte.set(schluessel, neu);
  return neu;
}

/** Die Punkte aus Farbgruppen und Vielfaltbonus, wie die Wertung sie zählt (A11, D30 bis D32). */
export function gruppenwert(spieler: SpielerSicht, erweiterung: boolean, merker: Wertungsmerker = neuerMerker()): number {
  return schlangenwert(spieler.schlangen, erweiterung, merker).punkte;
}

/** Die eigenen Punkte, wie die Wertung sie jetzt zählte: Farbgruppen, Vielfaltbonus und Kettenbonus (A11), ohne Aufgaben. */
export function eigenePunkte(sicht: Sicht, merker: Wertungsmerker = neuerMerker()): number {
  const kette = kettenbonus(sicht.spieler.map((spieler) => schlangenwert(spieler.schlangen, sicht.erweiterung, merker).kette))[sicht.ich];
  return gruppenwert(sicht.spieler[sicht.ich], sicht.erweiterung, merker) + kette;
}

/** Wie viele Farbgruppen der Betrachter der Sicht hat (A11). */
export function eigeneGruppen(sicht: Sicht, merker: Wertungsmerker = neuerMerker()): number {
  return schlangenwert(sicht.spieler[sicht.ich].schlangen, sicht.erweiterung, merker).gruppen;
}

/** A10: Hat der Spieler nach dem laufenden Zug noch einen Zug? Solange die Partie läuft, immer; in der Schlussrunde sagt es die Engine. */
export function hatNochZug(sicht: Sicht, spieler: number): boolean {
  return sicht.partiephase === 'Laufend' || hatNochLetztenZug(sicht, spieler);
}

/** Die Farbe der ersten Farbkarte ab `start` in Richtung `schritt`, über Joker hinweg; `null`, wenn vorher eine andere Sonderkarte oder das Ende kommt. */
function farbeAb(karten: readonly Spielkarte[], start: number, schritt: 1 | -1): Farbe | null {
  for (let stelle = start; stelle >= 0 && stelle < karten.length; stelle += schritt) {
    const karte = karten[stelle];
    if (karte.typ === 'Farbkarte') return karte.farbe;
    if (!istJoker(karte)) return null;
  }
  return null;
}

/**
 * Wie viele Karten ab `start` in Richtung `schritt` zur Farbe `farbe` passen; Joker
 * passen immer, eine andere Farbe oder Sonderkarte beendet die Reihe. Bei `null`
 * passen nur Joker.
 */
function reiheAb(karten: readonly Spielkarte[], start: number, schritt: 1 | -1, farbe: Farbe | null): number {
  let laenge = 0;
  for (let stelle = start; stelle >= 0 && stelle < karten.length; stelle += schritt) {
    const karte = karten[stelle];
    if (!(istJoker(karte) || (karte.typ === 'Farbkarte' && karte.farbe === farbe))) break;
    laenge += 1;
  }
  return laenge;
}

interface Endreihe {
  laenge: number;
  /** `null`, wenn die Reihe nur aus Jokern besteht. */
  farbe: Farbe | null;
  punkte: number;
}

/** Die Reihe gleicher Farbe an einem Ende der Schlange; Joker passen zu jeder Farbe, andere Sonderkarten beenden sie. */
function endreihe(karten: readonly Spielkarte[], vonHinten: boolean): Endreihe {
  const start = vonHinten ? karten.length - 1 : 0;
  const schritt = vonHinten ? -1 : 1;
  const farbe = farbeAb(karten, start, schritt);
  const punkte = karten.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe);
  return { laenge: reiheAb(karten, start, schritt, farbe), farbe, punkte: punkte?.typ === 'Farbkarte' ? punkte.punkte : 0 };
}

/** Was ein offenes Ende verspricht: ein Paar ist eine Karte von einer Gruppe entfernt, eine Gruppe lässt sich verlängern. */
function endwert(reihe: Endreihe): number {
  const punkte = reihe.farbe === null ? 1.5 : reihe.punkte;
  if (reihe.laenge === 0) return 0;
  if (reihe.laenge === 1) return 0.3 * punkte;
  if (reihe.laenge === 2) return 0.8 * punkte;
  return 0.4 * punkte;
}

/** Die Aussichten einer Schlange an ihren beiden Enden; eine Schlange aus einer einzigen Reihe zählt einmal. */
function aussichtVon(schlange: Schlange): number {
  const vorn = endreihe(schlange.karten, false);
  if (vorn.laenge >= schlange.karten.length) return 1.3 * endwert(vorn);
  return endwert(vorn) + endwert(endreihe(schlange.karten, true));
}

/** Was eine Sonderkarte auf der Hand wert ist, solange noch Züge kommen. */
function sonderkartenwert(karte: Spielkarte & { typ: 'Sonderkarte' }): number {
  switch (karte.name) {
    case 'Verdoppler':
      return 1.5;
    case 'Farbenschutz':
    case 'Farbendieb':
      return 1.2;
    case 'Regenbogenschlange':
    case 'Schlangenfrass':
    case 'Schlangenkorb des Glücks':
      return 1.0;
    case 'Schlangenblockade':
    case 'Schlangengrube':
      return 0.8;
    case 'Farbenfusion':
    case 'Schlangenhäutung':
      return 0.5;
  }
}

/**
 * Was eine eigene Handkarte wert ist. Eine Farbkarte ist mehr wert, wenn sie an ein
 * eigenes Ende mit derselben Farbe passt. Im letzten eigenen Zug zählt nur noch der
 * Farbenschutz, der auch danach abwehrt.
 */
export function haltewert(karte: Spielkarte, sicht: Sicht): number {
  if (!hatNochZug(sicht, sicht.ich)) return karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz' ? FARBENSCHUTZ_NACH_LETZTEM_ZUG : 0;
  if (karte.typ === 'Sonderkarte') return sonderkartenwert(karte);
  const reihen = sicht.spieler[sicht.ich].schlangen.flatMap((schlange) => [endreihe(schlange.karten, false), endreihe(schlange.karten, true)]);
  const passend = reihen.filter((reihe) => reihe.farbe === null || reihe.farbe === karte.farbe).map((reihe) => reihe.laenge);
  const bonus = passend.includes(2) ? 0.5 : passend.includes(1) ? 0.15 : 0;
  return (0.1 + bonus) * karte.punkte;
}

/** Wie viele Schlangengruben vor dem Spieler liegen (A7.6). */
function grubenVor(sicht: Sicht, spieler: number): number {
  return sicht.ausliegendeGruben.filter((grube) => grube.vor === spieler).length;
}

/**
 * Wie sehr die Zukunft eines Spielers zählt: voll, solange die Partie läuft; in der
 * Schlussrunde ein letzter Zug, und keiner, wenn eine Schlangengrube ihn kostet (D21).
 */
function zukunft(sicht: Sicht, spieler: number): number {
  if (!hatNochZug(sicht, spieler)) return 0;
  if (sicht.partiephase === 'Laufend') return 1;
  return grubenVor(sicht, spieler) > 0 ? 0 : 0.5;
}

/** Der Wert eines Spielers ohne Kettenbonus: Zwischenstand, Aussichten, Hand, Gruben, zweiter Zug. */
function spielerwert(sicht: Sicht, index: number, merker: Wertungsmerker): number {
  const spieler = sicht.spieler[index];
  const ausblick = zukunft(sicht, index);
  // In der Schlussrunde kostet eine Grube den letzten Zug; das steckt schon in `zukunft`.
  const gruben = sicht.partiephase === 'Laufend' ? grubenVor(sicht, index) : 0;
  const hand =
    index === sicht.ich
      ? sicht.hand.reduce((summe, karte) => summe + haltewert(karte, sicht), 0)
      : HANDKARTE_GEGNER * spieler.handgroesse * ausblick;
  const zug = sicht.zug;
  const zweiterZug = zug.spielerIndex === index && zug.teilzug === 1 && zug.verdopplerGespielt ? ZWEITER_ZUG : 0;
  return wertDerSchlangen(schlangenwert(spieler.schlangen, sicht.erweiterung, merker), ausblick) + hand - AUSGESETZTER_ZUG * gruben + zweiterZug;
}

/** Der Wert von Schlangen in der Bewertung: Punkte, fertige Gruppen und, soweit noch Züge kommen, die Aussichten. */
function wertDerSchlangen(wert: Schlangenwert, ausblick: number): number {
  return wert.punkte + FERTIGE_GRUPPE * wert.gruppen + ausblick * wert.aussicht;
}

/** Wer die längste Kette ab 3 Karten hat, bekommt den Kettenbonus, bei Gleichstand jeder (A11, D24); `laengsteFarbkette` zählt erst ab 3. */
function kettenbonus(laengen: readonly number[]): number[] {
  const laengste = Math.max(0, ...laengen);
  return laengen.map((laenge) => (laenge > 0 && laenge === laengste ? KETTENBONUS : 0));
}

/** Der Wert der Stellung für den Betrachter der Sicht: sein Wert minus der des stärksten Gegners. */
export function bewerte(sicht: Sicht, merker: Wertungsmerker = neuerMerker()): number {
  const bonus = kettenbonus(sicht.spieler.map((spieler) => schlangenwert(spieler.schlangen, sicht.erweiterung, merker).kette));
  const werte = sicht.spieler.map((_, index) => spielerwert(sicht, index, merker) + bonus[index]);
  const gegner = werte.filter((_, index) => index !== sicht.ich);
  const staerkster = Math.max(...gegner);
  const uebrige = gegner.reduce((summe, wert) => summe + wert, 0) - staerkster;
  return werte[sicht.ich] - staerkster - UEBRIGE_GEGNER * uebrige;
}
