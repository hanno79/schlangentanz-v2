/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für die Zugphasen-State-Machine im Schlangentanz-Engine-Slice 4.3.
*/

import { describe, it, expect } from 'vitest';
import {
  beendeAufgabenpruefung,
  beendeAusspielphase,
  beendeZug,
  erstelleSpielzustand,
  starteAusspielphase,
  werfeKarteMangelsSpielbarerAktionAb,
  werfeUeberzaehligeHandkartenAb,
} from '../index';

function basisZustand() {
  return erstelleSpielzustand(2, () => 0.999999);
}

function zustandInAusspielphase() {
  return { ...basisZustand(), zugphase: 'Ausspielphase' as const };
}

function zustandInAusspielphaseMitGespieltenKarten(gespielteKarten: number) {
  const zustand = zustandInAusspielphase();
  return { ...zustand, zugpflichten: { ...zustand.zugpflichten, gespielteKarten } };
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

  it('ändert die Spielphase nicht, wenn der Nachziehstapel bereits leer war', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler[0].hand = zustand.spieler[0].hand.slice(0, 3);
    zustand.nachziehstapel = [];

    const aktualisiert = starteAusspielphase(zustand);

    expect(aktualisiert.spieler[0].hand).toHaveLength(3);
    expect(aktualisiert.nachziehstapel).toHaveLength(0);
    expect(aktualisiert.spielphase).toBe('Normal');
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('verbietet den Übergang außerhalb der Nachziehphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.zugphase = 'Ausspielphase';

    expect(() => starteAusspielphase(zustand)).toThrow(
      'Ausspielphase kann nur aus der Nachziehphase gestartet werden.',
    );
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

describe('Turn State Machine — R2.4 Aufgabenprüfung', () => {
  function zustandInAufgabenpruefung() {
    return { ...basisZustand(), zugphase: 'Aufgabenpruefung' as const };
  }

  it('wechselt nach geprüften Aufgaben in den Zugabschluss', () => {
    const zustand = zustandInAufgabenpruefung();

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.zugphase).toBe('Zugabschluss');
    expect(zustand.zugphase).toBe('Aufgabenpruefung');
  });

  it('verbietet Abschluss ohne geprüfte Aufgaben', () => {
    const zustand = zustandInAufgabenpruefung();

    expect(() => beendeAufgabenpruefung(zustand, { aufgabenGeprueft: false })).toThrow(
      'Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.',
    );
  });

  it('verbietet Abschluss ohne Aufgabenparameter mit Domain-Fehler', () => {
    const zustand = zustandInAufgabenpruefung();
    const beendeOhneAufgabenparameter = beendeAufgabenpruefung as unknown as (
      zustand: ReturnType<typeof zustandInAufgabenpruefung>,
    ) => void;

    expect(() => beendeOhneAufgabenparameter(zustand)).toThrow(
      'Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.',
    );
  });

  it.each(['ja', 1])('verbietet truthy Nicht-Boolean-Wert %s für geprüfte Aufgaben', (aufgabenGeprueft) => {
    const zustand = zustandInAufgabenpruefung();

    expect(() =>
      beendeAufgabenpruefung(zustand, { aufgabenGeprueft: aufgabenGeprueft as unknown as boolean }),
    ).toThrow('Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.');
  });

  it('verbietet Abschluss außerhalb der Aufgabenprüfung', () => {
    const zustand = basisZustand();

    expect(() => beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true })).toThrow(
      'Aufgabenprüfung kann nur aus der Aufgabenprüfung beendet werden.',
    );
  });
});

describe('Turn State Machine — R2.5 Zugabschluss', () => {
  function zustandInZugabschluss(aktiverSpielerIndex = 0, anzahlSpieler = 2) {
    return { ...erstelleSpielzustand(anzahlSpieler, () => 0.999999), aktiverSpielerIndex, zugphase: 'Zugabschluss' as const };
  }

  function zustandMitUeberhand() {
    const zustand = zustandInZugabschluss(0);
    const zusatzHandkarten = zustand.nachziehstapel.slice(0, 6);
    zustand.spieler[0].hand = [...zustand.spieler[0].hand, ...zusatzHandkarten];
    zustand.nachziehstapel = zustand.nachziehstapel.slice(6);
    return zustand;
  }

  function ueberhandIds(zustand: ReturnType<typeof zustandMitUeberhand>) {
    return zustand.spieler[0].hand.slice(-1).map((karte) => karte.id);
  }

  it('beendet den Zug ohne Überhand und aktiviert den nächsten Spieler in der Nachziehphase', () => {
    const zustand = zustandInZugabschluss(0);

    const aktualisiert = beendeZug(zustand, { pflichtenErfuellt: true });

    expect(aktualisiert.aktiverSpielerIndex).toBe(1);
    expect(aktualisiert.zugphase).toBe('Nachziehphase');
    expect(aktualisiert.zugpflichten.gespielteKarten).toBe(0);
    expect(aktualisiert.spieler).toBe(zustand.spieler);
    expect(zustand.aktiverSpielerIndex).toBe(0);
    expect(zustand.zugphase).toBe('Zugabschluss');
  });

  it('wechselt nach dem letzten Spieler wieder zum ersten Spieler', () => {
    const zustand = zustandInZugabschluss(3, 4);

    const aktualisiert = beendeZug(zustand, { pflichtenErfuellt: true });

    expect(aktualisiert.aktiverSpielerIndex).toBe(0);
    expect(aktualisiert.zugphase).toBe('Nachziehphase');
  });

  it('verbietet Zugende mit mehr als zehn Handkarten beim aktiven Spieler', () => {
    const zustand = zustandMitUeberhand();

    expect(() => beendeZug(zustand, { pflichtenErfuellt: true })).toThrow(
      'Zug kann erst beendet werden, wenn der aktive Spieler höchstens zehn Handkarten hat.',
    );
  });

  it('wirft selbst gewählte überzählige Handkarten ab und bleibt im Zugabschluss', () => {
    const zustand = zustandMitUeberhand();
    const abzuwerfendeIds = ueberhandIds(zustand);

    const aktualisiert = werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: abzuwerfendeIds });

    expect(aktualisiert.spieler[0].hand).toHaveLength(10);
    expect(aktualisiert.spieler[0].hand.map((karte) => karte.id)).not.toContain(abzuwerfendeIds[0]);
    expect(aktualisiert.ablagestapel.at(-1)?.id).toBe(abzuwerfendeIds[0]);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
    expect(zustand.spieler[0].hand).toHaveLength(11);
    expect(zustand.ablagestapel).toHaveLength(0);
  });

  it('erlaubt Zugende nach korrekt abgeworfener Überhand', () => {
    const zustand = zustandMitUeberhand();
    const nachAbwurf = werfeUeberzaehligeHandkartenAb(zustand, {
      kartenIds: ueberhandIds(zustand),
    });

    const beendet = beendeZug(nachAbwurf, { pflichtenErfuellt: true });

    expect(beendet.aktiverSpielerIndex).toBe(1);
    expect(beendet.zugphase).toBe('Nachziehphase');
  });

  it('verbietet Abwurf, wenn nicht exakt die überzählige Kartenanzahl gewählt wurde', () => {
    const zustand = zustandMitUeberhand();

    expect(() => werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: [] })).toThrow(
      'Es müssen exakt so viele Handkarten abgeworfen werden, bis höchstens zehn Handkarten übrig sind.',
    );
  });

  it('verbietet Überhand-Abwurf ohne Kartenparameter mit Domain-Fehler', () => {
    const zustand = zustandMitUeberhand();
    const werfeOhneKartenparameter = werfeUeberzaehligeHandkartenAb as unknown as (
      zustand: ReturnType<typeof zustandMitUeberhand>,
    ) => void;

    expect(() => werfeOhneKartenparameter(zustand)).toThrow(
      'Es müssen exakt so viele Handkarten abgeworfen werden, bis höchstens zehn Handkarten übrig sind.',
    );
  });

  it('verbietet Überhand-Abwurf, wenn die aktive Hand das Limit nicht überschreitet', () => {
    const zustand = zustandInZugabschluss(0);

    expect(() => werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: [] })).toThrow(
      'Überzählige Handkarten können nur abgeworfen werden, wenn die Hand das Handkartenlimit überschreitet.',
    );
  });

  it('verbietet Abwurf fremder oder unbekannter Karten', () => {
    const zustand = zustandMitUeberhand();
    const fremdeKarte = zustand.spieler[1].hand[0];

    expect(() => werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: [fremdeKarte.id] })).toThrow(
      'Es können nur Handkarten des aktiven Spielers abgeworfen werden.',
    );
  });

  it('verbietet Überhand-Abwurf außerhalb des Zugabschlusses', () => {
    const zustand = basisZustand();

    expect(() => werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: [] })).toThrow(
      'Überzählige Handkarten können nur im Zugabschluss abgeworfen werden.',
    );
  });

  it('verbietet Zugende, solange die Zugpflichten nicht erfüllt sind', () => {
    const zustand = zustandInZugabschluss(0);

    expect(() => beendeZug(zustand, { pflichtenErfuellt: false })).toThrow(
      'Zug kann erst beendet werden, wenn alle Zugpflichten erfüllt sind.',
    );
  });

  it('verbietet Zugende ohne Pflichtparameter mit Domain-Fehler', () => {
    const zustand = zustandInZugabschluss(0);
    const beendeOhnePflichtparameter = beendeZug as unknown as (zustand: ReturnType<typeof zustandInZugabschluss>) => void;

    expect(() => beendeOhnePflichtparameter(zustand)).toThrow(
      'Zug kann erst beendet werden, wenn alle Zugpflichten erfüllt sind.',
    );
  });

  it.each(['ja', 1])('verbietet truthy Nicht-Boolean-Wert %s für erfüllte Zugpflichten', (pflichtenErfuellt) => {
    const zustand = zustandInZugabschluss(0);

    expect(() => beendeZug(zustand, { pflichtenErfuellt: pflichtenErfuellt as unknown as boolean })).toThrow(
      'Zug kann erst beendet werden, wenn alle Zugpflichten erfüllt sind.',
    );
  });

  it('verbietet Zugende außerhalb des Zugabschlusses', () => {
    const zustand = basisZustand();

    expect(() => beendeZug(zustand, { pflichtenErfuellt: true })).toThrow('Zug kann nur aus dem Zugabschluss beendet werden.');
  });
});

