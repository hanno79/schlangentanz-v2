/*
Author: rahn
Datum: 06.06.2026
Version: 1.1
Beschreibung: Ausgelagerte Legal-Action-Tests zur Einhaltung der 500-Zeilen-Regel.
*/

import { describe, it, expect } from 'vitest';
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, pruefeAktion } from '../index';
import type { Spielzustand } from '../types';
import { farbkarte, schlange, sonderkarte, zustandMitFarbenschutzUndEigenerSchlange } from './testHelpers';

function zustandInAusspielphase(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  return { ...zustand, zugphase: 'Ausspielphase' };
}

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
