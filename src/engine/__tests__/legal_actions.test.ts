/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für den Legal-Action-Validator im Schlangentanz-Engine-Slice 4.2.
*/

import { describe, it, expect } from 'vitest';
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, pruefeAktion } from '../index';
import type { Spielzustand } from '../types';

function zustandInAusspielphase(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  return { ...zustand, zugphase: 'Ausspielphase' };
}

describe('Legal Action Validator — R3 Schlangenbau', () => {
  it('erlaubt dem aktiven Spieler, mit einer Farbkarte eine neue Schlange zu starten', () => {
    const zustand = zustandInAusspielphase();
    const karte = zustand.spieler[0].hand[0];
    if (karte.typ !== 'Farbkarte') throw new Error('Testsetup erwartet Farbkarte.');

    const ergebnis = pruefeAktion(zustand, {
      typ: 'NeueSchlangeStarten',
      spielerId: 'spieler-1',
      handkartenId: karte.id,
    });

    expect(ergebnis).toEqual({ erlaubt: true });
  });

  it('verbietet neue Schlange außerhalb der Ausspielphase mit deutscher Begründung', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const karte = zustand.spieler[0].hand[0];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'NeueSchlangeStarten',
      spielerId: 'spieler-1',
      handkartenId: karte.id,
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Neue Schlangen können nur in der Ausspielphase gestartet werden.',
    });
  });

  it('verbietet Aktionen nicht aktiver Spieler', () => {
    const zustand = zustandInAusspielphase();
    const karte = zustand.spieler[1].hand[0];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'NeueSchlangeStarten',
      spielerId: 'spieler-2',
      handkartenId: karte.id,
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Nur der aktive Spieler darf diese Aktion ausführen.',
    });
  });

  it('verbietet neue Schlange mit Sonderkarte', () => {
    const zustand = zustandInAusspielphase();
    const sonderkarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte');
    if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte.');
    zustand.spieler[0].hand[0] = sonderkarte;

    const ergebnis = pruefeAktion(zustand, {
      typ: 'NeueSchlangeStarten',
      spielerId: 'spieler-1',
      handkartenId: sonderkarte.id,
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.',
    });
  });

  it('verbietet dritte Schlange wegen Schlangenlimit', () => {
    const zustand = zustandInAusspielphase();
    const [karte1, karte2, karte3] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [
      { id: 'schlange-1', zustand: 'aktiv', karten: [karte1] },
      { id: 'schlange-2', zustand: 'aktiv', karten: [karte2] },
    ];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'NeueSchlangeStarten',
      spielerId: 'spieler-1',
      handkartenId: karte3.id,
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Ein Spieler darf maximal 2 Schlangen haben.',
    });
  });

  it('erlaubt Farbkarte links oder rechts an eine aktive Schlange anzulegen', () => {
    const zustand = zustandInAusspielphase();
    const [startkarte, links, rechts] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [{ id: 'schlange-1', zustand: 'aktiv', karten: [startkarte] }];

    expect(
      pruefeAktion(zustand, {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: links.id,
        schlangenId: 'schlange-1',
        position: 'links',
      }),
    ).toEqual({ erlaubt: true });

    expect(
      pruefeAktion(zustand, {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: rechts.id,
        schlangenId: 'schlange-1',
        position: 'rechts',
      }),
    ).toEqual({ erlaubt: true });
  });

  it('verbietet Anlegen an blockierte Schlangen', () => {
    const zustand = zustandInAusspielphase();
    const [startkarte, karte] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [
      { id: 'schlange-1', zustand: 'blockiert', karten: [startkarte] },
    ];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'KarteAnlegen',
      spielerId: 'spieler-1',
      handkartenId: karte.id,
      schlangenId: 'schlange-1',
      position: 'links',
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Eine blockierte Schlange kann nicht erweitert werden.',
    });
  });

  it('verbietet Anlegen mit einer Karte, die nicht auf der Hand des aktiven Spielers ist', () => {
    const zustand = zustandInAusspielphase();
    const [startkarte] = zustand.spieler[0].hand;
    const fremdeKarte = zustand.spieler[1].hand[0];
    zustand.spieler[0].schlangen = [{ id: 'schlange-1', zustand: 'aktiv', karten: [startkarte] }];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'KarteAnlegen',
      spielerId: 'spieler-1',
      handkartenId: fremdeKarte.id,
      schlangenId: 'schlange-1',
      position: 'links',
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Die Karte befindet sich nicht auf der Hand des aktiven Spielers.',
    });
  });

  it('verbietet Anlegen mit Sonderkarte', () => {
    const zustand = zustandInAusspielphase();
    const [startkarte] = zustand.spieler[0].hand;
    const sonderkarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte');
    if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte.');
    zustand.spieler[0].hand[1] = sonderkarte;
    zustand.spieler[0].schlangen = [{ id: 'schlange-1', zustand: 'aktiv', karten: [startkarte] }];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'KarteAnlegen',
      spielerId: 'spieler-1',
      handkartenId: sonderkarte.id,
      schlangenId: 'schlange-1',
      position: 'rechts',
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'An eine Schlange kann nur eine Farbkarte angelegt werden.',
    });
  });

  it('verbietet Karte anlegen außerhalb der Ausspielphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const [startkarte, karte] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [{ id: 'schlange-1', zustand: 'aktiv', karten: [startkarte] }];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'KarteAnlegen',
      spielerId: 'spieler-1',
      handkartenId: karte.id,
      schlangenId: 'schlange-1',
      position: 'links',
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Karten können nur in der Ausspielphase angelegt werden.',
    });
  });

  it('verbietet Anlegen an unbekannte Schlange', () => {
    const zustand = zustandInAusspielphase();
    const karte = zustand.spieler[0].hand[0];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'KarteAnlegen',
      spielerId: 'spieler-1',
      handkartenId: karte.id,
      schlangenId: 'fehlt',
      position: 'links',
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Schlange nicht gefunden.',
    });
  });

  it('verbietet neue Schlange mit fremder Handkarte', () => {
    const zustand = zustandInAusspielphase();
    const fremdeKarte = zustand.spieler[1].hand[0];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'NeueSchlangeStarten',
      spielerId: 'spieler-1',
      handkartenId: fremdeKarte.id,
    });

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Die Karte befindet sich nicht auf der Hand des aktiven Spielers.',
    });
  });

  it('verbietet ungültige Anlegeposition zur Laufzeit', () => {
    const zustand = zustandInAusspielphase();
    const [startkarte, karte] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [{ id: 'schlange-1', zustand: 'aktiv', karten: [startkarte] }];

    const ergebnis = pruefeAktion(zustand, {
      typ: 'KarteAnlegen',
      spielerId: 'spieler-1',
      handkartenId: karte.id,
      schlangenId: 'schlange-1',
      position: 'mitte',
    } as never);

    expect(ergebnis).toEqual({
      erlaubt: false,
      grund: 'Karten können nur links oder rechts angelegt werden.',
    });
  });
  it('verbietet weitere legale Aktionen nach erfülltem Zwei-Karten-Limit', () => {
    const zustand = {
      ...zustandInAusspielphase(),
      zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 1 },
    };
    const karte = zustand.spieler[0].hand[0];

    expect(
      pruefeAktion(zustand, {
        typ: 'NeueSchlangeStarten',
        spielerId: 'spieler-1',
        handkartenId: karte.id,
      }),
    ).toEqual({
      erlaubt: false,
      grund: 'Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.',
    });
    expect(ermittleLegaleAktionen(zustand)).toEqual([]);
  });

  it('verbietet eine zweite Farbkarte im selben Zug', () => {
    const zustand = {
      ...zustandInAusspielphase(),
      zugpflichten: { gespielteKarten: 1, gespielteFarbkarten: 1, gespielteSonderkarten: 0 },
    };
    const [startkarte, weitereFarbkarte] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [
      { id: 'schlange-1', zustand: 'aktiv', karten: [startkarte] },
    ];

    expect(
      pruefeAktion(zustand, {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: weitereFarbkarte.id,
        schlangenId: 'schlange-1',
        position: 'rechts',
      }),
    ).toEqual({
      erlaubt: false,
      grund: 'Pro Zug darf höchstens eine Farbkarte gespielt werden.',
    });
    expect(ermittleLegaleAktionen(zustand)).toEqual([]);
  });
});

describe('Legal Action Anwendung — R17 Engine-Dispatch für UI-Aktionen', () => {
  it('wendet NeueSchlangeStarten über den zentralen Engine-Export an', () => {
    const zustand = zustandInAusspielphase();
    const karte = zustand.spieler[0].hand[0];

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'NeueSchlangeStarten',
      spielerId: 'spieler-1',
      handkartenId: karte.id,
    });

    expect(aktualisiert.spieler[0].hand.map((handkarte) => handkarte.id)).not.toContain(karte.id);
    expect(aktualisiert.spieler[0].schlangen).toEqual([
      { id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [karte] },
    ]);
    expect(zustand.spieler[0].schlangen).toEqual([]);
  });

  it('wendet KarteAnlegen über den zentralen Engine-Export an', () => {
    const zustand = zustandInAusspielphase();
    const [startkarte, anlegekarte] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [
      { id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [startkarte] },
    ];

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'KarteAnlegen',
      spielerId: 'spieler-1',
      handkartenId: anlegekarte.id,
      schlangenId: 'schlange-spieler-1-1',
      position: 'rechts',
    });

    expect(aktualisiert.spieler[0].hand.map((handkarte) => handkarte.id)).not.toContain(anlegekarte.id);
    expect(aktualisiert.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual([
      startkarte.id,
      anlegekarte.id,
    ]);
    expect(zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual([startkarte.id]);
  });

  it('bietet Schlangengrube als auswählbare Sonderkartenaktion mit Zielspieler an', () => {
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const schlangengrube = zustand.nachziehstapel.find(
      (karte): karte is Extract<typeof karte, { typ: 'Sonderkarte' }> =>
        karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );

    if (!schlangengrube) throw new Error('Testsetup erwartet Schlangengrube.');

    zustand.spieler[0].hand[0] = schlangengrube;
    zustand.zugphase = 'Ausspielphase';

    const schlangengrubenAktionen = ermittleLegaleAktionen(zustand).filter(
      (aktion) => (aktion as { typ: string }).typ === 'SonderkarteSpielen',
    );

    expect(schlangengrubenAktionen).toEqual([
      {
        typ: 'SonderkarteSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangengrube.id,
        zielSpielerId: 'spieler-2',
      },
      {
        typ: 'SonderkarteSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangengrube.id,
        zielSpielerId: 'spieler-3',
      },
    ]);
  });

  it('weist manuell konstruierte Aktionen mit falscher Spieler-ID zurück', () => {
    const zustand = zustandInAusspielphase();
    const karte = zustand.spieler[0].hand[0];

    expect(() =>
      anwendeAktion(zustand, {
        typ: 'NeueSchlangeStarten',
        spielerId: 'spieler-2',
        handkartenId: karte.id,
      }),
    ).toThrow('Nur der aktive Spieler darf diese Aktion ausführen.');
  });
});

describe('Legal Action Enumerator — R15 UI-Vertrag für bestehende R3-Aktionen', () => {
  it('liefert nur aktuell erlaubte Schlangenbau-Aktionen des aktiven Spielers in stabiler Reihenfolge', () => {
    const zustand = zustandInAusspielphase();
    const [startkarte, links, rechts, neueSchlange] = zustand.spieler[0].hand;
    zustand.spieler[0].hand = [links, rechts, neueSchlange];
    zustand.spieler[0].schlangen = [{ id: 'schlange-1', zustand: 'aktiv', karten: [startkarte] }];

    const zustandVorher = JSON.stringify(zustand);

    const aktionen = ermittleLegaleAktionen(zustand);

    expect(JSON.stringify(zustand)).toBe(zustandVorher);
    expect(aktionen).toEqual([
      {
        typ: 'NeueSchlangeStarten',
        spielerId: 'spieler-1',
        handkartenId: links.id,
      },
      {
        typ: 'NeueSchlangeStarten',
        spielerId: 'spieler-1',
        handkartenId: rechts.id,
      },
      {
        typ: 'NeueSchlangeStarten',
        spielerId: 'spieler-1',
        handkartenId: neueSchlange.id,
      },
      {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: links.id,
        schlangenId: 'schlange-1',
        position: 'links',
      },
      {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: links.id,
        schlangenId: 'schlange-1',
        position: 'rechts',
      },
      {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: rechts.id,
        schlangenId: 'schlange-1',
        position: 'links',
      },
      {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: rechts.id,
        schlangenId: 'schlange-1',
        position: 'rechts',
      },
      {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: neueSchlange.id,
        schlangenId: 'schlange-1',
        position: 'links',
      },
      {
        typ: 'KarteAnlegen',
        spielerId: 'spieler-1',
        handkartenId: neueSchlange.id,
        schlangenId: 'schlange-1',
        position: 'rechts',
      },
    ]);
  });

  it('liefert keine Aktionen außerhalb der Ausspielphase oder nach Spielende', () => {
    expect(ermittleLegaleAktionen(erstelleSpielzustand(2, () => 0.999999))).toEqual([]);

    const beendet = erstelleSpielzustand(2, () => 0.999999);
    beendet.zugphase = 'Spielende';
    beendet.spielphase = 'Beendet';
    beendet.ablagestapel = beendet.nachziehstapel;
    beendet.nachziehstapel = [];
    beendet.endrunde = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [] };

    expect(ermittleLegaleAktionen(beendet)).toEqual([]);
  });
});
