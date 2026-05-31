/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Punktwertung gültiger Farbgruppen nach R4.2/R4.4 und R8.4.
              Gruppen < 3 Karten zählen 0. Sonderkarten unterbrechen Gruppen.
*/

import type { Schlange } from './types';
import { ermittleFarbgruppen, type Farbgruppe } from './colorGroups';

export type FarbgruppenWertung = Farbgruppe & { punkte: number };

export interface FarbgruppenPunkteErgebnis {
  gesamtPunkte: number;
  gruppen: FarbgruppenWertung[];
}

export function berechneFarbgruppenPunkte(schlange: Schlange): FarbgruppenPunkteErgebnis {
  const gruppen: FarbgruppenWertung[] = ermittleFarbgruppen(schlange).map((gruppe) => {
    const punkte = schlange.karten
      .slice(gruppe.startIndex, gruppe.endIndex + 1)
      .reduce((sum, karte) => sum + (karte.typ === 'Farbkarte' ? karte.punkte : 0), 0);

    return { ...gruppe, punkte };
  });

  const gesamtPunkte = gruppen.reduce((sum, g) => sum + g.punkte, 0);

  return { gesamtPunkte, gruppen };
}
