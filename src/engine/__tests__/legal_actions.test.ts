/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für den Legal-Action-Validator im Schlangentanz-Engine-Slice 4.2.
*/

import { describe, it, expect } from 'vitest';
import { anwendeAktion, ermittleLegaleAktionen, ermittleReaktionsAktionen, erstelleSpielzustand, pruefeAktion } from '../index';
import type { Spielzustand } from '../types';
import { farbkarte, schlange, sonderkarte, zustandMitFarbenschutzUndEigenerSchlange } from './testHelpers';

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
      grund: 'Pro Zug darf höchstens 1 Farbkarte gespielt werden.',
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

  const istSonderkarteSpielen = (aktion: { typ: string }) => aktion.typ === 'SonderkarteSpielen';

  function zustandMitSchlangengrubeAufDerHand(spielerAnzahl = 3) {
    const zustand = erstelleSpielzustand(spielerAnzahl, () => 0.999999);
    const schlangengrube = zustand.nachziehstapel.find(
      (karte): karte is Extract<(typeof zustand.nachziehstapel)[number], { typ: 'Sonderkarte' }> =>
        karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );
    const farbenschutz = zustand.nachziehstapel.find(
      (karte): karte is Extract<(typeof zustand.nachziehstapel)[number], { typ: 'Sonderkarte' }> =>
        karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
    );

    if (!schlangengrube || !farbenschutz) throw new Error('Testsetup erwartet Schlangengrube und Farbenschutz.');

    zustand.spieler[0].hand[0] = schlangengrube;
    zustand.zugphase = 'Ausspielphase';

    return { zustand, schlangengrube, farbenschutz };
  }

  function zustandMitSchlangenblockadeAufDerHand() {
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const schlangenblockade = sonderkarte('schlangenblockade-test', 'Schlangenblockade');
    const farbenschutz = sonderkarte('farbenschutz-ziel', 'Farbenschutz');

    zustand.spieler[0].hand[0] = schlangenblockade;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.zugphase = 'Ausspielphase';
    zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [] }];
    zustand.spieler[1].schlangen = [{ id: 'schlange-spieler-2-1', zustand: 'aktiv', karten: [] }];

    return { zustand, schlangenblockade, farbenschutz };
  }

  function zustandMitFarbendiebAufDerHand() {
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const farbendieb = sonderkarte('farbendieb-test', 'Farbendieb');
    const farbenschutz = sonderkarte('farbenschutz-ziel', 'Farbenschutz');

    zustand.spieler[0].hand[0] = farbendieb;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.zugphase = 'Ausspielphase';
    zustand.spieler[0].schlangen = [schlange([farbkarte('eigene-rot', 'Rot'), farbkarte('eigene-gelb', 'Gelb')], 'schlange-spieler-1-1')];
    zustand.spieler[1].schlangen = [schlange([farbkarte('ziel-blau', 'Blau')], 'schlange-spieler-2-1')];

    return { zustand, farbendieb, farbenschutz };
  }

  function zustandMitVerdopplerAufDerHandMitFarbenschutz(): { zustand: Spielzustand; verdoppler: ReturnType<typeof sonderkarte>; farbenschutz: ReturnType<typeof sonderkarte> } {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const verdoppler = sonderkarte('verdoppler-test', 'Verdoppler');
    const farbenschutz = sonderkarte('farbenschutz-test', 'Farbenschutz');

    zustand.spieler[0].hand[0] = verdoppler;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.zugphase = 'Ausspielphase';
    zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [] }];
    zustand.spieler[1].schlangen = [{ id: 'schlange-spieler-2-1', zustand: 'aktiv', karten: [] }];

    return { zustand, verdoppler, farbenschutz };
  }

  it('bietet Schlangengrube als auswählbare Sonderkartenaktion mit Zielspieler an', () => {
    const { zustand, schlangengrube } = zustandMitSchlangengrubeAufDerHand();

    const schlangengrubenAktionen = ermittleLegaleAktionen(zustand).filter(istSonderkarteSpielen);

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

  it('verbietet Schlangenblockade auf die eigene Schlange bereits in der Aktionsprüfung', () => {
    const { zustand, schlangenblockade } = zustandMitSchlangenblockadeAufDerHand();

    expect(
      pruefeAktion(zustand, {
        typ: 'SchlangenblockadeSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangenblockade.id,
        zielSpielerId: 'spieler-1',
        zielSchlangenId: 'schlange-spieler-1-1',
      }),
    ).toEqual({
      erlaubt: false,
      grund: 'Schlangenblockade kann nur auf eine Schlange eines anderen Spielers gelegt werden.',
    });
  });

  it('verbietet SchlangenblockadeAbwehren durch falschen Spieler', () => {
    const { zustand, schlangenblockade } = zustandMitSchlangenblockadeAufDerHand();
    zustand.pendingReaktion = { typ: 'SchlangenblockadeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1, zielSchlangenId: 'schlange-spieler-2-1', blockadeKartenId: 'blockade-1' };

    expect(
      pruefeAktion(zustand, {
        typ: 'SchlangenblockadeAbwehren',
        spielerId: 'spieler-1',
        abwehrHandkartenId: schlangenblockade.id,
      }),
    ).toEqual({ erlaubt: false, grund: 'Nur der Zielspieler darf diese Reaktion ausführen.' });
  });

  it('bietet Schlangengrube nur für legal erreichbare Zielspieler an', () => {
    // ÄNDERUNG 02.06.2026: R74-Abschluss prüft, dass der Enumerator keine illegalen Schlangengrube-Ziele anbietet.
    const { zustand, schlangengrube } = zustandMitSchlangengrubeAufDerHand();
    zustand.spielphase = 'Endspurt';
    zustand.endrunde = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [1] };

    const schlangengrubenAktionen = ermittleLegaleAktionen(zustand).filter(istSonderkarteSpielen);

    expect(schlangengrubenAktionen).toEqual([
      {
        typ: 'SonderkarteSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangengrube.id,
        zielSpielerId: 'spieler-2',
      },
    ]);
    expect(
      pruefeAktion(zustand, {
        typ: 'SonderkarteSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangengrube.id,
        zielSpielerId: 'spieler-3',
      }),
    ).toEqual({ erlaubt: false, grund: 'Der gewählte Zielspieler hat in der Endrunde keinen verbleibenden Zug mehr.' });
  });

  it('bietet Schlangengrube nach bereits gespielter Sonderkarte nicht mehr an', () => {
    const { zustand, schlangengrube } = zustandMitSchlangengrubeAufDerHand();
    zustand.zugpflichten.gespielteKarten = 1;
    zustand.zugpflichten.gespielteSonderkarten = 1;

    const schlangengrubenAktionen = ermittleLegaleAktionen(zustand).filter(istSonderkarteSpielen);

    expect(schlangengrubenAktionen).toEqual([]);
    expect(
      pruefeAktion(zustand, {
        typ: 'SonderkarteSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangengrube.id,
        zielSpielerId: 'spieler-2',
      }),
    ).toEqual({ erlaubt: false, grund: 'Pro Zug darf höchstens eine Sonderkarte gespielt werden.' });
  });

  it('erlaubt Schlangengrube spielen ohne abwehrHandkartenId — Reaktion folgt durch Zielspieler', () => {
    // R78: Abwehr ist Zielspieler-Entscheidung, nicht Angreifer-Entscheidung.
    const { zustand, schlangengrube, farbenschutz } = zustandMitSchlangengrubeAufDerHand();
    zustand.spieler[1].hand[0] = farbenschutz;

    expect(
      pruefeAktion(zustand, {
        typ: 'SonderkarteSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangengrube.id,
        zielSpielerId: 'spieler-2',
      }),
    ).toEqual({ erlaubt: true });
  });

  it('verbietet SchlangengrubeAbwehren mit Karte, die nicht beim Zielspieler liegt', () => {
    // R78: Reaktionsvalidierung prüft Kartenzugehörigkeit beim Zielspieler.
    const { zustand, farbenschutz } = zustandMitSchlangengrubeAufDerHand();
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.pendingReaktion = { typ: 'SchlangengrubeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1 };
    const fremdeKartenId = zustand.spieler[2].hand[0].id;

    expect(
      pruefeAktion(zustand, {
        typ: 'SchlangengrubeAbwehren',
        spielerId: 'spieler-2',
        abwehrHandkartenId: fremdeKartenId,
      }),
    ).toEqual({ erlaubt: false, grund: 'Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte des Zielspielers erlaubt.' });
  });

  it('ermittleReaktionsAktionen bietet Abwehren und Durchlassen an, wenn Zielspieler Farbenschutz hat', () => {
    // R78: Zielspieler bekommt explizite Wahl.
    const { zustand, farbenschutz } = zustandMitSchlangengrubeAufDerHand();
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.pendingReaktion = { typ: 'SchlangengrubeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1 };

    const reaktionen = ermittleReaktionsAktionen(zustand);

    expect(reaktionen).toEqual([
      { typ: 'SchlangengrubeAbwehren', spielerId: 'spieler-2', abwehrHandkartenId: farbenschutz.id },
      { typ: 'SchlangengrubeDurchlassen', spielerId: 'spieler-2' },
    ]);
  });

  it('ermittleReaktionsAktionen bietet nur Durchlassen an, wenn Zielspieler keinen Farbenschutz hat', () => {
    const { zustand } = zustandMitSchlangengrubeAufDerHand();
    zustand.pendingReaktion = { typ: 'SchlangengrubeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1 };

    const reaktionen = ermittleReaktionsAktionen(zustand);

    expect(reaktionen).toEqual([
      { typ: 'SchlangengrubeDurchlassen', spielerId: 'spieler-2' },
    ]);
  });

  it('ermittleReaktionsAktionen bietet Abwehren und Durchlassen an, wenn Zielspieler bei Schlangenblockade Farbenschutz hat', () => {
    const { zustand, farbenschutz } = zustandMitSchlangenblockadeAufDerHand();
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.pendingReaktion = {
      typ: 'SchlangenblockadeAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      blockadeKartenId: 'blockade-2',
    };

    const reaktionen = ermittleReaktionsAktionen(zustand);

    expect(reaktionen).toEqual([
      { typ: 'SchlangenblockadeAbwehren', spielerId: 'spieler-2', abwehrHandkartenId: farbenschutz.id },
      { typ: 'SchlangenblockadeDurchlassen', spielerId: 'spieler-2' },
    ]);
  });

  it('ermittleReaktionsAktionen bietet Abwehren und Durchlassen an, wenn Zielspieler bei Farbendieb Farbenschutz hat', () => {
    const { zustand, farbenschutz } = zustandMitFarbendiebAufDerHand();
    zustand.pendingReaktion = {
      typ: 'FarbendiebAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: 'ziel-blau',
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 1,
    };

    const reaktionen = ermittleReaktionsAktionen(zustand);

    expect(reaktionen).toEqual([
      { typ: 'FarbendiebAbwehren', spielerId: 'spieler-2', abwehrHandkartenId: farbenschutz.id },
      { typ: 'FarbendiebDurchlassen', spielerId: 'spieler-2' },
    ]);
  });

  it('ermittleReaktionsAktionen bietet Abwehren und Durchlassen an, wenn Zielspieler bei Schlangenfrass Farbenschutz hat', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    zustand.pendingReaktion = {
      typ: 'SchlangenfrassAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeZiele: [{ spielerIndex: 1, schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' }],
    };
    zustand.spieler[1].hand.unshift(sonderkarte('schutz-spieler-2', 'Farbenschutz'));

    const reaktionen = ermittleReaktionsAktionen(zustand);

    expect(reaktionen).toEqual([
      { typ: 'SchlangenfrassAbwehren', spielerId: 'spieler-2', abwehrHandkartenId: 'schutz-spieler-2' },
      { typ: 'SchlangenfrassDurchlassen', spielerId: 'spieler-2' },
    ]);
  });

  it('verbietet SchlangenfrassAbwehren durch falschen Spieler', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    zustand.pendingReaktion = {
      typ: 'SchlangenfrassAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeZiele: [{ spielerIndex: 1, schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' }],
    };
    zustand.spieler[1].hand.unshift(sonderkarte('schutz-spieler-2', 'Farbenschutz'));

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassAbwehren',
      spielerId: 'spieler-1',
      abwehrHandkartenId: 'schutz-spieler-2',
    });

    expect(ergebnis).toEqual({ erlaubt: false, grund: 'Nur der aktuelle Reaktionsspieler darf diese Reaktion ausführen.' });
  });
  it('ermittleReaktionsAktionen bietet Abwehren und Durchlassen an, wenn Reaktionsspieler bei Verdoppler Farbenschutz hat', () => {
    const { zustand, farbenschutz } = zustandMitVerdopplerAufDerHandMitFarbenschutz();
    zustand.pendingReaktion = { typ: 'VerdopplerAbwehr', angreifenderSpielerIndex: 0, verbleibendeSpielerIndizes: [1] };

    const reaktionen = ermittleReaktionsAktionen(zustand);

    expect(reaktionen).toEqual([
      { typ: 'VerdopplerAbwehren', spielerId: 'spieler-2', abwehrHandkartenId: farbenschutz.id },
      { typ: 'VerdopplerDurchlassen', spielerId: 'spieler-2' },
    ]);
  });

  it('ermittleReaktionsAktionen gibt leeres Array zurück ohne pendingReaktion', () => {
    const { zustand } = zustandMitSchlangengrubeAufDerHand();
    const reaktionen = ermittleReaktionsAktionen(zustand);
    expect(reaktionen).toEqual([]);
  });

  it('ermittleLegaleAktionen gibt leeres Array zurück, wenn pendingReaktion gesetzt', () => {
    // R78: Aktiver Spieler kann nicht weiter agieren, bis Reaktion aufgelöst.
    const { zustand } = zustandMitSchlangengrubeAufDerHand();
    zustand.pendingReaktion = { typ: 'SchlangengrubeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1 };

    expect(ermittleLegaleAktionen(zustand)).toEqual([]);
  });

  it('verbietet normale Aktion des aktiven Spielers, wenn pendingReaktion gesetzt', () => {
    const { zustand } = zustandMitSchlangengrubeAufDerHand();
    zustand.pendingReaktion = { typ: 'SchlangengrubeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1 };
    const karte = zustand.spieler[0].hand[1];

    expect(
      pruefeAktion(zustand, {
        typ: 'NeueSchlangeStarten',
        spielerId: 'spieler-1',
        handkartenId: karte.id,
      }),
    ).toEqual({ erlaubt: false, grund: 'Es muss zuerst die ausstehende Reaktion des Zielspielers aufgelöst werden.' });
  });

  it('verbietet SchlangengrubeAbwehren durch falschen Spieler', () => {
    const { zustand } = zustandMitSchlangengrubeAufDerHand();
    zustand.pendingReaktion = { typ: 'SchlangengrubeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1 };

    expect(
      pruefeAktion(zustand, {
        typ: 'SchlangengrubeAbwehren',
        spielerId: 'spieler-1',
        abwehrHandkartenId: 'irgendwas',
      }),
    ).toEqual({ erlaubt: false, grund: 'Nur der Zielspieler darf diese Reaktion ausführen.' });
  });

  it('verbietet FarbendiebAbwehren durch falschen Spieler', () => {
    const { zustand, farbenschutz } = zustandMitFarbendiebAufDerHand();
    zustand.pendingReaktion = {
      typ: 'FarbendiebAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: 'ziel-blau',
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 1,
    };

    expect(
      pruefeAktion(zustand, {
        typ: 'FarbendiebAbwehren',
        spielerId: 'spieler-1',
        abwehrHandkartenId: farbenschutz.id,
      }),
    ).toEqual({ erlaubt: false, grund: 'Nur der Zielspieler darf diese Reaktion ausführen.' });
  });

  it('verbietet SchlangengrubeDurchlassen ohne pendingReaktion', () => {
    const { zustand } = zustandMitSchlangengrubeAufDerHand();

    expect(
      pruefeAktion(zustand, {
        typ: 'SchlangengrubeDurchlassen',
        spielerId: 'spieler-2',
      }),
    ).toEqual({ erlaubt: false, grund: 'Es gibt keine ausstehende Reaktion.' });
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

describe('Legal Action Validator — R79 Verdoppler', () => {
  const istVerdopplerSpielen = (aktion: { typ: string }) => aktion.typ === 'VerdopplerSpielen';

  function zustandMitVerdopplerAufDerHand(spielerAnzahl = 3) {
    const zustand = erstelleSpielzustand(spielerAnzahl, () => 0.999999);
    const verdoppler = zustand.nachziehstapel.find(
      (karte): karte is Extract<typeof karte, { typ: 'Sonderkarte' }> =>
        karte.typ === 'Sonderkarte' && karte.name === 'Verdoppler',
    );

    if (!verdoppler) throw new Error('Testsetup erwartet Verdoppler.');

    zustand.spieler[0].hand[0] = verdoppler;
    zustand.zugphase = 'Ausspielphase';
    zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', karten: [], zustand: 'aktiv' }];

    return { zustand, verdoppler };
  }

  it('bietet Verdoppler als auswählbare Sonderkartenaktion nur zu Zugbeginn an', () => {
    const { zustand, verdoppler } = zustandMitVerdopplerAufDerHand();

    const verdopplerAktionen = ermittleLegaleAktionen(zustand).filter(istVerdopplerSpielen);

    expect(verdopplerAktionen).toEqual([
      {
        typ: 'VerdopplerSpielen',
        spielerId: 'spieler-1',
        handkartenId: verdoppler.id,
      },
    ]);

    zustand.zugpflichten.gespielteKarten = 1;

    expect(ermittleLegaleAktionen(zustand).filter(istVerdopplerSpielen)).toEqual([]);
    expect(
      pruefeAktion(zustand, {
        typ: 'VerdopplerSpielen',
        spielerId: 'spieler-1',
        handkartenId: verdoppler.id,
      }),
    ).toEqual({ erlaubt: false, grund: 'Verdoppler kann nur zu Beginn des Zuges gespielt werden.' });
  });

  it('setzt nach Verdoppler-Spielen eine Reaktionskette auf und aktiviert den Bonus nach allen Durchläufen', () => {
    const { zustand, verdoppler } = zustandMitVerdopplerAufDerHand();

    const nachVerdoppler = anwendeAktion(zustand, {
      typ: 'VerdopplerSpielen',
      spielerId: 'spieler-1',
      handkartenId: verdoppler.id,
    });

    expect(nachVerdoppler.zugpflichten.gespielteKarten).toBe(1);
    expect(nachVerdoppler.zugpflichten.gespielteSonderkarten).toBe(1);
    expect(nachVerdoppler.pendingReaktion).toEqual({
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeSpielerIndizes: [1, 2],
    });
    const letzteKarte = nachVerdoppler.ablagestapel.at(-1);
    if (!letzteKarte || !('name' in letzteKarte)) {
      throw new Error('Testsetup erwartet abgeworfene Sonderkarte.');
    }
    expect(letzteKarte.name).toBe('Verdoppler');

    const nachErstemDurchlassen = anwendeAktion(nachVerdoppler, {
      typ: 'VerdopplerDurchlassen',
      spielerId: 'spieler-2',
    });
    expect(nachErstemDurchlassen.pendingReaktion).toEqual({
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeSpielerIndizes: [2],
    });

    const nachZweitemDurchlassen = anwendeAktion(nachErstemDurchlassen, {
      typ: 'VerdopplerDurchlassen',
      spielerId: 'spieler-3',
    });
    expect(nachZweitemDurchlassen.pendingReaktion).toBeNull();
    expect(nachZweitemDurchlassen.zugpflichten.verdopplerBonusAktiv).toBe(true);
  });

  it('verbietet VerdopplerAbwehren durch falschen Spieler', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const verdoppler = sonderkarte('verdoppler-test', 'Verdoppler');
    const farbenschutz = sonderkarte('farbenschutz-test', 'Farbenschutz');

    zustand.spieler[0].hand[0] = verdoppler;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.pendingReaktion = { typ: 'VerdopplerAbwehr', angreifenderSpielerIndex: 0, verbleibendeSpielerIndizes: [1] };

    expect(
      pruefeAktion(zustand, {
        typ: 'VerdopplerAbwehren',
        spielerId: 'spieler-1',
        abwehrHandkartenId: farbenschutz.id,
      }),
    ).toEqual({ erlaubt: false, grund: 'Nur der aktuelle Reaktionsspieler darf diese Reaktion ausführen.' });
  });

  it('verbietet Reaktionsaktionen für eine andere Pending-Reaktion', () => {
    const { zustand } = zustandMitVerdopplerAufDerHand();
    zustand.pendingReaktion = { typ: 'SchlangengrubeAbwehr', angreifenderSpielerIndex: 0, zielSpielerIndex: 1 };

    expect(
      pruefeAktion(zustand, {
        typ: 'VerdopplerDurchlassen',
        spielerId: 'spieler-2',
      }),
    ).toEqual({ erlaubt: false, grund: 'Diese Reaktion gehört zu einer anderen Pending-Reaktion.' });
  });

  it('erlaubt mit aktivem Verdoppler-Bonus eine dritte Karte im Zug', () => {
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    zustand.zugpflichten.gespielteKarten = 2;
    zustand.zugpflichten.gespielteFarbkarten = 1;
    zustand.zugpflichten.gespielteSonderkarten = 1;
    zustand.zugpflichten.verdopplerBonusAktiv = true;

    const schlangengrube = zustand.spieler[0].hand.find(
      (karte): karte is Extract<typeof karte, { typ: 'Sonderkarte' }> =>
        karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    ) ?? zustand.nachziehstapel.find(
      (karte): karte is Extract<typeof karte, { typ: 'Sonderkarte' }> =>
        karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );
    if (!schlangengrube) throw new Error('Testsetup erwartet Schlangengrube.');

    if (!zustand.spieler[0].hand.some((karte) => karte.id === schlangengrube.id)) {
      zustand.nachziehstapel = zustand.nachziehstapel.filter((karte) => karte.id !== schlangengrube.id);
      zustand.spieler[0].hand.push(schlangengrube);
    }

    expect(
      pruefeAktion(zustand, {
        typ: 'SonderkarteSpielen',
        spielerId: 'spieler-1',
        handkartenId: schlangengrube.id,
        zielSpielerId: 'spieler-2',
      }),
    ).toEqual({ erlaubt: true });
  });

  it('erlaubt mit aktivem Verdoppler-Bonus eine zweite Farbkarte im Zug', () => {
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    zustand.zugpflichten.gespielteKarten = 2;
    zustand.zugpflichten.gespielteFarbkarten = 1;
    zustand.zugpflichten.gespielteSonderkarten = 1;
    zustand.zugpflichten.verdopplerBonusAktiv = true;

    const farbkarte = zustand.spieler[0].hand.find(
      (karte): karte is Extract<typeof karte, { typ: 'Farbkarte' }> => karte.typ === 'Farbkarte',
    ) ?? zustand.nachziehstapel.find(
      (karte): karte is Extract<typeof karte, { typ: 'Farbkarte' }> => karte.typ === 'Farbkarte',
    );
    if (!farbkarte) throw new Error('Testsetup erwartet Farbkarte.');

    if (!zustand.spieler[0].hand.some((karte) => karte.id === farbkarte.id)) {
      zustand.nachziehstapel = zustand.nachziehstapel.filter((karte) => karte.id !== farbkarte.id);
      zustand.spieler[0].hand.push(farbkarte);
    }

    expect(
      pruefeAktion(zustand, {
        typ: 'NeueSchlangeStarten',
        spielerId: 'spieler-1',
        handkartenId: farbkarte.id,
      }),
    ).toEqual({ erlaubt: true });
  });

  it('bietet Farbendieb auch für eine Karte in der Mitte der eigenen Schlange an', () => {
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';
    zustand.zugpflichten.gespielteKarten = 0;
    zustand.zugpflichten.gespielteFarbkarten = 0;
    zustand.zugpflichten.gespielteSonderkarten = 0;

    const farbendieb = sonderkarte('farbendieb-test', 'Farbendieb');
    const eigeneErsteKarte = farbkarte('eigene-1', 'Rot');
    const eigeneZweiteKarte = farbkarte('eigene-2', 'Gelb');
    const gegnerischeZielkarte = farbkarte('gegner-ziel', 'Blau');
    const gegnerischeZweiteKarte = farbkarte('gegner-ziel-2', 'Grün');

    zustand.spieler[0].hand = [farbendieb];
    zustand.spieler[0].schlangen = [schlange([eigeneErsteKarte, eigeneZweiteKarte], 'schlange-spieler-1-1')];
    zustand.spieler[1].schlangen = [schlange([gegnerischeZielkarte, gegnerischeZweiteKarte], 'schlange-spieler-2-1')];
    zustand.spieler[2].schlangen = [];

    expect(ermittleLegaleAktionen(zustand)).toContainEqual({
      typ: 'FarbendiebSpielen',
      spielerId: 'spieler-1',
      handkartenId: farbendieb.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: gegnerischeZielkarte.id,
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 1,
    });
  });
});

describe('Legal Action Validator — R75 Farbenschutz', () => {
  it('bietet Farbenschutz als auswählbare Aktion mit eigener aktiver Schlange an', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();

    const farbenschutzAktionen = ermittleLegaleAktionen(zustand).filter((a) => a.typ === 'FarbenschutzSpielen');

    expect(farbenschutzAktionen).toEqual([
      {
        typ: 'FarbenschutzSpielen',
        spielerId: 'spieler-1',
        handkartenId: farbenschutz.id,
        zielSchlangenId: 'schlange-spieler-1-1',
      },
    ]);
  });

  it('verbietet Pflicht-Abwurf, solange Farbenschutz spielbar ist', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();
    zustand.spieler[0].hand = [farbenschutz];

    expect(ermittleLegaleAktionen(zustand).filter((a) => a.typ === 'PflichtAbwurf')).toEqual([]);
    expect(
      pruefeAktion(zustand, {
        typ: 'PflichtAbwurf',
        spielerId: 'spieler-1',
        handkartenId: farbenschutz.id,
      }),
    ).toEqual({ erlaubt: false, grund: 'Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.' });
  });

  it('bietet Farbenschutz nach bereits gespielter Sonderkarte nicht mehr an', () => {
    const { zustand } = zustandMitFarbenschutzUndEigenerSchlange();
    zustand.zugpflichten.gespielteKarten = 1;
    zustand.zugpflichten.gespielteSonderkarten = 1;

    const farbenschutzAktionen = ermittleLegaleAktionen(zustand).filter((a) => a.typ === 'FarbenschutzSpielen');

    expect(farbenschutzAktionen).toHaveLength(0);
  });

  it('bietet Farbenschutz nicht an, wenn keine eigene aktive Schlange vorhanden', () => {
    const { zustand } = zustandMitFarbenschutzUndEigenerSchlange();
    zustand.spieler[0].schlangen = [];

    const farbenschutzAktionen = ermittleLegaleAktionen(zustand).filter((a) => a.typ === 'FarbenschutzSpielen');

    expect(farbenschutzAktionen).toHaveLength(0);
  });

  it('verbietet Farbenschutz auf bereits geschützte Schlange', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();
    zustand.spieler[0].schlangen[0].zustand = 'geschuetzt';

    const ergebnis = pruefeAktion(zustand, {
      typ: 'FarbenschutzSpielen',
      spielerId: 'spieler-1',
      handkartenId: farbenschutz.id,
      zielSchlangenId: 'schlange-spieler-1-1',
    });

    expect(ergebnis).toEqual({ erlaubt: false, grund: 'Eine bereits geschützte Schlange kann nicht erneut geschützt werden.' });
  });

  it('verbietet Farbenschutz durch nicht-aktiven Spieler', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'FarbenschutzSpielen',
      spielerId: 'spieler-2',
      handkartenId: farbenschutz.id,
      zielSchlangenId: 'schlange-spieler-1-1',
    });

    expect(ergebnis).toEqual({ erlaubt: false, grund: 'Nur der aktive Spieler darf diese Aktion ausführen.' });
  });
});
