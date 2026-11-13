import type { KartenAktion } from './aktionen/typen';

/*
Der Spielzustand im Format 2.

Spieler werden im Zustand über ihre Stelle in `spieler` angesprochen (Index);
die Reihenfolge ist die Sitzordnung im Uhrzeigersinn (A5). Aktionen nennen
Spieler über ihre Id.
*/

export type Farbe = 'Blau' | 'Rot' | 'Gelb' | 'Violett' | 'Braun' | 'Grün';

export type Steuerung = 'Mensch' | 'KI';

/** Die Sonderkarten aus A1; die letzten beiden gibt es nur mit Erweiterung. */
export type Sonderkartenname =
  | 'Farbenschutz'
  | 'Regenbogenschlange'
  | 'Schlangenfrass'
  | 'Schlangenblockade'
  | 'Farbendieb'
  | 'Schlangengrube'
  | 'Farbenfusion'
  | 'Verdoppler'
  | 'Schlangenhäutung'
  | 'Schlangenkorb des Glücks';

/** Eine Kartenart: alle Farbkarten zusammen oder eine Sonderkarte. Je Art ein Eintrag im Kartenregister. */
export type Kartenart = 'Farbkarte' | Sonderkartenname;

export interface FarbkarteInfo {
  typ: 'Farbkarte';
  id: string;
  farbe: Farbe;
  punkte: number;
}

export interface SonderkarteInfo {
  typ: 'Sonderkarte';
  id: string;
  name: Sonderkartenname;
}

/** Eine Karte aus dem Kartenstapel (A1: Farb- und Sonderkarten). */
export type Spielkarte = FarbkarteInfo | SonderkarteInfo;

export interface AufgabenkarteInfo {
  typ: 'Aufgabenkarte';
  id: string;
  name: string;
  punkte: number;
  bedingung: string;
}

/** Comeback- und Risiko-Belohnungs-Karten liegen offen vor dem Spieler, nicht im Kartenstapel (A4, C22). */
export interface Auslagekarte {
  typ: 'Comeback' | 'Risiko-Belohnung';
  id: string;
}

/** Eine Farbenfusion in einer Schlange und die zwei Farbkarten darunter (A7.7). */
export interface Fusion {
  /** Id der Farbenfusion in `Schlange.karten`. */
  karteId: string;
  unter: [FarbkarteInfo, FarbkarteInfo];
}

export interface Schlange {
  id: string;
  /** Von vorn nach hinten. Eine Farbenfusion steht hier als eine Karte. */
  karten: Spielkarte[];
  fusionen: Fusion[];
}

export interface Spieler {
  id: string;
  name: string;
  steuerung: Steuerung;
  hand: Spielkarte[];
  schlangen: Schlange[];
  /** Der eigene Ablagestapel (A4), unterste Karte zuerst. */
  ablagestapel: Spielkarte[];
  /** Was der Spieler an Sonderkarten ausgespielt hat, für Aufgaben wie „Schlangenrepertoire“ (A9). */
  ausgespielteSonderkarten: Sonderkartenname[];
  /** Durch Schlangenhäutung neu gebildete Dreiergruppen, für die Aufgabe „Schlangentanz“ (A9). */
  schlangenhaeutungDreiergruppen: number;
  erfuellteAufgaben: AufgabenkarteInfo[];
  /** Nur mit Erweiterung (A4), sonst `null`. */
  geheimeAufgabe: AufgabenkarteInfo | null;
  geheimeAufgabeErfuellt: boolean;
  /** Nur mit Erweiterung (A4); nach dem Einsatz umgedreht (A8.1). */
  comeback: { karte: Auslagekarte; verbraucht: boolean } | null;
  /** Nur mit Erweiterung (A4); eine gespielte kommt aus dem Spiel (A8.2). */
  risikoKarten: Auslagekarte[];
}

/** A10: Die Schlussrunde beginnt, sobald der Nachziehstapel leer ist. */
export type Partiephase = 'Laufend' | 'Schlussrunde' | 'Beendet';

export interface Zug {
  spielerIndex: number;
  /** 2 ist der zweite Zug nach einem Verdoppler (A7.8). */
  teilzug: 1 | 2;
  /** Gespielt in diesem Teilzug (A5, D12). */
  gespielteFarbkarten: number;
  gespielteSonderkarten: number;
  verdopplerGespielt: boolean;
  farbenfusionGespielt: boolean;
  /** `Abwerfen`: Der Zug ist beendet, der Spieler hält mehr als 5 Karten und wählt, welche er ablegt (A5). */
  abschnitt: 'Ausspielen' | 'Abwerfen';
}

/** Eine Schlangengrube liegt vor dem getroffenen Spieler, bis er ausgesetzt hat (A7.6). */
export interface AusliegendeGrube {
  karte: SonderkarteInfo;
  gespieltVon: number;
  vor: number;
}

/**
 * Eine angesagte Sonderkarte, über die die Betroffenen noch entscheiden (A6).
 * Ziel und Wirkung stehen in der Aktion und lassen sich nicht mehr ändern (B2).
 */
export interface SchwebendeKarte {
  karte: SonderkarteInfo;
  aktion: KartenAktion;
  /** Betroffene, die noch entscheiden, im Uhrzeigersinn. */
  ausstehend: number[];
  /** Betroffene, die mit Farbenschutz abgewehrt haben. */
  abgewehrt: number[];
}

export interface Spielzustand {
  version: 2;
  erweiterung: boolean;
  spieler: Spieler[];
  partiephase: Partiephase;
  zug: Zug;
  /** Wer die letzte Karte gezogen hat (A10); `null`, solange die Partie läuft. */
  schlussrundeAusloeser: number | null;
  /** Oberste Karte zuerst. */
  nachziehstapel: Spielkarte[];
  ausliegendeGruben: AusliegendeGrube[];
  schwebend: SchwebendeKarte | null;
  /** Benutzter Schlangenkorb (A7.10) und gespielte Risiko-Karten (A8.2). */
  ausDemSpiel: Array<Spielkarte | Auslagekarte>;
  /** Höchstens 3 (A4); bei leerem Aufgabenstapel bleibt ein Platz leer (A9). */
  offeneAufgaben: AufgabenkarteInfo[];
  aufgabenStapel: AufgabenkarteInfo[];
  /** Zahl der bisher angelegten Schlangen; daraus entsteht die Id der nächsten. */
  schlangenZaehler: number;
}
