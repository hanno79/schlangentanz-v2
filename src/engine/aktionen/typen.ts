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

export type SpielAktion =
  | KartenAktion
  | SonderkarteWirkungslosAblegenAktion
  | ZugBeendenAktion
  | UeberhandAbwerfenAktion
  | ReagierenAktion;

export type Pruefergebnis = { erlaubt: true } | { erlaubt: false; grund: string };

/** Was eine Aktion bewirkt hat, damit die Oberfläche keine Zustände vergleichen muss (Plan E2). */
export type Ereignis =
  | { typ: 'KarteGespielt'; spielerIndex: number; karteId: string; aktion: Aktionstyp }
  | { typ: 'KartenGezogen'; spielerIndex: number; anzahl: number }
  | { typ: 'Abgewehrt'; spielerIndex: number; karteId: string }
  | { typ: 'Ausgesetzt'; spielerIndex: number }
  | { typ: 'SchlussrundeBegonnen'; ausloeser: number }
  | { typ: 'PartieBeendet' };

export interface AktionsErgebnis {
  zustand: Spielzustand;
  ereignisse: Ereignis[];
}
