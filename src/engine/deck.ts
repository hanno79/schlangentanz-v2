import type { Auslagekarte, FarbkarteInfo, Farbe, Sonderkartenname, SonderkarteInfo, Spielkarte } from './types';

/** A1: Farbkarten mit Stückzahl und Punkten. */
const FARBKARTEN: ReadonlyArray<{ farbe: Farbe; anzahl: number; punkte: number; idPrefix: string }> = [
  { farbe: 'Blau', anzahl: 15, punkte: 1, idPrefix: 'blau' },
  { farbe: 'Rot', anzahl: 15, punkte: 1, idPrefix: 'rot' },
  { farbe: 'Gelb', anzahl: 15, punkte: 1, idPrefix: 'gelb' },
  { farbe: 'Violett', anzahl: 12, punkte: 2, idPrefix: 'violett' },
  { farbe: 'Braun', anzahl: 12, punkte: 2, idPrefix: 'braun' },
  { farbe: 'Grün', anzahl: 9, punkte: 3, idPrefix: 'gruen' },
];

/** A1: Sonderkarten mit Stückzahl; `erweiterung` kommen nur mit der Erweiterung ins Spiel (A4). */
const SONDERKARTEN: ReadonlyArray<{ name: Sonderkartenname; anzahl: number; idPrefix: string; erweiterung: boolean }> = [
  { name: 'Farbenschutz', anzahl: 4, idPrefix: 'farbenschutz', erweiterung: false },
  { name: 'Regenbogenschlange', anzahl: 4, idPrefix: 'regenbogenschlange', erweiterung: false },
  { name: 'Schlangenfrass', anzahl: 4, idPrefix: 'schlangenfrass', erweiterung: false },
  { name: 'Schlangenblockade', anzahl: 3, idPrefix: 'schlangenblockade', erweiterung: false },
  { name: 'Farbendieb', anzahl: 4, idPrefix: 'farbendieb', erweiterung: false },
  { name: 'Schlangengrube', anzahl: 3, idPrefix: 'schlangengrube', erweiterung: false },
  { name: 'Farbenfusion', anzahl: 4, idPrefix: 'farbenfusion', erweiterung: false },
  { name: 'Verdoppler', anzahl: 4, idPrefix: 'verdoppler', erweiterung: false },
  { name: 'Schlangenhäutung', anzahl: 3, idPrefix: 'schlangenhaeutung', erweiterung: true },
  { name: 'Schlangenkorb des Glücks', anzahl: 1, idPrefix: 'schlangenkorb-des-gluecks', erweiterung: true },
];

export const SONDERKARTENNAMEN: readonly Sonderkartenname[] = SONDERKARTEN.map((eintrag) => eintrag.name);
export const FARBEN: readonly Farbe[] = FARBKARTEN.map((eintrag) => eintrag.farbe);

function nummer(i: number): string {
  return String(i).padStart(2, '0');
}

/** Alle Spielkarten einer Partie in fester Reihenfolge: 108 ohne, 112 mit Erweiterung (A1, A4). */
export function erstelleSpielkarten(erweiterung: boolean): Spielkarte[] {
  const farbkarten = FARBKARTEN.flatMap(({ farbe, anzahl, punkte, idPrefix }) =>
    Array.from({ length: anzahl }, (_, i): FarbkarteInfo => ({ typ: 'Farbkarte', id: `${idPrefix}-${nummer(i + 1)}`, farbe, punkte })),
  );
  const sonderkarten = SONDERKARTEN.filter((eintrag) => erweiterung || !eintrag.erweiterung).flatMap(({ name, anzahl, idPrefix }) =>
    Array.from({ length: anzahl }, (_, i): SonderkarteInfo => ({ typ: 'Sonderkarte', id: `${idPrefix}-${nummer(i + 1)}`, name })),
  );
  return [...farbkarten, ...sonderkarten];
}

/** A4: je Spieler 1 Comeback- und 2 Risiko-Belohnungs-Karten (A1: 4 und 8 in der Schachtel). */
export function erstelleAuslagekarten(spielerIndex: number): { comeback: Auslagekarte; risiko: Auslagekarte[] } {
  return {
    comeback: { typ: 'Comeback', id: `comeback-${nummer(spielerIndex + 1)}` },
    risiko: [1, 2].map((teil) => ({ typ: 'Risiko-Belohnung', id: `risiko-belohnung-${nummer(2 * spielerIndex + teil)}` })),
  };
}

/** Fisher-Yates (B2). `zufall` liefert Werte in [0, 1); die Engine zieht keinen eigenen Zufall (U4). */
export function mischeDeck<T>(deck: readonly T[], zufall: () => number): T[] {
  const gemischt = [...deck];
  for (let i = gemischt.length - 1; i > 0; i--) {
    const zufallswert = zufall();
    if (!(zufallswert >= 0 && zufallswert < 1)) {
      throw new Error(`Ungültiger Zufallswert ${zufallswert}: Die Zufallsquelle muss Werte von 0 bis kleiner 1 liefern.`);
    }
    const j = Math.floor(zufallswert * (i + 1));
    [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
  }
  return gemischt;
}
