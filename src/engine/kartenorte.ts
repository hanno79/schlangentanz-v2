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
export function istVerdeckt(ort: Kartenort): boolean {
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
 * fehlen; deren Reihenfolge stimmt schon.
 */
function versetzungen(vorher: ReadonlyMap<string, Kartenort>, nachher: ReadonlyMap<string, Kartenort>): Versetzung[] {
  const bewegt = new Set<string>();
  const geblieben = new Map<string, { vorher: string[]; nachher: string[] }>();
  for (const [karteId, nach] of nachher) {
    const schluessel = behaelter(nach);
    if (behaelter(ortVon(vorher, karteId, 'vor')) !== schluessel) bewegt.add(karteId);
    else if ('position' in nach) {
      if (!geblieben.has(schluessel)) geblieben.set(schluessel, { vorher: [], nachher: [] });
      geblieben.get(schluessel)!.nachher.push(karteId);
    }
  }
  for (const [karteId, von] of vorher) {
    ortVon(nachher, karteId, 'nach');
    if (!bewegt.has(karteId) && 'position' in von) geblieben.get(behaelter(von))!.vorher.push(karteId);
  }
  for (const folge of geblieben.values()) {
    folge.nachher.forEach((karteId, stelle) => {
      if (folge.vorher[stelle] !== karteId) bewegt.add(karteId);
    });
  }
  // Offene Ziele in der Folge danach, damit das Einfügen jede Position trifft; verdeckte in der Folge davor,
  // damit die Liste nicht verrät, wie die Karten in Hand oder Nachziehstapel liegen (B2).
  const offen = [...nachher].filter(([karteId, nach]) => bewegt.has(karteId) && !istVerdeckt(nach));
  const verdeckt = [...vorher].filter(([karteId]) => bewegt.has(karteId) && istVerdeckt(nachher.get(karteId)!));
  return [
    ...offen.map(([karteId, nach]) => ({ karteId, von: vorher.get(karteId)!, nach })),
    ...verdeckt.map(([karteId, von]) => ({ karteId: null, von, nach: nachher.get(karteId)! })),
  ];
}

function schlangenIds(zustand: Spielzustand): string[] {
  return zustand.spieler.flatMap((spieler) => spieler.schlangen.map((schlange) => schlange.id));
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
  const schlangenVorher = schlangenIds(zustand);
  const nach = wirkung(zustand);
  const karten = versetzungen(vorher, alleKartenorte(nach, karteId));
  const bestehend = new Set(schlangenIds(nach));
  const aufgeloest = schlangenVorher.filter((schlangenId) => !bestehend.has(schlangenId));
  if (karten.length > 0 || aufgeloest.length > 0) ereignisse.push({ typ: 'KartenVersetzt', spielerIndex, karteId, karten, aufgeloest });
  return nach;
}
