import type { VerdopplerSpielenAktion } from '../aktionen/typen';
import type { Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A7.8, A5: Der Verdoppler zählt als Sonderkarte des Zuges und geht mit höchstens
einer Farbkarte davor oder danach (die Grenze je Zug prüft die Aktionsschicht,
`kartengrenze`). Gespielt kommt er auf den eigenen Ablagestapel (A6). Beim
Beenden dieses Zuges füllt der Spieler auf und spielt sofort einen zweiten Zug
(`zugablauf.ts`). Im zweiten Zug wirkt kein weiterer Verdoppler (A7.8, D11); er
hat dort kein Ziel und darf deshalb wirkungslos auf den Ablagestapel (D23).
Er trifft keinen Mitspieler, also wehrt ihn niemand ab (A6).
*/

const ZWEITER_ZUG =
  'Im zweiten Zug nach einem Verdoppler gibt ein weiterer Verdoppler keinen weiteren Zug (A7.8, D11); er lässt sich nur wirkungslos auf den eigenen Ablagestapel legen (D23).';

export const verdoppler: KartenDefinition<VerdopplerSpielenAktion> = {
  art: 'Verdoppler',
  aktionstyp: 'VerdopplerSpielen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): VerdopplerSpielenAktion[] {
    if (zustand.zug.teilzug === 2) return [];
    return [{ typ: 'VerdopplerSpielen', spielerId: zustand.spieler[spielerIndex].id, karteId: karte.id }];
  },

  pruefe(zustand: Spielzustand): string | null {
    return zustand.zug.teilzug === 2 ? ZWEITER_ZUG : null;
  },

  betroffene(): number[] {
    return [];
  },

  wirke(zustand: Spielzustand, aktion: VerdopplerSpielenAktion): Spielzustand {
    const karte = entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
    zustand.spieler.find((spieler) => spieler.id === aktion.spielerId)!.ablagestapel.push(karte);
    zustand.zug.verdopplerGespielt = true;
    return zustand;
  },
};
