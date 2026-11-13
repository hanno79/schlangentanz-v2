import type { Spieler, Spielzustand, Steuerung } from './types';
import { HANDKARTEN, OFFENE_AUFGABEN, SPIELER_MAX, SPIELER_MIN } from './constants';
import { erstelleAuslagekarten, erstelleSpielkarten, mischeDeck } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';

export interface PartieOptionen {
  /** A2: 2 bis 4. Spieler 1 ist der Mensch, die übrigen sind KI-Gegner (B2). */
  spielerzahl: number;
  /** B1: mit oder ohne Erweiterung, vor der Partie gewählt. */
  erweiterung: boolean;
  /** Werte in [0, 1). Gleiche Folge, gleiche Partie (U4). */
  zufall: () => number;
}

export interface TischOptionen {
  spielerzahl: number;
  erweiterung: boolean;
  /** Ohne Zufallsquelle bleibt das Material in fester Reihenfolge. */
  zufall?: () => number;
}

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
  const offeneAufgaben = aufgabenStapel.splice(0, erweiterung ? OFFENE_AUFGABEN : 0);
  if (erweiterung) {
    for (const einzelner of spieler) einzelner.geheimeAufgabe = aufgabenStapel.shift() ?? null;
  }

  return {
    version: 2,
    erweiterung,
    spieler,
    partiephase: 'Laufend',
    zug: {
      spielerIndex: 0,
      teilzug: 1,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 0,
      verdopplerGespielt: false,
      farbenfusionGespielt: false,
      abschnitt: 'Ausspielen',
    },
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

/**
 * Eine neue Partie nach A4: mischen, jedem Spieler reihum 5 Karten austeilen,
 * der Rest ist der Nachziehstapel. Der Mensch beginnt (B2).
 */
export function erstellePartie({ spielerzahl, erweiterung, zufall }: PartieOptionen): Spielzustand {
  if (typeof zufall !== 'function') {
    throw new Error('Ungültige Partie: Ohne Zufallsquelle lässt sich nicht mischen (B2).');
  }
  const zustand = erstelleTisch({ spielerzahl, erweiterung, zufall });
  for (let runde = 0; runde < HANDKARTEN; runde++) {
    for (const spieler of zustand.spieler) {
      const karte = zustand.nachziehstapel.shift();
      if (karte === undefined) throw new Error('Ungültige Partie: Für das Austeilen fehlen Karten.');
      spieler.hand.push(karte);
    }
  }
  return zustand;
}
