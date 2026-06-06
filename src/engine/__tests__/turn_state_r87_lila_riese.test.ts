/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R87-Regressionstests — Aufgabenprüfung Lila Riese: mindestens 3 zusammenhängende violette Farbkarten in einer eigenen Schlange.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange } from '../index';
import { farbkarte, schlange, schlangeMitFarben, sonderkarte } from './testHelpers';

const lilaRiese: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-14',
  name: 'Lila Riese',
  punkte: 5,
  bedingung: 'Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3).',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-13',
  name: 'Gelber Schatz',
  punkte: 5,
  bedingung: 'Bilde eine Gruppe aus min. 6 gelben Karten.',
};

function zustandFuerLilaRiese(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [lilaRiese],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen } : spieler,
    ),
  };
}

describe('R87 Aufgabenprüfung — Lila Riese', () => {
  it('erfüllt Lila Riese mit 3 zusammenhängenden violetten Farbkarten in einer eigenen Schlange', () => {
    const zustand = zustandFuerLilaRiese([
      schlangeMitFarben('schlange-violett', ['Violett', 'Violett', 'Violett']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Lila Riese',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Gelber Schatz']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Lila Riese nicht mit nur 2 violetten Farbkarten', () => {
    const zustand = zustandFuerLilaRiese([
      schlangeMitFarben('schlange-zwei-violett', ['Violett', 'Violett']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Lila Riese']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('zählt violette Karten nicht über eine andersfarbige Unterbrechung hinweg als eine Kette', () => {
    const zustand = zustandFuerLilaRiese([
      schlangeMitFarben('schlange-unterbrochen', ['Violett', 'Violett', 'Gelb', 'Violett']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Lila Riese']);
  });

  it('zählt gegnerische violette Ketten nicht für den aktiven Spieler', () => {
    const basis = zustandFuerLilaRiese([schlangeMitFarben('eigene-violett', ['Violett'])]);
    const zustand = {
      ...basis,
      spieler: [
        basis.spieler[0],
        { ...basis.spieler[1], schlangen: [schlangeMitFarben('gegner-violett', ['Violett', 'Violett', 'Violett'])] },
      ],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Lila Riese']);
  });

  it('zählt eine Regenbogenschlange nicht als violette Farbkarte in der Kette mit', () => {
    const zustand = zustandFuerLilaRiese([
      schlange(
        [
          farbkarte('violett-1', 'Violett'),
          farbkarte('violett-2', 'Violett'),
          sonderkarte('regen-1', 'Regenbogenschlange'),
          farbkarte('violett-3', 'Violett'),
        ],
        'schlange-regenbogen-unterbrechung',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Lila Riese']);
  });

  it('erfüllt Lila Riese für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerLilaRiese([
      schlangeMitFarben('schlange-violett-spieler-2', ['Violett', 'Violett', 'Violett']),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Lila Riese',
    ]);
  });
});
