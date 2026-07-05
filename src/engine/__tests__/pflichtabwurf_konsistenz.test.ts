/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix K3 — der Enumerator (ermittleLegaleAktionen) und der Validator
              (pruefeAktion) müssen bei PflichtAbwurf übereinstimmen. Zuvor bot der
              Enumerator PflichtAbwurf an, während der Validator ihn ablehnte
              (fehlender hatLegaleFarbendiebAktionen-Zweig, überapproximierter
              Schlangenfrass-Zweig), was das KI-Vorspulen zum Absturz brachte.
*/

import { describe, expect, it } from 'vitest';
import { ermittleLegaleAktionen, pruefeAktion, anwendeAktion, erstelleSpielzustand } from '../index';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

describe('PflichtAbwurf Enumerator/Validator-Konsistenz (K3)', () => {
  it('Frass in Hand, keine eigene Schlange, Gegner mit genau 1 Karte: angebotener PflichtAbwurf ist gültig', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    const frass = sonderkarte('frass-hand', 'Schlangenfrass');
    zustand.spieler[0].hand = [frass];
    zustand.spieler[0].schlangen = [];
    zustand.spieler[1].schlangen = [schlange([farbkarte('gegner-1', 'Braun')], 'schlange-spieler-2-1')];

    const aktionen = ermittleLegaleAktionen(zustand);
    const pflicht = aktionen.filter((a) => a.typ === 'PflichtAbwurf');
    expect(pflicht.length).toBeGreaterThan(0);
    for (const aktion of pflicht) {
      expect(pruefeAktion(zustand, aktion).erlaubt).toBe(true);
      expect(() => anwendeAktion(zustand, aktion)).not.toThrow();
    }
  });

  it('Farbendieb in Hand, keine eigene Schlange, Gegner mit Farbkarte: PflichtAbwurf gültig', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    const dieb = sonderkarte('dieb-hand', 'Farbendieb');
    zustand.spieler[0].hand = [dieb];
    zustand.spieler[0].schlangen = [];
    zustand.spieler[1].schlangen = [schlange([farbkarte('gegner-1', 'Blau')], 'schlange-spieler-2-1')];

    const aktionen = ermittleLegaleAktionen(zustand);
    const pflicht = aktionen.filter((a) => a.typ === 'PflichtAbwurf');
    expect(pflicht.length).toBeGreaterThan(0);
    for (const aktion of pflicht) {
      expect(pruefeAktion(zustand, aktion).erlaubt).toBe(true);
    }
  });

  it('Frass mit gültigem 1-Ziel (eigene Schlange) wird NICHT als PflichtAbwurf angeboten', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    const frass = sonderkarte('frass-hand', 'Schlangenfrass');
    zustand.spieler[0].hand = [frass];
    zustand.spieler[0].schlangen = [schlange([farbkarte('eigen-1', 'Rot')], 'schlange-spieler-1-1')];
    zustand.spieler[1].schlangen = [];

    const aktionen = ermittleLegaleAktionen(zustand);
    expect(aktionen.some((a) => a.typ === 'PflichtAbwurf')).toBe(false);
    expect(aktionen.some((a) => a.typ === 'SchlangenfrassSpielen')).toBe(true);
  });
});
