/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R90-Regressionstests — Aufgabenprüfung Farbharmonie: mindestens eine Dreiergruppe jeder Farbe in eigenen Schlangen.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange } from '../index';
import { farbkarte, schlange, schlangeMitFarben, sonderkarte } from './testHelpers';

const farbharmonie: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-02',
  name: 'Farbharmonie',
  punkte: 10,
  bedingung: 'Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-03',
  name: 'Farbkombination',
  punkte: 5,
  bedingung: 'Habe 5 oder mehr Karten der gleichen Farbe in einer deiner Schlangen.',
};

function zustandFuerFarbharmonie(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [farbharmonie],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R90 Aufgabenprüfung — Farbharmonie', () => {
  it('erfüllt Farbharmonie mit mindestens einer Dreiergruppe jeder Farbe in eigenen Schlangen', () => {
    const zustand = zustandFuerFarbharmonie([
      schlangeMitFarben('schlange-rot-blau-gelb', ['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Blau', 'Gelb', 'Gelb', 'Gelb']),
      schlangeMitFarben('schlange-gruen-violett-braun', [
        'Grün',
        'Grün',
        'Grün',
        'Violett',
        'Violett',
        'Violett',
        'Braun',
        'Braun',
        'Braun',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbharmonie',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbkombination']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Farbharmonie nicht, wenn eine Farbe keine Dreiergruppe hat', () => {
    const zustand = zustandFuerFarbharmonie([
      schlangeMitFarben('schlange-ohne-braun-gruppe', [
        'Rot',
        'Rot',
        'Rot',
        'Blau',
        'Blau',
        'Blau',
        'Gelb',
        'Gelb',
        'Gelb',
        'Grün',
        'Grün',
        'Grün',
        'Violett',
        'Violett',
        'Violett',
        'Braun',
        'Braun',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbharmonie']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('zählt eine Dreiergruppe nicht über eine Regenbogenschlange oder Sonderkarte hinweg', () => {
    const zustand = zustandFuerFarbharmonie([
      schlange(
        [
          farbkarte('rot-1', 'Rot'),
          farbkarte('rot-2', 'Rot'),
          sonderkarte('regen-1', 'Regenbogenschlange'),
          farbkarte('rot-3', 'Rot'),
          farbkarte('blau-1', 'Blau'),
          farbkarte('blau-2', 'Blau'),
          farbkarte('blau-3', 'Blau'),
          farbkarte('gelb-1', 'Gelb'),
          farbkarte('gelb-2', 'Gelb'),
          farbkarte('gelb-3', 'Gelb'),
          farbkarte('gruen-1', 'Grün'),
          farbkarte('gruen-2', 'Grün'),
          farbkarte('gruen-3', 'Grün'),
          farbkarte('violett-1', 'Violett'),
          farbkarte('violett-2', 'Violett'),
          farbkarte('violett-3', 'Violett'),
          farbkarte('braun-1', 'Braun'),
          farbkarte('braun-2', 'Braun'),
          farbkarte('braun-3', 'Braun'),
        ],
        'schlange-sonderkarte-unterbricht-rot',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbharmonie']);
  });

  it('zählt gegnerische Dreiergruppen nicht für den aktiven Spieler', () => {
    const basis = zustandFuerFarbharmonie([
      schlangeMitFarben('eigene-kurz', ['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Blau']),
    ]);
    const zustand = {
      ...basis,
      spieler: [
        basis.spieler[0],
        {
          ...basis.spieler[1],
          schlangen: [
            schlangeMitFarben('gegner-harmonie', [
              'Rot',
              'Rot',
              'Rot',
              'Blau',
              'Blau',
              'Blau',
              'Gelb',
              'Gelb',
              'Gelb',
              'Grün',
              'Grün',
              'Grün',
              'Violett',
              'Violett',
              'Violett',
              'Braun',
              'Braun',
              'Braun',
            ]),
          ],
        },
      ],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbharmonie']);
  });

  it('erfüllt Farbharmonie für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerFarbharmonie([
      schlangeMitFarben('spieler-2-harmonie', [
        'Rot',
        'Rot',
        'Rot',
        'Blau',
        'Blau',
        'Blau',
        'Gelb',
        'Gelb',
        'Gelb',
        'Grün',
        'Grün',
        'Grün',
        'Violett',
        'Violett',
        'Violett',
        'Braun',
        'Braun',
        'Braun',
      ]),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbharmonie',
    ]);
  });
});
