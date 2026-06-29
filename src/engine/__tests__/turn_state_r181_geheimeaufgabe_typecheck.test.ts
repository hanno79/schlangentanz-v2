/*
Author: rahn
Datum: 29.06.2026
Version: 1.0
Beschreibung: R181 Typ-Compile-Test — geheimeAufgabe muss non-nullable sein,
              damit UI-Code wie `aktiverSpieler.geheimeAufgabe ? ... : 'keine'`
              überflüssig wird und TypeScript die Spec-Korrektheit durchsetzt.
              Wir prüfen das durch explizite Type-Assertion im Test.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo } from '../index';

describe('R181 geheimeAufgabe non-nullable Typ-Compile-Test', () => {
  it('aktiverSpieler.geheimeAufgabe ist ohne Null-Check nutzbar (TypeScript-Compile-Garantie)', () => {
    const zustand = erstelleSpielzustand(2);

    // Wenn der Typ non-nullable ist (Zielzustand), kompiliert diese Zuweisung ohne Fehler.
    // Wenn der Typ aktuell noch `AufgabenkarteInfo | null` ist, schlägt diese Zuweisung
    // bereits im typecheck fehl — und genau das wollen wir provozieren.
    const aufgabe: AufgabenkarteInfo = zustand.spieler[0].geheimeAufgabe;
    expect(aufgabe.typ).toBe('Aufgabenkarte');
  });

  it('useSpielLabels-Hook-Style: geheimeAufgabe direkt nutzbar ohne Truthiness-Check', () => {
    const zustand = erstelleSpielzustand(2);
    const aktiverSpieler = zustand.spieler[0];

    // Vorher: `aktiverSpieler.geheimeAufgabe ? label(...) : 'keine'`
    // Nachher: direkter Zugriff — TypeScript muss non-nullable garantieren.
    const id: string = aktiverSpieler.geheimeAufgabe.id;
    expect(id.length).toBeGreaterThan(0);
  });
});
