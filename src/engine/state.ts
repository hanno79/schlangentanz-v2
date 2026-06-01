/*
Author: rahn
Datum: 31.05.2026
Version: 1.1
Beschreibung: Factory für den initialen Schlangentanz-Spielzustand.
*/

import type { Spielzustand, Spieler, Spielkarte, AufgabenkarteInfo, Steuerung } from './types';
import {
  SPIELER_MIN,
  SPIELER_MAX,
  KI_GEGNER_MIN,
  KI_GEGNER_MAX,
  STARTHANDKARTEN,
  OFFENE_AUFGABEN_START,
} from './constants';
import { erstelleHauptdeck, mischeDeck } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';

type SpielerDefinition = { id: string; name: string; steuerung: Steuerung };

export function erstelleEinzelspielerSpielzustand(
  kiGegnerAnzahl: number,
  rng: () => number = () => Math.random(),
): Spielzustand {
  if (
    !Number.isInteger(kiGegnerAnzahl) ||
    kiGegnerAnzahl < KI_GEGNER_MIN ||
    kiGegnerAnzahl > KI_GEGNER_MAX
  ) {
    throw new Error(
      `Ungültige KI-Gegneranzahl: ${kiGegnerAnzahl}. Erlaubt sind ${KI_GEGNER_MIN}–${KI_GEGNER_MAX} KI-Gegner.`,
    );
  }

  const definitionen: SpielerDefinition[] = [
    { id: 'spieler-mensch', name: 'Spieler', steuerung: 'Mensch' },
    ...Array.from({ length: kiGegnerAnzahl }, (_, i): SpielerDefinition => ({
      id: `ki-gegner-${i + 1}`,
      name: `KI Gegner ${i + 1}`,
      steuerung: 'KI',
    })),
  ];

  return erstelleSpielzustandVonDefinitionen(definitionen, rng);
}

export function erstelleSpielzustand(
  anzahlSpieler: number,
  rng: () => number = () => Math.random(),
): Spielzustand {
  if (anzahlSpieler < SPIELER_MIN || anzahlSpieler > SPIELER_MAX) {
    throw new Error(
      `Ungültige Spieleranzahl: ${anzahlSpieler}. Erlaubt sind ${SPIELER_MIN}–${SPIELER_MAX} Spieler.`,
    );
  }

  const definitionen: SpielerDefinition[] = Array.from({ length: anzahlSpieler }, (_, i) => ({
    id: `spieler-${i + 1}`,
    name: `Spieler ${i + 1}`,
    steuerung: i === 0 ? 'Mensch' : 'KI',
  }));

  return erstelleSpielzustandVonDefinitionen(definitionen, rng);
}

function erstelleSpielzustandVonDefinitionen(
  definitionen: SpielerDefinition[],
  rng: () => number,
): Spielzustand {
  const hauptdeck = mischeDeck(erstelleHauptdeck(), rng);
  const aufgabenStapel = mischeDeck(erstelleAufgabenStapel(), rng);
  const spieler = erstelleSpielerListe(definitionen, aufgabenStapel);

  verteileStartkartenReihum(spieler, hauptdeck);

  return {
    version: 1,
    spieler,
    aktiverSpielerIndex: 0,
    zugphase: 'Nachziehphase',
    zugpflichten: { gespielteKarten: 0 },
    spielphase: 'Normal',
    nachziehstapel: hauptdeck,
    ablagestapel: [],
    offeneAufgaben: aufgabenStapel.splice(0, OFFENE_AUFGABEN_START),
    aufgabenStapel,
    endrunde: { ausloeserSpielerIndex: null, verbleibendeSpielerIndizes: [] },
  };
}

function erstelleSpielerListe(
  definitionen: SpielerDefinition[],
  aufgabenStapel: AufgabenkarteInfo[],
): Spieler[] {
  return definitionen.map(({ id, name, steuerung }) => ({
    id,
    name,
    steuerung,
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
