/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R19-Tests für Zugpflichten-Migration und Kartenart-Zähler in der Serialisierung.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand, deserialisiere } from '../index';

describe('Serialisierung — R19 Kartenart-Zähler in Zugpflichten', () => {
  it('migriert alte ungespielte Zugpflichten ohne Kartenart-Zähler sicher auf 0/0', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = { gespielteKarten: 0 };

    const deserialisiert = deserialisiere(JSON.stringify(zustand));

    expect(deserialisiert.zugpflichten).toEqual({
      gespielteKarten: 0,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 0,
    });
  });

  it('lehnt alte gespielte Zugpflichten ohne eindeutig migrierbare Kartenarten ab', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = { gespielteKarten: 1 };

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/gespielte farbkarten/i);
  });

  it.each([
    [{ gespielteKarten: 1, gespielteFarbkarten: 2, gespielteSonderkarten: 0 }, /gespielte farbkarten/i],
    [{ gespielteKarten: 1, gespielteFarbkarten: 0, gespielteSonderkarten: 2 }, /gespielte sonderkarten/i],
    [{ gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 0 }, /kartenarten/i],
  ])('lehnt ungültige Kartenart-Zähler ab: %o', (zugpflichten, fehlermuster) => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugpflichten'] = zugpflichten;

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(fehlermuster);
  });
});
