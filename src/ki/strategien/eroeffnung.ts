import type { SpielAktion } from '../../engine';
import type { Sicht } from '../sicht';

/*
Der erste Zug eines Spielers (Plan K4, Kriterium 2). Die Engine zählt die Züge nicht,
die Sicht zeigt aber, was ein Spieler schon gespielt hat: Wer seinen Zug beendet, hat
mindestens eine Karte gespielt (A5), und jede gespielte Karte hinterlässt eine Spur,
eine Farbkarte in einer eigenen Schlange oder eine Sonderkarte unter den ausgespielten
(A9). Im ersten Zug stammen alle Spuren aus diesem Zug: aus dem laufenden Teilzug, eine
mehr je Farbendieb, der eine fremde Farbkarte in die eigene Schlange holt (A7.1), und im
zweiten Teilzug nach einem Verdoppler dazu aus dem ersten (der Verdoppler, eine
Farbkarte und je eingesetzter Risiko-Karte eine Farbkarte, die sie anlegt; A5, A7.8,
A8.2 Aktion 2). Farbenschutz zählt nicht, er wehrt im Zug eines anderen ab (A7.2),
auch vor dem eigenen ersten Zug. Der eigene Ablagestapel zählt nicht, auf ihm landen
auch abgeworfene Karten (A5).

Hat ein Gegner dem Spieler alle Farbkarten aus den Schlangen genommen und hat er
ausser Farbenschutz nie eine Sonderkarte gespielt, sieht ein späterer Zug wie der erste
aus. Die KI hält ihre Karten dann wie im ersten Zug; in 240 Partien betraf das 1.3 %
der Entscheidungen nach dem ersten Zug. Jeden ersten Zug erkennt sie.
*/

/** A4: Risiko-Belohnungs-Karten je Spieler zu Beginn. */
const RISIKO_KARTEN_JE_SPIELER = 2;
/** Was der erste Teilzug vor dem zweiten nach einem Verdoppler hinterlässt: den Verdoppler und eine Farbkarte (A5, A7.8). */
const ERSTER_TEILZUG = 2;

/**
 * Im ersten Zug setzt die KI Comeback-Karte, Risiko-Karte und Schlangenkorb nur ein, wenn
 * der Zug eine Gruppe vollendet, eine Aufgabe erfüllt oder die Bewertung um mehr als so
 * viel steigt (Plan K4, Kriterium 2). In 2'000 Spiegelpartien gegen dieselbe KI, die im
 * ersten Zug keine dieser Karten einsetzt, holt sie 49.8 % (Standardfehler 1.1 %, Grenze
 * 47.8 %); ohne die Regel setzte sie in 85 % der ersten Züge eine ein, mit ihr in 3 %
 * (Testregister TF-KI-041).
 */
export const ERSTZUG_HALTEN = 2;

/** Ob der Spieler der Sicht gerade seinen ersten Zug spielt; nur mit Erweiterung von Belang. */
export function imErstenZug(sicht: Sicht): boolean {
  const { zug } = sicht;
  if (!sicht.erweiterung || zug.spielerIndex !== sicht.ich) return false;
  const eigen = sicht.spieler[sicht.ich];
  const farbkarten = eigen.schlangen.reduce((summe, schlange) => summe + schlange.karten.filter((karte) => karte.typ === 'Farbkarte').length, 0);
  const sonderkarten = eigen.ausgespielteSonderkarten.filter((name) => name !== 'Farbenschutz').length;
  const gespielt = zug.verwendet.reduce((summe, { karteId, kartenart }) => summe + (karteId !== null ? 1 : 0) + (kartenart === 'Farbendieb' ? 1 : 0), 0);
  const diesesZuges = gespielt + (zug.teilzug === 2 ? ERSTER_TEILZUG + RISIKO_KARTEN_JE_SPIELER - eigen.risikoKarten.length : 0);
  return farbkarten + sonderkarten <= diesesZuges;
}

/** Ob der Zug von `vorher` nach `nachher` eine offene oder die eigene geheime Aufgabe erfüllt; erraten aufgedeckte zählen nicht (B2). */
export function loestAufgabe(vorher: Sicht, nachher: Sicht): boolean {
  if (nachher.geheimeAufgabeErfuellt && !vorher.geheimeAufgabeErfuellt) return true;
  const offen = new Set(vorher.offeneAufgaben.map((aufgabe) => aufgabe.id));
  return nachher.spieler[nachher.ich].erfuellteAufgaben.some((aufgabe) => offen.has(aufgabe.id));
}

/** Ob die Aktion eine der Karten einsetzt, die Kriterium 2 im ersten Zug zurückhält: Comeback-Karte, Risiko-Karte, Schlangenkorb. */
export function setztAuslageEin(aktion: SpielAktion): boolean {
  return aktion.typ === 'ComebackEinsetzen' || aktion.typ === 'RisikoKarteSpielen' || aktion.typ === 'SchlangenkorbSpielen';
}
