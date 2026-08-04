/*
Author: rahn
Datum: 31.05.2026
Version: 1.2
Beschreibung: Gemeinsame Test-Builder für Engine-Unit-Tests.
*/

import { erstelleSpielzustand } from '../index';
import type { Farbe, Schlange, Spieler, Spielkarte, Spielzustand, Steuerung } from '../types';

export function farbkarte(id: string, farbe: Farbe, punkte = 1): Spielkarte {
  return { typ: 'Farbkarte', id, farbe, punkte };
}

export function sonderkarte(id: string, name = 'Test-Sonderkarte'): Spielkarte {
  return { typ: 'Sonderkarte', id, name };
}

export function schlange(karten: Spielkarte[], id = 'test-schlange'): Schlange {
  return { id, zustand: 'aktiv', karten };
}

export function spielerMitSchlangen(schlangen: Spieler['schlangen'], steuerung: Steuerung = 'KI'): Spieler {
  return {
    id: 'spieler-wertung-1',
    name: 'Wertungsspieler',
    steuerung,
    hand: [],
    schlangen,
    ausgespielteSonderkartenNamen: [],
    schlangenhaeutungDreiergruppen: 0,
    erfuellteAufgaben: [],
    geheimeAufgabe: { typ: 'Aufgabenkarte', id: 'test-aufgabe-geheim', name: 'Testaufgabe', punkte: 1, bedingung: 'Testbedingung' },
  };
}

export function schlangeMitFarben(id: string, farben: Farbe[]): Schlange {
  return schlange(
    farben.map((farbe, i) => farbkarte(`${id}-${farbe.toLowerCase()}-${i + 1}`, farbe)),
    id,
  );
}

export function spielerMitId(id: string, name: string, schlangen: Spieler['schlangen']): Spieler {
  return { ...spielerMitSchlangen(schlangen), id, name };
}

export function zustandMitFarbenschutzUndEigenerSchlange(): {
  zustand: Spielzustand;
  farbenschutz: Extract<Spielkarte, { typ: 'Sonderkarte' }>;
} {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  const farbenschutz = zustand.nachziehstapel.find(
    (karte): karte is Extract<Spielkarte, { typ: 'Sonderkarte' }> =>
      karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
  );
  if (!farbenschutz) throw new Error('Testsetup erwartet Farbenschutz.');

  zustand.spieler[0].hand[0] = farbenschutz;
  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', karten: [], zustand: 'aktiv' }];

  return { zustand, farbenschutz };
}

/*
ÄNDERUNG [04.08.2026]: O-1 — Kartenmaterial korrekt vom Nachziehstapel nehmen.

Die Vorrichtungen dieses Projekts sind zweimal an derselben Falle gescheitert
(R2.3a am 03.08., O-1 am 04.08.): Eine Karte wird dem Spieler in die Hand gelegt,
aber nicht vom Nachziehstapel entfernt — oder eine Schlange aus erfundenen IDs
gebaut. Die Spiellogik verarbeitet beides klaglos; erst `serialisiere` meldet
„Doppelte ID" beziehungsweise „Kartenmaterial ist nicht vollständig". Tests, die
nie serialisieren, bleiben grün und messen einen Zustand, den es nicht geben kann.

Diese Helfer nehmen die Karten **weg**, wo sie herkommen. Wer sie benutzt, kann
den Zustand serialisieren.
*/

/** Nimmt Karten nach Prädikat vom Nachziehstapel und gibt sie zurück. */
export function nimmVomStapel(
  zustand: Spielzustand,
  passt: (karte: Spielkarte) => boolean,
  anzahl = 1,
): Spielkarte[] {
  const karten = zustand.nachziehstapel.filter(passt).slice(0, anzahl);
  if (karten.length < anzahl) {
    throw new Error(`Testsetup erwartet ${anzahl} passende Karte(n) auf dem Nachziehstapel.`);
  }
  const genommen = new Set(karten.map((karte) => karte.id));
  zustand.nachziehstapel = zustand.nachziehstapel.filter((karte) => !genommen.has(karte.id));
  return karten;
}

/** Genau eine Sonderkarte dieses Namens, vom Stapel genommen. */
export function nimmSonderkarte(zustand: Spielzustand, name: string): Spielkarte {
  return nimmVomStapel(zustand, (karte) => karte.typ === 'Sonderkarte' && karte.name === name)[0];
}
