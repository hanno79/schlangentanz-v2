import type { Schlange, Spielkarte, Spielzustand } from './types';

/*
Die Schlangen am Tisch (A5, D9): finden, durchlaufen, eine neue beginnen und
eine Karte herausnehmen. Hier steht nur, wie Schlangen im Zustand liegen; ob
eine Karte dorthin darf, prüfen die Kartendateien unter `karten/`.
*/

export interface SchlangeAmTisch {
  schlange: Schlange;
  /** Die Stelle des Besitzers in `zustand.spieler`. */
  besitzer: number;
}

/** Die Id der Schlange mit dieser laufenden Nummer. */
export function schlangenIdFuer(nummer: number): string {
  return `schlange-${nummer}`;
}

/**
 * Beginnt für `besitzer` eine neue Schlange mit diesen Karten, hinter seinen
 * bisherigen, und gibt sie zurück. Die Id kommt aus dem Schlangenzähler, damit
 * keine Id zweimal vergeben wird. Verändert `zustand`.
 */
export function beginneSchlange(zustand: Spielzustand, besitzer: number, karten: Spielkarte[] = []): Schlange {
  zustand.schlangenZaehler += 1;
  const schlange: Schlange = { id: schlangenIdFuer(zustand.schlangenZaehler), karten, fusionen: [] };
  zustand.spieler[besitzer].schlangen.push(schlange);
  return schlange;
}

/** Die Schlangen dieser Spieler mit ihrem Besitzer, in der Reihenfolge der Liste und je Spieler in seiner Reihenfolge. */
export function schlangenVon(zustand: Spielzustand, besitzer: readonly number[]): SchlangeAmTisch[] {
  return besitzer.flatMap((index) => zustand.spieler[index].schlangen.map((schlange) => ({ schlange, besitzer: index })));
}

/** Jede Schlange am Tisch mit ihrem Besitzer, in Sitzordnung und je Spieler in seiner Reihenfolge. */
export function alleSchlangen(zustand: Spielzustand): SchlangeAmTisch[] {
  return zustand.spieler.flatMap((spieler, besitzer) => spieler.schlangen.map((schlange) => ({ schlange, besitzer })));
}

/** Die Schlange mit dieser Id, gleich wem sie gehört, oder `null`, wenn es sie nicht gibt. */
export function findeSchlange(zustand: Spielzustand, schlangenId: string): SchlangeAmTisch | null {
  // Ohne Zwischenliste: `pruefe` sucht so für jede aufgezählte Aktion.
  for (const [besitzer, spieler] of zustand.spieler.entries()) {
    const schlange = spieler.schlangen.find((eintrag) => eintrag.id === schlangenId);
    if (schlange !== undefined) return { schlange, besitzer };
  }
  return null;
}

/** Wie `findeSchlange`, für Aktionen, die schon geprüft sind: Fehlt die Schlange, ist das ein Fehler der Engine. */
export function gepruefteSchlange(zustand: Spielzustand, schlangenId: string): SchlangeAmTisch {
  const gefunden = findeSchlange(zustand, schlangenId);
  if (gefunden === null) throw new Error(`Die Schlange ${schlangenId} gibt es nicht.`);
  return gefunden;
}

/**
 * Nimmt die Karte aus der Schlange und gibt sie zurück. Eine Farbenfusion lässt
 * ihre beiden Karten an ihrer Stelle zurück, links zuerst (A7.4, A7.7); eine
 * leere Schlange gibt es danach nicht mehr, ihre Nachbarn schliessen auf.
 * Verändert `zustand`.
 */
export function nimmAusSchlange(zustand: Spielzustand, { schlange, besitzer }: SchlangeAmTisch, karteId: string): Spielkarte {
  const stelle = schlange.karten.findIndex((karte) => karte.id === karteId);
  if (stelle < 0) throw new Error(`Die Karte ${karteId} liegt nicht in der Schlange ${schlange.id}.`);
  const fusion = schlange.fusionen.find((eintrag) => eintrag.karteId === karteId);
  const [karte] = schlange.karten.splice(stelle, 1, ...(fusion?.unter ?? []));
  schlange.fusionen = schlange.fusionen.filter((eintrag) => eintrag !== fusion);
  const spieler = zustand.spieler[besitzer];
  if (schlange.karten.length === 0) spieler.schlangen = spieler.schlangen.filter((eintrag) => eintrag !== schlange);
  return karte;
}
