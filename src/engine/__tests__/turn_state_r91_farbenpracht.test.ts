/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R91-Regressionstests — Aufgabenprüfung Farbenpracht: jede Farbe mindestens zweimal in eigenen Schlangen.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange } from '../index';
import { farbkarte, schlange, schlangeMitFarben, sonderkarte } from './testHelpers';

const farbenpracht: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-01',
  name: 'Farbenpracht',
  punkte: 8,
  bedingung:
    'Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-03',
  name: 'Farbkombination',
  punkte: 5,
  bedingung: 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.',
};

function zustandFuerFarbenpracht(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [farbenpracht],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R91 Aufgabenprüfung — Farbenpracht', () => {
  it('erfüllt Farbenpracht mit jeder Farbe mindestens zweimal über zwei eigene Schlangen verteilt', () => {
    const zustand = zustandFuerFarbenpracht([
      schlangeMitFarben('schlange-rot-blau-gelb', ['Rot', 'Rot', 'Blau', 'Blau', 'Gelb', 'Gelb']),
      schlangeMitFarben('schlange-gruen-violett-braun', [
        'Grün',
        'Grün',
        'Violett',
        'Violett',
        'Braun',
        'Braun',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbenpracht',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbkombination']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Farbenpracht mit jeder Farbe mindestens zweimal in einer eigenen Schlange', () => {
    const zustand = zustandFuerFarbenpracht([
      schlangeMitFarben('schlange-alle-farben-zweimal', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Violett',
        'Braun',
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Violett',
        'Braun',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbenpracht',
    ]);
  });

  it('erfüllt Farbenpracht nicht, wenn eine Farbe nur einmal vorhanden ist', () => {
    const zustand = zustandFuerFarbenpracht([
      schlangeMitFarben('schlange-braun-einmal', [
        'Rot',
        'Rot',
        'Blau',
        'Blau',
        'Gelb',
        'Gelb',
        'Grün',
        'Grün',
        'Violett',
        'Violett',
        'Braun',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbenpracht']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('zählt Sonderkarten oder Regenbogenschlangen nicht als fehlende Farbkarte', () => {
    const zustand = zustandFuerFarbenpracht([
      schlange(
        [
          farbkarte('rot-1', 'Rot'),
          farbkarte('rot-2', 'Rot'),
          farbkarte('blau-1', 'Blau'),
          farbkarte('blau-2', 'Blau'),
          farbkarte('gelb-1', 'Gelb'),
          farbkarte('gelb-2', 'Gelb'),
          farbkarte('gruen-1', 'Grün'),
          farbkarte('gruen-2', 'Grün'),
          farbkarte('violett-1', 'Violett'),
          farbkarte('violett-2', 'Violett'),
          farbkarte('braun-1', 'Braun'),
          sonderkarte('regen-1', 'Regenbogenschlange'),
        ],
        'schlange-sonderkarte-ersetzt-braun-nicht',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbenpracht']);
  });

  it('zählt gegnerische Farbkarten nicht für den aktiven Spieler', () => {
    const basis = zustandFuerFarbenpracht([
      schlangeMitFarben('eigene-fast-komplett', [
        'Rot',
        'Rot',
        'Blau',
        'Blau',
        'Gelb',
        'Gelb',
        'Grün',
        'Grün',
        'Violett',
        'Violett',
        'Braun',
      ]),
    ]);
    const zustand = {
      ...basis,
      spieler: [
        basis.spieler[0],
        {
          ...basis.spieler[1],
          schlangen: [schlangeMitFarben('gegner-braun', ['Braun', 'Braun'])],
        },
      ],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbenpracht']);
  });

  it('erfüllt Farbenpracht für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerFarbenpracht([
      schlangeMitFarben('spieler-2-farbenpracht', [
        'Rot',
        'Rot',
        'Blau',
        'Blau',
        'Gelb',
        'Gelb',
        'Grün',
        'Grün',
        'Violett',
        'Violett',
        'Braun',
        'Braun',
      ]),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbenpracht',
    ]);
  });
});
