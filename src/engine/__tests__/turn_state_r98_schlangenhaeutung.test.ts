/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R98-Regressionstests — Schlangenhäutung ordnet eine eigene Schlange regelkonform neu und zählt neu entstandene Dreiergruppen.
*/

import { describe, expect, it } from 'vitest';
import {
  anwendeAktion,
  beendeAufgabenpruefung,
  ermittleLegaleAktionen,
  erstelleSpielzustand,
  pruefeAktion,
  spieleSchlangenhaeutung,
} from '../index';
import type { AufgabenkarteInfo, Spielkarte, Spielzustand } from '../index';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

const schlangentanz: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-11',
  name: 'Schlangentanz',
  punkte: 7,
  bedingung: 'Bilde durch Schlangenhäutung 2 neue Dreiergruppen.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-01',
  name: 'Farbenpracht',
  punkte: 8,
  bedingung: 'Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.',
};

function schlangenhaeutung(): Spielkarte {
  return sonderkarte('schlangenhaeutung-r98', 'Schlangenhäutung');
}

function zustandMitSchlangenhaeutung(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  const sonderkarteR98 = schlangenhaeutung();
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    offeneAufgaben: [schlangentanz],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarteR98],
            schlangen: [
              schlange(
                [
                  farbkarte('blau-1-r98', 'Blau'),
                  farbkarte('gruen-1-r98', 'Grün'),
                  farbkarte('gruen-2-r98', 'Grün'),
                  farbkarte('blau-2-r98', 'Blau'),
                  farbkarte('gruen-3-r98', 'Grün'),
                  farbkarte('rot-1-r98', 'Rot'),
                  farbkarte('rot-2-r98', 'Rot'),
                  farbkarte('violett-1-r98', 'Violett'),
                  farbkarte('violett-2-r98', 'Violett'),
                  farbkarte('rot-3-r98', 'Rot'),
                  farbkarte('violett-3-r98', 'Violett'),
                ],
                'schlange-spieler-1-r98',
              ),
            ],
            schlangenhaeutungDreiergruppen: 0,
          }
        : {
            ...spieler,
            schlangen: [schlange([farbkarte('gegner-rot-1-r98', 'Rot')], 'gegner-schlange-r98')],
            schlangenhaeutungDreiergruppen: 0,
          },
    ),
  };
}

const regelBeispielNachher = [
  'blau-1-r98',
  'gruen-1-r98',
  'gruen-2-r98',
  'blau-2-r98',
  'gruen-3-r98',
  'rot-1-r98',
  'rot-2-r98',
  'rot-3-r98',
  'violett-1-r98',
  'violett-2-r98',
  'violett-3-r98',
];

describe('R98 Schlangenhäutung', () => {
  it('ordnet die eigene Schlange nach Regelwerksbeispiel neu, zählt zwei neue Dreiergruppen und erfüllt Schlangentanz', () => {
    const zustand = zustandMitSchlangenhaeutung();

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'SchlangenhaeutungSpielen',
      spielerId: 'spieler-1',
      handkartenId: 'schlangenhaeutung-r98',
      schlangenId: 'schlange-spieler-1-r98',
      kartenIdsInNeuerReihenfolge: regelBeispielNachher,
    });

    expect(aktualisiert.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual(regelBeispielNachher);
    expect(aktualisiert.spieler[0].hand).toHaveLength(0);
    expect(aktualisiert.ablagestapel.map((karte) => karte.id)).toContain('schlangenhaeutung-r98');
    expect(aktualisiert.zugpflichten.gespielteSonderkarten).toBe(1);
    expect(aktualisiert.spieler[0].ausgespielteSonderkartenNamen).toEqual(['Schlangenhäutung']);
    expect(aktualisiert.spieler[0].schlangenhaeutungDreiergruppen).toBe(2);
    expect(aktualisiert.spieler[1].schlangen[0].karten.map((karte) => karte.id)).toEqual(['gegner-rot-1-r98']);

    const nachAufgabenpruefung = beendeAufgabenpruefung(
      { ...aktualisiert, zugphase: 'Aufgabenpruefung' },
      { aufgabenGeprueft: true },
    );
    expect(nachAufgabenpruefung.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangentanz',
    ]);
  });

  it('verbietet eine identische Reihenfolge als wirkungslose Schlangenhäutung', () => {
    const zustand = zustandMitSchlangenhaeutung();
    const alteReihenfolge = zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id);

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenhaeutungSpielen',
      spielerId: 'spieler-1',
      handkartenId: 'schlangenhaeutung-r98',
      schlangenId: 'schlange-spieler-1-r98',
      kartenIdsInNeuerReihenfolge: alteReihenfolge,
    });

    expect(ergebnis).toEqual({ erlaubt: false, grund: 'Schlangenhäutung muss die Reihenfolge der Schlange verändern.' });
  });

  it('verbietet fehlende, doppelte oder fremde Karten in der neuen Reihenfolge', () => {
    const zustand = zustandMitSchlangenhaeutung();

    expect(() =>
      spieleSchlangenhaeutung(zustand, {
        kartenId: 'schlangenhaeutung-r98',
        schlangenId: 'schlange-spieler-1-r98',
        kartenIdsInNeuerReihenfolge: regelBeispielNachher.slice(0, -1),
      }),
    ).toThrow('Die neue Reihenfolge muss exakt alle Karten der ausgewählten Schlange enthalten.');

    expect(() =>
      spieleSchlangenhaeutung(zustand, {
        kartenId: 'schlangenhaeutung-r98',
        schlangenId: 'schlange-spieler-1-r98',
        kartenIdsInNeuerReihenfolge: [...regelBeispielNachher.slice(0, -1), 'rot-3-r98'],
      }),
    ).toThrow('Die neue Reihenfolge darf keine doppelten Karten enthalten.');

    expect(() =>
      spieleSchlangenhaeutung(zustand, {
        kartenId: 'schlangenhaeutung-r98',
        schlangenId: 'schlange-spieler-1-r98',
        kartenIdsInNeuerReihenfolge: [...regelBeispielNachher.slice(0, -1), 'gegner-rot-1-r98'],
      }),
    ).toThrow('Die neue Reihenfolge darf nur Karten der ausgewählten Schlange enthalten.');
  });

  it('zählt eine nur verschobene bestehende Dreiergruppe nicht erneut', () => {
    const basis = zustandMitSchlangenhaeutung();
    const zustand: Spielzustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, index) =>
        index === 0
          ? {
              ...spieler,
              schlangen: [
                schlange(
                  [
                    farbkarte('rot-bestehend-1-r98', 'Rot'),
                    farbkarte('rot-bestehend-2-r98', 'Rot'),
                    farbkarte('rot-bestehend-3-r98', 'Rot'),
                    farbkarte('blau-trenner-r98', 'Blau'),
                    farbkarte('gruen-trenner-r98', 'Grün'),
                  ],
                  'schlange-spieler-1-r98',
                ),
              ],
            }
          : spieler,
      ),
    };

    const aktualisiert = spieleSchlangenhaeutung(zustand, {
      kartenId: 'schlangenhaeutung-r98',
      schlangenId: 'schlange-spieler-1-r98',
      kartenIdsInNeuerReihenfolge: [
        'blau-trenner-r98',
        'rot-bestehend-1-r98',
        'rot-bestehend-2-r98',
        'rot-bestehend-3-r98',
        'gruen-trenner-r98',
      ],
    });

    expect(aktualisiert.spieler[0].schlangenhaeutungDreiergruppen).toBe(0);
  });

  it('beachtet Phase und Sonderkartenlimit', () => {
    const zustand = zustandMitSchlangenhaeutung();

    expect(
      pruefeAktion({ ...zustand, zugphase: 'Nachziehphase' }, {
        typ: 'SchlangenhaeutungSpielen',
        spielerId: 'spieler-1',
        handkartenId: 'schlangenhaeutung-r98',
        schlangenId: 'schlange-spieler-1-r98',
        kartenIdsInNeuerReihenfolge: regelBeispielNachher,
      }),
    ).toEqual({ erlaubt: false, grund: 'Sonderkarten können nur in der Ausspielphase gespielt werden.' });

    expect(
      pruefeAktion({ ...zustand, zugpflichten: { ...zustand.zugpflichten, gespielteKarten: 1, gespielteSonderkarten: 1 } }, {
        typ: 'SchlangenhaeutungSpielen',
        spielerId: 'spieler-1',
        handkartenId: 'schlangenhaeutung-r98',
        schlangenId: 'schlange-spieler-1-r98',
        kartenIdsInNeuerReihenfolge: regelBeispielNachher,
      }),
    ).toEqual({ erlaubt: false, grund: 'Pro Zug darf höchstens 1 Sonderkarte gespielt werden.' });
  });

  it('zählt eine verschobene Bestandsgruppe nicht, aber eine gleichzeitig neu gebildete Dreiergruppe schon', () => {
    // Vorher: Rot-Dreiergruppe an Positionen 2–4 bereits vorhanden; Grün-Karten getrennt (0, 1, 6).
    // Nachher: Rot-Gruppe an Positionen 0–2 (verschoben, nicht neu); Grün-Gruppe erstmals beisammen (3–5).
    const basis = zustandMitSchlangenhaeutung();
    const zustand: Spielzustand = {
      ...basis,
      spieler: basis.spieler.map((spieler, index) =>
        index === 0
          ? {
              ...spieler,
              schlangen: [
                schlange(
                  [
                    farbkarte('gruen-r98-1', 'Grün'),
                    farbkarte('gruen-r98-2', 'Grün'),
                    farbkarte('rot-r98-1', 'Rot'),
                    farbkarte('rot-r98-2', 'Rot'),
                    farbkarte('rot-r98-3', 'Rot'),
                    farbkarte('blau-r98-1', 'Blau'),
                    farbkarte('gruen-r98-3', 'Grün'),
                  ],
                  'schlange-spieler-1-r98',
                ),
              ],
            }
          : spieler,
      ),
    };

    const aktualisiert = spieleSchlangenhaeutung(zustand, {
      kartenId: 'schlangenhaeutung-r98',
      schlangenId: 'schlange-spieler-1-r98',
      kartenIdsInNeuerReihenfolge: [
        'rot-r98-1',
        'rot-r98-2',
        'rot-r98-3',
        'gruen-r98-1',
        'gruen-r98-2',
        'gruen-r98-3',
        'blau-r98-1',
      ],
    });

    expect(aktualisiert.spieler[0].schlangenhaeutungDreiergruppen).toBe(1);

    const nachAufgabenpruefung = beendeAufgabenpruefung(
      { ...aktualisiert, zugphase: 'Aufgabenpruefung' },
      { aufgabenGeprueft: true },
    );
    expect(nachAufgabenpruefung.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).not.toContain(
      'Schlangentanz',
    );
  });

  it('bietet keinen Pflicht-Abwurf an, wenn Schlangenhäutung spielbar aber nicht enumeriert ist', () => {
    const zustand = zustandMitSchlangenhaeutung();

    const legaleAktionen = ermittleLegaleAktionen(zustand);

    expect(legaleAktionen.some((aktion) => aktion.typ === 'PflichtAbwurf')).toBe(false);
  });
});
