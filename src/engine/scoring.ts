/*
Author: rahn
Datum: 31.05.2026
Version: 1.4
Beschreibung: Punktwertung gültiger Farbgruppen nach R4.2/R4.4 und R8.4.
              Gruppen < 3 Karten zählen 0. Sonderkarten unterbrechen Gruppen.
              R8.4c: Erfüllte Aufgabenpunkte eines Spielers summieren.
              R8.4d: Spieler-Gesamtpunkte aus Farbgruppen + erfüllten Aufgaben aggregieren.
              R8.4e: Spiel-Gesamtwertung über alle Spieler berechnen.
*/

import type { Schlange, Spieler } from './types';
import { ermittleFarbgruppen, type Farbgruppe } from './colorGroups';

export type FarbgruppenWertung = Farbgruppe & { punkte: number };

export interface FarbgruppenPunkteErgebnis {
  gesamtPunkte: number;
  gruppen: FarbgruppenWertung[];
}

export type SchlangenFarbgruppenPunkteErgebnis = FarbgruppenPunkteErgebnis & { schlangenId: string };

export interface SpielerFarbgruppenPunkteErgebnis {
  gesamtPunkte: number;
  schlangen: SchlangenFarbgruppenPunkteErgebnis[];
}

export function berechneSpielerFarbgruppenPunkte(spieler: Spieler): SpielerFarbgruppenPunkteErgebnis {
  const schlangen = spieler.schlangen.map((s) => {
    const ergebnis = berechneFarbgruppenPunkte(s);
    return { schlangenId: s.id, ...ergebnis };
  });
  const gesamtPunkte = schlangen.reduce((sum, s) => sum + s.gesamtPunkte, 0);
  return { gesamtPunkte, schlangen };
}

export interface AufgabenPunkteEintrag {
  aufgabenId: string;
  name: string;
  punkte: number;
}

export interface SpielerAufgabenPunkteErgebnis {
  gesamtPunkte: number;
  aufgaben: AufgabenPunkteEintrag[];
}

export function berechneSpielerAufgabenPunkte(spieler: Spieler): SpielerAufgabenPunkteErgebnis {
  const aufgaben = spieler.erfuellteAufgaben.map((a) => ({
    aufgabenId: a.id,
    name: a.name,
    punkte: a.punkte,
  }));
  const gesamtPunkte = aufgaben.reduce((sum, a) => sum + a.punkte, 0);
  return { gesamtPunkte, aufgaben };
}

export interface SpielerGesamtPunkteErgebnis {
  gesamtPunkte: number;
  farbgruppenPunkte: SpielerFarbgruppenPunkteErgebnis;
  aufgabenPunkte: SpielerAufgabenPunkteErgebnis;
}

export function berechneSpielerGesamtPunkte(spieler: Spieler): SpielerGesamtPunkteErgebnis {
  const farbgruppenPunkte = berechneSpielerFarbgruppenPunkte(spieler);
  const aufgabenPunkte = berechneSpielerAufgabenPunkte(spieler);
  return {
    gesamtPunkte: farbgruppenPunkte.gesamtPunkte + aufgabenPunkte.gesamtPunkte,
    farbgruppenPunkte,
    aufgabenPunkte,
  };
}

export type SpielerWertungsEintrag = {
  spielerId: string;
  name: string;
  gesamtPunkte: number;
  wertung: SpielerGesamtPunkteErgebnis;
};

export interface SpielGesamtwertungErgebnis {
  spielerwertungen: SpielerWertungsEintrag[];
}

export function berechneSpielGesamtwertung(spieler: Spieler[]): SpielGesamtwertungErgebnis {
  return {
    spielerwertungen: spieler.map((s) => {
      const wertung = berechneSpielerGesamtPunkte(s);
      return { spielerId: s.id, name: s.name, gesamtPunkte: wertung.gesamtPunkte, wertung };
    }),
  };
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
