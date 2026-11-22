import type { Spielzustand } from '../types';

/*
Alle Aktionen der Basis-Engine (Plan E1, Kriterium 4). Die Oberfläche und die KI
bauen keine Aktion selbst, sie wählen aus `ermittleAktionen` (U3).

Positionen in einer Schlange sind Lücken: 0 ist vor der ersten Karte, `länge`
hinter der letzten (`istGueltigeEinfuegePosition`).
*/

export const AKTIONSTYPEN = [
  'FarbkarteLegen',
  'RegenbogenschlangeLegen',
  'BlockadeLegen',
  'FusionLegen',
  'FarbendiebSpielen',
  'SchlangenfrassSpielen',
  'SchlangengrubeSpielen',
  'VerdopplerSpielen',
  'SchlangenhaeutungSpielen',
  'SonderkarteWirkungslosAblegen',
  'ZugBeenden',
  'UeberhandAbwerfen',
  'Reagieren',
  'Entscheiden',
] as const;

export type Aktionstyp = (typeof AKTIONSTYPEN)[number];

interface MitKarte {
  spielerId: string;
  /** Die gespielte Handkarte. */
  karteId: string;
}

/** Eine neue eigene Schlange beginnen oder an ein Ende einer Schlange anlegen (A5, D9). */
export type Farbkartenziel = { art: 'neueSchlange' } | { art: 'schlange'; schlangenId: string; seite: 'anfang' | 'ende' };

export interface FarbkarteLegenAktion extends MitKarte {
  typ: 'FarbkarteLegen';
  ziel: Farbkartenziel;
}

/** A7.3: an eine beliebige Stelle einer Schlange. */
export interface RegenbogenschlangeLegenAktion extends MitKarte {
  typ: 'RegenbogenschlangeLegen';
  schlangenId: string;
  position: number;
}

/** A7.5: an eine beliebige Stelle einer Schlange. */
export interface BlockadeLegenAktion extends MitKarte {
  typ: 'BlockadeLegen';
  schlangenId: string;
  position: number;
}

/** A7.7: auf zwei nebeneinanderliegende Farbkarten, links zuerst. */
export interface FusionLegenAktion extends MitKarte {
  typ: 'FusionLegen';
  schlangenId: string;
  kartenIds: [string, string];
}

/** A7.1: eine Farbkarte aus einer gegnerischen Schlange in eine eigene. */
export interface FarbendiebSpielenAktion extends MitKarte {
  typ: 'FarbendiebSpielen';
  quelle: { schlangenId: string; karteId: string };
  ziel: { art: 'neueSchlange' } | { art: 'schlange'; schlangenId: string; position: number };
}

/** A7.4: a) eine eigene Karte, b) eine eigene Blockade, c) Karten der Mitspieler. */
export interface SchlangenfrassSpielenAktion extends MitKarte {
  typ: 'SchlangenfrassSpielen';
  option: 'eigeneKarte' | 'eigeneBlockade' | 'gegnerischeKarten';
  ziele: { schlangenId: string; karteId: string }[];
}

/** A7.6: ein Mitspieler setzt seinen nächsten Zug aus. */
export interface SchlangengrubeSpielenAktion extends MitKarte {
  typ: 'SchlangengrubeSpielen';
  zielSpielerId: string;
}

/** A7.8: Auffüllen und ein zweiter Zug. */
export interface VerdopplerSpielenAktion extends MitKarte {
  typ: 'VerdopplerSpielen';
}

/**
 * A7.9: Ein Abschnitt aufeinanderfolgender Farbkarten wird neu geordnet. Der
 * Abschnitt sind genau die genannten Karten, `neueReihenfolge` ihre Folge danach.
 */
export interface SchlangenhaeutungSpielenAktion extends MitKarte {
  typ: 'SchlangenhaeutungSpielen';
  schlangenId: string;
  neueReihenfolge: string[];
}

/** Die Karten, die eine Wirkung haben und deshalb im Kartenregister stehen. */
export type KartenAktion =
  | FarbkarteLegenAktion
  | RegenbogenschlangeLegenAktion
  | BlockadeLegenAktion
  | FusionLegenAktion
  | FarbendiebSpielenAktion
  | SchlangenfrassSpielenAktion
  | SchlangengrubeSpielenAktion
  | VerdopplerSpielenAktion
  | SchlangenhaeutungSpielenAktion;

/** D13: eine Sonderkarte ohne mögliches Ziel und jeder Farbenschutz (A5) auf den eigenen Ablagestapel. */
export interface SonderkarteWirkungslosAblegenAktion extends MitKarte {
  typ: 'SonderkarteWirkungslosAblegen';
}

export interface ZugBeendenAktion {
  typ: 'ZugBeenden';
  spielerId: string;
}

/** A5: Am Zugende überzählige Handkarten auf den eigenen Ablagestapel. */
export interface UeberhandAbwerfenAktion {
  typ: 'UeberhandAbwerfen';
  spielerId: string;
  karteIds: string[];
}

/** A6: auf eine schwebende Sonderkarte mit Farbenschutz antworten oder sie durchlassen (`null`). */
export interface ReagierenAktion {
  typ: 'Reagieren';
  spielerId: string;
  farbenschutzId: string | null;
}

/** X3: über eine offene Entscheidung wählen (D52, A8.2); `wahl` ist eine ihrer Optionen. */
export interface EntscheidenAktion {
  typ: 'Entscheiden';
  spielerId: string;
  wahl: string;
}

export type SpielAktion =
  | KartenAktion
  | SonderkarteWirkungslosAblegenAktion
  | ZugBeendenAktion
  | UeberhandAbwerfenAktion
  | ReagierenAktion
  | EntscheidenAktion;

export type Pruefergebnis = { erlaubt: true } | { erlaubt: false; grund: string };

/**
 * Wo eine Karte liegt; `spielerIndex` ist der Besitzer der Schlange, des
 * Ablagestapels, der Hand bzw. der, vor dem sie liegt. `position` zählt ab 0:
 * in der Schlange von vorn, unter einer Fusion von links, im Ablagestapel von
 * unten. Hand und Nachziehstapel sind verdeckt und haben keine Position (B2).
 */
export type Kartenort =
  | { ort: 'Schlange'; spielerIndex: number; schlangenId: string; position: number }
  /** A7.7: unter der Farbenfusion `fusionId` in dieser Schlange. */
  | { ort: 'UnterFusion'; spielerIndex: number; schlangenId: string; fusionId: string; position: number }
  | { ort: 'Ablagestapel'; spielerIndex: number; position: number }
  | { ort: 'VorSpieler'; spielerIndex: number }
  | { ort: 'Hand'; spielerIndex: number }
  | { ort: 'Nachziehstapel' }
  | { ort: 'Schwebend' }
  | { ort: 'AusDemSpiel' }
  /** X3: offen aufgedeckt vom Nachziehstapel, bis eine Entscheidung sie weiterlegt (A8.2); `position` zählt in der Folge des Aufdeckens. */
  | { ort: 'Aufgedeckt'; position: number };

/** Eine Karte, die eine Kartenwirkung von `von` nach `nach` gebracht hat; `karteId` ist `null`, wenn sie danach verdeckt liegt (B2). */
export interface Versetzung {
  karteId: string | null;
  von: Kartenort;
  nach: Kartenort;
}

/**
 * Was eine Aktion bewirkt hat, in der Reihenfolge, in der es geschah, damit die
 * Oberfläche keine Zustände vergleichen muss (Plan E2). Gezogene Karten stehen
 * nur als Anzahl da, weil Handkarten der Gegner verdeckt sind (B2).
 */
export type Ereignis =
  /** Eine Handkarte ist gespielt und hat gewirkt; `nach` sagt, wo sie danach liegt. Gilt für Karten, die niemanden sonst treffen. */
  | { typ: 'KarteGespielt'; spielerIndex: number; karteId: string; aktion: Aktionstyp; nach: Kartenort }
  /**
   * A6: Eine Sonderkarte, die Mitspieler trifft, ist mit ihrem Ziel angesagt und
   * schwebt. `betroffene` sind alle, die sie trifft, im Uhrzeigersinn; jeder von
   * ihnen wird gefragt (D33).
   */
  | { typ: 'KarteAngesagt'; spielerIndex: number; karteId: string; ansage: KartenAktion; betroffene: number[] }
  /**
   * A6, D33: Der Betroffene entscheidet jetzt, ob er die schwebende Karte `karteId`
   * abwehrt. Gefragt wird jeder Betroffene, auch ohne Farbenschutz; die Frage
   * verrät deshalb keine Handkarte (B2).
   */
  | { typ: 'AbwehrGefragt'; spielerIndex: number; karteId: string }
  /**
   * A6: Alle Betroffenen haben entschieden. Für die in `abgewehrt` hatte die Karte
   * keine Wirkung (A7.2); `ohneWirkung` heisst, dass alle abgewehrt haben und sie
   * wirkungslos auf dem Ablagestapel des Angreifers liegt. `nach` sagt, wo sie liegt.
   */
  | { typ: 'AnsageEntschieden'; spielerIndex: number; karteId: string; abgewehrt: number[]; ohneWirkung: boolean; nach: Kartenort }
  /**
   * Plan E4b: Was die Wirkung der gespielten Karte `karteId` ausser ihr selbst
   * bewegt hat, kommt vor `KarteGespielt` bzw. `AnsageEntschieden`. Genannt ist
   * jede Karte, die den Ort wechselt oder ihre Reihenfolge zu den übrigen Karten
   * ihres Ortes; wer nur nachrückt, fehlt. Die Oberfläche nimmt erst jede Karte
   * von `von`, dann legt sie sie in der Reihenfolge der Liste nach `nach`, und
   * entfernt zuletzt die Schlangen in `aufgeloest`. `von` zählt vor der Wirkung,
   * `nach` danach, beide ohne die gespielte Karte, die erst das folgende Ereignis
   * hinlegt. Eine neue Schlange erscheint mit ihrer Id in `nach`.
   * Liegt eine Karte danach auf einer Hand oder im Nachziehstapel, fehlt ihre Id
   * (B2); der Besitzer sieht sie in seiner Hand. Solche Karten stehen am Ende der
   * Liste in der Reihenfolge vor der Wirkung, damit die Liste nicht verrät, wie
   * sie danach verdeckt liegen.
   */
  | { typ: 'KartenVersetzt'; spielerIndex: number; karteId: string; karten: Versetzung[]; aufgeloest: string[] }
  | { typ: 'KartenGezogen'; spielerIndex: number; anzahl: number }
  /** A5: Nach dem Auffüllen hält der Spieler mehr als 5 Karten und muss `anzahl` abwerfen. */
  | { typ: 'AbwerfenVerlangt'; spielerIndex: number; anzahl: number }
  /** Die Karten liegen danach in dieser Reihenfolge oben auf dem eigenen Ablagestapel. */
  | { typ: 'KartenAbgeworfen'; spielerIndex: number; karteIds: string[] }
  | { typ: 'ZugBegonnen'; spielerIndex: number; teilzug: 1 | 2 }
  /** A7.2: Der Spieler wehrt die schwebende Karte `gegen` mit dem Farbenschutz `karteId` ab; der liegt danach auf seinem Ablagestapel. */
  | { typ: 'Abgewehrt'; spielerIndex: number; karteId: string; gegen: string }
  /** A7.6: Der Spieler setzt aus; die Schlangengrube `karteId` kommt auf den Ablagestapel von `ablagestapelVon`. */
  | { typ: 'Ausgesetzt'; spielerIndex: number; karteId: string; ablagestapelVon: number }
  /** D29: Der Spieler hat für die Schlangengrube `karteId` keinen Zug mehr; sie kommt ohne Wirkung auf den Ablagestapel von `ablagestapelVon`. */
  | { typ: 'GrubeOhneWirkung'; spielerIndex: number; karteId: string; ablagestapelVon: number }
  /**
   * X3: `spielerIndex` entscheidet jetzt über `art`, die die Wirkung der Karte
   * `karteId` verlangt; zur Wahl steht `optionen` (D52, A8.2). Kommt am Ende der
   * Aktion, nach allem, was sie bewegt hat.
   */
  | { typ: 'EntscheidungVerlangt'; spielerIndex: number; art: string; karteId: string; optionen: string[] }
  /** X3: `spielerIndex` hat `wahl` gewählt; was die Wahl bewegt, meldet danach `KartenVersetzt` mit derselben `karteId`. */
  | { typ: 'Entschieden'; spielerIndex: number; art: string; karteId: string; wahl: string }
  /** A10, D55: Der Nachziehstapel ist leer; `ausloeser` ist der Spieler am Zug, gleich wer die letzte Karte genommen hat. */
  | { typ: 'SchlussrundeBegonnen'; ausloeser: number }
  | { typ: 'PartieBeendet' };

export interface AktionsErgebnis {
  zustand: Spielzustand;
  ereignisse: Ereignis[];
}
