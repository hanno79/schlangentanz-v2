/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R97-Regressionstests — Aufgabenprüfung Schlangentanz: mindestens zwei durch Schlangenhäutung neu gebildete Dreiergruppen.
*/

import { describe, expect, it } from 'vitest';
import { beendeAufgabenpruefung, deserialisiere, erstelleSpielzustand, serialisiere } from '../index';
import type { AufgabenkarteInfo, Spieler, Spielzustand } from '../index';

const schlangentanz: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-11',
  name: 'Schlangentanz',
  punkte: 7,
  bedingung: 'Bilde durch Schlangenhäutung 2 neue Dreiergruppen.',
};

const ersatzAufgabe: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-14',
  name: 'Lila Riese',
  punkte: 5,
  bedingung: 'Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3).',
};

type SpielerMitSchlangentanzHistorie = Spieler & {
  schlangenhaeutungDreiergruppen: number;
};

function setzeSchlangentanzHistorie(spieler: Spieler, anzahl: number): SpielerMitSchlangentanzHistorie {
  return { ...spieler, schlangenhaeutungDreiergruppen: anzahl } as SpielerMitSchlangentanzHistorie;
}

function leseSchlangentanzHistorie(spieler: Spieler): number | undefined {
  return (spieler as Partial<SpielerMitSchlangentanzHistorie>).schlangenhaeutungDreiergruppen;
}

function zustandFuerSchlangentanz(
  schlangenhaeutungDreiergruppen: number,
  aktiverSpielerIndex = 0,
): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999);
  return {
    ...basis,
    aktiverSpielerIndex,
    zugphase: 'Aufgabenpruefung',
    offeneAufgaben: [schlangentanz],
    aufgabenStapel: [ersatzAufgabe],
    spieler: basis.spieler.map((spieler, index) =>
      index === aktiverSpielerIndex
        ? setzeSchlangentanzHistorie(spieler, schlangenhaeutungDreiergruppen)
        : setzeSchlangentanzHistorie(spieler, 9),
    ),
  };
}

describe('R97 Aufgabenprüfung — Schlangentanz', () => {
  it('erfüllt Schlangentanz mit zwei durch Schlangenhäutung neu gebildeten Dreiergruppen', () => {
    const zustand = zustandFuerSchlangentanz(2);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangentanz',
    ]);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Lila Riese']);
    expect(aktualisiert.zugphase).toBe('Zugabschluss');
  });

  it('erfüllt Schlangentanz nicht mit nur einer durch Schlangenhäutung neu gebildeten Dreiergruppe', () => {
    const zustand = zustandFuerSchlangentanz(1);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangentanz']);
    expect(aktualisiert.aufgabenStapel).toEqual([ersatzAufgabe]);
  });

  it('wertet nur die Schlangenhäutung-Historie des aktiven Spielers', () => {
    const zustand = zustandFuerSchlangentanz(0, 0);

    const aktualisiert = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.offeneAufgaben.map((aufgabe) => aufgabe.name)).toEqual(['Schlangentanz']);
  });

  it('erfüllt Schlangentanz für aktiverSpielerIndex 1 ohne Daten von Spieler 0 zu verwenden', () => {
    const zustand = zustandFuerSchlangentanz(2, 1);
    const mitLeererHistorieFuerSpieler0 = {
      ...zustand,
      spieler: zustand.spieler.map((spieler, index) =>
        index === 0 ? setzeSchlangentanzHistorie(spieler, 0) : spieler,
      ),
    };

    const aktualisiert = beendeAufgabenpruefung(mitLeererHistorieFuerSpieler0, {
      aufgabenGeprueft: true,
    });

    expect(aktualisiert.spieler[0].erfuellteAufgaben).toHaveLength(0);
    expect(aktualisiert.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([
      'Schlangentanz',
    ]);
  });
});

describe('R97 Schlangentanz-Historie im Spielzustand', () => {
  it('initialisiert die Schlangenhäutung-Dreiergruppen-Historie für jeden Spieler mit 0', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);

    expect(zustand.spieler.map(leseSchlangentanzHistorie)).toEqual([0, 0]);
  });

  it('serialisiert und deserialisiert die Schlangenhäutung-Dreiergruppen-Historie stabil', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    zustand.spieler = zustand.spieler.map((spieler, index) =>
      setzeSchlangentanzHistorie(spieler, index === 0 ? 2 : 9),
    );

    const roundtrip = deserialisiere(serialisiere(zustand));

    expect(roundtrip.spieler.map(leseSchlangentanzHistorie)).toEqual([2, 9]);
  });

  it('migriert alte Spielstände ohne Schlangenhäutung-Dreiergruppen-Historie auf 0', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const altstand = JSON.parse(serialisiere(zustand)) as Spielzustand;
    for (const spieler of altstand.spieler) {
      delete (spieler as Partial<SpielerMitSchlangentanzHistorie>).schlangenhaeutungDreiergruppen;
    }

    const migriert = deserialisiere(JSON.stringify(altstand));

    expect(migriert.spieler.map(leseSchlangentanzHistorie)).toEqual([0, 0]);
  });

  it('verwirft ungültige Schlangenhäutung-Dreiergruppen-Historie', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const defekt = JSON.parse(serialisiere(zustand)) as Spielzustand;
    (defekt.spieler[0] as SpielerMitSchlangentanzHistorie).schlangenhaeutungDreiergruppen = 1.5;

    expect(() => deserialisiere(JSON.stringify(defekt))).toThrow(
      'Ungültiger Spielzustand: spieler.schlangenhaeutungDreiergruppen muss eine nicht-negative ganze Zahl sein.',
    );
  });
});
