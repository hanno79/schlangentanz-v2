/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R93-Regressionstests — Aufgabenprüfung Schlangenbändiger: wiederholtes Muster aus mindestens drei verschiedenen Farben in einer eigenen Schlange.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange } from '../index';
import { farbkarte, schlange, schlangeMitFarben, sonderkarte } from './testHelpers';

const schlangenbaendiger: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-10',
  name: 'Schlangenbändiger',
  punkte: 7,
  bedingung:
    'Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-12',
  name: 'Symmetriemeister',
  punkte: 10,
  bedingung:
    'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.',
};

function zustandFuerSchlangenbaendiger(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [schlangenbaendiger],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R93 Aufgabenprüfung — Schlangenbändiger', () => {
  it('erfüllt Schlangenbändiger mit einem direkt wiederholten Dreier-Farbmuster', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('dreier-muster', ['Rot', 'Blau', 'Gelb', 'Rot', 'Blau', 'Gelb']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangenbändiger',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Schlangenbändiger mit einem längeren direkt wiederholten Farbmuster', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('vierer-muster', [
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
        'Rot',
        'Blau',
        'Gelb',
        'Grün',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangenbändiger',
    ]);
  });

  it('erfüllt Schlangenbändiger auch, wenn das wiederholte Muster erst später in der Schlange beginnt', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('eingebettetes-muster', [
        'Braun',
        'Rot',
        'Blau',
        'Gelb',
        'Rot',
        'Blau',
        'Gelb',
        'Violett',
      ]),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangenbändiger',
    ]);
  });

  it('erfüllt Schlangenbändiger nicht, wenn für ein Dreiermuster weniger als sechs Farbkarten vorhanden sind', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('zu-kurz-fuer-dreier-wiederholung', ['Rot', 'Blau', 'Gelb', 'Rot', 'Blau']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenbändiger']);
  });

  it('erfüllt Schlangenbändiger nicht mit nur zwei verschiedenen Farben im wiederholten Muster', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('zweier-muster', ['Rot', 'Blau', 'Rot', 'Blau']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenbändiger']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Schlangenbändiger nicht, wenn die Farben nicht direkt als Muster wiederholt werden', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('kein-direktes-muster', ['Rot', 'Blau', 'Gelb', 'Rot', 'Gelb', 'Blau']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenbändiger']);
  });

  it('zählt eine Sonderkarte nicht als Musterfarbe und verbindet die Teile nicht über sie hinweg', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlange(
        [
          farbkarte('rot-1', 'Rot'),
          farbkarte('blau-1', 'Blau'),
          farbkarte('gelb-1', 'Gelb'),
          sonderkarte('regen-mitte', 'Regenbogenschlange'),
          farbkarte('rot-2', 'Rot'),
          farbkarte('blau-2', 'Blau'),
          farbkarte('gelb-2', 'Gelb'),
        ],
        'sonderkarte-unterbricht-muster',
      ),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenbändiger']);
  });

  it('zählt gegnerische Muster-Schlangen nicht für den aktiven Spieler', () => {
    const basis = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('eigene-ohne-muster', ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun']),
    ]);
    const zustand = {
      ...basis,
      spieler: [
        basis.spieler[0],
        {
          ...basis.spieler[1],
          schlangen: [
            schlangeMitFarben('gegner-muster', ['Rot', 'Blau', 'Gelb', 'Rot', 'Blau', 'Gelb']),
          ],
        },
      ],
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenbändiger']);
  });

  it('erfüllt Schlangenbändiger für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerSchlangenbaendiger([
      schlangeMitFarben('spieler-2-muster', ['Rot', 'Blau', 'Gelb', 'Rot', 'Blau', 'Gelb']),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangenbändiger',
    ]);
  });
});
