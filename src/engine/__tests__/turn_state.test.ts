/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für die Zugphasen-State-Machine im Schlangentanz-Engine-Slice 4.3.
*/

import { describe, it, expect } from 'vitest';
import { erstelleSpielzustand, starteAusspielphase } from '../index';

describe('Turn State Machine — R2 Nachziehphase', () => {
  it('zieht Pflichtkarten bis zur Mindesthand und wechselt in die Ausspielphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const aktiverSpieler = zustand.spieler[0];
    aktiverSpieler.hand = aktiverSpieler.hand.slice(0, 3);
    const stapelVorher = zustand.nachziehstapel.length;

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand).toHaveLength(5);
    expect(aktualisiert.nachziehstapel).toHaveLength(stapelVorher - 2);
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
    expect(aktualisiert.spielphase).toBe('Normal');
  });

  it('überspringt Nachziehen bei mindestens fünf Handkarten und wechselt in die Ausspielphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const handVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const stapelVorher = zustand.nachziehstapel.map((karte) => karte.id);

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand.map((karte) => karte.id)).toEqual(handVorher);
    expect(aktualisiert.nachziehstapel.map((karte) => karte.id)).toEqual(stapelVorher);
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('zieht nur verfügbare Karten und aktiviert Endspurt, wenn der Nachziehstapel leer wird', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const aktiverSpieler = zustand.spieler[0];
    aktiverSpieler.hand = aktiverSpieler.hand.slice(0, 3);
    zustand.nachziehstapel = zustand.nachziehstapel.slice(0, 1);

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand).toHaveLength(4);
    expect(aktualisiert.nachziehstapel).toHaveLength(0);
    expect(aktualisiert.spielphase).toBe('Endspurt');
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('lässt inaktive Spieler und den Eingabezustand unverändert', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler[0].hand = zustand.spieler[0].hand.slice(0, 3);
    const inaktiveHandVorher = zustand.spieler[1].hand.map((karte) => karte.id);
    const aktiveHandVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const stapelVorher = zustand.nachziehstapel.map((karte) => karte.id);

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[1].hand.map((karte) => karte.id)).toEqual(inaktiveHandVorher);
    expect(zustand.spieler[0].hand.map((karte) => karte.id)).toEqual(aktiveHandVorher);
    expect(zustand.nachziehstapel.map((karte) => karte.id)).toEqual(stapelVorher);
  });

  it('ändert die Spielphase nicht, wenn der Nachziehstapel bereits leer war', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler[0].hand = zustand.spieler[0].hand.slice(0, 3);
    zustand.nachziehstapel = [];

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand).toHaveLength(3);
    expect(aktualisiert.nachziehstapel).toHaveLength(0);
    expect(aktualisiert.spielphase).toBe('Normal');
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('verbietet den Übergang außerhalb der Nachziehphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';

    expect(() => starteAusspielphase(zustand)).toThrow(
      'Ausspielphase kann nur aus der Nachziehphase gestartet werden.',
    );
  });
});
