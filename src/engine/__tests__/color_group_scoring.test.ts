/*
Author: rahn
Datum: 31.05.2026
Version: 1.1
Beschreibung: TDD-Tests für die Punktwertung gültiger Farbgruppen nach R4.2/R4.4 und R8.4.
              v1.1: Regressionsabsicherung Regenbogenschlange an Außenpositionen und
              mehrere Regenbogenschlangen mit unterschiedlichen optimalen Farben.
*/

import { describe, expect, it } from 'vitest';
import { berechneFarbgruppenPunkte } from '../index';
import { farbkarte, sonderkarte, schlange } from './testHelpers';

describe('Farbgruppen-Punktwertung — R4.2/R4.4 und R8.4', () => {
  it('wertet Regenbogenschlangen als Wildcard in der direkten Farbgruppenwertung', () => {
    const wertung = berechneFarbgruppenPunkte(
      schlange([
        farbkarte('blau-1', 'Blau', 1),
        farbkarte('blau-2', 'Blau', 1),
        sonderkarte('regen-1', 'Regenbogenschlange'),
        farbkarte('gruen-1', 'Grün', 3),
        farbkarte('gruen-2', 'Grün', 3),
      ]),
    );

    expect(wertung).toEqual({
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
    });
  });

  it('summiert die Punktwerte aller Karten einer gültigen Farbgruppe', () => {
    const wertung = berechneFarbgruppenPunkte(
      schlange([
        farbkarte('gruen-1', 'Grün', 3),
        farbkarte('gruen-2', 'Grün', 3),
        farbkarte('gruen-3', 'Grün', 3),
      ]),
    );

    expect(wertung).toEqual({
      gesamtPunkte: 9,
      gruppen: [
        {
          farbe: 'Grün',
          startIndex: 0,
          endIndex: 2,
          laenge: 3,
          kartenIds: ['gruen-1', 'gruen-2', 'gruen-3'],
          punkte: 9,
        },
      ],
    });
  });

  it('wertet Einzelkarten und Zweiergruppen mit 0 Punkten', () => {
    const wertung = berechneFarbgruppenPunkte(
      schlange([
        farbkarte('blau-1', 'Blau', 1),
        farbkarte('blau-2', 'Blau', 1),
        farbkarte('rot-1', 'Rot', 1),
      ]),
    );

    expect(wertung).toEqual({ gesamtPunkte: 0, gruppen: [] });
  });

  it('wertet mehrere getrennte Gruppen separat und summiert sie', () => {
    const wertung = berechneFarbgruppenPunkte(
      schlange([
        farbkarte('blau-1', 'Blau', 1),
        farbkarte('blau-2', 'Blau', 1),
        farbkarte('blau-3', 'Blau', 1),
        farbkarte('violett-1', 'Violett', 2),
        farbkarte('violett-2', 'Violett', 2),
        farbkarte('violett-3', 'Violett', 2),
        farbkarte('violett-4', 'Violett', 2),
      ]),
    );

    expect(wertung.gesamtPunkte).toBe(11);
    expect(wertung.gruppen).toEqual([
      {
        farbe: 'Blau',
        startIndex: 0,
        endIndex: 2,
        laenge: 3,
        kartenIds: ['blau-1', 'blau-2', 'blau-3'],
        punkte: 3,
      },
      {
        farbe: 'Violett',
        startIndex: 3,
        endIndex: 6,
        laenge: 4,
        kartenIds: ['violett-1', 'violett-2', 'violett-3', 'violett-4'],
        punkte: 8,
      },
    ]);
  });

  it('zählt durch Sonderkarten getrennte gleichfarbige Karten nicht zusammen', () => {
    const wertung = berechneFarbgruppenPunkte(
      schlange([
        farbkarte('gelb-1', 'Gelb', 1),
        farbkarte('gelb-2', 'Gelb', 1),
        sonderkarte('sonder-1'),
        farbkarte('gelb-3', 'Gelb', 1),
      ]),
    );

    expect(wertung).toEqual({ gesamtPunkte: 0, gruppen: [] });
  });

  it('wertet Karten positionsbasiert statt per ID, damit doppelte IDs keine Punkte überschreiben', () => {
    const wertung = berechneFarbgruppenPunkte(
      schlange([
        farbkarte('duplikat-id', 'Rot', 1),
        farbkarte('duplikat-id', 'Rot', 2),
        farbkarte('duplikat-id', 'Rot', 3),
      ]),
    );

    expect(wertung.gruppen[0].punkte).toBe(6);
    expect(wertung.gesamtPunkte).toBe(6);
  });

  it('mutiert die Schlange und Kartenreihenfolge nicht', () => {
    const eingabe = schlange([
      farbkarte('braun-1', 'Braun', 2),
      farbkarte('braun-2', 'Braun', 2),
      farbkarte('braun-3', 'Braun', 2),
    ]);
    const vorher = eingabe.karten.map((karte) => ({ ...karte }));

    berechneFarbgruppenPunkte(eingabe);

    expect(eingabe.karten).toEqual(vorher);
  });

  describe('Regenbogenschlange an Außenpositionen', () => {
    it('Regenbogenschlange an erster Position ermöglicht außenliegende Dreiergruppe', () => {
      // [Regen, Grün 3, Grün 3] — Regen übernimmt Grün, bildet Dreiergruppe ab Index 0
      const wertung = berechneFarbgruppenPunkte(
        schlange([
          sonderkarte('regen-1', 'Regenbogenschlange'),
          farbkarte('gruen-1', 'Grün', 3),
          farbkarte('gruen-2', 'Grün', 3),
        ]),
      );

      expect(wertung).toEqual({
        gesamtPunkte: 6,
        gruppen: [
          {
            farbe: 'Grün',
            startIndex: 0,
            endIndex: 2,
            laenge: 3,
            kartenIds: ['regen-1', 'gruen-1', 'gruen-2'],
            punkte: 6,
          },
        ],
      });
    });

    it('Regenbogenschlange an letzter Position ermöglicht außenliegende Dreiergruppe', () => {
      // [Blau 3, Blau 3, Regen] — Regen verlängert bestehende Blau-Gruppe auf Länge 3
      const wertung = berechneFarbgruppenPunkte(
        schlange([
          farbkarte('blau-1', 'Blau', 3),
          farbkarte('blau-2', 'Blau', 3),
          sonderkarte('regen-1', 'Regenbogenschlange'),
        ]),
      );

      expect(wertung).toEqual({
        gesamtPunkte: 6,
        gruppen: [
          {
            farbe: 'Blau',
            startIndex: 0,
            endIndex: 2,
            laenge: 3,
            kartenIds: ['blau-1', 'blau-2', 'regen-1'],
            punkte: 6,
          },
        ],
      });
    });
  });

  describe('Mehrere Regenbogenschlangen', () => {
    it('mehrere Regenbogenschlangen tragen in derselben Schlange unterschiedliche beste Farben', () => {
      // [Blau 3, Blau 3, Regen A, Regen B, Grün 2, Grün 2]
      // Optimale Zuordnung: Regen A → Blau (schließt Dreiergruppe), Regen B → Grün (eröffnet Dreiergruppe)
      // Blau-Gruppe [0..2] = 3+3+0 = 6, Grün-Gruppe [3..5] = 0+2+2 = 4, Gesamt = 10
      const wertung = berechneFarbgruppenPunkte(
        schlange([
          farbkarte('blau-1', 'Blau', 3),
          farbkarte('blau-2', 'Blau', 3),
          sonderkarte('regen-a', 'Regenbogenschlange'),
          sonderkarte('regen-b', 'Regenbogenschlange'),
          farbkarte('gruen-1', 'Grün', 2),
          farbkarte('gruen-2', 'Grün', 2),
        ]),
      );

      expect(wertung).toEqual({
        gesamtPunkte: 10,
        gruppen: [
          {
            farbe: 'Blau',
            startIndex: 0,
            endIndex: 2,
            laenge: 3,
            kartenIds: ['blau-1', 'blau-2', 'regen-a'],
            punkte: 6,
          },
          {
            farbe: 'Grün',
            startIndex: 3,
            endIndex: 5,
            laenge: 3,
            kartenIds: ['regen-b', 'gruen-1', 'gruen-2'],
            punkte: 4,
          },
        ],
      });
    });
  });
});
