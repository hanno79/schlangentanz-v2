/*
Author: rahn
Datum: 06.06.2026
Version: 1.1
Beschreibung: Ausgelagerte Serialisierungs-Tests zur Einhaltung der 500-Zeilen-Regel.
*/

import { describe, it, expect } from 'vitest';
import { aufgabenPool } from '../aufgabenKarten';
import { erstelleSpielzustand } from '../state';
import { serialisiere, deserialisiere } from '../serialization';
import type { Spielzustand } from '../types';

function spielerAlsRoh(anzahl = 2): { zustand: Record<string, unknown>; spieler: Array<Record<string, unknown>> } {
  const zustand = erstelleSpielzustand(anzahl) as unknown as Record<string, unknown>;
  const spieler = zustand['spieler'] as Array<Record<string, unknown>>;
  return { zustand, spieler };
}

describe('Serialisierung', () => {
  it('Roundtrip serialize -> deserialize ergibt strukturell gleichen Zustand', () => {
    let counter = 0;
    const deterministischerRng = () => {
      counter = (counter + 1) % 100;
      return counter / 100;
    };
    const original = erstelleSpielzustand(2, deterministischerRng);
    const serialisiert = serialisiere(original);
    const deserialisiert = deserialisiere(serialisiert);
    expect(deserialisiert).toEqual(original);
  });

  it('Serialisierung ist deterministisch für denselben Zustand', () => {
    const zustand = erstelleSpielzustand(2);
    const s1 = serialisiere(zustand);
    const s2 = serialisiere(zustand);
    expect(s1).toBe(s2);
  });

  it('Serialisierung sortiert Objekt-Schlüssel deterministisch', () => {
    const a = { version: 1, spieler: [], aktiverSpielerIndex: 0 };
    const b = { aktiverSpielerIndex: 0, spieler: [], version: 1 };
    expect(serialisiere(a as unknown as Spielzustand)).toBe(
      serialisiere(b as unknown as Spielzustand),
    );
  });

  it('wirft deutschen Fehler bei ungültigem JSON', () => {
    expect(() => deserialisiere('kein json{')).toThrow(/ungültig/i);
  });

  it('wirft deutschen Fehler bei fehlendem version-Feld', () => {
    expect(() => deserialisiere('{"spieler":[]}')).toThrow(/ungültig/i);
  });

  it('wirft deutschen Fehler bei null-Eingabe', () => {
    expect(() => deserialisiere('null')).toThrow(/ungültig/i);
  });

  it('wirft deutschen Fehler bei Array-Eingabe', () => {
    expect(() => deserialisiere('[]')).toThrow(/ungültig/i);
  });

  it('wirft deutschen Fehler bei ungültiger Zugphase', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugphase'] = 'Falsch';
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/zugphase/i);
  });

  it('wirft deutschen Fehler bei aktivem Spieler außerhalb des Bereichs', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['aktiverSpielerIndex'] = 2;
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/aktiver spieler/i);
  });

  it('wirft deutschen Fehler bei fehlenden Zugpflichten', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    delete zustand['zugpflichten'];
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/zugpflichten/i);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 3])(
    'wirft deutschen Fehler bei ungültiger gespielter Kartenanzahl %s',
    (gespielteKarten) => {
      const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
      zustand['zugpflichten'] = { gespielteKarten };
      expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/gespielte karten/i);
    },
  );

  it('wirft deutschen Fehler bei fehlender geheimer Aufgabe', () => {
    const { zustand, spieler } = spielerAlsRoh();
    delete spieler[0]['geheimeAufgabe'];
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/geheimeaufgabe/i);
  });

  it('wirft deutschen Fehler bei geheimer Aufgabe null', () => {
    const { zustand, spieler } = spielerAlsRoh();
    spieler[0]['geheimeAufgabe'] = null;
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/geheimeaufgabe/i);
  });

  it('wirft deutschen Fehler bei fehlender Spielersteuerung', () => {
    const { zustand, spieler } = spielerAlsRoh();
    delete spieler[0]['steuerung'];
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/steuerung/i);
  });

  it('wirft deutschen Fehler bei ungültiger Spielersteuerung', () => {
    const { zustand, spieler } = spielerAlsRoh();
    spieler[1]['steuerung'] = 'Roboter';
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/steuerung/i);
  });

  it('wirft deutschen Fehler bei Spielzustand ohne menschlichen Spieler', () => {
    const { zustand, spieler } = spielerAlsRoh();
    spieler[0]['steuerung'] = 'KI';
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/genau ein mensch/i);
  });

  it('wirft deutschen Fehler bei Spielzustand mit mehreren menschlichen Spielern', () => {
    const { zustand, spieler } = spielerAlsRoh();
    spieler[1]['steuerung'] = 'Mensch';
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/genau ein mensch/i);
  });

  it('wirft deutschen Fehler bei Aufgabenkarte in der Spielerhand', () => {
    const zustand = erstelleSpielzustand(2);
    zustand.spieler[0].hand[0] = aufgabenPool[0] as never;
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/spielkarte/i);
  });

  it('wirft deutschen Fehler bei doppelter Karten-ID', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler[1].hand[0] = { ...zustand.spieler[0].hand[0] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/doppelte id/i);
  });

  it('wirft deutschen Fehler bei erfundener Karten-ID', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler[0].hand[0] = {
      ...zustand.spieler[0].hand[0],
      id: 'erfunden-01',
    };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/kartenmaterial/i);
  });

  it('wirft deutschen Fehler bei falschem Farbpunktwert', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const ersteKarte = zustand.spieler[0].hand[0];
    if (ersteKarte.typ !== 'Farbkarte') throw new Error('Testsetup erwartet Farbkarte.');
    zustand.spieler[0].hand[0] = { ...ersteKarte, punkte: 99 };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/kartenmaterial/i);
  });

  it('wirft deutschen Fehler bei fehlender Spielkarte im Gesamtmaterial', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.nachziehstapel.pop();
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/kartenmaterial/i);
  });

  it('wirft deutschen Fehler bei erfundener Aufgaben-ID', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.offeneAufgaben[0] = { ...zustand.offeneAufgaben[0], id: 'aufgabe-99' };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/aufgabenmaterial/i);
  });

  it('wirft deutschen Fehler bei fehlender Endrunde', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    delete zustand['endrunde'];
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler bei Endrunde im Normalspiel', () => {
    const zustand = erstelleSpielzustand(3) as unknown as Record<string, unknown>;
    zustand['endrunde'] = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [2, 0] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler bei Endspurt ohne Auslöser', () => {
    const zustand = erstelleSpielzustand(3) as unknown as Record<string, unknown>;
    zustand['spielphase'] = 'Endspurt';
    zustand['nachziehstapel'] = [];
    zustand['endrunde'] = { ausloeserSpielerIndex: null, verbleibendeSpielerIndizes: [1, 2] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler bei doppelten oder ungültigen Endrunden-Spielerindizes', () => {
    const zustand = erstelleSpielzustand(3) as unknown as Record<string, unknown>;
    zustand['spielphase'] = 'Endspurt';
    zustand['nachziehstapel'] = [];
    zustand['endrunde'] = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [1, 1] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);

    zustand['endrunde'] = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [3] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler, wenn Spielende nicht zur beendeten Spielphase passt', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['zugphase'] = 'Spielende';
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/spielende/i);
  });

  it('wirft deutschen Fehler bei Beendet-Phase ohne Auslöser', () => {
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    zustand['spielphase'] = 'Beendet';
    zustand['zugphase'] = 'Spielende';
    zustand['nachziehstapel'] = [];
    zustand['endrunde'] = { ausloeserSpielerIndex: null, verbleibendeSpielerIndizes: [] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler, wenn die Endrunde den Auslöser erneut enthält', () => {
    const zustand = erstelleSpielzustand(3) as unknown as Record<string, unknown>;
    zustand['spielphase'] = 'Endspurt';
    zustand['ablagestapel'] = zustand['nachziehstapel'];
    zustand['nachziehstapel'] = [];
    zustand['endrunde'] = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [1, 0] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler bei fehlenden oder falsch geordneten Endrunden-Spielern', () => {
    const zustand = erstelleSpielzustand(4) as unknown as Record<string, unknown>;
    zustand['spielphase'] = 'Endspurt';
    zustand['aktiverSpielerIndex'] = 1;
    zustand['ablagestapel'] = zustand['nachziehstapel'];
    zustand['nachziehstapel'] = [];
    zustand['endrunde'] = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [2] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);

    zustand['endrunde'] = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [0, 2, 3] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler bei unpassendem aktivem Spieler in laufender Endrunde', () => {
    const zustand = erstelleSpielzustand(3) as unknown as Record<string, unknown>;
    zustand['spielphase'] = 'Endspurt';
    zustand['aktiverSpielerIndex'] = 0;
    zustand['ablagestapel'] = zustand['nachziehstapel'];
    zustand['nachziehstapel'] = [];
    zustand['endrunde'] = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [2, 0] };
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/endrunde/i);
  });

  it('wirft deutschen Fehler, wenn Spielphase und Nachziehstapel-Ende widersprechen', () => {
    const normalLeer = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    normalLeer['ablagestapel'] = normalLeer['nachziehstapel'];
    normalLeer['nachziehstapel'] = [];
    expect(() => deserialisiere(JSON.stringify(normalLeer))).toThrow(/nachziehstapel/i);

    const endspurtMitStapel = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    endspurtMitStapel['spielphase'] = 'Endspurt';
    endspurtMitStapel['endrunde'] = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [1] };
    expect(() => deserialisiere(JSON.stringify(endspurtMitStapel))).toThrow(/nachziehstapel/i);
  });
});
