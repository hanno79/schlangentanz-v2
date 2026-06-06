import { describe, it, expect } from 'vitest';
import {
  SPIELER_MIN,
  SPIELER_MAX,
  KI_GEGNER_MIN,
  KI_GEGNER_MAX,
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
import { erstelleFarbkarten, erstelleHauptdeck, erstelleSonderkarten, erstelleErweiterungsSonderkarten } from '../deck';
import { erstelleSpielzustand, erstelleEinzelspielerSpielzustand } from '../state';
import { erstelleEinzelspielerSpielzustand as exportierteEinzelspielerFactory } from '../index';

describe('Spielkonstanten', () => {
  it('Mindest- und Maximalspielerzahl', () => {
    expect(SPIELER_MIN).toBe(2);
    expect(SPIELER_MAX).toBe(4);
  });

  it('KI-Gegnerauswahl erlaubt 1 bis 3 Gegner', () => {
    expect(KI_GEGNER_MIN).toBe(1);
    expect(KI_GEGNER_MAX).toBe(3);
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
    const sonderkarten = erstelleSonderkarten();
    const namen = sonderkarten.map((karte) => karte.name);

    expect(sonderkarten).toHaveLength(32);
    expect(namen.filter((name) => name === 'Farbenschutz')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Regenbogenschlange')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Schlangenfrass')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Schlangenblockade')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Farbendieb')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Schlangengrube')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Farbenfusion')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Verdoppler')).toHaveLength(4);
  });

  it('enthält die 17 benannten Erweiterungssonderkarten', () => {
    const sonderkarten = erstelleErweiterungsSonderkarten();
    const namen = sonderkarten.map((karte) => karte.name);

    expect(sonderkarten).toHaveLength(17);
    expect(namen.filter((name) => name === 'Schlangenhäutung')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Schlangenkorb des Glücks')).toHaveLength(1);
    expect(namen.filter((name) => name === 'Comeback')).toHaveLength(4);
    expect(namen.filter((name) => name === 'Risiko-Belohnung')).toHaveLength(8);
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
  it('erzeugt Einzelspieler-Zustand mit 1 menschlichem Spieler und 1 bis 3 KI-Gegnern', () => {
    for (const kiGegnerAnzahl of [1, 2, 3]) {
      const zustand = erstelleEinzelspielerSpielzustand(kiGegnerAnzahl);

      expect(zustand.spieler).toHaveLength(1 + kiGegnerAnzahl);
      expect(zustand.spieler[0]).toMatchObject({
        id: 'spieler-mensch',
        name: 'Spieler',
        steuerung: 'Mensch',
      });
      expect(zustand.spieler.slice(1).map((spieler) => spieler.steuerung)).toEqual(
        Array.from({ length: kiGegnerAnzahl }, () => 'KI'),
      );
    }
  });

  it('exportiert die Einzelspieler-Factory über den zentralen Engine-Einstieg', () => {
    expect(exportierteEinzelspielerFactory(1).spieler.map((spieler) => spieler.steuerung)).toEqual(['Mensch', 'KI']);
  });

  it('wirft Fehler bei ungültiger KI-Gegneranzahl', () => {
    expect(() => erstelleEinzelspielerSpielzustand(0)).toThrow(/ki-gegner/i);
    expect(() => erstelleEinzelspielerSpielzustand(4)).toThrow(/ki-gegner/i);
    expect(() => erstelleEinzelspielerSpielzustand(Number.NaN)).toThrow(/ki-gegner/i);
    expect(() => erstelleEinzelspielerSpielzustand(1.5)).toThrow(/ki-gegner/i);
  });

  it('markiert auch im Totalspieler-Pfad Spieler 1 als Mensch und die übrigen als KI', () => {
    const zustand = erstelleSpielzustand(3);

    expect(zustand.spieler.map((spieler) => spieler.steuerung)).toEqual(['Mensch', 'KI', 'KI']);
  });

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
