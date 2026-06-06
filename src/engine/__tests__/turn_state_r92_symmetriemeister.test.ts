/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R92-Regressionstests — Aufgabenprüfung Symmetriemeister: erste Hälfte einer langen Schlange spiegelt die zweite Hälfte.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange } from '../index';
import { farbkarte, schlange, schlangeMitFarben, sonderkarte } from './testHelpers';

const symmetriemeister: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-12',
  name: 'Symmetriemeister',
  punkte: 10,
  bedingung:
    'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-01',
  name: 'Farbenpracht',
  punkte: 8,
  bedingung:
    'Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.',
};

function zustandFuerSymmetriemeister(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [symmetriemeister],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R92 Aufgabenprüfung — Symmetriemeister', () => {
  it('erfüllt Symmetriemeister mit exakt 8 Farbkarten als gespiegelte Schlange', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlangeMitFarben('symmetrie-acht', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Grün',
        'Gelb',
        'Blau',
        'Rot',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Symmetriemeister',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbenpracht']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Symmetriemeister mit einer längeren geraden Spiegel-Schlange', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlangeMitFarben('symmetrie-zehn', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Violett',
        'Violett',
        'Grün',
        'Gelb',
        'Blau',
        'Rot',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Symmetriemeister',
    ]);
  });

  it('erfüllt Symmetriemeister nicht mit gespiegelter Schlange unter 8 Karten', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlangeMitFarben('symmetrie-sechs', ['Rot', 'Blau', 'Gelb', 'Gelb', 'Blau', 'Rot']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Symmetriemeister nicht, wenn die zweite Hälfte kein Spiegelbild ist', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlangeMitFarben('keine-symmetrie', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Rot',
        'Gelb',
        'Blau',
        'Grün',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
  });

  it('erfüllt Symmetriemeister nicht mit einer ungeraden reinen Farbkarte-Schlange', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlangeMitFarben('ungerade-symmetrie', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Braun',
        'Grün',
        'Gelb',
        'Blau',
        'Rot',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
  });

  it('zählt eine Sonderkarte nicht als passende Spiegel-Farbkarte', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlange(
        [
          farbkarte('rot-1', 'Rot'),
          farbkarte('blau-1', 'Blau'),
          farbkarte('gelb-1', 'Gelb'),
          farbkarte('gruen-1', 'Grün'),
          farbkarte('gruen-2', 'Grün'),
          farbkarte('gelb-2', 'Gelb'),
          farbkarte('blau-2', 'Blau'),
          sonderkarte('regen-1', 'Regenbogenschlange'),
        ],
        'sonderkarte-spiegelt-rot-nicht',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
  });

  it('ignoriert Sonderkarten nicht so, dass nach dem Herausfiltern eine falsche Spiegelung entsteht', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlange(
        [
          farbkarte('rot-1', 'Rot'),
          farbkarte('blau-1', 'Blau'),
          farbkarte('gelb-1', 'Gelb'),
          farbkarte('gruen-1', 'Grün'),
          sonderkarte('regen-mitte', 'Regenbogenschlange'),
          farbkarte('gruen-2', 'Grün'),
          farbkarte('gelb-2', 'Gelb'),
          farbkarte('blau-2', 'Blau'),
          farbkarte('rot-2', 'Rot'),
        ],
        'sonderkarte-darf-nicht-herausgefiltert-werden',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
  });

  it('zählt gegnerische Spiegel-Schlangen nicht für den aktiven Spieler', () => {
    const basis = zustandFuerSymmetriemeister([
      schlangeMitFarben('eigene-nicht-symmetrisch', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Braun',
        'Violett',
        'Gelb',
        'Rot',
      ]),
    ]);
    const zustand = {
      ...basis,
      spieler: [
        basis.spieler[0],
        {
          ...basis.spieler[1],
          schlangen: [
            schlangeMitFarben('gegner-symmetrie', [
              'Rot',
              'Blau',
              'Gelb',
              'Grün',
              'Grün',
              'Gelb',
              'Blau',
              'Rot',
            ]),
          ],
        },
      ],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
  });

  it('erfüllt Symmetriemeister für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerSymmetriemeister([
      schlangeMitFarben('spieler-2-symmetrie', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Grün',
        'Gelb',
        'Blau',
        'Rot',
      ]),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Symmetriemeister',
    ]);
  });
});
