/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R85-Regressionstests — Aufgabenprüfung Farbkombination: 5 gleiche Farbkarten in einer eigenen Schlange.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Farbe, Schlange } from '../index';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

const farbkombination: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-03',
  name: 'Farbkombination',
  punkte: 5,
  bedingung: 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-13',
  name: 'Gelber Schatz',
  punkte: 5,
  bedingung: 'Bilde eine Gruppe aus min. 6 gelben Karten.',
};

function schlangeMitFarben(id: string, farben: Farbe[]): Schlange {
  return schlange(farben.map((farbe, i) => farbkarte(`${farbe.toLowerCase()}-${i + 1}`, farbe)), id);
}

function zustandFuerFarbkombination(schlangen: Schlange[], aktiverSpielerIndex = 0) {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung' as const,
    offeneAufgaben: [farbkombination],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  };
}

describe('R85 Aufgabenprüfung — Farbkombination', () => {
  it('erfüllt Farbkombination mit 5 Karten gleicher Farbe in einer eigenen Schlange', () => {
    const zustand = zustandFuerFarbkombination([
      schlangeMitFarben('schlange-rot', ['Rot', 'Rot', 'Rot', 'Rot', 'Rot']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbkombination',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Gelber Schatz']);
    expect(aktualisiert.aufgabenStapel).toHaveLength(0);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Farbkombination nicht mit nur 4 Karten gleicher Farbe', () => {
    const zustand = zustandFuerFarbkombination([
      schlangeMitFarben('schlange-blau', ['Blau', 'Blau', 'Blau', 'Blau']),
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbkombination']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('zählt gleiche Farbe nicht verteilt über mehrere Schlangen oder beim Gegner', () => {
    const basis = zustandFuerFarbkombination([
      schlangeMitFarben('schlange-1', ['Gelb', 'Gelb', 'Gelb']),
      schlangeMitFarben('schlange-2', ['Gelb', 'Gelb']),
    ]);
    const zustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, index) =>
        index === 1
          ? { ...spieler, schlangen: [schlangeMitFarben('gegner-gelb', ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb'])] }
          : spieler,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbkombination']);
  });

  it('zählt Sonderkarten in derselben Schlange nicht als Farbkarten mit', () => {
    const schlangeMitSonderkarte = schlangeMitFarben('schlange-mit-sonderkarten', [
      'Violett',
      'Violett',
      'Violett',
      'Violett',
    ]);
    const zustand = zustandFuerFarbkombination([
      {
        ...schlangeMitSonderkarte,
        karten: [...schlangeMitSonderkarte.karten, sonderkarte('sonderkarte-1', 'Schlangenfrass')],
      },
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Farbkombination']);
  });

  it('erfüllt Farbkombination für aktiverSpielerIndex 1', () => {
    const zustand = zustandFuerFarbkombination([
      schlangeMitFarben('schlange-gruen', ['Grün', 'Grün', 'Grün', 'Grün', 'Grün']),
    ], 1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Farbkombination',
    ]);
  });
});
