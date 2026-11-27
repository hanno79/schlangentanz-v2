import type { Zug } from '../../engine'

/*
Die übrigen Zusatzaktionen eines Zuges für die Statuszeile (O10, Prüfprotokoll
O10, Mangel 3). Eigene Datei, weil die Sicht des Tischs sonst über die
Grenze von U7 wüchse.
*/

/** Die Plätze, die jeder Zug ohne Zusatzaktion hat: eine Farbkarte und eine Sonderkarte (A5, D12). */
const GRUNDPLAETZE = ['Farbkarte', 'Sonderkarte']

/**
 * Wie viele Zusatzaktionen dieses Teilzugs noch frei sind (A8.1, A7.10;
 * Prüfprotokoll O10, Mangel 3). Die Engine führt nur, welche Zusatzaktionen der
 * Zug bekommen hat und was er schon verwendet hat; eine Zahl der übrigen gibt
 * sie nicht heraus. Was zuerst einen Grundplatz belegen kann, belegt ihn; jede
 * weitere Verwendung, die einen Platz braucht, verbraucht eine Zusatzaktion.
 * Eine Karte, die eine Wirkung zusätzlich legt (Risiko-Aktion 2), passt auf
 * keinen Platz und zählt nicht.
 */
export function uebrigeZusatzaktionen(zug: Zug): number {
  const artenMitPlatz = new Set([...GRUNDPLAETZE, ...zug.zusatzaktionen.flatMap((zusatz) => zusatz.erlaubt)])
  const belegt = zug.verwendet.filter((verwendung) => artenMitPlatz.has(verwendung.art))
  const imGrundzug = GRUNDPLAETZE.filter((art) => belegt.some((verwendung) => verwendung.art === art)).length
  return Math.max(0, zug.zusatzaktionen.length - (belegt.length - imGrundzug))
}
