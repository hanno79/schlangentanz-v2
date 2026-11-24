import type { BlockadeLegenAktion, RegenbogenschlangeLegenAktion } from '../aktionen/typen';
import { istGueltigeEinfuegePosition } from '../constants';
import { alleSchlangen, findeSchlange, gepruefteSchlange } from '../schlangen';
import type { Schlange, Sonderkartenname, Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, spielerIndexVon } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A5, D9: Jede Karte darf in jede Schlange am Tisch, auch in die eines
Mitspielers. Hier stehen die Regeln, die mehrere Kartendateien teilen: wen eine
Karte in einer Schlange trifft (A6, D10), warum eine Karte nicht offen in der
Schlange liegt (A7.7), und die gemeinsame Regel von Regenbogenschlange und
Schlangenblockade: Beide kommen an eine beliebige Stelle einer bestehenden
Schlange (A5, A7.3, A7.5) und beginnen keine neue (D16). Wie Schlangen im
Zustand liegen, steht in `schlangen.ts`.
*/

/**
 * A6, D10: Wen eine Karte trifft, die in diese Schlange gespielt wird: ihren
 * Besitzer, ausser er spielt sie selbst. Die Schlange muss es geben.
 */
export function betroffenerBesitzer(zustand: Spielzustand, aktion: { spielerId: string; schlangenId: string }): number[] {
  const { besitzer } = gepruefteSchlange(zustand, aktion.schlangenId);
  return besitzer === spielerIndexVon(zustand, aktion.spielerId) ? [] : [besitzer];
}

/**
 * A7.7: Der Grund, warum die Karte nicht offen in der Schlange liegt, für eine
 * Karte, die dort nicht offen liegt. Liegt sie unter einer Farbenfusion, sagt
 * `unterFusion` mit der Id der Fusion, was die Kartendatei mit ihr nicht darf.
 */
export function grundVerdeckt(schlange: Schlange, karteId: string, unterFusion: (fusionId: string) => string): string {
  const verdeckt = schlange.fusionen.find((fusion) => fusion.unter.some((karte) => karte.id === karteId));
  return verdeckt === undefined ? `Die Karte ${karteId} liegt nicht in der Schlange ${schlange.id}.` : unterFusion(verdeckt.karteId);
}

/** A7.4, A7.10: Ist die Karte eine Schlangenblockade? Schlangenfrass und Schlangenkorb behandeln sie eigens. */
export function istBlockade(karte: Spielkarte): boolean {
  return karte.typ === 'Sonderkarte' && karte.name === 'Schlangenblockade';
}

/** Die Aktionen, die eine Sonderkarte an eine Lücke einer Schlange legen. */
export type EinfuegeAktion = RegenbogenschlangeLegenAktion | BlockadeLegenAktion;

/**
 * Eine Sonderkarte, die an jede Lücke jeder bestehenden Schlange kommt, 0 vor
 * der ersten Karte bis hinter die letzte, in eigene wie in fremde Schlangen
 * (A5, D9). Ohne Schlange am Tisch hat sie kein Ziel (D16, D13). Eine
 * Farbenfusion ist eine Karte; zwischen die Karten darunter kommt nichts (A7.7).
 * In der Schlange eines Mitspielers trifft sie ihn, er darf abwehren (A6, D10);
 * in der eigenen trifft sie niemanden.
 */
export function sonderkarteAnJedeStelle<A extends EinfuegeAktion>(art: Sonderkartenname, aktionstyp: A['typ'], abschnitt: string): KartenDefinition<A> {
  return {
    art,
    aktionstyp,

    ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): A[] {
      const spielerId = zustand.spieler[spielerIndex].id;
      return alleSchlangen(zustand).flatMap(({ schlange }) =>
        Array.from({ length: schlange.karten.length + 1 }, (_, position) => ({ typ: aktionstyp, spielerId, karteId: karte.id, schlangenId: schlange.id, position }) as A),
      );
    },

    pruefe(zustand: Spielzustand, aktion: A): string | null {
      const gefunden = findeSchlange(zustand, aktion.schlangenId);
      if (gefunden === null) return `Die Schlange ${aktion.schlangenId} gibt es nicht; die ${art} braucht eine bestehende Schlange (D16).`;
      const laenge = gefunden.schlange.karten.length;
      if (!istGueltigeEinfuegePosition(aktion.position, laenge)) {
        return `Die Stelle ${aktion.position} gibt es in ${aktion.schlangenId} nicht: erlaubt sind 0 bis ${laenge} (${abschnitt}).`;
      }
      return null;
    },

    betroffene: betroffenerBesitzer,

    wirke(zustand: Spielzustand, aktion: A): Spielzustand {
      const { schlange } = gepruefteSchlange(zustand, aktion.schlangenId);
      schlange.karten.splice(aktion.position, 0, entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId));
      return zustand;
    },
  };
}
