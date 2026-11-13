import type { KartenAktion } from '../aktionen/typen';
import type { Kartenart, Spielkarte, Spielzustand } from '../types';
import { farbendieb } from './farbendieb';
import { farbenfusion } from './farbenfusion';
import { farbenschutz } from './farbenschutz';
import { farbkarte } from './farbkarte';
import { regenbogenschlange } from './regenbogenschlange';
import { schlangenblockade } from './schlangenblockade';
import { schlangenfrass } from './schlangenfrass';
import { schlangengrube } from './schlangengrube';
import { schlangenhaeutung } from './schlangenhaeutung';
import { schlangenkorb } from './schlangenkorb';
import { verdoppler } from './verdoppler';

/*
Je Kartenart eine Datei unter `karten/`, je Datei ein Eintrag hier. Die
Aktionsschicht fragt nur dieses Register; eine Karte umsetzen heisst, ihre Datei
zu füllen (E2 bis E9, X6). Register und Schnittstelle ändert nach E1 nur, wer es
ausdrücklich darf (U13).
*/

export interface KartenDefinition<A extends KartenAktion = KartenAktion> {
  readonly art: Kartenart;
  /** Der Aktionstyp, mit dem die Karte mit Wirkung gespielt wird; `null`, wenn sie keinen hat (Farbenschutz: nur als Reaktion). */
  readonly aktionstyp: A['typ'] | null;
  /**
   * Alle Aktionen, mit denen der Spieler diese Handkarte mit Wirkung spielen darf.
   * Leer heisst: kein mögliches Ziel (D13, D25).
   */
  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): A[];
  /** Der Grund, warum die Aktion nicht erlaubt ist, oder `null`. Die allgemeinen Prüfungen sind schon gelaufen. */
  pruefe(zustand: Spielzustand, aktion: A): string | null;
  /** Wen die Aktion trifft, ohne den Spieler selbst: Sie dürfen mit Farbenschutz abwehren (A6, D10). */
  betroffene(zustand: Spielzustand, aktion: A): number[];
  /**
   * Die Wirkung, nachdem alle Betroffenen entschieden haben (A6). `abgewehrt`
   * nennt, wer mit Farbenschutz abgewehrt hat; für ihn hat die Karte keine Wirkung (A7.2).
   */
  wirke(zustand: Spielzustand, aktion: A, abgewehrt: readonly number[]): Spielzustand;
}

export const KARTENREGISTER: { readonly [K in Kartenart]: KartenDefinition } = {
  Farbkarte: farbkarte,
  Farbenschutz: farbenschutz,
  Regenbogenschlange: regenbogenschlange,
  Schlangenfrass: schlangenfrass,
  Schlangenblockade: schlangenblockade,
  Farbendieb: farbendieb,
  Schlangengrube: schlangengrube,
  Farbenfusion: farbenfusion,
  Verdoppler: verdoppler,
  Schlangenhäutung: schlangenhaeutung,
  'Schlangenkorb des Glücks': schlangenkorb,
};

export function kartenartVon(karte: Spielkarte): Kartenart {
  return karte.typ === 'Farbkarte' ? 'Farbkarte' : karte.name;
}

export function definitionFuer(karte: Spielkarte): KartenDefinition {
  return KARTENREGISTER[kartenartVon(karte)];
}

/** Die Kartenart, die eine Kartenaktion spielt. */
export function kartenartFuer(aktionstyp: KartenAktion['typ']): Kartenart {
  const definition = Object.values(KARTENREGISTER).find((eintrag) => eintrag.aktionstyp === aktionstyp);
  if (definition === undefined) throw new Error(`Kein Eintrag im Kartenregister spielt ${aktionstyp}.`);
  return definition.art;
}
