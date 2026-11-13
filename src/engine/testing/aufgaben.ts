import { OFFENE_AUFGABEN } from '../constants';
import type { AufgabenkarteInfo, Spielzustand } from '../types';

/*
Erfüllte Aufgaben für Tests und Szenarien (E10). Ob eine Aufgabe erfüllt ist,
prüft die Engine erst mit X1/X2; bis dahin setzen diese Hilfen den Zustand so,
wie ihn die Wertung liest. Jede Aufgabe bleibt dabei genau einmal im Spiel.
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
