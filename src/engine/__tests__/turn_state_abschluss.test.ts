/*
Author: rahn
Datum: 06.06.2026
Version: 1.1
Beschreibung: Ausgelagerte Zugabschluss-/Aufgabenprüfungs-Tests zur Einhaltung der 500-Zeilen-Regel.
*/

import { describe, it, expect } from 'vitest';
import {
  beendeAufgabenpruefung,
  beendeZug,
  erstelleSpielzustand,
  HANDKARTENLIMIT,
  MINDESTHANDKARTEN,
  spieleFarbenschutz,
  ueberhandAbwurfKartenIds,
  werfeUeberzaehligeHandkartenAb,
} from '../index';

import { zustandMitFarbenschutzUndEigenerSchlange } from './testHelpers';

function basisZustand() {
  return erstelleSpielzustand(2, () => 0.999999);
}

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

  /* ÄNDERUNG [02.08.2026]: Die fest verdrahtete `slice(-1)` durch die
     Engine-Funktion ersetzt. Sie tat dasselbe, solange die Überhand genau eine
     Karte beträgt — bei einem Testaufbau mit zwei Karten zu viel hätte sie
     stillschweigend zu wenige geliefert. */

  it('beendet den Zug ohne Überhand und aktiviert den nächsten Spieler in der Nachziehphase', () => {
    const zustand = zustandInZugabschluss(0);

    const aktualisiert = beendeZug(zustand, { pflichtenErfuellt: true });

    expect(aktualisiert.aktiverSpielerIndex).toBe(1);
    expect(aktualisiert.zugphase).toBe('Nachziehphase');
    expect(aktualisiert.zugpflichten.gespielteKarten).toBe(0);
    expect(aktualisiert.spieler[0].hand).toBe(zustand.spieler[0].hand);
    expect(zustand.aktiverSpielerIndex).toBe(0);
    expect(zustand.zugphase).toBe('Zugabschluss');
  });

  it('wechselt nach dem letzten Spieler wieder zum ersten Spieler', () => {
    const zustand = zustandInZugabschluss(3, 4);

    const aktualisiert = beendeZug(zustand, { pflichtenErfuellt: true });

    expect(aktualisiert.aktiverSpielerIndex).toBe(0);
    expect(aktualisiert.zugphase).toBe('Nachziehphase');
  });

  it('verbietet Zugende mit mehr Handkarten als dem Limit beim aktiven Spieler', () => {
    const zustand = zustandMitUeberhand();

    expect(() => beendeZug(zustand, { pflichtenErfuellt: true })).toThrow(
      `Zug kann erst beendet werden, wenn der aktive Spieler höchstens ${HANDKARTENLIMIT} Handkarten hat.`,
    );
  });

  it('wirft selbst gewählte überzählige Handkarten ab und bleibt im Zugabschluss', () => {
    const zustand = zustandMitUeberhand();
    const abzuwerfendeIds = ueberhandAbwurfKartenIds(zustand);

    const aktualisiert = werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: abzuwerfendeIds });

    /* ÄNDERUNG [03.08.2026]: Zahlen aus der Konstante statt fest verdrahtet. Sie
       standen als 10 und 11 da und hingen damit still am alten Limit; die
       Vorrichtung legt sechs Karten auf eine volle Hand. */
    expect(aktualisiert.spieler[0].hand).toHaveLength(HANDKARTENLIMIT);
    expect(aktualisiert.spieler[0].hand.map((karte) => karte.id)).not.toContain(abzuwerfendeIds[0]);
    expect(aktualisiert.ablagestapel.at(-1)?.id).toBe(abzuwerfendeIds.at(-1));
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
    expect(zustand.spieler[0].hand).toHaveLength(MINDESTHANDKARTEN + 6);
    expect(zustand.ablagestapel).toHaveLength(0);
  });

  it('erlaubt Zugende nach korrekt abgeworfener Überhand', () => {
    const zustand = zustandMitUeberhand();
    const nachAbwurf = werfeUeberzaehligeHandkartenAb(zustand, {
      kartenIds: ueberhandAbwurfKartenIds(zustand),
    });

    const beendet = beendeZug(nachAbwurf, { pflichtenErfuellt: true });

    expect(beendet.aktiverSpielerIndex).toBe(1);
    expect(beendet.zugphase).toBe('Nachziehphase');
  });

  it('verbietet Abwurf, wenn nicht exakt die überzählige Kartenanzahl gewählt wurde', () => {
    const zustand = zustandMitUeberhand();

    expect(() => werfeUeberzaehligeHandkartenAb(zustand, { kartenIds: [] })).toThrow(
      `Es müssen exakt so viele Handkarten abgeworfen werden, bis höchstens ${HANDKARTENLIMIT} Handkarten übrig sind.`,
    );
  });

  it('verbietet Überhand-Abwurf ohne Kartenparameter mit Domain-Fehler', () => {
    const zustand = zustandMitUeberhand();
    const werfeOhneKartenparameter = werfeUeberzaehligeHandkartenAb as unknown as (
      zustand: ReturnType<typeof zustandMitUeberhand>,
    ) => void;

    expect(() => werfeOhneKartenparameter(zustand)).toThrow(
      `Es müssen exakt so viele Handkarten abgeworfen werden, bis höchstens ${HANDKARTENLIMIT} Handkarten übrig sind.`,
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

    /* ÄNDERUNG [03.08.2026]: Die Liste hat jetzt die **richtige Länge** und
       tauscht nur einen Eintrag gegen eine fremde Karte. Zuvor stand hier eine
       einelementige Liste — die passte nur zufällig zur damaligen Überhand von
       genau 1. Mit einem anderen Limit greift die Mengenprüfung zuerst, und der
       Test hätte die Eigentumsprüfung gar nicht mehr erreicht, ohne dass seine
       Absicht sichtbar verlorenging. */
    const kartenIds = [...ueberhandAbwurfKartenIds(zustand)];
    kartenIds[0] = fremdeKarte.id;

    expect(() => werfeUeberzaehligeHandkartenAb(zustand, { kartenIds })).toThrow(
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

describe('Turn State Machine — R75 Farbenschutz', () => {
  it('setzt Zustand der Zielschlange auf geschuetzt', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();

    const nachAktion = spieleFarbenschutz(zustand, { kartenId: farbenschutz.id, zielSchlangenId: 'schlange-spieler-1-1' });

    expect(nachAktion.spieler[0].schlangen[0].zustand).toBe('geschuetzt');
  });

  it('entfernt Farbenschutz-Karte von der Hand', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();

    const nachAktion = spieleFarbenschutz(zustand, { kartenId: farbenschutz.id, zielSchlangenId: 'schlange-spieler-1-1' });

    expect(nachAktion.spieler[0].hand.map((k) => k.id)).not.toContain(farbenschutz.id);
  });

  it('legt Farbenschutz-Karte auf den Ablagestapel', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();

    const nachAktion = spieleFarbenschutz(zustand, { kartenId: farbenschutz.id, zielSchlangenId: 'schlange-spieler-1-1' });

    expect(nachAktion.ablagestapel.map((k) => k.id)).toContain(farbenschutz.id);
  });

  it('inkrementiert gespielteSonderkarten', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();

    const nachAktion = spieleFarbenschutz(zustand, { kartenId: farbenschutz.id, zielSchlangenId: 'schlange-spieler-1-1' });

    expect(nachAktion.zugpflichten.gespielteSonderkarten).toBe(1);
  });

  it('verbietet Schutz auf bereits geschützte Schlange', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();
    zustand.spieler[0].schlangen[0].zustand = 'geschuetzt';

    expect(() =>
      spieleFarbenschutz(zustand, { kartenId: farbenschutz.id, zielSchlangenId: 'schlange-spieler-1-1' }),
    ).toThrow('Eine bereits geschützte Schlange kann nicht erneut geschützt werden.');
  });

  // Designentscheidung R75: Farbenschutz schützt nur aktive Schlangen.
  // Blockierte Schlangen befinden sich bereits in einem Sonderzustand; überschreiben wäre semantisch unklar.
  it('verbietet Schutz auf blockierte Schlange (nur aktive erlaubt)', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();
    zustand.spieler[0].schlangen[0].zustand = 'blockiert';

    expect(() =>
      spieleFarbenschutz(zustand, { kartenId: farbenschutz.id, zielSchlangenId: 'schlange-spieler-1-1' }),
    ).toThrow('Farbenschutz kann nur auf aktive Schlangen angewendet werden.');
  });

  it('verbietet Spielen außerhalb der Ausspielphase', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutzUndEigenerSchlange();
    zustand.zugphase = 'Zugabschluss';

    expect(() =>
      spieleFarbenschutz(zustand, { kartenId: farbenschutz.id, zielSchlangenId: 'schlange-spieler-1-1' }),
    ).toThrow('Farbenschutz kann nur in der Ausspielphase gespielt werden.');
  });
});
