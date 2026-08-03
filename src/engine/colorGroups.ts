/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Farbgruppen-Erkennung nach R3.3 — mindestens 3 zusammenhängende
              Farbkarten gleicher Farbe, Sonderkarten unterbrechen Sequenzen.
*/

import type { Farbe, Schlange } from './types';
import { MINDEST_FARBGRUPPEN_LAENGE } from './constants';

export interface Farbgruppe {
  farbe: Farbe;
  startIndex: number;
  endIndex: number;
  laenge: number;
  kartenIds: string[];
}

/**
 * Alle maximalen Läufe direkt benachbarter Farbkarten gleicher Farbe.
 *
 * Sonderkarten unterbrechen ausnahmslos — auch die Regenbogenschlange. Wer sie
 * als Wildcard gewertet haben will, schickt die Schlange vorher durch
 * `transformiereRegenbogenschlangen` (`scoring.ts`); **dort** sitzt die
 * Wildcard-Semantik, nicht hier.
 *
 * ÄNDERUNG [03.08.2026]: `mindestLaenge` ist dazugekommen. R3.3 zählt erst ab 3
 * Karten, R8.4a (längste Farbkette) kennt dagegen gar keine Mindestlänge — bei
 * zwei Spielern mit Maximalkette 2 gäbe der Vorgabewert sonst „keine Kette"
 * statt Gleichstand. Der Vorgabewert hält alle bestehenden Aufrufer unverändert.
 */
export function ermittleFarbgruppen(
  schlange: Schlange,
  mindestLaenge: number = MINDEST_FARBGRUPPEN_LAENGE,
): Farbgruppe[] {
  const gruppen: Farbgruppe[] = [];
  const { karten } = schlange;

  for (let i = 0; i < karten.length; i++) {
    const karte = karten[i];
    if (karte.typ !== 'Farbkarte') continue;

    const farbe = karte.farbe;
    const start = i;
    const ids: string[] = [karte.id];

    while (i + 1 < karten.length) {
      const naechste = karten[i + 1];
      if (naechste.typ !== 'Farbkarte' || naechste.farbe !== farbe) break;
      ids.push(naechste.id);
      i++;
    }

    if (ids.length >= mindestLaenge) {
      gruppen.push({ farbe, startIndex: start, endIndex: i, laenge: ids.length, kartenIds: ids });
    }
  }

  return gruppen;
}
