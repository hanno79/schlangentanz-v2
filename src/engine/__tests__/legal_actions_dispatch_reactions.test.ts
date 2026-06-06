/*
Author: rahn
Datum: 06.06.2026
Version: 1.1
Beschreibung: Ausgelagerte Legal-Action-Tests zur Einhaltung der 500-Zeilen-Regel.
*/

import { describe, it, expect } from 'vitest';
import { anwendeAktion, ermittleLegaleAktionen, ermittleReaktionsAktionen, erstelleSpielzustand, pruefeAktion } from '../index';
import type { Spielzustand } from '../types';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

function zustandInAusspielphase(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  return { ...zustand, zugphase: 'Ausspielphase' };
}

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
