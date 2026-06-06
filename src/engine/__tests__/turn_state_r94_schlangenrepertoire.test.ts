/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: R94-Regressionstests — Aufgabenprüfung Schlangenrepertoire: mindestens fünf verschiedene ausgespielte Sonderkartenarten.
*/

import { describe, expect, it } from 'vitest';
import {
  beendeAufgabenpruefung,
  deserialisiere,
  erstelleSpielzustand,
  spieleVerdoppler,
} from '../index';
import { loesePendingReaktionAbwehr } from '../turnState';
import type { AufgabenkarteInfo, Spieler, Spielzustand } from '../index';
import { farbkarte, sonderkarte } from './testHelpers';

const schlangenrepertoire: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-09',
  name: 'Schlangenrepertoire',
  punkte: 4,
  bedingung: 'Spiele min. 5 versch. Arten von Sonderkarten aus.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-12',
  name: 'Symmetriemeister',
  punkte: 10,
  bedingung:
    'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.',
};

function mitSonderkartenHistorie(spieler: Spieler, namen: string[]): Spieler {
  return { ...spieler, ausgespielteSonderkartenNamen: namen };
}

function zustandFuerSchlangenrepertoire(namen: string[], aktiverSpielerIndex = 0): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung',
    offeneAufgaben: [schlangenrepertoire],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex
        ? mitSonderkartenHistorie(spieler, namen)
        : mitSonderkartenHistorie(spieler, [
            'Schlangengrube',
            'Schlangenblockade',
            'Farbendieb',
            'Schlangenfrass',
            'Farbenschutz',
          ]),
    ),
  };
}

describe('R94 Aufgabenprüfung — Schlangenrepertoire', () => {
  it('erfüllt Schlangenrepertoire mit fünf verschiedenen ausgespielten Sonderkartenarten', () => {
    const zustand = zustandFuerSchlangenrepertoire([
      'Schlangengrube',
      'Schlangenblockade',
      'Farbendieb',
      'Schlangenfrass',
      'Farbenschutz',
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangenrepertoire',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Symmetriemeister']);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('zählt doppelt ausgespielte Sonderkartenarten nur einmal', () => {
    const zustand = zustandFuerSchlangenrepertoire([
      'Schlangengrube',
      'Schlangengrube',
      'Schlangenblockade',
      'Farbendieb',
      'Schlangenfrass',
    ]);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangenrepertoire']);
  });

  it('wertet nur die Sonderkartenhistorie des aktiven Spielers', () => {
    const zustand = zustandFuerSchlangenrepertoire(['Schlangengrube'], 0);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
  });

  it('initialisiert neue Spieler mit leerer ausgespielter Sonderkartenhistorie', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);

    expect(zustand.spieler.map((spieler) => spieler.ausgespielteSonderkartenNamen)).toEqual([[], []]);
  });

  it('zeichnet ausgespielte Sonderkartenarten bei Spielaktionen auf', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const verdoppler = sonderkarte('verdoppler-r94', 'Verdoppler');
    zustand.zugphase = 'Ausspielphase';
    zustand.spieler[0].hand = [verdoppler];

    const aktualisiert = spieleVerdoppler(zustand, { kartenId: verdoppler.id });

    expect(aktualisiert.spieler[0].ausgespielteSonderkartenNamen).toEqual(['Verdoppler']);
    expect(aktualisiert.spieler[1].ausgespielteSonderkartenNamen).toEqual([]);
  });
});

describe('R94 Serialisierung — ausgespielte Sonderkartenhistorie', () => {
  it('migriert alte Spieler ohne ausgespielte Sonderkartenhistorie auf ein leeres Array', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    for (const spieler of zustand['spieler'] as Record<string, unknown>[]) {
      delete spieler['ausgespielteSonderkartenNamen'];
    }

    const deserialisiert = deserialisiere(JSON.stringify(zustand));

    expect(deserialisiert.spieler.map((spieler) => spieler.ausgespielteSonderkartenNamen)).toEqual([[], []]);
  });

  it('lehnt nicht-array-förmige ausgespielte Sonderkartenhistorie ab', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    spieler[0]['ausgespielteSonderkartenNamen'] = 'Verdoppler';

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/sonderkartenhistorie/i);
  });

  it('lehnt nicht-textuelle Einträge in der ausgespielten Sonderkartenhistorie ab', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    spieler[0]['ausgespielteSonderkartenNamen'] = ['Verdoppler', 7];

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/sonderkartenhistorie/i);
  });

  it('akzeptiert Erweiterungs-Sonderkartennamen in der ausgespielten Sonderkartenhistorie', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    spieler[0]['ausgespielteSonderkartenNamen'] = ['Verdoppler', 'Schlangenhäutung'];

    const deserialisiert = deserialisiere(JSON.stringify(zustand));

    expect(deserialisiert.spieler[0].ausgespielteSonderkartenNamen).toEqual([
      'Verdoppler',
      'Schlangenhäutung',
    ]);
  });

  it('lehnt unbekannte Sonderkartennamen in der ausgespielten Sonderkartenhistorie ab', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999) as unknown as Record<string, unknown>;
    const spieler = zustand['spieler'] as Record<string, unknown>[];
    spieler[0]['ausgespielteSonderkartenNamen'] = ['Verdoppler', 'Hausregelkarte'];

    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/sonderkartenhistorie/i);
  });
});

describe('R94 Reaktionen — Farbenschutz zählt als ausgespielte Sonderkarte', () => {
  it('zeichnet Farbenschutz-Abwehr gegen Standard-Reaktionen beim Zielspieler auf', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const farbenschutz = sonderkarte('farbenschutz-r94-standard', 'Farbenschutz');
    zustand.spieler[1].hand = [farbenschutz];
    zustand.pendingReaktion = {
      typ: 'SchlangengrubeAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
    };

    const aktualisiert = loesePendingReaktionAbwehr(zustand, 'spieler-2', farbenschutz.id);

    expect(aktualisiert.spieler[1].ausgespielteSonderkartenNamen).toEqual(['Farbenschutz']);
    expect(aktualisiert.spieler[0].ausgespielteSonderkartenNamen).toEqual([]);
  });

  it('zeichnet Farbenschutz-Abwehr gegen Schlangenfrass beim betroffenen Spieler auf', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const farbenschutz = sonderkarte('farbenschutz-r94-frass', 'Farbenschutz');
    zustand.spieler[1].hand = [farbenschutz];
    zustand.spieler[1].schlangen = [
      { id: 'schlange-ziel-r94', zustand: 'aktiv', karten: [farbkarte('ziel-blau-r94', 'Blau')] },
    ];
    zustand.pendingReaktion = {
      typ: 'SchlangenfrassAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeZiele: [{ spielerIndex: 1, schlangenId: 'schlange-ziel-r94', kartenId: 'ziel-blau-r94' }],
    };

    const aktualisiert = loesePendingReaktionAbwehr(zustand, 'spieler-2', farbenschutz.id);

    expect(aktualisiert.spieler[1].ausgespielteSonderkartenNamen).toEqual(['Farbenschutz']);
  });

  it('zeichnet Farbenschutz-Abwehr gegen Verdoppler beim Reaktionsspieler auf', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const farbenschutz = sonderkarte('farbenschutz-r94-verdoppler', 'Farbenschutz');
    zustand.spieler[1].hand = [farbenschutz];
    zustand.pendingReaktion = {
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeSpielerIndizes: [1],
    };

    const aktualisiert = loesePendingReaktionAbwehr(zustand, 'spieler-2', farbenschutz.id);

    expect(aktualisiert.spieler[1].ausgespielteSonderkartenNamen).toEqual(['Farbenschutz']);
  });
});
