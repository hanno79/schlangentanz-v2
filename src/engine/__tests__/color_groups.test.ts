/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für Farbgruppen-Erkennung in Schlangentanz-Schlangen nach R3.3.
*/

import { describe, expect, it } from 'vitest';
import { ermittleFarbgruppen } from '../index';
import { farbkarte, sonderkarte, schlange } from './testHelpers';

describe('Farbgruppen-Erkennung — R3.3', () => {
  it('erkennt eine direkt zusammenhängende Dreiergruppe derselben Farbe', () => {
    const gruppen = ermittleFarbgruppen(
      schlange([
        farbkarte('blau-1', 'Blau'),
        farbkarte('blau-2', 'Blau'),
        farbkarte('blau-3', 'Blau'),
      ]),
    );

    expect(gruppen).toEqual([
      {
        farbe: 'Blau',
        startIndex: 0,
        endIndex: 2,
        laenge: 3,
        kartenIds: ['blau-1', 'blau-2', 'blau-3'],
      },
    ]);
  });

  it('ignoriert Farbsequenzen mit weniger als drei Karten', () => {
    const gruppen = ermittleFarbgruppen(
      schlange([
        farbkarte('rot-1', 'Rot'),
        farbkarte('rot-2', 'Rot'),
        farbkarte('gelb-1', 'Gelb'),
      ]),
    );

    expect(gruppen).toEqual([]);
  });

  it('erkennt mehrere getrennte Farbgruppen separat', () => {
    const gruppen = ermittleFarbgruppen(
      schlange([
        farbkarte('blau-1', 'Blau'),
        farbkarte('blau-2', 'Blau'),
        farbkarte('blau-3', 'Blau'),
        farbkarte('rot-1', 'Rot'),
        farbkarte('gruen-1', 'Grün'),
        farbkarte('gruen-2', 'Grün'),
        farbkarte('gruen-3', 'Grün'),
        farbkarte('gruen-4', 'Grün'),
      ]),
    );

    expect(gruppen).toEqual([
      {
        farbe: 'Blau',
        startIndex: 0,
        endIndex: 2,
        laenge: 3,
        kartenIds: ['blau-1', 'blau-2', 'blau-3'],
      },
      {
        farbe: 'Grün',
        startIndex: 4,
        endIndex: 7,
        laenge: 4,
        kartenIds: ['gruen-1', 'gruen-2', 'gruen-3', 'gruen-4'],
      },
    ]);
  });

  it('unterbricht Farbgruppen durch Sonderkarten', () => {
    const gruppen = ermittleFarbgruppen(
      schlange([
        farbkarte('gelb-1', 'Gelb'),
        farbkarte('gelb-2', 'Gelb'),
        sonderkarte('sonder-1'),
        farbkarte('gelb-3', 'Gelb'),
        farbkarte('gelb-4', 'Gelb'),
        farbkarte('gelb-5', 'Gelb'),
      ]),
    );

    expect(gruppen).toEqual([
      {
        farbe: 'Gelb',
        startIndex: 3,
        endIndex: 5,
        laenge: 3,
        kartenIds: ['gelb-3', 'gelb-4', 'gelb-5'],
      },
    ]);
  });

  it('mutiert die Schlange und Kartenreihenfolge nicht', () => {
    const eingabe = schlange([
      farbkarte('violett-1', 'Violett'),
      farbkarte('violett-2', 'Violett'),
      farbkarte('violett-3', 'Violett'),
    ]);
    const vorher = eingabe.karten.map((karte) => karte.id);

    ermittleFarbgruppen(eingabe);

    expect(eingabe.karten.map((karte) => karte.id)).toEqual(vorher);
  });
});
