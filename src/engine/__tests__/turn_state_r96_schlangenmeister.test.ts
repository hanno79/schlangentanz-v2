/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R96-Regressionstests — Aufgabenprüfung Schlangenmeister: mindestens zwei verschiedene Sonderkarten in eigenen Schlangen und mindestens vier ausgespielte Sonderkarten.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, erstelleSpielzustand } from '../index';
import type { AufgabenkarteInfo, Schlange, Spielzustand } from '../index';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

const schlangenmeister: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-08',
  name: 'Schlangenmeister',
  punkte: 4,
  bedingung: 'Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-12',
  name: 'Symmetriemeister',
  punkte: 10,
  bedingung:
    'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.',
};

function zustandFuerSchlangenmeister(
  schlangen: Schlange[],
  ausgespielteSonderkartenNamen: string[],
  aktiverSpielerIndex = 0,
): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung',
    offeneAufgaben: [schlangenmeister],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex
        ? { ...spieler, schlangen, ausgespielteSonderkartenNamen, erfuellteAufgaben: [] }
        : {
            ...spieler,
            schlangen: [
              schlange(
                [sonderkarte('gegner-frass', 'Schlangenfrass'), sonderkarte('gegner-blockade', 'Schlangenblockade')],
                'gegner-schlangenmeister-schlange',
              ),
            ],
            ausgespielteSonderkartenNamen: [
              'Schlangengrube',
              'Schlangenblockade',
              'Farbendieb',
              'Schlangenfrass',
            ],
          },
    ),
  };
}

describe('R96 Aufgabenprüfung — Schlangenmeister', () => {
  it('erfüllt Schlangenmeister mit zwei verschiedenen Sonderkarten in eigenen Schlangen und vier ausgespielten Sonderkarten', () => {
    const zustand = zustandFuerSchlangenmeister(
      [
        schlange(
          [
            farbkarte('rot-r96', 'Rot'),
            sonderkarte('frass-r96', 'Schlangenfrass'),
            sonderkarte('blockade-r96', 'Schlangenblockade'),
          ],
          'eigene-schlangenmeister-schlange',
        ),
      ],
      ['Verdoppler', 'Verdoppler', 'Farbenschutz', 'Schlangengrube'],
    );

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangenmeister',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Schlangenmeister nicht mit nur einer verschiedenen Sonderkartenart in eigenen Schlangen', () => {
    const zustand = zustandFuerSchlangenmeister(
      [
        schlange(
          [sonderkarte('frass-1-r96', 'Schlangenfrass'), sonderkarte('frass-2-r96', 'Schlangenfrass')],
          'nur-eine-sonderkartenart',
        ),
      ],
      ['Verdoppler', 'Farbenschutz', 'Schlangengrube', 'Farbenfusion'],
    );

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenmeister']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('erfüllt Schlangenmeister nicht mit nur drei ausgespielten Sonderkarten', () => {
    const zustand = zustandFuerSchlangenmeister(
      [
        schlange(
          [sonderkarte('frass-r96-kurz', 'Schlangenfrass'), sonderkarte('blockade-r96-kurz', 'Schlangenblockade')],
          'zu-wenig-ausgespielt',
        ),
      ],
      ['Verdoppler', 'Farbenschutz', 'Schlangengrube'],
    );

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenmeister']);
  });

  it('wertet nur eigene Schlangen und die eigene ausgespielte Sonderkartenhistorie des aktiven Spielers', () => {
    const zustand = zustandFuerSchlangenmeister([], [], 0);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenmeister']);
  });

  it('erfüllt Schlangenmeister für aktiverSpielerIndex 1 ohne Daten von Spieler 0 zu verwenden', () => {
    const basis = zustandFuerSchlangenmeister(
      [
        schlange(
          [sonderkarte('spieler-2-frass-r96', 'Schlangenfrass'), sonderkarte('spieler-2-blockade-r96', 'Schlangenblockade')],
          'spieler-2-schlangenmeister-schlange',
        ),
      ],
      ['Verdoppler', 'Verdoppler', 'Farbenschutz', 'Schlangengrube'],
      1,
    );
    const zustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, index) =>
        index === 0 ? { ...spieler, schlangen: [], ausgespielteSonderkartenNamen: [] } : spieler,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangenmeister',
    ]);
  });
});
