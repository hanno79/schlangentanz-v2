/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für die Spiel-Gesamtwertung über alle Spieler nach R8.4e.
*/

import { describe, expect, it } from 'vitest';
import { berechneSpielGesamtwertung, berechneSpielzustandGesamtwertung } from '../index';
import { farbkarte, schlange, spielerMitId } from './testHelpers';

describe('Spiel-Gesamtwertung — R8.4e', () => {
  it('berechnet die Gesamtpunkte für alle Spieler in stabiler Spieler-Reihenfolge', () => {
    const anna = spielerMitId('spieler-anna', 'Anna', [
      schlange([
        farbkarte('anna-blau-1', 'Blau', 1),
        farbkarte('anna-blau-2', 'Blau', 1),
        farbkarte('anna-blau-3', 'Blau', 1),
      ], 'anna-schlange-1'),
    ]);
    anna.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'anna-aufgabe-1', name: 'Farbenpracht', punkte: 8, bedingung: 'Test' },
    ];

    const ben = spielerMitId('spieler-ben', 'Ben', [
      schlange([
        farbkarte('ben-gruen-1', 'Grün', 3),
        farbkarte('ben-gruen-2', 'Grün', 3),
        farbkarte('ben-gruen-3', 'Grün', 3),
      ], 'ben-schlange-1'),
    ]);
    ben.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'ben-aufgabe-1', name: 'Gelber Schatz', punkte: 5, bedingung: 'Test' },
    ];

    expect(berechneSpielGesamtwertung([anna, ben])).toEqual({
      spielerwertungen: [
        {
          spielerId: 'spieler-anna',
          name: 'Anna',
          gesamtPunkte: 11,
          wertung: expect.objectContaining({
            gesamtPunkte: 11,
            farbgruppenPunkte: expect.objectContaining({ gesamtPunkte: 3 }),
            aufgabenPunkte: expect.objectContaining({ gesamtPunkte: 8 }),
          }),
        },
        {
          spielerId: 'spieler-ben',
          name: 'Ben',
          gesamtPunkte: 14,
          wertung: expect.objectContaining({
            gesamtPunkte: 14,
            farbgruppenPunkte: expect.objectContaining({ gesamtPunkte: 9 }),
            aufgabenPunkte: expect.objectContaining({ gesamtPunkte: 5 }),
          }),
        },
      ],
    });
  });

  it('liefert für ein leeres Spielerfeld eine leere Wertung ohne Gewinnerannahme', () => {
    expect(berechneSpielGesamtwertung([])).toEqual({ spielerwertungen: [] });
  });

  it('mutiert Spieler, Schlangen, Karten und Aufgaben nicht', () => {
    const spieler = spielerMitId('spieler-caro', 'Caro', [
      schlange([
        farbkarte('caro-rot-1', 'Rot', 1),
        farbkarte('caro-rot-2', 'Rot', 1),
        farbkarte('caro-rot-3', 'Rot', 1),
      ], 'caro-schlange-1'),
    ]);
    spieler.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'caro-aufgabe-1', name: 'Farbvielfalt', punkte: 9, bedingung: 'Test' },
    ];
    const vorher = JSON.parse(JSON.stringify(spieler));

    berechneSpielGesamtwertung([spieler]);

    expect(spieler).toEqual(vorher);
  });
});

describe('Spielzustand-Gesamtwertung — R8.4f', () => {
  it('berechnet die Spiel-Gesamtwertung direkt aus dem Spielzustand', () => {
    const anna = spielerMitId('spieler-anna', 'Anna', [
      schlange([
        farbkarte('anna-zustand-blau-1', 'Blau', 1),
        farbkarte('anna-zustand-blau-2', 'Blau', 1),
        farbkarte('anna-zustand-blau-3', 'Blau', 1),
      ], 'anna-zustand-schlange-1'),
    ]);
    anna.erfuellteAufgaben = [
      { typ: 'Aufgabenkarte', id: 'anna-zustand-aufgabe-1', name: 'Farbenpracht', punkte: 8, bedingung: 'Test' },
    ];

    const ben = spielerMitId('spieler-ben', 'Ben', [
      schlange([
        farbkarte('ben-zustand-gelb-1', 'Gelb', 2),
        farbkarte('ben-zustand-gelb-2', 'Gelb', 2),
        farbkarte('ben-zustand-gelb-3', 'Gelb', 2),
      ], 'ben-zustand-schlange-1'),
    ]);

    const zustand = { spieler: [anna, ben] };

    const erwarteteWertung = berechneSpielGesamtwertung(zustand.spieler);

    expect(berechneSpielzustandGesamtwertung(zustand)).toEqual(erwarteteWertung);
    expect(erwarteteWertung).toEqual({
      spielerwertungen: [
        expect.objectContaining({ spielerId: 'spieler-anna', name: 'Anna', gesamtPunkte: 11 }),
        expect.objectContaining({ spielerId: 'spieler-ben', name: 'Ben', gesamtPunkte: 6 }),
      ],
    });
  });

  it('mutiert den Spielzustand und enthaltene Spieler nicht', () => {
    const spieler = spielerMitId('spieler-caro', 'Caro', [
      schlange([
        farbkarte('caro-zustand-rot-1', 'Rot', 1),
        farbkarte('caro-zustand-rot-2', 'Rot', 1),
        farbkarte('caro-zustand-rot-3', 'Rot', 1),
      ], 'caro-zustand-schlange-1'),
    ]);
    const zustand = { spieler: [spieler] };
    const vorher = JSON.parse(JSON.stringify(zustand));

    berechneSpielzustandGesamtwertung(zustand);

    expect(zustand).toEqual(vorher);
  });
});
