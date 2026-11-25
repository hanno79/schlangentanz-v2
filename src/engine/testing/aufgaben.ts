import { OFFENE_AUFGABEN } from '../constants';
import type { AufgabenkarteInfo, Spieler, Spielzustand } from '../types';

/*
Aufgaben für Tests und Szenarien. Erfüllte Aufgaben setzen die Hilfen von E10
so, wie die Wertung sie liest, ohne dass die Engine sie geprüft hat;
`legeAufgabenAus` (X1) legt die Aufgaben so aus, wie ein Test zum Einlösen sie
braucht. Jede Aufgabe bleibt dabei genau einmal im Spiel.
*/

/** Nimmt die Aufgabe `name` aus der Auslage, dem Stapel oder der geheimen Hand eines Spielers; Lücken füllt der Stapel. */
function nimmAufgabe(zustand: Spielzustand, name: string): AufgabenkarteInfo {
  const offen = zustand.offeneAufgaben.findIndex((aufgabe) => aufgabe.name === name);
  if (offen >= 0) {
    const [aufgabe] = zustand.offeneAufgaben.splice(offen, 1);
    if (zustand.offeneAufgaben.length < OFFENE_AUFGABEN && zustand.aufgabenStapel.length > 0) {
      zustand.offeneAufgaben.push(zustand.aufgabenStapel.shift() as AufgabenkarteInfo);
    }
    return aufgabe;
  }
  const imStapel = zustand.aufgabenStapel.findIndex((aufgabe) => aufgabe.name === name);
  if (imStapel >= 0) return zustand.aufgabenStapel.splice(imStapel, 1)[0];
  const besitzer = zustand.spieler.find((spieler) => spieler.geheimeAufgabe?.name === name);
  const aufgabe = besitzer?.geheimeAufgabe;
  if (besitzer === undefined || aufgabe == null || zustand.aufgabenStapel.length === 0) {
    throw new Error(`Die Aufgabe ${name} liegt nicht frei.`);
  }
  besitzer.geheimeAufgabe = zustand.aufgabenStapel.shift() as AufgabenkarteInfo;
  return aufgabe;
}

/** Spieler `spieler` hat die offene Aufgabe `name` erfüllt und zu sich genommen (A9). */
export function gibErfuellteAufgabe(zustand: Spielzustand, spieler: number, name: string): void {
  zustand.spieler[spieler].erfuellteAufgaben.push(nimmAufgabe(zustand, name));
}

/** Spieler `spieler` hat `name` als geheime Aufgabe, erfüllt oder nicht; seine bisherige kommt in den Stapel. */
export function legeGeheimeAufgabe(zustand: Spielzustand, spieler: number, name: string, erfuellt: boolean): void {
  const aufgabe = nimmAufgabe(zustand, name);
  const bisher = zustand.spieler[spieler].geheimeAufgabe;
  if (bisher !== null) zustand.aufgabenStapel.push(bisher);
  zustand.spieler[spieler].geheimeAufgabe = aufgabe;
  zustand.spieler[spieler].geheimeAufgabeErfuellt = erfuellt;
}

/** Welche Aufgaben offen liegen, oben auf dem Stapel und geheim bei einem Spieler (Name aus A9). */
export interface Aufgabenauslage {
  /** Die offenen Aufgaben in dieser Reihenfolge; höchstens 3 (A4). */
  offen?: string[];
  /** Diese Aufgaben liegen in dieser Reihenfolge oben auf dem Aufgabenstapel. */
  stapelOben?: string[];
  /** Je Spieler seine geheime Aufgabe. */
  geheim?: Array<[spieler: number, name: string]>;
}

/**
 * Legt die Aufgaben, die noch niemand erfüllt hat, nach `auslage` aus. Was die
 * Auslage nicht nennt, bleibt in seiner Reihenfolge: offene Aufgaben ohne Angabe
 * bleiben liegen, geheime bei ihrem Spieler, solange niemand sie anders
 * verlangt; alle übrigen kommen unter die genannten in den Stapel. Verändert
 * `zustand`; die Invarianten prüft der Baukasten.
 */
export function legeAufgabenAus(zustand: Spielzustand, auslage: Aufgabenauslage): void {
  if (!zustand.erweiterung) throw new Error('Ohne Erweiterung gibt es keine Aufgaben (D34).');
  const frei = new Map<string, AufgabenkarteInfo>();
  for (const aufgabe of [...zustand.offeneAufgaben, ...zustand.spieler.flatMap((spieler) => spieler.geheimeAufgabe ?? []), ...zustand.aufgabenStapel]) {
    frei.set(aufgabe.name, aufgabe);
  }
  const nimm = (name: string): AufgabenkarteInfo => {
    const aufgabe = frei.get(name);
    if (aufgabe === undefined) throw new Error(`Die Aufgabe ${name} liegt nicht frei oder ist doppelt genannt.`);
    frei.delete(name);
    return aufgabe;
  };
  const offen = auslage.offen?.map(nimm);
  const geheim = new Map((auslage.geheim ?? []).map(([spieler, name]) => [spieler, nimm(name)]));
  const oben = (auslage.stapelOben ?? []).map(nimm);
  const bleibt = (aufgabe: AufgabenkarteInfo | null) => (aufgabe !== null && frei.has(aufgabe.name) ? nimm(aufgabe.name) : undefined);
  zustand.offeneAufgaben = offen ?? zustand.offeneAufgaben.flatMap((aufgabe) => bleibt(aufgabe) ?? []);
  for (const [index, spieler] of zustand.spieler.entries()) {
    spieler.geheimeAufgabe = geheim.get(index) ?? bleibt(spieler.geheimeAufgabe) ?? nimm([...frei.keys()][0]);
  }
  zustand.aufgabenStapel = [...oben, ...frei.values()];
}

/** Die Auslage der Tests und Szenarien von X1: drei offene, zwei oben auf dem Stapel, bei zwei Spielern je eine geheime. */
export const GRUNDAUSLAGE: Aufgabenauslage = {
  offen: ['Farbkombination', 'Fusionsexperte', 'Lila Riese'],
  stapelOben: ['Gelber Schatz', 'Farbvielfalt'],
  geheim: [
    [0, 'Schlangentanz'],
    [1, 'Symmetriemeister'],
  ],
};

/** Im Aufgabenstapel bleiben die obersten `anzahl` Karten; den Rest hat Spieler `spieler` schon früher erfüllt. */
export function stapelBis(anzahl: number, spieler = 1): (zustand: Spielzustand) => void {
  return (zustand) => {
    zustand.spieler[spieler].erfuellteAufgaben.push(...zustand.aufgabenStapel.splice(anzahl));
  };
}

/** D35: Wer seine geheime Aufgabe in diesem Schritt erfüllt hat. Die Engine meldet das mit keinem Ereignis (B2); Prüfer und Protokoll vergleichen deshalb die Zustände. */
export function neuErfuellteGeheimeAufgaben(vorher: Spielzustand, nachher: Spielzustand): Spieler[] {
  return nachher.spieler.filter((spieler, index) => spieler.geheimeAufgabeErfuellt && !vorher.spieler[index].geheimeAufgabeErfuellt);
}
