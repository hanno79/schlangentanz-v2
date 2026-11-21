import type { FusionLegenAktion } from '../aktionen/typen';
import type { FarbkarteInfo, Schlange, Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, mitspielerImUhrzeigersinn, spielerIndexVon } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A7.7: Die Farbenfusion kommt auf zwei nebeneinanderliegende Karten der gleichen
Farbe; nur zwei Farbkarten derselben Farbe dürfen fusioniert werden (D20). Die
Fusion nimmt in der Schlange den Platz der beiden ein, die Karten bleiben unter
ihr liegen (`Schlange.fusionen`), damit sie beim Entfernen wieder einzeln an
ihrer Stelle liegen (A7.4, E6). Sie geht in jede Schlange am Tisch (D9); in der
Schlange eines Mitspielers trifft sie ihn, und er darf abwehren (A6, D10).
Abgewehrt legt der Reaktionsablauf sie auf den Ablagestapel dessen, der sie
gespielt hat (`reaktion.ts`, A7.2). Pro Zug geht nur eine (A7.7); im zweiten
Zug nach einem Verdoppler ist wieder eine erlaubt (D27), weil jeder Zug neu
zählt. Was die Fusion in der Wertung bringt, steht in `jokerGruppen.ts` (D30).
*/

const NUR_EINE = 'Pro Zug nur eine Farbenfusion (A7.7); in diesem Zug ist schon eine gespielt.';

interface Fundort {
  schlange: Schlange;
  besitzer: number;
}

function findeSchlange(zustand: Spielzustand, schlangenId: string): Fundort | null {
  for (const [besitzer, spieler] of zustand.spieler.entries()) {
    const schlange = spieler.schlangen.find((eintrag) => eintrag.id === schlangenId);
    if (schlange !== undefined) return { schlange, besitzer };
  }
  return null;
}

/** D20: Nur zwei Farbkarten derselben Farbe lassen sich fusionieren. */
function gleichfarbig(links: Spielkarte, rechts: Spielkarte): boolean {
  return links.typ === 'Farbkarte' && rechts.typ === 'Farbkarte' && links.farbe === rechts.farbe;
}

/** Der Grund, warum diese zwei Karten der Schlange nicht unter eine Fusion können, oder `null`. */
function pruefePaar(schlange: Schlange, [linksId, rechtsId]: readonly [string, string]): string | null {
  if (linksId === rechtsId) return `Die Farbenfusion kommt auf zwei verschiedene Karten, ${linksId} ist zweimal genannt (A7.7).`;
  const stelle = (id: string) => schlange.karten.findIndex((karte) => karte.id === id);
  for (const id of [linksId, rechtsId]) {
    if (stelle(id) >= 0) continue;
    const verdeckt = schlange.fusionen.find((fusion) => fusion.unter.some((karte) => karte.id === id));
    return verdeckt === undefined
      ? `Die Karte ${id} liegt nicht in der Schlange ${schlange.id}.`
      : `Die Karte ${id} liegt unter der Farbenfusion ${verdeckt.karteId}; fusionieren lassen sich nur Karten, die offen in der Schlange liegen (A7.7).`;
  }
  const links = stelle(linksId);
  const rechts = stelle(rechtsId);
  if (rechts === links - 1) return `Die Farbenfusion nennt ihre zwei Karten links zuerst: erst ${rechtsId}, dann ${linksId}.`;
  if (rechts !== links + 1) return `Die Karten ${linksId} und ${rechtsId} liegen nicht nebeneinander; die Farbenfusion kommt auf zwei nebeneinanderliegende Karten (A7.7).`;
  const [linkeKarte, rechteKarte] = [schlange.karten[links], schlange.karten[rechts]];
  if (linkeKarte.typ !== 'Farbkarte' || rechteKarte.typ !== 'Farbkarte') {
    return `Fusionieren lassen sich nur zwei Farbkarten derselben Farbe, keine Sonderkarte wie ${linkeKarte.typ === 'Farbkarte' ? rechtsId : linksId} (D20).`;
  }
  if (!gleichfarbig(linkeKarte, rechteKarte)) {
    return `Die Karten ${linksId} (${linkeKarte.farbe}) und ${rechtsId} (${rechteKarte.farbe}) haben nicht die gleiche Farbe (A7.7).`;
  }
  return null;
}

/** Die Schlangen am Tisch, zuerst die eigenen, dann die der Mitspieler im Uhrzeigersinn (D9). */
function schlangenAmTisch(zustand: Spielzustand, spielerIndex: number): Schlange[] {
  return [spielerIndex, ...mitspielerImUhrzeigersinn(zustand, spielerIndex)].flatMap((index) => zustand.spieler[index].schlangen);
}

export const farbenfusion: KartenDefinition<FusionLegenAktion> = {
  art: 'Farbenfusion',
  aktionstyp: 'FusionLegen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): FusionLegenAktion[] {
    if (zustand.zug.farbenfusionGespielt) return [];
    const spielerId = zustand.spieler[spielerIndex].id;
    return schlangenAmTisch(zustand, spielerIndex).flatMap((schlange) =>
      schlange.karten.slice(1).flatMap((rechts, stelle): FusionLegenAktion[] => {
        const links = schlange.karten[stelle];
        if (!gleichfarbig(links, rechts)) return [];
        return [{ typ: 'FusionLegen', spielerId, karteId: karte.id, schlangenId: schlange.id, kartenIds: [links.id, rechts.id] }];
      }),
    );
  },

  pruefe(zustand: Spielzustand, aktion: FusionLegenAktion): string | null {
    if (zustand.zug.farbenfusionGespielt) return NUR_EINE;
    const fundort = findeSchlange(zustand, aktion.schlangenId);
    if (fundort === null) return `Die Schlange ${aktion.schlangenId} gibt es nicht.`;
    return pruefePaar(fundort.schlange, aktion.kartenIds);
  },

  betroffene(zustand: Spielzustand, aktion: FusionLegenAktion): number[] {
    const fundort = findeSchlange(zustand, aktion.schlangenId);
    if (fundort === null) throw new Error(`Die Schlange ${aktion.schlangenId} gibt es nicht.`);
    return fundort.besitzer === spielerIndexVon(zustand, aktion.spielerId) ? [] : [fundort.besitzer];
  },

  wirke(zustand: Spielzustand, aktion: FusionLegenAktion): Spielzustand {
    const karte = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
    if (karte.typ !== 'Sonderkarte') throw new Error(`Die Karte ${karte.id} ist keine Farbenfusion.`);
    const { schlange } = findeSchlange(zustand, aktion.schlangenId)!;
    const links = schlange.karten.findIndex((eintrag) => eintrag.id === aktion.kartenIds[0]);
    const unter = schlange.karten.splice(links, 2, karte) as [FarbkarteInfo, FarbkarteInfo];
    schlange.fusionen.push({ karteId: karte.id, unter });
    zustand.zug.farbenfusionGespielt = true;
    return zustand;
  },
};
