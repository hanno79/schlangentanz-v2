/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R86-Regressionstests — Aufgabenprüfung Gelber Schatz: mindestens 6 zusammenhängende gelbe Farbkarten in einer eigenen Schlange.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Farbe, Schlange } from '../index';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

const gelberSchatz: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-13',
  name: 'Gelber Schatz',
  punkte: 5,
  bedingung: 'Bilde eine Gruppe aus min. 6 gelben Karten.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-03',
  name: 'Farbkombination',
  punkte: 5,
  bedingung: 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.',
};

function schlangeMitFarben(id: string, farben: Farbe[]): Schlange {
  return schlange(farben.map((farbe, i) => farbkarte(`${farbe.toLowerCase()}-${i + 1}`, farbe)), id);
}

function zustandFuerGelbenSchatz(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [gelberSchatz],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R86 Aufgabenprüfung — Gelber Schatz', () => {
  it('erfüllt Gelber Schatz mit 6 zusammenhängenden gelben Farbkarten in einer eigenen Schlange', () => {
    const zustand = zustandFuerGelbenSchatz([
      schlangeMitFarben('schlange-gelb', ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Gelber Schatz',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbkombination']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Gelber Schatz nicht mit nur 5 gelben Farbkarten', () => {
    const zustand = zustandFuerGelbenSchatz([
      schlangeMitFarben('schlange-fuenf-gelb', ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Gelber Schatz']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('zählt gelbe Karten nicht über eine Unterbrechung hinweg als eine Gruppe', () => {
    const zustand = zustandFuerGelbenSchatz([
      schlangeMitFarben('schlange-unterbrochen', ['Gelb', 'Gelb', 'Gelb', 'Rot', 'Gelb', 'Gelb', 'Gelb']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Gelber Schatz']);
  });

  it('zählt gegnerische gelbe Gruppen nicht für den aktiven Spieler', () => {
    const basis = zustandFuerGelbenSchatz([schlangeMitFarben('eigene-gelb', ['Gelb', 'Gelb', 'Gelb'])]);
    const zustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, index) =>
        index === 1
          ? {
              ...spieler,
              schlangen: [
                schlangeMitFarben('gegner-gelb', ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb']),
              ],
            }
          : spieler,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Gelber Schatz']);
  });

  it('zählt eine Regenbogenschlange nicht als gelbe Farbkarte in der Gruppe mit', () => {
    const zustand = zustandFuerGelbenSchatz([
      schlange(
        [
          farbkarte('gelb-1', 'Gelb'),
          farbkarte('gelb-2', 'Gelb'),
          farbkarte('gelb-3', 'Gelb'),
          sonderkarte('regen-1', 'Regenbogenschlange'),
          farbkarte('gelb-4', 'Gelb'),
          farbkarte('gelb-5', 'Gelb'),
          farbkarte('gelb-6', 'Gelb'),
        ],
        'schlange-regenbogen-unterbrechung',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Gelber Schatz']);
  });

  it('erfüllt Gelber Schatz für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerGelbenSchatz([
      schlangeMitFarben('schlange-gelb-spieler-2', ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb']),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Gelber Schatz',
    ]);
  });
});
