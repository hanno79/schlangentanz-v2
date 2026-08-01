/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für die Farbgruppen-Punktwertung über alle Schlangen eines Spielers nach R4.2/R4.4.
*/

import { describe, expect, it } from 'vitest';
import {
  berechneSpielerAufgabenPunkte,
  berechneSpielerFarbgruppenPunkte,
  berechneSpielerGesamtPunkte,
  ermittleFarbenFuerFarbvielfalt,
} from '../index';
import { farbkarte, schlange, sonderkarte, spielerMitSchlangen } from './testHelpers';

describe('Spieler-Farbgruppen-Punktwertung — R4.2/R4.4', () => {
  it('wertet Regenbogenschlangen als beste Farbe und zählt sie mit 0 Punkten', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        farbkarte('blau-1', 'Blau', 1),
        farbkarte('blau-2', 'Blau', 1),
        { typ: 'Sonderkarte', id: 'regen-1', name: 'Regenbogenschlange' },
        farbkarte('gruen-1', 'Grün', 3),
        farbkarte('gruen-2', 'Grün', 3),
      ]),
    ]);

    const wertung = berechneSpielerFarbgruppenPunkte(spieler);

    expect(wertung.gesamtPunkte).toBe(6);
    expect(wertung.schlangen).toEqual([
      {
        schlangenId: 'test-schlange',
        gesamtPunkte: 6,
        gruppen: [
          {
            farbe: 'Grün',
            startIndex: 2,
            endIndex: 4,
            laenge: 3,
            kartenIds: ['regen-1', 'gruen-1', 'gruen-2'],
            punkte: 6,
          },
        ],
      },
    ]);
  });

  it('wertet Regenbogenschlangen am Anfang und am Ende einer Schlange korrekt', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        sonderkarte('regen-start', 'Regenbogenschlange'),
        farbkarte('gruen-start-1', 'Grün', 2),
        farbkarte('gruen-start-2', 'Grün', 2),
        farbkarte('gruen-start-3', 'Grün', 2),
      ]),
      schlange([
        farbkarte('gruen-ende-1', 'Grün', 2),
        farbkarte('gruen-ende-2', 'Grün', 2),
        farbkarte('gruen-ende-3', 'Grün', 2),
        sonderkarte('regen-ende', 'Regenbogenschlange'),
      ], 'test-schlange-2'),
    ]);

    const wertung = berechneSpielerFarbgruppenPunkte(spieler);

    expect(wertung.gesamtPunkte).toBe(12);
    expect(wertung.schlangen).toEqual([
      {
        schlangenId: 'test-schlange',
        gesamtPunkte: 6,
        gruppen: [
          {
            farbe: 'Grün',
            startIndex: 1,
            endIndex: 3,
            laenge: 3,
            kartenIds: ['gruen-start-1', 'gruen-start-2', 'gruen-start-3'],
            punkte: 6,
          },
        ],
      },
      {
        schlangenId: 'test-schlange-2',
        gesamtPunkte: 6,
        gruppen: [
          {
            farbe: 'Grün',
            startIndex: 0,
            endIndex: 3,
            laenge: 4,
            kartenIds: ['gruen-ende-1', 'gruen-ende-2', 'gruen-ende-3', 'regen-ende'],
            punkte: 6,
          },
        ],
      },
    ]);
  });

  it('wertet aufeinanderfolgende Regenbogenschlangen als zusammenhängende Wildcards', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        farbkarte('gruen-doppel-1', 'Grün', 2),
        sonderkarte('regen-doppel-1', 'Regenbogenschlange'),
        sonderkarte('regen-doppel-2', 'Regenbogenschlange'),
        farbkarte('gruen-doppel-2', 'Grün', 2),
        farbkarte('gruen-doppel-3', 'Grün', 2),
      ]),
    ]);

    const wertung = berechneSpielerFarbgruppenPunkte(spieler);

    expect(wertung.gesamtPunkte).toBe(6);
    expect(wertung.schlangen).toEqual([
      {
        schlangenId: 'test-schlange',
        gesamtPunkte: 6,
        gruppen: [
          {
            farbe: 'Grün',
            startIndex: 0,
            endIndex: 4,
            laenge: 5,
            kartenIds: ['gruen-doppel-1', 'regen-doppel-1', 'regen-doppel-2', 'gruen-doppel-2', 'gruen-doppel-3'],
            punkte: 6,
          },
        ],
      },
    ]);
  });

  it('wertet eine einzelne Regenbogenschlange ohne Gruppe mit 0 Punkten', () => {
    const spieler = spielerMitSchlangen([
      schlange([sonderkarte('regen-einzeln', 'Regenbogenschlange')]),
    ]);

    expect(berechneSpielerFarbgruppenPunkte(spieler)).toEqual({
      gesamtPunkte: 0,
      schlangen: [
        {
          schlangenId: 'test-schlange',
          gesamtPunkte: 0,
          gruppen: [],
        },
      ],
    });
  });

  it('summiert Farbgruppen-Punkte über mehrere Schlangen eines Spielers', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        farbkarte('blau-1', 'Blau', 1),
        farbkarte('blau-2', 'Blau', 1),
        farbkarte('blau-3', 'Blau', 1),
      ]),
      schlange([
        farbkarte('gruen-1', 'Grün', 3),
        farbkarte('gruen-2', 'Grün', 3),
        farbkarte('gruen-3', 'Grün', 3),
        farbkarte('gruen-4', 'Grün', 3),
      ], 'test-schlange-2'),
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

describe('Farbenvielfalt-Helfer', () => {
  it('ignoriert Farbenfusionen beim Ermitteln der Farben für den Vielfaltbonus', () => {
    const schlangeMitFusion = schlange([
      farbkarte('blau-1', 'Blau', 1),
      farbkarte('blau-2', 'Blau', 1),
      sonderkarte('farbenfusion-1', 'Farbenfusion'),
      farbkarte('gruen-1', 'Grün', 3),
      farbkarte('gruen-2', 'Grün', 3),
    ]);
    schlangeMitFusion.farbenfusionen = [{ kartenId: 'farbenfusion-1', punkte: 4 }];

    expect(ermittleFarbenFuerFarbvielfalt(schlangeMitFusion)).toEqual(['Blau', 'Grün']);
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
      geheimePunkte: 0,
      aufgaben: [
        { aufgabenId: 'aufgabe-test-1', name: 'Farbenpracht', punkte: 8 },
        { aufgabenId: 'aufgabe-test-2', name: 'Schlangentanz', punkte: 7 },
      ],
    });
  });

  it('wertet Spieler ohne erfüllte Aufgaben mit 0 Punkten', () => {
    expect(berechneSpielerAufgabenPunkte(spielerMitSchlangen([]))).toEqual({
      gesamtPunkte: 0,
      geheimePunkte: 0,
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

describe('Spieler-Gesamtpunktwertung — R8.4d', () => {
  it('aggregiert Farbgruppen- und erfüllte Aufgabenpunkte eines Spielers', () => {
    const spieler = spielerMitSchlangen([
      schlange([farbkarte('blau-1', 'Blau', 1), farbkarte('blau-2', 'Blau', 1), farbkarte('blau-3', 'Blau', 1)]),
      schlange([farbkarte('violett-1', 'Violett', 2), farbkarte('violett-2', 'Violett', 2), farbkarte('violett-3', 'Violett', 2)], 'test-schlange-2'),
    ]);
    spieler.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'aufgabe-gesamt-1', name: 'Farbenpracht', punkte: 8, bedingung: 'Test' },
      { typ: 'Aufgabenkarte', id: 'aufgabe-gesamt-2', name: 'Gelber Schatz', punkte: 5, bedingung: 'Test' },
    ];

    const ergebnis = berechneSpielerGesamtPunkte(spieler);

    expect(ergebnis.gesamtPunkte).toBe(22);           // 9 Farbgruppen + 13 Aufgaben
    expect(ergebnis.farbgruppenPunkte.gesamtPunkte).toBe(9);
    expect(ergebnis.aufgabenPunkte.gesamtPunkte).toBe(13);
  });

  it('wertet Spieler ohne Farbgruppen und erfüllte Aufgaben mit 0 Gesamtpunkten', () => {
    expect(berechneSpielerGesamtPunkte(spielerMitSchlangen([]))).toEqual({
      gesamtPunkte: 0,
      farbgruppenPunkte: { gesamtPunkte: 0, schlangen: [] },
      aufgabenPunkte: { gesamtPunkte: 0, geheimePunkte: 0, aufgaben: [] },
    });
  });

  /* ÄNDERUNG [01.08.2026]: Der geheime Anteil wird getrennt ausgewiesen, damit
     die laufende Anzeige ihn weglassen kann. Ohne das verriet die Punktzahl
     eines Gegners, welche geheime Aufgabe er erfüllt hatte. In der
     Schlusswertung zählt er weiterhin mit. */
  it('weist den Anteil der geheimen Aufgabe getrennt aus', () => {
    const spieler = spielerMitSchlangen([]);
    spieler.geheimeAufgabe = {
      typ: 'Aufgabenkarte',
      id: 'aufgabe-geheim',
      name: 'Farbwechsler',
      punkte: 6,
      bedingung: 'Test',
    };
    spieler.geheimeAufgabeErfuellt = true;

    const ergebnis = berechneSpielerGesamtPunkte(spieler);

    expect(ergebnis.aufgabenPunkte.geheimePunkte).toBe(6);
    // In der Schlusswertung zählt sie weiterhin voll mit.
    expect(ergebnis.gesamtPunkte).toBe(6);
  });

  it('mutiert Spieler, Schlangen, Karten und Aufgaben nicht', () => {
    const spieler = spielerMitSchlangen([
      schlange([
        farbkarte('gruen-gesamt-1', 'Grün', 3),
        farbkarte('gruen-gesamt-2', 'Grün', 3),
        farbkarte('gruen-gesamt-3', 'Grün', 3),
      ]),
    ]);
    spieler.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'aufgabe-gesamt-3', name: 'Farbvielfalt', punkte: 9, bedingung: 'Test' },
    ];
    const vorher = JSON.parse(JSON.stringify(spieler));

    berechneSpielerGesamtPunkte(spieler);

    expect(spieler).toEqual(vorher);
  });
});
