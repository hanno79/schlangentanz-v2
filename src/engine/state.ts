import type { Spieler, Spielzustand, Steuerung } from './types';
import { HANDKARTEN, OFFENE_AUFGABEN, SPIELER_MAX, SPIELER_MIN } from './constants';
import { erstelleAuslagekarten, erstelleSpielkarten, mischeDeck } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';
import { neuerZug } from './zugablauf';

export interface TischOptionen {
  /** A2: 2 bis 4. Spieler 1 ist der Mensch, die übrigen sind KI-Gegner (B2). */
  spielerzahl: number;
  /** B1: mit oder ohne Erweiterung, vor der Partie gewählt. */
  erweiterung: boolean;
  /** Werte in [0, 1); gleiche Folge, gleiche Partie (U4). Ohne bleibt das Material in fester Reihenfolge. */
  zufall?: () => number;
}

export type PartieOptionen = Required<TischOptionen>;

/** Die Id der Schlange mit dieser laufenden Nummer. */
export function schlangenIdFuer(nummer: number): string {
  return `schlange-${nummer}`;
}

function pruefeSpielerzahl(spielerzahl: number): void {
  if (!Number.isInteger(spielerzahl) || spielerzahl < SPIELER_MIN || spielerzahl > SPIELER_MAX) {
    throw new Error(`Ungültige Spielerzahl ${spielerzahl}: Schlangentanz spielen ${SPIELER_MIN} bis ${SPIELER_MAX} Spieler (A2).`);
  }
}

function erstelleSpieler(index: number, erweiterung: boolean): Spieler {
  const steuerung: Steuerung = index === 0 ? 'Mensch' : 'KI';
  const auslage = erstelleAuslagekarten(index);
  return {
    id: `spieler-${index + 1}`,
    name: index === 0 ? 'Spieler 1' : `KI-Gegner ${index}`,
    steuerung,
    hand: [],
    schlangen: [],
    ablagestapel: [],
    ausgespielteSonderkarten: [],
    schlangenhaeutungDreiergruppen: 0,
    erfuellteAufgaben: [],
    geheimeAufgabe: null,
    geheimeAufgabeErfuellt: false,
    comeback: erweiterung ? { karte: auslage.comeback, verbraucht: false } : null,
    risikoKarten: erweiterung ? auslage.risiko : [],
  };
}

/**
 * Der Tisch nach A4, aber ohne ausgeteilte Handkarten: alle Spielkarten im
 * Nachziehstapel, mit Erweiterung die Aufgaben ausgelegt und die Auslage vor
 * jedem Spieler. Grundlage für `erstellePartie` und den Szenario-Baukasten.
 */
export function erstelleTisch({ spielerzahl, erweiterung, zufall }: TischOptionen): Spielzustand {
  pruefeSpielerzahl(spielerzahl);
  if (typeof erweiterung !== 'boolean') {
    throw new Error('Ungültige Partie: Es muss feststehen, ob mit oder ohne Erweiterung gespielt wird (B1).');
  }
  const mische = <T>(liste: T[]): T[] => (zufall === undefined ? liste : mischeDeck(liste, zufall));

  const spieler = Array.from({ length: spielerzahl }, (_, index) => erstelleSpieler(index, erweiterung));
  const nachziehstapel = mische(erstelleSpielkarten(erweiterung));

  // A4: Aufgaben getrennt mischen, 3 offen auslegen, jedem Spieler eine geheime geben.
  const aufgabenStapel = erweiterung ? mische(erstelleAufgabenStapel()) : [];
  const offeneAufgaben = aufgabenStapel.splice(0, OFFENE_AUFGABEN);
  for (const einzelner of spieler) einzelner.geheimeAufgabe = aufgabenStapel.shift() ?? null;

  return {
    version: 2,
    erweiterung,
    spieler,
    partiephase: 'Laufend',
    zug: neuerZug(0),
    schlussrundeAusloeser: null,
    nachziehstapel,
    ausliegendeGruben: [],
    schwebend: null,
    ausDemSpiel: [],
    offeneAufgaben,
    aufgabenStapel,
    schlangenZaehler: 0,
  };
}

/** Teilt reihum von oben aus, bis jeder 5 Handkarten hat oder der Nachziehstapel leer ist (A4). Verändert `zustand`. */
export function teileReihumAus(zustand: Spielzustand): void {
  while (zustand.nachziehstapel.length > 0 && zustand.spieler.some((spieler) => spieler.hand.length < HANDKARTEN)) {
    for (const spieler of zustand.spieler) {
      const karte = spieler.hand.length < HANDKARTEN ? zustand.nachziehstapel.shift() : undefined;
      if (karte !== undefined) spieler.hand.push(karte);
    }
  }
}

/**
 * Eine neue Partie nach A4: mischen, jedem Spieler reihum 5 Karten austeilen,
 * der Rest ist der Nachziehstapel. Der Mensch beginnt (B2).
 */
export function erstellePartie({ spielerzahl, erweiterung, zufall }: PartieOptionen): Spielzustand {
  if (typeof zufall !== 'function') {
    throw new Error('Ungültige Partie: Ohne Zufallsquelle lässt sich nicht mischen (B2).');
  }
  const zustand = erstelleTisch({ spielerzahl, erweiterung, zufall });
  teileReihumAus(zustand);
  return zustand;
}
