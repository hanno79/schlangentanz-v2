import { ermittleFarbgruppen } from './colorGroups';
import { werteSchlangen } from './jokerGruppen';
import type { SchlangenWertung } from './jokerGruppen';
import type { Spieler, Spielzustand } from './types';

/*
Die Punktezählung (A11): Farbgruppen, Vielfaltbonus [Erweiterung], längste
Farbkette, Aufgaben [Erweiterung].

Es gibt zwei Wertungen:
- Die **Endwertung** nach Spielende mit allem, was A11 nennt, und den Siegern.
- Den **Zwischenstand** während der Partie aus der Sicht eines Spielers: ohne
  den Kettenbonus, den A11 erst nach Spielende vergibt, und ohne die geheimen
  Aufgaben der anderen, die erst bei der Wertung aufgedeckt werden (A9).

Beide schlüsseln je Spieler auf: Gruppen je Schlange, Farbe jedes Jokers,
Vielfaltbonus, Kette, Aufgaben und Summe. Joker haben keine gespeicherte Farbe
(D8); sie werden bei jeder Wertung neu gewählt (`jokerGruppen.ts`).
*/

/** A11: Der Spieler mit der längsten Farbkette erhält 5 Bonuspunkte. */
export const KETTENBONUS = 5;

/** D24: Eine Kette zählt erst ab 3 Farbkarten derselben Farbe in ununterbrochener Reihe. */
const MINDEST_KETTENLAENGE = 3;

export interface AufgabenEintrag {
  aufgabeId: string;
  name: string;
  punkte: number;
  /** Die geheime Aufgabe des Spielers (A4, A9). */
  geheim: boolean;
}

export interface KettenWertung {
  /** Die längste Kette ab 3 Farbkarten (D24); 0, wenn der Spieler keine hat. */
  laenge: number;
  bonus: number;
}

export interface SpielerWertung {
  spielerId: string;
  name: string;
  schlangen: SchlangenWertung[];
  gruppenPunkte: number;
  /** Der höchste Vielfaltbonus einer Schlange; `null` ohne Erweiterung. */
  vielfaltBonus: number | null;
  /** `null` im Zwischenstand: Der Kettenbonus kommt erst nach Spielende. */
  kette: KettenWertung | null;
  /** Die gewerteten Aufgaben; `null` ohne Erweiterung. */
  aufgaben: AufgabenEintrag[] | null;
  aufgabenPunkte: number;
  summe: number;
}

export interface Zwischenstand {
  betrachterId: string;
  spieler: SpielerWertung[];
}

export interface Endwertung {
  spieler: SpielerWertung[];
  hoechstePunktzahl: number;
  /** D22: Alle mit der höchsten Summe gewinnen, in der Sitzordnung. */
  gewinner: string[];
}

type Wertungsgrundlage = Pick<Spielzustand, 'spieler' | 'erweiterung'>;

/**
 * A11: die längste ununterbrochene Kette einer Farbe in einer Schlange. Sonderkarten
 * zählen nicht mit und unterbrechen sie, auch Regenbogenschlange und Farbenfusion;
 * `ermittleFarbgruppen` arbeitet deshalb auf der rohen Schlange. Unter 3 Karten: 0 (D24).
 */
export function laengsteFarbkette(spieler: Spieler): number {
  const laengen = spieler.schlangen.flatMap((schlange) => ermittleFarbgruppen(schlange, MINDEST_KETTENLAENGE).map((kette) => kette.laenge));
  return Math.max(0, ...laengen);
}

/**
 * A11 Abschnitt 4: erfüllte offene Aufgaben und die geheime, wenn sie erfüllt wurde.
 * Ob eine Aufgabe erfüllt ist, stellen X1 und X2 fest; die Wertung liest es nur ab.
 * In der Schlussrunde zählt jede Aufgabe einfach (C11).
 */
function aufgabenVon(spieler: Spieler, geheimeSichtbar: boolean): AufgabenEintrag[] {
  const eintraege = spieler.erfuellteAufgaben.map((aufgabe) => ({ aufgabeId: aufgabe.id, name: aufgabe.name, punkte: aufgabe.punkte, geheim: false }));
  const geheime = spieler.geheimeAufgabe;
  if (geheimeSichtbar && geheime !== null && spieler.geheimeAufgabeErfuellt) {
    eintraege.push({ aufgabeId: geheime.id, name: geheime.name, punkte: geheime.punkte, geheim: true });
  }
  return eintraege;
}

function werteSpieler(spieler: Spieler, erweiterung: boolean, kette: KettenWertung | null, geheimeSichtbar: boolean): SpielerWertung {
  const farbgruppen = werteSchlangen(spieler.schlangen, erweiterung);
  const aufgaben = erweiterung ? aufgabenVon(spieler, geheimeSichtbar) : null;
  const aufgabenPunkte = (aufgaben ?? []).reduce((summe, aufgabe) => summe + aufgabe.punkte, 0);
  return {
    spielerId: spieler.id,
    name: spieler.name,
    schlangen: farbgruppen.schlangen,
    gruppenPunkte: farbgruppen.gruppenPunkte,
    vielfaltBonus: farbgruppen.vielfaltBonus,
    kette,
    aufgaben,
    aufgabenPunkte,
    summe: farbgruppen.gruppenPunkte + (farbgruppen.vielfaltBonus ?? 0) + (kette?.bonus ?? 0) + aufgabenPunkte,
  };
}

/** Der Stand während der Partie aus der Sicht von `betrachterId` (Plan E10, Kriterium 6). */
export function berechneZwischenstand(zustand: Wertungsgrundlage, betrachterId: string): Zwischenstand {
  if (!zustand.spieler.some((spieler) => spieler.id === betrachterId)) {
    throw new Error(`Zwischenstand: Einen Spieler „${betrachterId}“ gibt es in dieser Partie nicht.`);
  }
  return {
    betrachterId,
    spieler: zustand.spieler.map((spieler) => werteSpieler(spieler, zustand.erweiterung, null, spieler.id === betrachterId)),
  };
}

/** Die Punktezählung nach Spielende (A11) mit den Siegern (D22). */
export function berechneEndwertung(zustand: Wertungsgrundlage): Endwertung {
  const ketten = zustand.spieler.map(laengsteFarbkette);
  const laengste = Math.max(0, ...ketten);
  const spieler = zustand.spieler.map((einzelner, index) => {
    const laenge = ketten[index];
    return werteSpieler(einzelner, zustand.erweiterung, { laenge, bonus: laenge > 0 && laenge === laengste ? KETTENBONUS : 0 }, true);
  });
  const hoechstePunktzahl = Math.max(...spieler.map((wertung) => wertung.summe));
  return {
    spieler,
    hoechstePunktzahl,
    gewinner: spieler.filter((wertung) => wertung.summe === hoechstePunktzahl).map((wertung) => wertung.spielerId),
  };
}
