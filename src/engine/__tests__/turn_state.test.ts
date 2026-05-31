/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für die Zugphasen-State-Machine im Schlangentanz-Engine-Slice 4.3.
*/

import { describe, it, expect } from 'vitest';
import {
  beendeAufgabenpruefung,
  beendeAusspielphase,
  erstelleSpielzustand,
  starteAusspielphase,
} from '../index';

function basisZustand() {
  return erstelleSpielzustand(2, () => 0.999999);
}

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

describe('Turn State Machine — R2.3 Ausspielphase', () => {
  function zustandInAusspielphase() {
    return { ...basisZustand(), zugphase: 'Ausspielphase' as const };
  }

  it.each([1, 2])('wechselt nach %i ausgespielten Karten in die Aufgabenprüfung', (n) => {
    const zustand = zustandInAusspielphase();

    const aktualisiert = beendeAusspielphase(zustand, { ausgespielteKarten: n });

    expect(aktualisiert.zugphase).toBe('Aufgabenpruefung');
    expect(zustand.zugphase).toBe('Ausspielphase');
  });

  it('verbietet Abschluss ohne ausgespielte Karte', () => {
    const zustand = zustandInAusspielphase();

    expect(() => beendeAusspielphase(zustand, { ausgespielteKarten: 0 })).toThrow(
      'Die Ausspielphase darf erst nach mindestens einer gespielten Karte beendet werden.',
    );
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'verbietet nicht-ganzzahlige oder ungültige Kartenanzahl %s',
    (ausgespielteKarten) => {
      const zustand = zustandInAusspielphase();

      expect(() => beendeAusspielphase(zustand, { ausgespielteKarten })).toThrow(
        'Die Anzahl ausgespielter Karten muss eine ganze Zahl sein.',
      );
    },
  );

  it('verbietet Abschluss nach mehr als zwei ausgespielten Karten', () => {
    const zustand = zustandInAusspielphase();

    expect(() => beendeAusspielphase(zustand, { ausgespielteKarten: 3 })).toThrow(
      'Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.',
    );
  });

  it('verbietet Abschluss außerhalb der Ausspielphase', () => {
    const zustand = basisZustand();

    expect(() => beendeAusspielphase(zustand, { ausgespielteKarten: 1 })).toThrow(
      'Ausspielphase kann nur aus der Ausspielphase beendet werden.',
    );
  });
});

describe('Turn State Machine — R2.4 Aufgabenprüfung', () => {
  function zustandInAufgabenpruefung() {
    return { ...basisZustand(), zugphase: 'Aufgabenpruefung' as const };
  }

  it('wechselt nach geprüften Aufgaben in den Zugabschluss', () => {
    const zustand = zustandInAufgabenpruefung();

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.zugphase).toBe('Zugabschluss');
    expect(zustand.zugphase).toBe('Aufgabenpruefung');
  });

  it('verbietet Abschluss ohne geprüfte Aufgaben', () => {
    const zustand = zustandInAufgabenpruefung();

    expect(() => beendeAufgabenpruefung(zustand, { aufgabenGeprueft: false })).toThrow(
      'Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.',
    );
  });

  it.each(['ja', 1])('verbietet truthy Nicht-Boolean-Wert %s für geprüfte Aufgaben', (aufgabenGeprueft) => {
    const zustand = zustandInAufgabenpruefung();

    expect(() =>
      beendeAufgabenpruefung(zustand, { aufgabenGeprueft: aufgabenGeprueft as unknown as boolean }),
    ).toThrow('Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.');
  });

  it('verbietet Abschluss außerhalb der Aufgabenprüfung', () => {
    const zustand = basisZustand();

    expect(() => beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true })).toThrow(
      'Aufgabenprüfung kann nur aus der Aufgabenprüfung beendet werden.',
    );
  });
});
