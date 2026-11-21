import type { BlockadeLegenAktion, RegenbogenschlangeLegenAktion } from '../aktionen/typen';
import { istGueltigeEinfuegePosition } from '../constants';
import type { Schlange, Sonderkartenname, Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, spielerIndexVon } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A5, D9: Jede Karte darf in jede Schlange am Tisch, auch in die eines
Mitspielers. Hier steht, wie eine Kartendatei eine Schlange über ihre Id findet,
und die gemeinsame Regel von Regenbogenschlange und Schlangenblockade: Beide
kommen an eine beliebige Stelle einer bestehenden Schlange (A5, A7.3, A7.5) und
beginnen keine neue (D16).
*/

interface SchlangeAmTisch {
  schlange: Schlange;
  /** Die Stelle des Besitzers in `zustand.spieler`. */
  besitzer: number;
}

/** Jede Schlange am Tisch mit ihrem Besitzer, in Sitzordnung und je Spieler in seiner Reihenfolge. */
export function alleSchlangen(zustand: Spielzustand): SchlangeAmTisch[] {
  return zustand.spieler.flatMap((spieler, besitzer) => spieler.schlangen.map((schlange) => ({ schlange, besitzer })));
}

/** Die Schlange mit dieser Id, gleich wem sie gehört, oder `null`, wenn es sie nicht gibt. */
export function findeSchlange(zustand: Spielzustand, schlangenId: string): SchlangeAmTisch | null {
  return alleSchlangen(zustand).find(({ schlange }) => schlange.id === schlangenId) ?? null;
}

/** Wie `findeSchlange`, für Aktionen, die schon geprüft sind: Fehlt die Schlange, ist das ein Fehler der Engine. */
export function gepruefteSchlange(zustand: Spielzustand, schlangenId: string): SchlangeAmTisch {
  const gefunden = findeSchlange(zustand, schlangenId);
  if (gefunden === null) throw new Error(`Die Schlange ${schlangenId} gibt es nicht.`);
  return gefunden;
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

    betroffene(zustand: Spielzustand, aktion: A): number[] {
      const { besitzer } = gepruefteSchlange(zustand, aktion.schlangenId);
      return besitzer === spielerIndexVon(zustand, aktion.spielerId) ? [] : [besitzer];
    },

    wirke(zustand: Spielzustand, aktion: A): Spielzustand {
      const { schlange } = gepruefteSchlange(zustand, aktion.schlangenId);
      schlange.karten.splice(aktion.position, 0, entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId));
      return zustand;
    },
  };
}
