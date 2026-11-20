import type { SchlangengrubeSpielenAktion } from '../aktionen/typen';
import type { Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, mitspielerImUhrzeigersinn } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A7.6: Die Schlangengrube trifft einen Mitspieler nach Wahl; er muss seinen
nächsten Zug komplett aussetzen. Sie ist abwehrbar; abgewehrt legt der
Reaktionsablauf sie ohne Wirkung auf den Ablagestapel dessen, der sie gespielt
hat (`reaktion.ts`, A7.2). Sonst liegt sie vor dem Getroffenen, bis er für sie
ausgesetzt hat, und geht dann auf jenen Ablagestapel (`zugablauf.ts`, D14, D18,
D21). Angeboten ist jeder Mitspieler, auch einer, der keinen Zug mehr hat; dort
geht sie ohne Wirkung ab (D29). Ob das klug ist, entscheidet der Spieler.
*/

function zielIndex(zustand: Spielzustand, aktion: SchlangengrubeSpielenAktion): number {
  return zustand.spieler.findIndex((spieler) => spieler.id === aktion.zielSpielerId);
}

export const schlangengrube: KartenDefinition<SchlangengrubeSpielenAktion> = {
  art: 'Schlangengrube',
  aktionstyp: 'SchlangengrubeSpielen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): SchlangengrubeSpielenAktion[] {
    const spielerId = zustand.spieler[spielerIndex].id;
    return mitspielerImUhrzeigersinn(zustand, spielerIndex).map((ziel) => ({
      typ: 'SchlangengrubeSpielen',
      spielerId,
      karteId: karte.id,
      zielSpielerId: zustand.spieler[ziel].id,
    }));
  },

  pruefe(zustand: Spielzustand, aktion: SchlangengrubeSpielenAktion): string | null {
    if (zielIndex(zustand, aktion) < 0) return `Den Spieler „${aktion.zielSpielerId}“ gibt es nicht; die Schlangengrube trifft einen Mitspieler (A7.6).`;
    if (aktion.zielSpielerId === aktion.spielerId) return 'Die Schlangengrube trifft einen Mitspieler, nicht dich selbst (A7.6).';
    return null;
  },

  betroffene(zustand: Spielzustand, aktion: SchlangengrubeSpielenAktion): number[] {
    return [zielIndex(zustand, aktion)];
  },

  wirke(zustand: Spielzustand, aktion: SchlangengrubeSpielenAktion): Spielzustand {
    const karte = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
    if (karte.typ !== 'Sonderkarte') throw new Error(`Die Karte ${karte.id} ist keine Schlangengrube.`);
    const gespieltVon = zustand.spieler.findIndex((spieler) => spieler.id === aktion.spielerId);
    zustand.ausliegendeGruben.push({ karte, gespieltVon, vor: zielIndex(zustand, aktion) });
    return zustand;
  },
};
