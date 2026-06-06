/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R88-Regressionstests — Aufgabenprüfung Farbwechsler: mindestens 4 direkt aufeinanderfolgende verschiedene Farbkarten in einer eigenen Schlange.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange } from '../index';
import { farbkarte, schlange, schlangeMitFarben, sonderkarte } from './testHelpers';

const farbwechsler: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-05',
  name: 'Farbwechsler',
  punkte: 6,
  bedingung: 'Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-14',
  name: 'Lila Riese',
  punkte: 5,
  bedingung: 'Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3).',
};

function zustandFuerFarbwechsler(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [farbwechsler],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R88 Aufgabenprüfung — Farbwechsler', () => {
  it('erfüllt Farbwechsler mit 4 direkt aufeinanderfolgenden verschiedenen Farbkarten in einer eigenen Schlange', () => {
    const zustand = zustandFuerFarbwechsler([
      schlangeMitFarben('schlange-farbwechsel', ['Rot', 'Blau', 'Gelb', 'Grün']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbwechsler',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Lila Riese']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Farbwechsler, wenn ein gültiges 4er-Fenster innerhalb einer längeren Schlange liegt', () => {
    const zustand = zustandFuerFarbwechsler([
      schlangeMitFarben('schlange-fenster', ['Rot', 'Rot', 'Blau', 'Gelb', 'Grün', 'Violett']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbwechsler',
    ]);
  });

  it('erfüllt Farbwechsler nicht mit nur 3 direkt aufeinanderfolgenden verschiedenen Farbkarten', () => {
    const zustand = zustandFuerFarbwechsler([
      schlangeMitFarben('schlange-drei-farben', ['Rot', 'Blau', 'Gelb']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbwechsler']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Farbwechsler nicht, wenn sich eine Farbe im 4er-Fenster wiederholt', () => {
    const zustand = zustandFuerFarbwechsler([
      schlangeMitFarben('schlange-wiederholung', ['Rot', 'Blau', 'Rot', 'Grün']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbwechsler']);
  });

  it('zählt Farben nicht über eine Regenbogenschlange oder Sonderkarte hinweg als direkt aufeinanderfolgend', () => {
    const zustand = zustandFuerFarbwechsler([
      schlange(
        [
          farbkarte('rot-1', 'Rot'),
          farbkarte('blau-1', 'Blau'),
          sonderkarte('regen-1', 'Regenbogenschlange'),
          farbkarte('gelb-1', 'Gelb'),
          farbkarte('gruen-1', 'Grün'),
        ],
        'schlange-sonderkarte-unterbrechung',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbwechsler']);
  });

  it('zählt gegnerische Farbwechsel nicht für den aktiven Spieler', () => {
    const basis = zustandFuerFarbwechsler([schlangeMitFarben('eigene-kurz', ['Rot', 'Blau', 'Gelb'])]);
    const zustand = {
      ...basis,
      spieler: [
        basis.spieler[0],
        { ...basis.spieler[1], schlangen: [schlangeMitFarben('gegner-farbwechsel', ['Rot', 'Blau', 'Gelb', 'Grün'])] },
      ],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbwechsler']);
  });

  it('erfüllt Farbwechsler für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerFarbwechsler([
      schlangeMitFarben('schlange-farbwechsel-spieler-2', ['Rot', 'Blau', 'Gelb', 'Grün']),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbwechsler',
    ]);
  });
});
