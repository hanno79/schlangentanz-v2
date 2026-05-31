/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für die Farbgruppen-Punktwertung über alle Schlangen eines Spielers nach R4.2/R4.4.
*/

import { describe, expect, it } from 'vitest';
import { berechneSpielerAufgabenPunkte, berechneSpielerFarbgruppenPunkte } from '../index';
import type { AufgabenkarteInfo, Spieler } from '../types';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

const geheimeAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'test-aufgabe-geheim',
  name: 'Testaufgabe',
  punkte: 1,
  bedingung: 'Testbedingung',
};

function spielerMitSchlangen(schlangen: Spieler['schlangen']): Spieler {
  return {
    id: 'spieler-wertung-1',
    name: 'Wertungsspieler',
    hand: [],
    schlangen,
    erfuellteAufgaben: [],
    geheimeAufgabe,
  };
}

describe('Spieler-Farbgruppen-Punktwertung — R4.2/R4.4', () => {
  it('summiert Farbgruppen-Punkte über mehrere Schlangen eines Spielers', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        farbkarte('blau-1', 'Blau', 1),
        farbkarte('blau-2', 'Blau', 1),
        farbkarte('blau-3', 'Blau', 1),
      ]),
      { ...schlange([
        farbkarte('gruen-1', 'Grün', 3),
        farbkarte('gruen-2', 'Grün', 3),
        farbkarte('gruen-3', 'Grün', 3),
        farbkarte('gruen-4', 'Grün', 3),
      ]), id: 'test-schlange-2' },
    ]);

    const wertung = berechneSpielerFarbgruppenPunkte(spieler);

    expect(wertung.gesamtPunkte).toBe(15);
    expect(wertung.schlangen).toEqual([
      {
        schlangenId: 'test-schlange',
        gesamtPunkte: 3,
        gruppen: [
          {
            farbe: 'Blau',
            startIndex: 0,
            endIndex: 2,
            laenge: 3,
            kartenIds: ['blau-1', 'blau-2', 'blau-3'],
            punkte: 3,
          },
        ],
      },
      {
        schlangenId: 'test-schlange-2',
        gesamtPunkte: 12,
        gruppen: [
          {
            farbe: 'Grün',
            startIndex: 0,
            endIndex: 3,
            laenge: 4,
            kartenIds: ['gruen-1', 'gruen-2', 'gruen-3', 'gruen-4'],
            punkte: 12,
          },
        ],
      },
    ]);
  });

  it('behält Schlangen ohne gültige Farbgruppe mit 0 Punkten in der Ergebnisliste', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        farbkarte('rot-1', 'Rot', 1),
        farbkarte('rot-2', 'Rot', 1),
        sonderkarte('sonder-1'),
      ]),
    ]);

    expect(berechneSpielerFarbgruppenPunkte(spieler)).toEqual({
      gesamtPunkte: 0,
      schlangen: [{ schlangenId: 'test-schlange', gesamtPunkte: 0, gruppen: [] }],
    });
  });

  it('mutiert Spieler, Schlangen und Karten nicht', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        farbkarte('braun-1', 'Braun', 2),
        farbkarte('braun-2', 'Braun', 2),
        farbkarte('braun-3', 'Braun', 2),
      ]),
    ]);
    const vorher = JSON.parse(JSON.stringify(spieler));

    berechneSpielerFarbgruppenPunkte(spieler);

    expect(spieler).toEqual(vorher);
  });
});

describe('Spieler-Aufgaben-Punktwertung — R8.4c', () => {
  it('summiert die Punkte bereits erfüllter Aufgaben eines Spielers', () => {
    const spieler = spielerMitSchlangen([]);
    spieler.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'aufgabe-test-1', name: 'Farbenpracht', punkte: 8, bedingung: 'Test' },
      { typ: 'Aufgabenkarte', id: 'aufgabe-test-2', name: 'Schlangentanz', punkte: 7, bedingung: 'Test' },
    ];

    expect(berechneSpielerAufgabenPunkte(spieler)).toEqual({
      gesamtPunkte: 15,
      aufgaben: [
        { aufgabenId: 'aufgabe-test-1', name: 'Farbenpracht', punkte: 8 },
        { aufgabenId: 'aufgabe-test-2', name: 'Schlangentanz', punkte: 7 },
      ],
    });
  });

  it('wertet Spieler ohne erfüllte Aufgaben mit 0 Punkten', () => {
    expect(berechneSpielerAufgabenPunkte(spielerMitSchlangen([]))).toEqual({
      gesamtPunkte: 0,
      aufgaben: [],
    });
  });

  it('mutiert erfüllte Aufgaben und Spieler nicht', () => {
    const spieler = spielerMitSchlangen([]);
    spieler.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'aufgabe-test-3', name: 'Symmetriemeister', punkte: 10, bedingung: 'Test' },
    ];
    const vorher = JSON.parse(JSON.stringify(spieler));

    berechneSpielerAufgabenPunkte(spieler);

    expect(spieler).toEqual(vorher);
  });
});
