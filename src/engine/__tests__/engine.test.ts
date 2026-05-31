import { describe, it, expect } from 'vitest';
import {
  SPIELER_MIN,
  SPIELER_MAX,
  STARTHANDKARTEN,
  HANDKARTENLIMIT,
  MINDESTHANDKARTEN,
  MAX_SCHLANGEN_PRO_SPIELER,
  FARBKARTEN_GESAMT,
  SONDERKARTEN_GESAMT,
  BASIS_KARTEN_GESAMT,
  AUFGABENKARTEN_GESAMT,
  ERWEITERUNG_KARTEN,
  KARTEN_GESAMT,
} from '../constants';
import { aufgabenPool } from '../aufgabenKarten';
import { erstelleFarbkarten, erstelleHauptdeck, erstelleSonderkarten } from '../deck';
import { erstelleSpielzustand } from '../state';
import { serialisiere, deserialisiere } from '../serialization';
import type { Spielzustand } from '../types';

describe('Spielkonstanten', () => {
  it('Mindest- und Maximalspielerzahl', () => {
    expect(SPIELER_MIN).toBe(2);
    expect(SPIELER_MAX).toBe(4);
  });

  it('Handkartenlimits sind korrekt', () => {
    expect(STARTHANDKARTEN).toBe(5);
    expect(HANDKARTENLIMIT).toBe(10);
    expect(MINDESTHANDKARTEN).toBe(5);
  });

  it('maximale Schlangen pro Spieler ist 2', () => {
    expect(MAX_SCHLANGEN_PRO_SPIELER).toBe(2);
  });

  it('Farbkarten gesamt 78', () => {
    expect(FARBKARTEN_GESAMT).toBe(78);
  });

  it('Sonderkarten gesamt 32', () => {
    expect(SONDERKARTEN_GESAMT).toBe(32);
  });

  it('Basiskarten gesamt 110', () => {
    expect(BASIS_KARTEN_GESAMT).toBe(110);
  });

  it('Aufgabenkarten gesamt 14', () => {
    expect(AUFGABENKARTEN_GESAMT).toBe(14);
  });

  it('Erweiterungskarten 31', () => {
    expect(ERWEITERUNG_KARTEN).toBe(31);
  });

  it('Gesamtkarten 141', () => {
    expect(KARTEN_GESAMT).toBe(141);
  });
});

describe('Kartenmaterial', () => {
  it('erzeugt tatsächlich 78 Farbkarten', () => {
    expect(erstelleFarbkarten()).toHaveLength(78);
  });

  it('erzeugt tatsächlich 32 Sonderkarten', () => {
    expect(erstelleSonderkarten()).toHaveLength(32);
  });

  it('erzeugt ein Hauptdeck mit 110 Basis-Spielkarten ohne Aufgaben', () => {
    const hauptdeck = erstelleHauptdeck();
    expect(hauptdeck).toHaveLength(110);
    expect(hauptdeck.filter((karte) => karte.typ === 'Farbkarte')).toHaveLength(78);
    expect(hauptdeck.filter((karte) => karte.typ === 'Sonderkarte')).toHaveLength(32);
  });
});

describe('Aufgabenpool', () => {
  it('enthält genau 14 Aufgabenkarten', () => {
    expect(aufgabenPool).toHaveLength(14);
  });

  it('jede Aufgabenkarte hat Name, Punkte und Bedingung', () => {
    for (const aufgabe of aufgabenPool) {
      expect(aufgabe.name).toBeTruthy();
      expect(aufgabe.punkte).toBeGreaterThan(0);
      expect(aufgabe.bedingung).toBeTruthy();
      expect(aufgabe.typ).toBe('Aufgabenkarte');
    }
  });

  it('alle Aufgabennamen sind eindeutig', () => {
    const namen = aufgabenPool.map((a) => a.name);
    expect(new Set(namen).size).toBe(14);
  });

  it('enthält Farbenpracht mit 8 Punkten', () => {
    const karte = aufgabenPool.find((a) => a.name === 'Farbenpracht');
    expect(karte?.punkte).toBe(8);
  });

  it('enthält Farbharmonie mit 10 Punkten', () => {
    const karte = aufgabenPool.find((a) => a.name === 'Farbharmonie');
    expect(karte?.punkte).toBe(10);
  });

  it('enthält Schlangentanz mit 7 Punkten', () => {
    const karte = aufgabenPool.find((a) => a.name === 'Schlangentanz');
    expect(karte?.punkte).toBe(7);
  });

  it('enthält Symmetriemeister mit 10 Punkten', () => {
    const karte = aufgabenPool.find((a) => a.name === 'Symmetriemeister');
    expect(karte?.punkte).toBe(10);
  });
});

describe('Spielzustand erstellen', () => {
  it('erzeugt gültigen Zustand für 2 Spieler', () => {
    const zustand = erstelleSpielzustand(2);
    expect(zustand.spieler).toHaveLength(2);
  });

  it('erzeugt gültigen Zustand für 4 Spieler', () => {
    const zustand = erstelleSpielzustand(4);
    expect(zustand.spieler).toHaveLength(4);
  });

  it('wirft Fehler bei weniger als 2 Spielern', () => {
    expect(() => erstelleSpielzustand(1)).toThrow(/ungültige spieleranzahl/i);
  });

  it('wirft Fehler bei mehr als 4 Spielern', () => {
    expect(() => erstelleSpielzustand(5)).toThrow(/ungültige spieleranzahl/i);
  });

  it('jeder Spieler startet mit 5 Handkarten', () => {
    const zustand = erstelleSpielzustand(2);
    for (const spieler of zustand.spieler) {
      expect(spieler.hand).toHaveLength(5);
    }
  });

  it('verteilt Startkarten reihum', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    expect(zustand.spieler[0].hand.map((karte) => karte.id)).toEqual([
      'blau-01',
      'blau-03',
      'blau-05',
      'blau-07',
      'blau-09',
    ]);
    expect(zustand.spieler[1].hand.map((karte) => karte.id)).toEqual([
      'blau-02',
      'blau-04',
      'blau-06',
      'blau-08',
      'blau-10',
    ]);
  });

  it('behält nach reihum Startverteilung den korrekten Hauptdeck-Rest', () => {
    const zustand = erstelleSpielzustand(4, () => 0.999999);
    expect(zustand.nachziehstapel).toHaveLength(90);
    expect(zustand.nachziehstapel.some((karte) => karte.typ === 'Sonderkarte')).toBe(true);
  });

  it('jeder Spieler startet mit 0 Schlangen', () => {
    const zustand = erstelleSpielzustand(2);
    for (const spieler of zustand.spieler) {
      expect(spieler.schlangen).toHaveLength(0);
    }
  });

  it('aktiver Spieler ist Index 0', () => {
    const zustand = erstelleSpielzustand(3);
    expect(zustand.aktiverSpielerIndex).toBe(0);
  });

  it('startet in der Nachziehphase', () => {
    const zustand = erstelleSpielzustand(2);
    expect(zustand.zugphase).toBe('Nachziehphase');
  });

  it('startet im Normalmodus', () => {
    const zustand = erstelleSpielzustand(2);
    expect(zustand.spielphase).toBe('Normal');
  });

  it('hat 3 offene Aufgabenkarten', () => {
    const zustand = erstelleSpielzustand(2);
    expect(zustand.offeneAufgaben).toHaveLength(3);
  });

  it('jeder Spieler hat eine geheime Aufgabenkarte', () => {
    const zustand = erstelleSpielzustand(2);
    for (const spieler of zustand.spieler) {
      expect(spieler.geheimeAufgabe).not.toBeNull();
      expect(spieler.geheimeAufgabe?.typ).toBe('Aufgabenkarte');
    }
  });

  it('version ist 1', () => {
    const zustand = erstelleSpielzustand(2);
    expect(zustand.version).toBe(1);
  });
});

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
    const zustand = erstelleSpielzustand(2) as unknown as Record<string, unknown>;
    const spieler = zustand['spieler'] as Array<Record<string, unknown>>;
    delete spieler[0]['geheimeAufgabe'];
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/geheimeaufgabe/i);
  });

  it('wirft deutschen Fehler bei geheimer Aufgabe null', () => {
    const zustand = erstelleSpielzustand(2);
    zustand.spieler[0].geheimeAufgabe = null;
    expect(() => deserialisiere(JSON.stringify(zustand))).toThrow(/geheimeaufgabe/i);
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
});
