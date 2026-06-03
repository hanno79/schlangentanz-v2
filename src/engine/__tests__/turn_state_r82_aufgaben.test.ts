/*
Author: rahn
Datum: 03.06.2026
Version: 1.1
Beschreibung: R82/R83-Regressionstests — Aufgabenprüfung:
  R82: beendeAufgabenpruefung erkennt mindestens 2 Farbfusionen in einer Spielerschlange (Fusionsexperte).
  R83: beendeAufgabenpruefung erkennt mindestens 4 Sonderkarten in eigenen Schlangen (Schlangenbeschwörer).
*/

import { describe, it, expect } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange, SonderkarteInfo } from '../index';

const fusionsexperte: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-06',
  name: 'Fusionsexperte',
  punkte: 6,
  bedingung: 'Habe eine Schlange mit mindestens 2 Farbfusionen.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-13',
  name: 'Gelber Schatz',
  punkte: 5,
  bedingung: 'Bilde eine Gruppe aus min. 6 gelben Karten.',
};

const zweiteErsatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-14',
  name: 'Lila Riese',
  punkte: 5,
  bedingung: 'Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3).',
};

function schlangeM(anzahlFusionen: number): Schlange {
  const ids = Array.from({ length: anzahlFusionen }, (_, i) => `fusion-${i + 1}`);
  return {
    id: 'schlange-test',
    karten: ids.map((id): SonderkarteInfo => ({ typ: 'Sonderkarte', id, name: 'Farbenfusion' })),
    zustand: 'aktiv',
    farbenfusionen: ids.map((id) => ({ kartenId: id, punkte: 2 })),
  };
}

function zustandFuerAufgabenpruefung(
  anzahlFusionen: number,
  aufgabenStapel: AufgabenkarteInfo[] = [ersatzAufgabe],
  aktiverSpielerIndex = 0,
) {
  const base = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...base,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    spieler: base.spieler.map((s, i) =>
      i === aktiverSpielerIndex ? { ...s, schlangen: [schlangeM(anzahlFusionen)], erfuellteAufgaben: [] } : s,
    ),
    offeneAufgaben: [fusionsexperte],
    aufgabenStapel,
  };
}

describe('R82 Aufgabenprüfung — Fusionsexperte', () => {
  it('verschiebt Fusionsexperte von offeneAufgaben zu erfuellteAufgaben, wenn eine Schlange 2 Fusionen hat', () => {
    const zustand = zustandFuerAufgabenpruefung(2);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(1);
    expect(aktualisiert.spieler[0].erfuellteAufgaben[0].name).toBe('Fusionsexperte');
    expect(aktualisiert.offeneAufgaben.some((a) => a.name === 'Fusionsexperte')).toBe(false);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('zieht eine neue offene Aufgabe nach, wenn aufgabenStapel nicht leer ist', () => {
    const zustand = zustandFuerAufgabenpruefung(2);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.offeneAufgaben).toHaveLength(1);
    expect(aktualisiert.offeneAufgaben[0].name).toBe('Gelber Schatz');
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
  });

  it('erfüllt Fusionsexperte nicht, wenn nur 1 Farbfusion vorhanden ist', () => {
    const zustand = zustandFuerAufgabenpruefung(1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.some((a) => a.name === 'Fusionsexperte')).toBe(true);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Fusionsexperte nicht durch verwaiste farbenfusionen-Metadaten ohne Karten in der Schlange', () => {
    const basis = zustandFuerAufgabenpruefung(2);
    const zustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, index) =>
        index === 0 ? { ...spieler, schlangen: [{ ...schlangeM(2), karten: [] }] } : spieler,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.some((a) => a.name === 'Fusionsexperte')).toBe(true);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Fusionsexperte nicht, wenn sie nicht in offeneAufgaben liegt', () => {
    const zustand = {
      ...zustandFuerAufgabenpruefung(2),
      offeneAufgaben: [ersatzAufgabe],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('prüft die Farbfusionen des aktiven Spielers, nicht die des Gegners', () => {
    const basis = zustandFuerAufgabenpruefung(0, [ersatzAufgabe], 1);
    const zustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, index) =>
        index === 0 ? { ...spieler, schlangen: [schlangeM(2)], erfuellteAufgaben: [] } : spieler,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[1].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.some((a) => a.name === 'Fusionsexperte')).toBe(true);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Fusionsexperte für den aktiven Spieler auch bei aktivem Spielerindex 1', () => {
    const zustand = zustandFuerAufgabenpruefung(2, [ersatzAufgabe], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben).toHaveLength(1);
    expect(aktualisiert.spieler[1].erfuellteAufgaben[0].name).toBe('Fusionsexperte');
  });

  it('erfindet keine neue offene Aufgabe, wenn aufgabenStapel leer ist', () => {
    const zustand = zustandFuerAufgabenpruefung(2, []);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(1);
    expect(aktualisiert.offeneAufgaben).toHaveLength(0);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
  });
});

// ─── R83 Schlangenbeschwörer ───────────────────────────────────────────────

const schlangenbeschwörer: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-07',
  name: 'Schlangenbeschwörer',
  punkte: 7,
  bedingung: 'Habe min. 4 Sonderkarten in deinen Schlangen.',
};

function schlangeNSonderkarten(schlangenId: string, anzahl: number): Schlange {
  return {
    id: schlangenId,
    karten: Array.from({ length: anzahl }, (_, i): SonderkarteInfo => ({
      typ: 'Sonderkarte',
      id: `sonder-${schlangenId}-${i + 1}`,
      name: 'Schlangenfrass',
    })),
    zustand: 'aktiv',
  };
}

function zustandFuerSchlangenbeschwörer(anzahlSonderkarten: number, aktiverSpielerIndex = 0) {
  const base = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...base,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    spieler: base.spieler.map((s, i) =>
      i === aktiverSpielerIndex
        ? { ...s, schlangen: [schlangeNSonderkarten('schlange-test', anzahlSonderkarten)], erfuellteAufgaben: [] }
        : s,
    ),
    offeneAufgaben: [schlangenbeschwörer],
    aufgabenStapel: [ersatzAufgabe],
  };
}

describe('R83 Aufgabenprüfung — Schlangenbeschwörer', () => {
  it('verschiebt Schlangenbeschwörer zu erfuellteAufgaben, wenn aktiver Spieler 4 Sonderkarten in eigenen Schlangen hat', () => {
    const zustand = zustandFuerSchlangenbeschwörer(4);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(1);
    expect(aktualisiert.spieler[0].erfuellteAufgaben[0].name).toBe('Schlangenbeschwörer');
    expect(aktualisiert.offeneAufgaben.some((a) => a.name === 'Schlangenbeschwörer')).toBe(false);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Schlangenbeschwörer nicht, wenn aktiver Spieler nur 3 Sonderkarten hat', () => {
    const zustand = zustandFuerSchlangenbeschwörer(3);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.some((a) => a.name === 'Schlangenbeschwörer')).toBe(true);
  });

  it('erfüllt Schlangenbeschwörer auch mit 4 Sonderkarten verteilt über beide eigenen Schlangen', () => {
    const basis = zustandFuerSchlangenbeschwörer(0);
    const zustand = {
      ...basis,
      spieler: basis.spieler.map((s, i) =>
        i === 0
          ? {
              ...s,
              schlangen: [
                schlangeNSonderkarten('schlange-links', 2),
                schlangeNSonderkarten('schlange-rechts', 2),
              ],
              erfuellteAufgaben: [],
            }
          : s,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(1);
    expect(aktualisiert.spieler[0].erfuellteAufgaben[0].name).toBe('Schlangenbeschwörer');
  });

  it('zählt gegnerische Sonderkarten nicht für den aktiven Spieler', () => {
    const basis = zustandFuerSchlangenbeschwörer(3);
    const zustand = {
      ...basis,
      spieler: basis.spieler.map((s, i) =>
        i !== 0 ? { ...s, schlangen: [schlangeNSonderkarten('schlange-gegner', 4)], erfuellteAufgaben: [] } : s,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.some((a) => a.name === 'Schlangenbeschwörer')).toBe(true);
  });

  it('erfüllt Schlangenbeschwörer für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerSchlangenbeschwörer(4, 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben).toHaveLength(1);
    expect(aktualisiert.spieler[1].erfuellteAufgaben[0].name).toBe('Schlangenbeschwörer');
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Fusionsexperte und Schlangenbeschwörer in derselben Aufgabenprüfung', () => {
    const basis = zustandFuerAufgabenpruefung(2, [ersatzAufgabe, zweiteErsatzAufgabe]);
    const m2 = schlangeM(2);
    const zustand = {
      ...basis,
      offeneAufgaben: [fusionsexperte, schlangenbeschwörer],
      spieler: basis.spieler.map((s, i) =>
        i === 0
          ? {
              ...s,
              schlangen: [
                { ...m2, karten: [...m2.karten, ...schlangeNSonderkarten('schlange-zusatz', 2).karten] },
              ],
              erfuellteAufgaben: [],
            }
          : s,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((a) => a.name)).toEqual([
      'Fusionsexperte',
      'Schlangenbeschwörer',
    ]);
    expect(aktualisiert.offeneAufgaben.map((a) => a.name)).toEqual(['Gelber Schatz', 'Lila Riese']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });
});
