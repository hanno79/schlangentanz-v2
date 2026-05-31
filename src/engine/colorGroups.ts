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

export function ermittleFarbgruppen(schlange: Schlange): Farbgruppe[] {
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

    if (ids.length >= MINDEST_FARBGRUPPEN_LAENGE) {
      gruppen.push({ farbe, startIndex: start, endIndex: i, laenge: ids.length, kartenIds: ids });
    }
  }

  return gruppen;
}
