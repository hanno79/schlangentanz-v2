/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Erzeugt Farbkarten, Sonderkarten und gemischte Decks.
*/

import type { FarbkarteInfo, Farbe, SonderkarteInfo, Spielkarte } from './types';

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

const BASIS_SONDERKARTEN: ReadonlyArray<{
  name: string;
  anzahl: number;
  idPrefix: string;
}> = [
  { name: 'Farbenschutz', anzahl: 4, idPrefix: 'farbenschutz' },
  { name: 'Regenbogenschlange', anzahl: 4, idPrefix: 'regenbogenschlange' },
  { name: 'Schlangenfrass', anzahl: 4, idPrefix: 'schlangenfrass' },
  { name: 'Schlangenblockade', anzahl: 4, idPrefix: 'schlangenblockade' },
  { name: 'Farbendieb', anzahl: 4, idPrefix: 'farbendieb' },
  { name: 'Schlangengrube', anzahl: 4, idPrefix: 'schlangengrube' },
  { name: 'Farbenfusion', anzahl: 4, idPrefix: 'farbenfusion' },
  { name: 'Verdoppler', anzahl: 4, idPrefix: 'verdoppler' },
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
  const karten: SonderkarteInfo[] = [];

  for (const { name, anzahl, idPrefix } of BASIS_SONDERKARTEN) {
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

// ÄNDERUNG [05.07.2026]: H1 — das tatsächlich gemischte digitale Spieldeck umfasst zusätzlich
// die 4 Schlangenhäutung-Karten der Erweiterung (110 Basis + 4 = 114). Ohne sie wären die
// Häutungs-Mechanik und die Aufgabe "Schlangentanz" unerreichbar. Die übrigen
// Erweiterungskarten (Comeback, Risiko-Belohnung, Schlangenkorb) bleiben vorerst außerhalb.
export function erstelleSpieldeck(): Spielkarte[] {
  const schlangenhaeutung = erstelleErweiterungsSonderkarten().filter((karte) => karte.name === 'Schlangenhäutung');
  return [...erstelleHauptdeck(), ...schlangenhaeutung];
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
