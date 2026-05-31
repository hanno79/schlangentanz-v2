/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Factory für den initialen Schlangentanz-Spielzustand.
*/

import type { Spielzustand, Spieler, Spielkarte, AufgabenkarteInfo } from './types';
import {
  SPIELER_MIN,
  SPIELER_MAX,
  STARTHANDKARTEN,
  OFFENE_AUFGABEN_START,
} from './constants';
import { erstelleHauptdeck, mischeDeck } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';

export function erstelleSpielzustand(
  anzahlSpieler: number,
  rng: () => number = () => Math.random(),
): Spielzustand {
  if (anzahlSpieler < SPIELER_MIN || anzahlSpieler > SPIELER_MAX) {
    throw new Error(
      `Ungültige Spieleranzahl: ${anzahlSpieler}. Erlaubt sind ${SPIELER_MIN}–${SPIELER_MAX} Spieler.`,
    );
  }

  const hauptdeck = mischeDeck(erstelleHauptdeck(), rng);
  const aufgabenStapel = mischeDeck(erstelleAufgabenStapel(), rng);
  const spieler = erstelleSpieler(anzahlSpieler, aufgabenStapel);

  verteileStartkartenReihum(spieler, hauptdeck);

  return {
    version: 1,
    spieler,
    aktiverSpielerIndex: 0,
    zugphase: 'Nachziehphase',
    spielphase: 'Normal',
    nachziehstapel: hauptdeck,
    ablagestapel: [],
    offeneAufgaben: aufgabenStapel.splice(0, OFFENE_AUFGABEN_START),
    aufgabenStapel,
  };
}

function erstelleSpieler(
  anzahlSpieler: number,
  aufgabenStapel: AufgabenkarteInfo[],
): Spieler[] {
  return Array.from({ length: anzahlSpieler }, (_, index) => ({
    id: `spieler-${index + 1}`,
    name: `Spieler ${index + 1}`,
    hand: [],
    schlangen: [],
    erfuellteAufgaben: [],
    geheimeAufgabe: aufgabenStapel.shift() ?? null,
  }));
}

function verteileStartkartenReihum(
  spieler: Spieler[],
  hauptdeck: Spielkarte[],
): void {
  for (let runde = 0; runde < STARTHANDKARTEN; runde++) {
    for (const einzelnerSpieler of spieler) {
      const karte = hauptdeck.shift();
      if (karte === undefined) {
        throw new Error('Ungültiger Spielzustand: Nicht genug Karten für Startverteilung.');
      }
      einzelnerSpieler.hand.push(karte);
    }
  }
}
