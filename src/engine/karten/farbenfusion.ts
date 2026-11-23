import type { FusionLegenAktion } from '../aktionen/typen';
import { findeSchlange, gepruefteSchlange } from '../schlangen';
import type { FarbkarteInfo, Schlange, Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, mitspielerImUhrzeigersinn } from '../zugablauf';
import type { KartenDefinition } from './register';
import { betroffenerBesitzer, grundVerdeckt } from './schlangenstelle';

/*
A7.7: Die Farbenfusion kommt auf zwei nebeneinanderliegende Karten der gleichen
Farbe; nur zwei Farbkarten derselben Farbe dürfen fusioniert werden (D20). Die
Fusion nimmt in der Schlange den Platz der beiden ein, die Karten bleiben unter
ihr liegen (`Schlange.fusionen`), links zuerst, damit sie beim Entfernen wieder
einzeln an ihrer Stelle liegen (A7.4, E6). Sie geht in jede Schlange am Tisch (D9); in der
Schlange eines Mitspielers trifft sie ihn, und er darf abwehren (A6, D10).
Abgewehrt legt der Reaktionsablauf sie auf den Ablagestapel dessen, der sie
gespielt hat (`reaktion.ts`, A7.2). Pro Zug geht nur eine (A7.7); im zweiten
Zug nach einem Verdoppler ist wieder eine erlaubt (D27), weil jeder Zug neu
zählt; diese Grenze steht im Rahmen des Zuges (`zuggrenzen.ts`, X3). Was die
Fusion in der Wertung bringt, steht in `jokerGruppen.ts` (D30).
*/

/** D20: Nur zwei Farbkarten derselben Farbe lassen sich fusionieren; `pruefePaar` nennt für jeden Fall den Grund. */
function gleichfarbig(links: Spielkarte, rechts: Spielkarte): boolean {
  return links.typ === 'Farbkarte' && rechts.typ === 'Farbkarte' && links.farbe === rechts.farbe;
}

/** Der Grund, warum diese zwei Karten der Schlange nicht unter eine Fusion können, oder `null`. */
function pruefePaar(schlange: Schlange, [linksId, rechtsId]: readonly [string, string]): string | null {
  if (linksId === rechtsId) return `Die Farbenfusion kommt auf zwei verschiedene Karten, ${linksId} ist zweimal genannt (A7.7).`;
  const links = schlange.karten.findIndex((karte) => karte.id === linksId);
  const rechts = schlange.karten.findIndex((karte) => karte.id === rechtsId);
  const fehlend = links < 0 ? linksId : rechts < 0 ? rechtsId : null;
  if (fehlend !== null) {
    return grundVerdeckt(
      schlange,
      fehlend,
      (fusionId) => `Die Karte ${fehlend} liegt unter der Farbenfusion ${fusionId}; fusionieren lassen sich nur Karten, die offen in der Schlange liegen (A7.7).`,
    );
  }
  if (rechts === links - 1) return `Die Farbenfusion nennt ihre zwei Karten links zuerst: erst ${rechtsId}, dann ${linksId}.`;
  if (rechts !== links + 1) return `Die Karten ${linksId} und ${rechtsId} liegen nicht nebeneinander; die Farbenfusion kommt auf zwei nebeneinanderliegende Karten (A7.7).`;
  const linkeKarte = schlange.karten[links];
  const rechteKarte = schlange.karten[rechts];
  if (linkeKarte.typ !== 'Farbkarte' || rechteKarte.typ !== 'Farbkarte') {
    const sonderkarte = linkeKarte.typ === 'Farbkarte' ? rechtsId : linksId;
    return `Fusionieren lassen sich nur zwei Farbkarten derselben Farbe, keine Sonderkarte wie ${sonderkarte} (D20).`;
  }
  if (linkeKarte.farbe !== rechteKarte.farbe) {
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
    const spielerId = zustand.spieler[spielerIndex].id;
    const ziele: FusionLegenAktion[] = [];
    for (const schlange of schlangenAmTisch(zustand, spielerIndex)) {
      for (let rechts = 1; rechts < schlange.karten.length; rechts += 1) {
        const linkeKarte = schlange.karten[rechts - 1];
        const rechteKarte = schlange.karten[rechts];
        if (gleichfarbig(linkeKarte, rechteKarte)) {
          ziele.push({ typ: 'FusionLegen', spielerId, karteId: karte.id, schlangenId: schlange.id, kartenIds: [linkeKarte.id, rechteKarte.id] });
        }
      }
    }
    return ziele;
  },

  pruefe(zustand: Spielzustand, aktion: FusionLegenAktion): string | null {
    const fundort = findeSchlange(zustand, aktion.schlangenId);
    if (fundort === null) return `Die Schlange ${aktion.schlangenId} gibt es nicht.`;
    return pruefePaar(fundort.schlange, aktion.kartenIds);
  },

  betroffene: betroffenerBesitzer,

  wirke(zustand: Spielzustand, aktion: FusionLegenAktion): Spielzustand {
    const karte = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
    if (karte.typ !== 'Sonderkarte') throw new Error(`Die Karte ${karte.id} ist keine Farbenfusion.`);
    const { schlange } = gepruefteSchlange(zustand, aktion.schlangenId);
    const links = schlange.karten.findIndex((eintrag) => eintrag.id === aktion.kartenIds[0]);
    // Links zuerst, wie sie in der Schlange lagen; E6 legt sie beim Fressen so zurück.
    const unter = schlange.karten.splice(links, 2, karte) as [FarbkarteInfo, FarbkarteInfo];
    schlange.fusionen.push({ karteId: karte.id, unter });
    zustand.zug.farbenfusionGespielt = true;
    return zustand;
  },
};
