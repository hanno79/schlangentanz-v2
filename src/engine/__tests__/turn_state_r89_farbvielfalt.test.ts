/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R89-Regressionstests — Aufgabenprüfung Farbvielfalt: direkte Kette aus je einer Karte aller 6 Farben in einer eigenen Schlange.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange } from '../index';
import { farbkarte, schlange, schlangeMitFarben, sonderkarte } from './testHelpers';

const farbvielfalt: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-04',
  name: 'Farbvielfalt',
  punkte: 9,
  bedingung: 'Bilde eine Kette aus je einer Karte aller 6 Farben.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-05',
  name: 'Farbwechsler',
  punkte: 6,
  bedingung: 'Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen.',
};

function zustandFuerFarbvielfalt(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [farbvielfalt],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R89 Aufgabenprüfung — Farbvielfalt', () => {
  it('erfüllt Farbvielfalt mit einer direkten Kette aus je einer Karte aller 6 Farben', () => {
    const zustand = zustandFuerFarbvielfalt([
      schlangeMitFarben('schlange-alle-farben', ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbvielfalt',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbwechsler']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Farbvielfalt, wenn die gültige 6er-Kette innerhalb einer längeren Schlange liegt', () => {
    const zustand = zustandFuerFarbvielfalt([
      schlangeMitFarben('schlange-fenster', ['Rot', 'Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbvielfalt',
    ]);
  });

  it('erfüllt Farbvielfalt nicht mit nur 5 verschiedenen direkt aufeinanderfolgenden Farbkarten', () => {
    const zustand = zustandFuerFarbvielfalt([
      schlangeMitFarben('schlange-fuenf-farben', ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbvielfalt']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Farbvielfalt nicht, wenn eine Farbe in der 6er-Kette doppelt vorkommt', () => {
    const zustand = zustandFuerFarbvielfalt([
      schlangeMitFarben('schlange-doppelte-farbe', ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Rot']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbvielfalt']);
  });

  it('zählt Farben nicht über eine Regenbogenschlange oder Sonderkarte hinweg als direkte Kette', () => {
    const zustand = zustandFuerFarbvielfalt([
      schlange(
        [
          farbkarte('rot-1', 'Rot'),
          farbkarte('blau-1', 'Blau'),
          farbkarte('gelb-1', 'Gelb'),
          sonderkarte('regen-1', 'Regenbogenschlange'),
          farbkarte('gruen-1', 'Grün'),
          farbkarte('violett-1', 'Violett'),
          farbkarte('braun-1', 'Braun'),
        ],
        'schlange-sonderkarte-unterbrechung',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbvielfalt']);
  });

  it('zählt gegnerische Farbvielfalt nicht für den aktiven Spieler', () => {
    const basis = zustandFuerFarbvielfalt([schlangeMitFarben('eigene-kurz', ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])]);
    const zustand = {
      ...basis,
      spieler: [
        basis.spieler[0],
        {
          ...basis.spieler[1],
          schlangen: [schlangeMitFarben('gegner-alle-farben', ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun'])],
        },
      ],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbvielfalt']);
  });

  it('erfüllt Farbvielfalt für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerFarbvielfalt([
      schlangeMitFarben('schlange-alle-farben-spieler-2', ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun']),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbvielfalt',
    ]);
  });
});
