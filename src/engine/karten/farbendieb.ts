import type { FarbendiebSpielenAktion } from '../aktionen/typen';
import { istGueltigeEinfuegePosition } from '../constants';
import { beginneSchlange, findeSchlange, gepruefteSchlange, nimmAusSchlange, schlangenVon } from '../schlangen';
import type { Schlange, Spielkarte, Spielzustand } from '../types';
import { legeAufEigenenAblagestapel, mitspielerImUhrzeigersinn, spielerIndexVon } from '../zugablauf';
import type { KartenDefinition } from './register';
import { grundVerdeckt } from './schlangenstelle';

/*
A7.1, D2, D17: Der Farbendieb nimmt eine Farbkarte aus einer gegnerischen
Schlange und legt sie an eine beliebige Stelle einer eigenen Schlange; hat der
Dieb keine Schlange, beginnt sie eine neue. Sonderkarten stiehlt er nicht (D2),
auch keine Farbkarte unter einer Farbenfusion: die liegt nicht offen in der
Schlange, sondern darunter (A7.7). Betroffen ist der Besitzer der Schlange, aus
der gestohlen wird; er darf abwehren (A6, A7.2). Wehrt er ab, legt der
Reaktionsablauf den Farbendieb ohne Wirkung auf den Ablagestapel des Diebs
(`reaktion.ts`), und `wirke` wird nicht gerufen. Sonst kommt er nach dem
Diebstahl dorthin.
*/

type Ziel = FarbendiebSpielenAktion['ziel'];

/** A7.1, D2: die offen liegenden Farbkarten in den Schlangen der Mitspieler, im Uhrzeigersinn ab dem linken Nachbarn. */
function beute(zustand: Spielzustand, spielerIndex: number): FarbendiebSpielenAktion['quelle'][] {
  return schlangenVon(zustand, mitspielerImUhrzeigersinn(zustand, spielerIndex)).flatMap(({ schlange }) =>
    schlange.karten.filter((karte) => karte.typ === 'Farbkarte').map((karte) => ({ schlangenId: schlange.id, karteId: karte.id })),
  );
}

/** A7.1, D17: jede Stelle jeder eigenen Schlange; ohne eigene Schlange nur eine neue. */
function ablageorte(eigene: readonly Schlange[]): Ziel[] {
  if (eigene.length === 0) return [{ art: 'neueSchlange' }];
  return eigene.flatMap((schlange) =>
    Array.from({ length: schlange.karten.length + 1 }, (_, position): Ziel => ({ art: 'schlange', schlangenId: schlange.id, position })),
  );
}

function pruefeQuelle(zustand: Spielzustand, dieb: number, quelle: FarbendiebSpielenAktion['quelle']): string | null {
  const gefunden = findeSchlange(zustand, quelle.schlangenId);
  if (gefunden === null) return `Die Schlange ${quelle.schlangenId} gibt es nicht.`;
  if (gefunden.besitzer === dieb) return 'Der Farbendieb stiehlt aus einer gegnerischen Schlange, nicht aus der eigenen (A7.1).';
  const karte = gefunden.schlange.karten.find((eintrag) => eintrag.id === quelle.karteId);
  if (karte === undefined) {
    return grundVerdeckt(
      gefunden.schlange,
      quelle.karteId,
      () => `Die Karte ${quelle.karteId} liegt unter einer Farbenfusion; gestohlen werden nur Farbkarten, die offen in der Schlange liegen (A7.1, A7.7).`,
    );
  }
  if (karte.typ !== 'Farbkarte') return `Die Karte ${karte.id} ist eine Sonderkarte (${karte.name}); der Farbendieb stiehlt nur Farbkarten (D2).`;
  return null;
}

function pruefeZiel(zustand: Spielzustand, dieb: number, ziel: Ziel): string | null {
  const eigene = zustand.spieler[dieb].schlangen;
  if (ziel.art === 'neueSchlange') {
    return eigene.length === 0
      ? null
      : 'Die gestohlene Karte beginnt nur dann eine neue Schlange, wenn der Dieb keine Schlange hat; sonst kommt sie in eine eigene Schlange (D17).';
  }
  const schlange = eigene.find((eintrag) => eintrag.id === ziel.schlangenId);
  if (schlange === undefined) {
    return findeSchlange(zustand, ziel.schlangenId) === null
      ? `Die Schlange ${ziel.schlangenId} gibt es nicht.`
      : `Die gestohlene Karte kommt in eine eigene Schlange, nicht in die Schlange ${ziel.schlangenId} eines Mitspielers (D17).`;
  }
  if (!istGueltigeEinfuegePosition(ziel.position, schlange.karten.length)) {
    return `Die Stelle ${ziel.position} gibt es in ${schlange.id} nicht; erlaubt sind 0 bis ${schlange.karten.length} (A7.1).`;
  }
  return null;
}

export const farbendieb: KartenDefinition<FarbendiebSpielenAktion> = {
  art: 'Farbendieb',
  aktionstyp: 'FarbendiebSpielen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): FarbendiebSpielenAktion[] {
    const spieler = zustand.spieler[spielerIndex];
    const orte = ablageorte(spieler.schlangen);
    return beute(zustand, spielerIndex).flatMap((quelle) =>
      orte.map((ziel): FarbendiebSpielenAktion => ({ typ: 'FarbendiebSpielen', spielerId: spieler.id, karteId: karte.id, quelle, ziel })),
    );
  },

  pruefe(zustand: Spielzustand, aktion: FarbendiebSpielenAktion): string | null {
    const dieb = spielerIndexVon(zustand, aktion.spielerId);
    return pruefeQuelle(zustand, dieb, aktion.quelle) ?? pruefeZiel(zustand, dieb, aktion.ziel);
  },

  betroffene(zustand: Spielzustand, aktion: FarbendiebSpielenAktion): number[] {
    const gefunden = findeSchlange(zustand, aktion.quelle.schlangenId);
    return gefunden === null ? [] : [gefunden.besitzer];
  },

  wirke(zustand: Spielzustand, aktion: FarbendiebSpielenAktion): Spielzustand {
    legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId);
    const karte = nimmAusSchlange(zustand, gepruefteSchlange(zustand, aktion.quelle.schlangenId), aktion.quelle.karteId);
    const { ziel } = aktion;
    if (ziel.art === 'neueSchlange') beginneSchlange(zustand, spielerIndexVon(zustand, aktion.spielerId), [karte]);
    else gepruefteSchlange(zustand, ziel.schlangenId).schlange.karten.splice(ziel.position, 0, karte);
    return zustand;
  },
};
