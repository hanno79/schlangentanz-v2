import type { Ereignis, Kartenort, Versetzung } from './aktionen/typen';
import type { Spielkarte, Spielzustand } from './types';

/*
Wo jede Karte liegt, und was eine Kartenwirkung davon geändert hat (Plan E4b).
Die Engine vergleicht die Orte vor und nach der Wirkung für jede Karte gleich,
ohne zu wissen, welche Karte gewirkt hat, und meldet das Ergebnis als
`KartenVersetzt`. So muss weder die Oberfläche Zustände vergleichen noch eine
Kartendatei ihre Bewegungen selbst melden.
*/

/**
 * Der Ort jeder Karte im Zustand, ohne die Karte `ohne`, die auch bei den
 * Positionen nicht mitzählt. Die Reihenfolge ist je Ort aufsteigend, die Orte
 * folgen dem Zustand.
 */
export function alleKartenorte(zustand: Spielzustand, ohne: string | null = null): Map<string, Kartenort> {
  const orte = new Map<string, Kartenort>();
  const sichtbar = (karten: readonly Spielkarte[]) => karten.filter((karte) => karte.id !== ohne);
  for (const [spielerIndex, spieler] of zustand.spieler.entries()) {
    for (const karte of spieler.hand) orte.set(karte.id, { ort: 'Hand', spielerIndex });
    for (const { id: schlangenId, karten, fusionen } of spieler.schlangen) {
      sichtbar(karten).forEach((karte, position) => orte.set(karte.id, { ort: 'Schlange', spielerIndex, schlangenId, position }));
      for (const { karteId: fusionId, unter } of fusionen) {
        unter.forEach((karte, position) => orte.set(karte.id, { ort: 'UnterFusion', spielerIndex, schlangenId, fusionId, position }));
      }
    }
    sichtbar(spieler.ablagestapel).forEach((karte, position) => orte.set(karte.id, { ort: 'Ablagestapel', spielerIndex, position }));
  }
  for (const karte of zustand.nachziehstapel) orte.set(karte.id, { ort: 'Nachziehstapel' });
  for (const grube of zustand.ausliegendeGruben) orte.set(grube.karte.id, { ort: 'VorSpieler', spielerIndex: grube.vor });
  if (zustand.schwebend !== null) orte.set(zustand.schwebend.karte.id, { ort: 'Schwebend' });
  for (const karte of zustand.ausDemSpiel) orte.set(karte.id, { ort: 'AusDemSpiel' });
  if (ohne !== null) orte.delete(ohne);
  return orte;
}

/** Der Ort ohne Position: Karten mit demselben Behälter liegen am selben Ort. */
function behaelter(ort: Kartenort): string {
  return JSON.stringify({ ...ort, position: undefined });
}

/** Hände und Nachziehstapel sind verdeckt; ihre Reihenfolge meldet niemand (B2). */
function istVerdeckt(ort: Kartenort): boolean {
  return ort.ort === 'Hand' || ort.ort === 'Nachziehstapel';
}

function ortVon(orte: ReadonlyMap<string, Kartenort>, karteId: string, wann: string): Kartenort {
  const ort = orte.get(karteId);
  if (ort === undefined) throw new Error(`Die Karte ${karteId} liegt ${wann} der Wirkung an keinem Ort, den ein Ereignis nennen kann.`);
  return ort;
}

/**
 * Die Karten, die von `vorher` nach `nachher` den Ort gewechselt haben, und in
 * jedem geordneten Ort die Karten, die ihre Reihenfolge zu den dort gebliebenen
 * geändert haben. Gebliebene Karten an derselben Stelle der gebliebenen Folge
 * fehlen; deren Reihenfolge stimmt schon. Sortiert nach `nachher`, damit das
 * Einfügen in Listenreihenfolge jede Position trifft.
 */
function versetzungen(vorher: ReadonlyMap<string, Kartenort>, nachher: ReadonlyMap<string, Kartenort>): Versetzung[] {
  for (const karteId of vorher.keys()) ortVon(nachher, karteId, 'nach');
  const bewegt = new Set<string>();
  const geblieben = new Map<string, { vorher: string[]; nachher: string[] }>();
  for (const [karteId, nach] of nachher) {
    const von = ortVon(vorher, karteId, 'vor');
    if (behaelter(von) !== behaelter(nach)) bewegt.add(karteId);
    else if ('position' in nach) {
      const folge = geblieben.get(behaelter(nach)) ?? { vorher: [], nachher: [] };
      folge.nachher.push(karteId);
      geblieben.set(behaelter(nach), folge);
    }
  }
  for (const [karteId, von] of vorher) {
    if (!bewegt.has(karteId) && 'position' in von) geblieben.get(behaelter(von))!.vorher.push(karteId);
  }
  for (const folge of geblieben.values()) {
    folge.nachher.forEach((karteId, stelle) => {
      if (folge.vorher[stelle] !== karteId) bewegt.add(karteId);
    });
  }
  return [...nachher]
    .filter(([karteId]) => bewegt.has(karteId))
    .map(([karteId, nach]) => ({ karteId: istVerdeckt(nach) ? null : karteId, von: vorher.get(karteId)!, nach }));
}

/**
 * Führt die Wirkung der gespielten Karte `karteId` aus und meldet, was sie
 * ausser dieser Karte bewegt hat (`KartenVersetzt`); bewegt sie nichts sonst,
 * kein Ereignis. Die gespielte Karte meldet der Aufrufer danach selbst.
 */
export function wirkeUndMeldeVersetzte(
  zustand: Spielzustand,
  spielerIndex: number,
  karteId: string,
  wirkung: (zustand: Spielzustand) => Spielzustand,
  ereignisse: Ereignis[],
): Spielzustand {
  const vorher = alleKartenorte(zustand, karteId);
  const schlangenVorher = zustand.spieler.flatMap((spieler) => spieler.schlangen.map((schlange) => schlange.id));
  const nach = wirkung(zustand);
  const karten = versetzungen(vorher, alleKartenorte(nach, karteId));
  const bestehend = new Set(nach.spieler.flatMap((spieler) => spieler.schlangen.map((schlange) => schlange.id)));
  const aufgeloest = schlangenVorher.filter((schlangenId) => !bestehend.has(schlangenId));
  if (karten.length > 0 || aufgeloest.length > 0) ereignisse.push({ typ: 'KartenVersetzt', spielerIndex, karteId, karten, aufgeloest });
  return nach;
}
