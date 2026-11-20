import type { FarbkarteLegenAktion } from '../aktionen/typen';
import { MAX_SCHLANGEN_PRO_SPIELER } from '../constants';
import { schlangenIdFuer } from '../state';
import type { Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A5: Eine Farbkarte beginnt eine neue eigene Schlange (höchstens zwei je
Spieler) oder setzt eine eigene Schlange an einem ihrer beiden Enden fort.
Gegnerische Schlangen (D9, D19) bringt E5; eine Abwehr gegen Farbkarten gibt es
nicht (D10).
*/

function eigeneSchlangen(zustand: Spielzustand, spielerId: string) {
  return zustand.spieler.find((spieler) => spieler.id === spielerId)?.schlangen ?? [];
}

export const farbkarte: KartenDefinition<FarbkarteLegenAktion> = {
  art: 'Farbkarte',
  aktionstyp: 'FarbkarteLegen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): FarbkarteLegenAktion[] {
    const spieler = zustand.spieler[spielerIndex];
    const basis = { typ: 'FarbkarteLegen', spielerId: spieler.id, karteId: karte.id } as const;
    const anEnden = spieler.schlangen.flatMap((schlange) =>
      (['anfang', 'ende'] as const).map((seite): FarbkarteLegenAktion => ({ ...basis, ziel: { art: 'schlange', schlangenId: schlange.id, seite } })),
    );
    const neu: FarbkarteLegenAktion[] = spieler.schlangen.length < MAX_SCHLANGEN_PRO_SPIELER ? [{ ...basis, ziel: { art: 'neueSchlange' } }] : [];
    return [...neu, ...anEnden];
  },

  pruefe(zustand: Spielzustand, aktion: FarbkarteLegenAktion): string | null {
    const schlangen = eigeneSchlangen(zustand, aktion.spielerId);
    const { ziel } = aktion;
    if (ziel.art === 'neueSchlange') {
      return schlangen.length < MAX_SCHLANGEN_PRO_SPIELER ? null : `Eine neue Schlange geht nicht: Jeder Spieler hat höchstens ${MAX_SCHLANGEN_PRO_SPIELER} Schlangen (A5).`;
    }
    if (schlangen.some((schlange) => schlange.id === ziel.schlangenId)) return null;
    const gegnerisch = zustand.spieler.some((spieler) => spieler.schlangen.some((schlange) => schlange.id === ziel.schlangenId));
    return gegnerisch
      ? `Eine Farbkarte in die gegnerische Schlange ${ziel.schlangenId} ist noch nicht umgesetzt (kommt mit E5, D9).`
      : `Die Schlange ${ziel.schlangenId} gibt es nicht.`;
  },

  betroffene(): number[] {
    return [];
  },

  wirke(zustand: Spielzustand, aktion: FarbkarteLegenAktion): Spielzustand {
    const karte = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
    const { ziel } = aktion;
    if (ziel.art === 'neueSchlange') {
      zustand.schlangenZaehler += 1;
      eigeneSchlangen(zustand, aktion.spielerId).push({ id: schlangenIdFuer(zustand.schlangenZaehler), karten: [karte], fusionen: [] });
      return zustand;
    }
    const schlange = eigeneSchlangen(zustand, aktion.spielerId).find((eintrag) => eintrag.id === ziel.schlangenId)!;
    if (ziel.seite === 'anfang') schlange.karten.unshift(karte);
    else schlange.karten.push(karte);
    return zustand;
  },
};
