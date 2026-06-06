/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für die Zugphasen-State-Machine im Schlangentanz-Engine-Slice 4.3.
*/

import { describe, it, expect } from 'vitest';
import {
  anwendeAktion,
  beendeAusspielphase,
  beendeZug,
  ermittleLegaleAktionen,
  erstelleSpielzustand,
  starteAusspielphase,
  werfeKarteMangelsSpielbarerAktionAb,
} from '../index';

import { sonderkarte } from './testHelpers';

function basisZustand() {
  return erstelleSpielzustand(2, () => 0.999999);
}

function zustandInAusspielphase() {
  return { ...basisZustand(), zugphase: 'Ausspielphase' as const };
}

function zustandInAusspielphaseMitGespieltenKarten(gespielteKarten: number) {
  const zustand = zustandInAusspielphase();
  const gespielteFarbkarten = gespielteKarten >= 1 ? 1 : 0;
  const gespielteSonderkarten = gespielteKarten === 2 ? 1 : 0;
  return { ...zustand, zugpflichten: { ...zustand.zugpflichten, gespielteKarten, gespielteFarbkarten, gespielteSonderkarten } };
}


describe('Turn State Machine — R2 Nachziehphase', () => {
  it('zieht Pflichtkarten bis zur Mindesthand und wechselt in die Ausspielphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const aktiverSpieler = zustand.spieler[0];
    aktiverSpieler.hand = aktiverSpieler.hand.slice(0, 3);
    const stapelVorher = zustand.nachziehstapel.length;

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand).toHaveLength(5);
    expect(aktualisiert.nachziehstapel).toHaveLength(stapelVorher - 2);
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
    expect(aktualisiert.spielphase).toBe('Normal');
  });

  it('überspringt Nachziehen bei mindestens fünf Handkarten und wechselt in die Ausspielphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const handVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const stapelVorher = zustand.nachziehstapel.map((karte) => karte.id);

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand.map((karte) => karte.id)).toEqual(handVorher);
    expect(aktualisiert.nachziehstapel.map((karte) => karte.id)).toEqual(stapelVorher);
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('zieht nur verfügbare Karten und aktiviert Endspurt, wenn der Nachziehstapel leer wird', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const aktiverSpieler = zustand.spieler[0];
    aktiverSpieler.hand = aktiverSpieler.hand.slice(0, 3);
    zustand.nachziehstapel = zustand.nachziehstapel.slice(0, 1);

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand).toHaveLength(4);
    expect(aktualisiert.nachziehstapel).toHaveLength(0);
    expect(aktualisiert.spielphase).toBe('Endspurt');
    expect(aktualisiert.endrunde).toEqual({
      ausloeserSpielerIndex: 0,
      verbleibendeSpielerIndizes: [1],
    });
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('lässt inaktive Spieler und den Eingabezustand unverändert', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler[0].hand = zustand.spieler[0].hand.slice(0, 3);
    const inaktiveHandVorher = zustand.spieler[1].hand.map((karte) => karte.id);
    const aktiveHandVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const stapelVorher = zustand.nachziehstapel.map((karte) => karte.id);

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[1].hand.map((karte) => karte.id)).toEqual(inaktiveHandVorher);
    expect(zustand.spieler[0].hand.map((karte) => karte.id)).toEqual(aktiveHandVorher);
    expect(zustand.nachziehstapel.map((karte) => karte.id)).toEqual(stapelVorher);
  });

  it('überspringt Nachziehen in der Endrunde, wenn der Nachziehstapel bereits leer ist', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler[0].hand = zustand.spieler[0].hand.slice(0, 3);
    zustand.nachziehstapel = [];
    zustand.spielphase = 'Endspurt';
    zustand.endrunde = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [0] };

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand).toHaveLength(3);
    expect(aktualisiert.nachziehstapel).toHaveLength(0);
    expect(aktualisiert.spielphase).toBe('Endspurt');
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('verbietet den Übergang außerhalb der Nachziehphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';

    expect(() => starteAusspielphase(zustand)).toThrow(
      'Ausspielphase kann nur aus der Nachziehphase gestartet werden.',
    );
  });

  it('setzt pendingReaktion wenn Schlangengrube gegen Zielspieler mit Farbenschutz gespielt wird', () => {
    // R78 Blocker 1: Abwehr ist Zielspieler-Entscheidung. Schlangengrube setzt pendingReaktion statt sofort auszusetzen.
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const schlangengrube = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );
    const farbenschutz = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
    );
    if (!schlangengrube || !farbenschutz) throw new Error('Testsetup erwartet Schlangengrube und Farbenschutz.');

    zustand.spieler[0].hand[0] = schlangengrube;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.zugphase = 'Ausspielphase';

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SonderkarteSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangengrube.id,
      zielSpielerId: 'spieler-2',
    });

    // Schlangengrube abgelegt, aber kein Aussetzen — Farbenschutz noch auf Hand, pendingReaktion gesetzt
    expect(nachAngriff.aussetzenSpielerIndizes).toEqual([]);
    expect(nachAngriff.ablagestapel.map((k) => k.id)).toContain(schlangengrube.id);
    expect(nachAngriff.spieler[1].hand.map((k) => k.id)).toContain(farbenschutz.id);
    expect(nachAngriff.pendingReaktion).toEqual({
      typ: 'SchlangengrubeAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
    });
    expect(nachAngriff.zugpflichten.gespielteSonderkarten).toBe(1);
  });

  it('neutralisiert Schlangengrube wenn Zielspieler explizit SchlangengrubeAbwehren wählt', () => {
    // R78: Zielspieler entscheidet Abwehren → beide Karten abgelegt, kein Aussetzen.
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const schlangengrube = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );
    const farbenschutz = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
    );
    if (!schlangengrube || !farbenschutz) throw new Error('Testsetup erwartet Schlangengrube und Farbenschutz.');

    zustand.spieler[0].hand[0] = schlangengrube;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.zugphase = 'Ausspielphase';

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SonderkarteSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangengrube.id,
      zielSpielerId: 'spieler-2',
    });
    const nachAbwehr = anwendeAktion(nachAngriff, {
      typ: 'SchlangengrubeAbwehren',
      spielerId: 'spieler-2',
      abwehrHandkartenId: farbenschutz.id,
    });

    expect(nachAbwehr.aussetzenSpielerIndizes).toEqual([]);
    expect(nachAbwehr.ablagestapel.map((k) => k.id)).toContain(schlangengrube.id);
    expect(nachAbwehr.ablagestapel.map((k) => k.id)).toContain(farbenschutz.id);
    expect(nachAbwehr.spieler[1].hand.map((k) => k.id)).not.toContain(farbenschutz.id);
    expect(nachAbwehr.pendingReaktion).toBeNull();
  });

  it('lässt Schlangengrube durchlassen wenn Zielspieler SchlangengrubeDurchlassen wählt', () => {
    // R78: Zielspieler entscheidet Durchlassen → Aussetzen-Effekt tritt ein.
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const schlangengrube = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );
    const farbenschutz = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
    );
    if (!schlangengrube || !farbenschutz) throw new Error('Testsetup erwartet Schlangengrube und Farbenschutz.');

    zustand.spieler[0].hand[0] = schlangengrube;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.zugphase = 'Ausspielphase';

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SonderkarteSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangengrube.id,
      zielSpielerId: 'spieler-2',
    });
    const nachDurchlassen = anwendeAktion(nachAngriff, {
      typ: 'SchlangengrubeDurchlassen',
      spielerId: 'spieler-2',
    });

    expect(nachDurchlassen.aussetzenSpielerIndizes).toContain(1);
    expect(nachDurchlassen.pendingReaktion).toBeNull();
    expect(nachDurchlassen.spieler[1].hand.map((k) => k.id)).toContain(farbenschutz.id);
  });

  it('Schlangengrube ohne Farbenschutz beim Zielspieler setzt sofort aus (kein pendingReaktion)', () => {
    // Kein Farbenschutz beim Ziel → Auto-Resolve, kein pending-Schritt nötig.
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const schlangengrube = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );
    if (!schlangengrube) throw new Error('Testsetup erwartet Schlangengrube.');

    zustand.spieler[0].hand[0] = schlangengrube;
    // Sicherstellen: kein Farbenschutz auf Spieler-2-Hand
    zustand.spieler[1].hand = zustand.spieler[1].hand.filter(
      (k) => !(k.typ === 'Sonderkarte' && k.name === 'Farbenschutz'),
    );
    zustand.zugphase = 'Ausspielphase';

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SonderkarteSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangengrube.id,
      zielSpielerId: 'spieler-2',
    });

    expect(nachAngriff.aussetzenSpielerIndizes).toContain(1);
    expect(nachAngriff.pendingReaktion).toBeNull();
  });

  it('ermöglicht Verdoppler-Abwehr durch den Reaktionsspieler und verhindert den Bonus', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const verdoppler = sonderkarte('verdoppler-test', 'Verdoppler');
    const farbenschutz = sonderkarte('farbenschutz-test', 'Farbenschutz');

    zustand.spieler[0].hand[0] = verdoppler;
    zustand.spieler[1].hand[0] = farbenschutz;
    zustand.zugphase = 'Ausspielphase';

    const nachVerdoppler = anwendeAktion(zustand, {
      typ: 'VerdopplerSpielen',
      spielerId: 'spieler-1',
      handkartenId: verdoppler.id,
    });

    expect(nachVerdoppler.pendingReaktion).toEqual({
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeSpielerIndizes: [1],
    });

    const nachAbwehr = anwendeAktion(nachVerdoppler, {
      typ: 'VerdopplerAbwehren',
      spielerId: 'spieler-2',
      abwehrHandkartenId: farbenschutz.id,
    });

    expect(nachAbwehr.pendingReaktion).toBeNull();
    expect(nachAbwehr.zugpflichten.verdopplerBonusAktiv).toBe(false);
    expect(nachAbwehr.spieler[1].hand.map((karte) => karte.id)).not.toContain(farbenschutz.id);
    expect(nachAbwehr.ablagestapel.map((karte) => karte.id)).toContain(farbenschutz.id);
  });

  it('lässt Schlangengrube den gewählten Spieler beim Zugwechsel aussetzen', () => {
    const zustand = erstelleSpielzustand(3, () => 0.999999);
    const schlangengrube = zustand.nachziehstapel.find(
      (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
    );
    if (!schlangengrube) throw new Error('Testsetup erwartet Schlangengrube.');

    zustand.spieler[0].hand[0] = schlangengrube;
    zustand.zugphase = 'Ausspielphase';

    const schlangengrubeAktion = ermittleLegaleAktionen(zustand).find(
      (aktion) => aktion.typ === 'SonderkarteSpielen' && aktion.zielSpielerId === 'spieler-2',
    );
    if (!schlangengrubeAktion) throw new Error('Testsetup erwartet eine Schlangengrube-Aktion.');

    const nachAktion = anwendeAktion(zustand, schlangengrubeAktion);
    expect(nachAktion.aussetzenSpielerIndizes).toEqual([1]);

    const beendeterZug = beendeZug({
      ...nachAktion,
      zugphase: 'Zugabschluss',
    }, { pflichtenErfuellt: true });

    expect(beendeterZug.aktiverSpielerIndex).toBe(2);
    expect(beendeterZug.aussetzenSpielerIndizes).toEqual([]);
  });
});

describe('Turn State Machine — R2.3 Ausspielphase', () => {
  it.each([1, 2])('wechselt nach %i ausgespielten Karten in die Aufgabenprüfung', (n) => {
    const zustand = zustandInAusspielphaseMitGespieltenKarten(n);

    const aktualisiert = beendeAusspielphase(zustand);

    expect(aktualisiert.zugphase).toBe('Aufgabenpruefung');
    expect(zustand.zugphase).toBe('Ausspielphase');
  });

  it('verbietet Abschluss ohne ausgespielte Karte', () => {
    const zustand = zustandInAusspielphase();

    expect(() => beendeAusspielphase(zustand)).toThrow(
      'Die Ausspielphase darf erst nach mindestens einer gespielten Karte beendet werden.',
    );
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'verbietet nicht-ganzzahlige oder ungültige Kartenanzahl %s',
    (ausgespielteKarten) => {
      const zustand = zustandInAusspielphaseMitGespieltenKarten(ausgespielteKarten);

      expect(() => beendeAusspielphase(zustand)).toThrow(
        'Die Anzahl ausgespielter Karten muss eine ganze Zahl sein.',
      );
    },
  );

  it('verbietet Abschluss nach mehr als zwei ausgespielten Karten', () => {
    const zustand = zustandInAusspielphaseMitGespieltenKarten(3);

    expect(() => beendeAusspielphase(zustand)).toThrow(
      'Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.',
    );
  });

  it('verbietet Abschluss nach zwei Farbkarten im selben Zug', () => {
    const zustand = {
      ...zustandInAusspielphaseMitGespieltenKarten(2),
      zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 2, gespielteSonderkarten: 0 },
    };

    expect(() => beendeAusspielphase(zustand)).toThrow(
      'Pro Zug darf höchstens 1 Farbkarte gespielt werden.',
    );
  });

  it('erlaubt Abschluss nach einer Farbkarte und einer Sonderkarte', () => {
    const zustand = {
      ...zustandInAusspielphaseMitGespieltenKarten(2),
      zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 1 },
    };

    expect(beendeAusspielphase(zustand).zugphase).toBe('Aufgabenpruefung');
  });

  it('verbietet Abschluss nach zwei Sonderkarten im selben Zug', () => {
    const zustand = {
      ...zustandInAusspielphaseMitGespieltenKarten(2),
      zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 0, gespielteSonderkarten: 2 },
    };

    expect(() => beendeAusspielphase(zustand)).toThrow(
      'Pro Zug darf höchstens eine Sonderkarte gespielt werden.',
    );
  });

  it('verbietet Abschluss, wenn die Kartenart-Zähler nicht zur Gesamtanzahl passen', () => {
    const zustand = {
      ...zustandInAusspielphaseMitGespieltenKarten(2),
      zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 0 },
    };

    expect(() => beendeAusspielphase(zustand)).toThrow(
      'Die gespielten Kartenarten müssen zur Anzahl gespielter Karten passen.',
    );
  });

  it('verbietet Abschluss außerhalb der Ausspielphase', () => {
    const zustand = basisZustand();
    zustand.zugpflichten.gespielteKarten = 1;

    expect(() => beendeAusspielphase(zustand)).toThrow(
      'Ausspielphase kann nur aus der Ausspielphase beendet werden.',
    );
  });
});

describe('Turn State Machine — R2.6 Pflicht-Abwurf ohne spielbare Karte', () => {
  it('wirft eine aktive Handkarte ab und lässt den Abwurf als gespielte Karte zählen', () => {
    const zustand = zustandInAusspielphase();
    const abzuwerfendeKarte = zustand.spieler[0].hand[0];
    const aktiveHandVorher = zustand.spieler[0].hand.map((karte) => karte.id);

    const aktualisiert = werfeKarteMangelsSpielbarerAktionAb(zustand, {
      kartenId: abzuwerfendeKarte.id,
      keineSpielbareKarte: true,
    });
    const nachAusspielphase = beendeAusspielphase(aktualisiert);

    expect(aktualisiert.spieler[0].hand.map((karte) => karte.id)).toEqual(aktiveHandVorher.slice(1));
    expect(aktualisiert.ablagestapel.at(-1)?.id).toBe(abzuwerfendeKarte.id);
    expect(aktualisiert.zugpflichten.gespielteKarten).toBe(1);
    expect(zustand.zugpflichten.gespielteKarten).toBe(0);
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
    expect(nachAusspielphase.zugphase).toBe('Aufgabenpruefung');
  });

  it('mutiert den Eingabezustand und inaktive Spieler nicht', () => {
    const zustand = zustandInAusspielphase();
    const aktiveHandVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const inaktiveHandVorher = zustand.spieler[1].hand.map((karte) => karte.id);

    const aktualisiert = werfeKarteMangelsSpielbarerAktionAb(zustand, {
      kartenId: aktiveHandVorher[0],
      keineSpielbareKarte: true,
    });

    expect(zustand.spieler[0].hand.map((karte) => karte.id)).toEqual(aktiveHandVorher);
    expect(zustand.spieler[1].hand.map((karte) => karte.id)).toEqual(inaktiveHandVorher);
    expect(zustand.ablagestapel).toHaveLength(0);
    expect(aktualisiert.spieler[1].hand.map((karte) => karte.id)).toEqual(inaktiveHandVorher);
  });

  it('verbietet Pflicht-Abwurf außerhalb der Ausspielphase', () => {
    const zustand = basisZustand();
    const kartenId = zustand.spieler[0].hand[0].id;

    expect(() => werfeKarteMangelsSpielbarerAktionAb(zustand, { kartenId, keineSpielbareKarte: true })).toThrow(
      'Pflicht-Abwurf ohne spielbare Karte ist nur in der Ausspielphase erlaubt.',
    );
  });

  it.each([false, 'ja', 1])(
    'verbietet Pflicht-Abwurf ohne bestätigte fehlende Spielbarkeit %s',
    (keineSpielbareKarte) => {
      const zustand = zustandInAusspielphase();
      const kartenId = zustand.spieler[0].hand[0].id;

      expect(() =>
        werfeKarteMangelsSpielbarerAktionAb(zustand, {
          kartenId,
          keineSpielbareKarte: keineSpielbareKarte as unknown as boolean,
        }),
      ).toThrow('Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.');
    },
  );

  it('verbietet Pflicht-Abwurf fremder oder unbekannter Karten', () => {
    const zustand = zustandInAusspielphase();
    const fremdeKarte = zustand.spieler[1].hand[0];

    expect(() =>
      werfeKarteMangelsSpielbarerAktionAb(zustand, { kartenId: fremdeKarte.id, keineSpielbareKarte: true }),
    ).toThrow(
      'Es kann nur eine Handkarte des aktiven Spielers abgeworfen werden.',
    );
  });

  it('verbietet Pflicht-Abwurf ohne Kartenparameter mit Domain-Fehler', () => {
    const zustand = zustandInAusspielphase();
    const werfeOhneParameter = werfeKarteMangelsSpielbarerAktionAb as unknown as (
      zustand: ReturnType<typeof zustandInAusspielphase>,
    ) => void;

    expect(() => werfeOhneParameter(zustand)).toThrow('Es muss genau eine abzuwerfende Handkarte gewählt werden.');
  });

  it.each(['', 1, null])('verbietet ungültigen Kartenparameter %s', (kartenId) => {
    const zustand = zustandInAusspielphase();

    expect(() =>
      werfeKarteMangelsSpielbarerAktionAb(zustand, {
        kartenId: kartenId as unknown as string,
        keineSpielbareKarte: true,
      }),
    ).toThrow('Es muss genau eine abzuwerfende Handkarte gewählt werden.');
  });
});
