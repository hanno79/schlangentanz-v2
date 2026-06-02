/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Erzeugt Farbkarten, Sonderkarten und gemischte Decks.
*/

import type { FarbkarteInfo, Farbe, SonderkarteInfo, Spielkarte } from './types';
import { SONDERKARTEN_GESAMT } from './constants';

const FARB_KONFIGURATION: ReadonlyArray<{
  farbe: Farbe;
  anzahl: number;
  punkte: number;
}> = [
  { farbe: 'Blau', anzahl: 15, punkte: 1 },
  { farbe: 'Rot', anzahl: 15, punkte: 1 },
  { farbe: 'Gelb', anzahl: 15, punkte: 1 },
  { farbe: 'Violett', anzahl: 12, punkte: 2 },
  { farbe: 'Braun', anzahl: 12, punkte: 2 },
  { farbe: 'Grün', anzahl: 9, punkte: 3 },
];

const ERWEITERUNGS_SONDERKARTEN: ReadonlyArray<{
  name: string;
  anzahl: number;
  idPrefix: string;
}> = [
  { name: 'Schlangenhäutung', anzahl: 4, idPrefix: 'schlangenhaeutung' },
  { name: 'Schlangenkorb des Glücks', anzahl: 1, idPrefix: 'schlangenkorb-des-gluecks' },
  { name: 'Comeback', anzahl: 4, idPrefix: 'comeback' },
  { name: 'Risiko-Belohnung', anzahl: 8, idPrefix: 'risiko-belohnung' },
];

export function erstelleFarbkarten(): FarbkarteInfo[] {
  const karten: FarbkarteInfo[] = [];
  for (const { farbe, anzahl, punkte } of FARB_KONFIGURATION) {
    for (let i = 1; i <= anzahl; i++) {
      karten.push({
        typ: 'Farbkarte',
        id: `${farbe.toLowerCase()}-${String(i).padStart(2, '0')}`,
        farbe,
        punkte,
      });
    }
  }
  return karten;
}

export function erstelleSonderkarten(): SonderkarteInfo[] {
  return Array.from({ length: SONDERKARTEN_GESAMT }, (_, index) => ({
    typ: 'Sonderkarte',
    id: `sonderkarte-${String(index + 1).padStart(2, '0')}`,
    name: 'Sonderkarte',
  }));
}

export function erstelleErweiterungsSonderkarten(): SonderkarteInfo[] {
  const karten: SonderkarteInfo[] = [];

  for (const { name, anzahl, idPrefix } of ERWEITERUNGS_SONDERKARTEN) {
    for (let i = 1; i <= anzahl; i++) {
      karten.push({
        typ: 'Sonderkarte',
        id: `${idPrefix}-${String(i).padStart(2, '0')}`,
        name,
      });
    }
  }

  return karten;
}

export function erstelleHauptdeck(): Spielkarte[] {
  return [...erstelleFarbkarten(), ...erstelleSonderkarten()];
}

// Fisher-Yates-Mischung; rng-Parameter ermöglicht deterministisches Testen.
export function mischeDeck<T>(deck: T[], rng: () => number): T[] {
  const gemischt = [...deck];
  for (let i = gemischt.length - 1; i > 0; i--) {
    const zufallswert = rng();
    if (zufallswert < 0 || zufallswert >= 1) {
      throw new Error('Ungültiger Zufallswert: rng muss Werte von 0 bis kleiner 1 liefern.');
    }
    const j = Math.floor(zufallswert * (i + 1));
    [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
  }
  return gemischt;
}
