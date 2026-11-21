import { KETTENBONUS, ermittleFarbgruppen, werteSchlangen } from '../../engine';
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

/** D24: Eine Kette zählt erst ab 3 Farbkarten derselben Farbe in ununterbrochener Reihe. */
const KETTE_AB = 3;
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

/** Punkte aus Farbgruppen und Vielfaltbonus, wie die Wertung sie zählt (A11, D30 bis D32), und die Zahl der Gruppen. */
function wertungVon(spieler: SpielerSicht, erweiterung: boolean): { punkte: number; gruppen: number } {
  const wertung = werteSchlangen(spieler.schlangen, erweiterung);
  return {
    punkte: wertung.gruppenPunkte + (wertung.vielfaltBonus ?? 0),
    gruppen: wertung.schlangen.reduce((summe, schlange) => summe + schlange.gruppen.length, 0),
  };
}

/** Die Punkte aus Farbgruppen und Vielfaltbonus, wie die Wertung sie zählt (A11, D30 bis D32). */
export function gruppenwert(spieler: SpielerSicht, erweiterung: boolean): number {
  return wertungVon(spieler, erweiterung).punkte;
}

/** Die eigenen Punkte aus Farbgruppen und Vielfaltbonus. */
export function eigenePunkte(sicht: Sicht): number {
  return gruppenwert(sicht.spieler[sicht.ich], sicht.erweiterung);
}

/** A11, D24: die längste ununterbrochene Kette einer Farbe ab 3 Farbkarten; Sonderkarten unterbrechen sie. 0 ohne. */
export function kettenlaenge(spieler: SpielerSicht): number {
  return Math.max(0, ...spieler.schlangen.flatMap((schlange) => ermittleFarbgruppen(schlange, KETTE_AB).map((kette) => kette.laenge)));
}

/** A10: Hat der Spieler nach dem laufenden Zug noch einen Zug? In der Schlussrunde nur, wer vor dem Auslöser noch drankommt. */
export function hatNochZug(sicht: Sicht, spieler: number): boolean {
  if (sicht.partiephase === 'Laufend') return true;
  const ausloeser = sicht.schlussrundeAusloeser;
  if (sicht.partiephase === 'Beendet' || ausloeser === null) return false;
  const anzahl = sicht.spieler.length;
  const amZug = sicht.zug.spielerIndex;
  const abstand = (index: number) => (index - amZug + anzahl) % anzahl || anzahl;
  return spieler !== amZug && abstand(spieler) < abstand(ausloeser);
}

/** Regenbogenschlange und Farbenfusion zählen als jede Farbe (A7.3, A7.7). */
export function istJoker(karte: Spielkarte): boolean {
  return karte.typ === 'Sonderkarte' && (karte.name === 'Regenbogenschlange' || karte.name === 'Farbenfusion');
}

interface Endreihe {
  laenge: number;
  /** `null`, wenn die Reihe nur aus Jokern besteht. */
  farbe: Farbe | null;
  punkte: number;
}

/** Die Reihe gleicher Farbe an einem Ende der Schlange; Joker passen zu jeder Farbe, andere Sonderkarten beenden sie. */
function endreihe(karten: readonly Spielkarte[], vonHinten: boolean): Endreihe {
  const reihe: Endreihe = { laenge: 0, farbe: null, punkte: 0 };
  for (const karte of vonHinten ? [...karten].reverse() : karten) {
    if (karte.typ === 'Farbkarte') {
      if (reihe.farbe !== null && karte.farbe !== reihe.farbe) break;
      reihe.farbe = karte.farbe;
      reihe.punkte = karte.punkte;
    } else if (!istJoker(karte)) break;
    reihe.laenge += 1;
  }
  return reihe;
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
function spielerwert(sicht: Sicht, index: number): number {
  const spieler = sicht.spieler[index];
  const ausblick = zukunft(sicht, index);
  const aussichten = spieler.schlangen.reduce((summe, schlange) => summe + aussichtVon(schlange), 0);
  // In der Schlussrunde kostet eine Grube den letzten Zug; das steckt schon in `zukunft`.
  const gruben = sicht.partiephase === 'Laufend' ? grubenVor(sicht, index) : 0;
  const hand =
    index === sicht.ich
      ? sicht.hand.reduce((summe, karte) => summe + haltewert(karte, sicht), 0)
      : HANDKARTE_GEGNER * spieler.handgroesse * ausblick;
  const zug = sicht.zug;
  const zweiterZug = zug.spielerIndex === index && zug.teilzug === 1 && zug.verdopplerGespielt ? ZWEITER_ZUG : 0;
  const { punkte, gruppen } = wertungVon(spieler, sicht.erweiterung);
  return punkte + FERTIGE_GRUPPE * gruppen + ausblick * aussichten + hand - AUSGESETZTER_ZUG * gruben + zweiterZug;
}

/** Wer die längste Kette ab 3 Karten hat, bekommt den Kettenbonus, bei Gleichstand jeder (A11, D24). */
function kettenbonus(laengen: readonly number[]): number[] {
  const laengste = Math.max(0, ...laengen);
  return laengen.map((laenge) => (laenge >= KETTE_AB && laenge === laengste ? KETTENBONUS : 0));
}

/** Der Wert der Stellung für den Betrachter der Sicht: sein Wert minus der des stärksten Gegners. */
export function bewerte(sicht: Sicht): number {
  const bonus = kettenbonus(sicht.spieler.map(kettenlaenge));
  const werte = sicht.spieler.map((_, index) => spielerwert(sicht, index) + bonus[index]);
  const gegner = werte.filter((_, index) => index !== sicht.ich);
  const staerkster = Math.max(...gegner);
  const uebrige = gegner.reduce((summe, wert) => summe + wert, 0) - staerkster;
  return werte[sicht.ich] - staerkster - UEBRIGE_GEGNER * uebrige;
}
