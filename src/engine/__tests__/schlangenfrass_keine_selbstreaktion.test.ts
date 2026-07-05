/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix A4 — Ein Schlangenfrass auf die eigene Schlange darf keine
              Farbenschutz-Reaktionskette gegen den aktiven Spieler selbst auslösen,
              auch wenn dieser noch einen Farbenschutz auf der Hand hält. Die
              Reaktionskette gilt nur für gegnerische Ziele.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand } from '../index';
import { spieleSchlangenfrass } from '../turnState';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

describe('Schlangenfrass — keine Selbst-Reaktion (A4)', () => {
  it('entfernt die eigene Zielkarte sofort, ohne pendingReaktion, trotz eigenem Farbenschutz', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    const frass = sonderkarte('frass-hand', 'Schlangenfrass');
    const schutz = sonderkarte('schutz-hand', 'Farbenschutz');
    zustand.spieler[0].hand = [frass, schutz];
    zustand.spieler[0].schlangen = [schlange([farbkarte('eigen-gruen', 'Grün')], 'schlange-spieler-1-1')];

    const z = spieleSchlangenfrass(zustand, {
      kartenId: frass.id,
      ziele: [{ spielerId: 'spieler-1', schlangenId: 'schlange-spieler-1-1', kartenId: 'eigen-gruen' }],
    });

    expect(z.pendingReaktion).toBeNull();
    expect(z.spieler[0].schlangen[0].karten).toHaveLength(0);
    expect(z.ablagestapel.map((k) => k.id)).toContain('eigen-gruen');
  });
});
