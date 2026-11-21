import type { FarbkarteLegenAktion } from '../aktionen/typen';
import { MAX_SCHLANGEN_PRO_SPIELER } from '../constants';
import { alleSchlangen, beginneSchlange, findeSchlange, gepruefteSchlange } from '../schlangen';
import type { Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, spielerIndexVon } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A5, D9, D19: Eine Farbkarte beginnt eine neue eigene Schlange (höchstens zwei je
Spieler) oder setzt jede Schlange am Tisch an einem ihrer beiden Enden fort, auch
die eines Mitspielers. Eine neue Schlange beginnt jeder nur für sich selbst
(D19). Gegen eine Farbkarte gibt es keine Abwehr (A6, D10): Sie trifft niemanden,
auch nicht in einer fremden Schlange.
*/

function eigeneSchlangen(zustand: Spielzustand, spielerId: string) {
  return zustand.spieler[spielerIndexVon(zustand, spielerId)].schlangen;
}

export const farbkarte: KartenDefinition<FarbkarteLegenAktion> = {
  art: 'Farbkarte',
  aktionstyp: 'FarbkarteLegen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): FarbkarteLegenAktion[] {
    const spieler = zustand.spieler[spielerIndex];
    const basis = { typ: 'FarbkarteLegen', spielerId: spieler.id, karteId: karte.id } as const;
    const anEnden = alleSchlangen(zustand).flatMap(({ schlange }) =>
      (['anfang', 'ende'] as const).map((seite): FarbkarteLegenAktion => ({ ...basis, ziel: { art: 'schlange', schlangenId: schlange.id, seite } })),
    );
    const neu: FarbkarteLegenAktion[] = spieler.schlangen.length < MAX_SCHLANGEN_PRO_SPIELER ? [{ ...basis, ziel: { art: 'neueSchlange' } }] : [];
    return [...neu, ...anEnden];
  },

  pruefe(zustand: Spielzustand, aktion: FarbkarteLegenAktion): string | null {
    const { ziel } = aktion;
    if (ziel.art === 'neueSchlange') {
      return eigeneSchlangen(zustand, aktion.spielerId).length < MAX_SCHLANGEN_PRO_SPIELER
        ? null
        : `Eine neue Schlange geht nicht: Jeder Spieler hat höchstens ${MAX_SCHLANGEN_PRO_SPIELER} Schlangen (A5).`;
    }
    return findeSchlange(zustand, ziel.schlangenId) === null ? `Die Schlange ${ziel.schlangenId} gibt es nicht.` : null;
  },

  betroffene(): number[] {
    return [];
  },

  wirke(zustand: Spielzustand, aktion: FarbkarteLegenAktion): Spielzustand {
    const karte = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
    const { ziel } = aktion;
    if (ziel.art === 'neueSchlange') {
      beginneSchlange(zustand, spielerIndexVon(zustand, aktion.spielerId), [karte]);
      return zustand;
    }
    const { schlange } = gepruefteSchlange(zustand, ziel.schlangenId);
    if (ziel.seite === 'anfang') schlange.karten.unshift(karte);
    else schlange.karten.push(karte);
    return zustand;
  },
};
