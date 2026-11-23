import type { VerdopplerSpielenAktion } from '../aktionen/typen';
import type { Spielkarte, Spielzustand } from '../types';
import { legeAufEigenenAblagestapel } from '../zugablauf';
import { meldeZugerweiterung } from '../zuggrenzen';
import type { KartenDefinition } from './register';

/*
A7.8, A5: Der Verdoppler zählt als Sonderkarte des Zuges und geht mit höchstens
einer Farbkarte davor oder danach. Gespielt kommt er auf den eigenen
Ablagestapel (A6) und meldet die Zugerweiterung der Runde an; beim Beenden
dieses Zuges füllt der Spieler auf und spielt sofort einen zweiten Zug
(`zugablauf.ts`). Wann er keine Wirkung hat, im zweiten Zug (A7.8, D11) und
neben einer anderen Zugerweiterung (D46, D47), sagt der Rahmen
(`zuggrenzen.ts`); dann hat er kein Ziel und darf wirkungslos auf den
Ablagestapel (D23). Er trifft keinen Mitspieler, also wehrt ihn niemand ab (A6).
*/

export const verdoppler: KartenDefinition<VerdopplerSpielenAktion> = {
  art: 'Verdoppler',
  aktionstyp: 'VerdopplerSpielen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): VerdopplerSpielenAktion[] {
    return [{ typ: 'VerdopplerSpielen', spielerId: zustand.spieler[spielerIndex].id, karteId: karte.id }];
  },

  pruefe(): string | null {
    return null;
  },

  betroffene(): number[] {
    return [];
  },

  wirke(zustand: Spielzustand, aktion: VerdopplerSpielenAktion): Spielzustand {
    legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId);
    meldeZugerweiterung(zustand.zug, 'Verdoppler', []);
    return zustand;
  },
};
