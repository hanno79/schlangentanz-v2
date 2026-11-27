import type { SpielAktion } from '../../engine';
import { offeneAufgabenIds, simuliere } from '../sicht';
import type { Sicht, SpielerSicht, Stellung } from '../sicht';
import { GLEICH, bewerte, eigeneGruppen, eigenePunkte, neuerMerker, sichtbarePunkte } from './bewertung';
import type { Wertungsmerker } from './bewertung';
import { aufgabenkorrektur, ohneGerateneAufgaben } from './erweiterungswert';
import { kartensaetze, mitHand, mittel, schaetzwert } from './schaetzung';
import type { Schaetzrechnung } from './schaetzung';
import { punkteNach, vorauswahl } from './vorauswahl';
import { ziehtVerdeckt } from './ziehen';

/*
Die Suche eines Schritts der soliden KI (Plan K2): Sie rechnet Aktionen auf einem
erratenen Zustand durch (`simuliere` aus dem Rahmen), bewertet die Sicht danach und
zählt dabei jede Bewertung (Kriterium 8). Die Pläne, welche Aktionen durchgerechnet
werden, macht `zugsuche.ts`.

Bewertet wird eine Stellung mit `bewerte` und, mit Erweiterung, mit den bekannten
Aufgaben, die der Spieler dort erfüllt, aber noch nicht eingelöst hat (Plan K4): etwa
„Farbenpracht“, die erst am Zugende zählt (D59), oder eine Aufgabe, die eine Karte
ausserhalb seines Zuges erfüllt hat und die er zu Beginn seines Zuges einlöst (A9).
Was er schon eingelöst hat, zählt `bewerte` selbst, ausser was die Simulation nur
geraten aufgedeckt hat, bei ihm wie bei jedem Gegner (`ohneGerateneAufgaben`), auch
nicht unter den sicheren Punkten.

Zieht eine Wahl über eine Risiko-Karte verdeckt vom Stapel (D52, D54: „oberste
Stapelkarte“), läge in der Simulation die eine erratene Karte auf der Hand. Statt
ihrer mittelt die Suche dann über Karten aus den ungesehenen (`schaetzung.ts`), damit
die Wahl nicht am Zufall der KI hängt; mit einer solchen Stellung plant sie nicht weiter.
*/

/** Abzug für eine Karte, die nichts bewirkt (K2, Kriterium 5). */
const OHNE_WIRKUNG = 0.05;

/** Wie oft ein Schritt `bewerte` aufgerufen hat (Kriterium 8). */
export interface Bewertungen {
  /** Für Stellungen, die die Suche durchgerechnet hat, und den Stand vor „Zug beenden“. */
  suche: number;
  /** In der Vorauswahl, ohne Simulation. */
  vorauswahl: number;
  /** Wie viele Aktionen der Vorauswahl angeboten waren, über alle Stände des Schritts. */
  angeboten: number;
  /** Für geschätzte Ausgänge verdeckter Karten, ohne Simulation (`schaetzung.ts`: Risiko-Karten, verdecktes Ziehen). */
  schaetzung: number;
}

/** Ein Schritt ohne jede Bewertung; je Aufruf ein neues Objekt, weil eine Strategie auf der Modulebene nichts Veränderliches hält (U5). */
export function ohneBewertung(): Bewertungen {
  return { suche: 0, vorauswahl: 0, angeboten: 0, schaetzung: 0 };
}

/** Was beim Vergleich zweier Züge zählt: erst die Bewertung, bei Gleichstand die Zahl der eigenen Gruppen, dann die sicheren Punkte. */
export interface Ergebnis {
  wert: number;
  gruppen: number;
  punkte: number;
}

/** Eine durchgerechnete Aktion; `punkte` (`sichtbarePunkte`) und `gruppen` sind die eigenen nach ihr (A9, A11). */
export interface Folge extends Ergebnis {
  aktion: SpielAktion;
  stellung: Stellung;
  /** Verletzt die Aktion eine der festen Regeln aus `zugsuche.ts`? Dann nur, wenn nichts anderes geht. */
  verworfen: boolean;
  /** Über verdeckt gezogene Karten geschätzt: Die Stellung enthält eine erratene Karte und taugt nicht zum Weiterplanen. */
  geschaetzt: boolean;
}

/**
 * Ob eine Karte nichts bewirkt hat: wirkungslos abgelegt (D13, D25), oder eine
 * Schlangengrube, die gleich auf dem Ablagestapel liegt statt vor dem Getroffenen,
 * weil er keinen Zug mehr hat (D29).
 */
function ohneWirkung(aktion: SpielAktion, nachher: Sicht): boolean {
  if (aktion.typ === 'SonderkarteWirkungslosAblegen') return true;
  return aktion.typ === 'SchlangengrubeSpielen' && !nachher.ausliegendeGruben.some((grube) => grube.karte.id === aktion.karteId);
}

/**
 * Die festen Regeln zum Ziel, einmal je Stand ausgewertet; die Antwort sagt, ob eine
 * Aktion gesperrt ist. Gesperrt ist eine Regenbogenschlange in eine gegnerische
 * Schlange, wenn die Engine eine eigene als Ziel anbietet (K2, Kriterium 3, D9), und
 * eine Farbkarte in eine gegnerische Schlange, solange eine angebotene Farbkarte in
 * eine eigene Schlange die eigenen Punkte hebt (K3, Kriterium 3).
 */
function zumGegnerGesperrt(sicht: Sicht, aktionen: readonly SpielAktion[], merker: Wertungsmerker): (aktion: SpielAktion) => boolean {
  const eigene = new Set(sicht.spieler[sicht.ich].schlangen.map((schlange) => schlange.id));
  const zumGegner = (aktion: SpielAktion) =>
    aktion.typ === 'RegenbogenschlangeLegen' ? !eigene.has(aktion.schlangenId) : aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && !eigene.has(aktion.ziel.schlangenId);
  const regenbogenEigen = aktionen.some((aktion) => aktion.typ === 'RegenbogenschlangeLegen' && !zumGegner(aktion));
  const farbeStoert = aktionen.some((aktion) => aktion.typ === 'FarbkarteLegen' && zumGegner(aktion));
  const vorher = farbeStoert ? eigenePunkte(sicht, merker) : 0;
  const farbeHebt = farbeStoert && aktionen.some((aktion) => aktion.typ === 'FarbkarteLegen' && !zumGegner(aktion) && punkteNach(sicht, aktion, merker) > vorher);
  return (aktion) => zumGegner(aktion) && (aktion.typ === 'RegenbogenschlangeLegen' ? regenbogenEigen : farbeHebt);
}

export function istDurchlassen(aktion: SpielAktion): boolean {
  return aktion.typ === 'Reagieren' && aktion.farbenschutzId === null;
}

/**
 * Die Stellung nach `aktion`: Fragt die Engine danach Gegner, ob sie eine angesagte
 * Karte abwehren, lassen sie in der Rechnung durch. Muss ein Gegner über eine
 * Risiko-Karte entscheiden (D52, D54), nimmt er in der Rechnung die erste Wahl der
 * Engine, bei Aktion 2 also die geplante Farbkarte.
 */
function folgeVon(stellung: Stellung, aktion: SpielAktion, ich: number): Stellung {
  let jetzt = stellung.nach(aktion);
  while (jetzt.entscheider !== null && jetzt.entscheider !== ich) {
    const angeboten = jetzt.aktionen();
    const antwort = angeboten.every((eintrag) => eintrag.typ === 'Reagieren') ? angeboten.find(istDurchlassen) : angeboten.every((eintrag) => eintrag.typ === 'Entscheiden') ? angeboten[0] : undefined;
    if (antwort === undefined) break;
    jetzt = jetzt.nach(antwort);
  }
  return jetzt;
}

/** Die Suche eines Schritts; sie zählt ihre Bewertungen und merkt sich die Wertung gleicher Schlangen. */
export function erstelleSuche(sicht: Sicht, zufall: () => number) {
  const bewertungen = ohneBewertung();
  const ich = sicht.ich;
  const wurzel = simuliere(sicht, zufall);
  const merker: Wertungsmerker = neuerMerker();
  const bekannt = offeneAufgabenIds(sicht);
  /** Was die Aufgaben einer Stellung oder einer geschätzten Sicht von ihr aus zu `bewerte` beitragen (siehe oben). */
  const aufgaben = (stellung: Stellung) => (eigen: SpielerSicht) => aufgabenkorrektur(eigen, stellung.erfuellbar(eigen), bekannt);

  /** Die Bewertung einer Stellung, mit den Aufgaben, die dort noch einzulösen sind. */
  const werte = (stellung: Stellung) => {
    bewertungen.suche += 1;
    const stand = ohneGerateneAufgaben(stellung.sicht, bekannt);
    return bewerte(stand, merker) + aufgaben(stellung)(stand.spieler[ich]);
  };
  /** Die sicheren Punkte, ohne geraten aufgedeckte Aufgaben. */
  const sicher = (stand: Sicht) => sichtbarePunkte(ohneGerateneAufgaben(stand, bekannt), merker);
  /** Die sicheren Punkte samt den Aufgaben, die dort erfüllt und noch nicht eingelöst sind (D59 „Farbenpracht“ zählt erst am Zugende). */
  const mitAufgaben = (stellung: Stellung, stand: Sicht) => sicher(stand) + aufgaben(stellung)(ohneGerateneAufgaben(stand, bekannt).spieler[ich]);
  /** Die Schätzung von `stellung` aus: ungesehen ist, was an der Wurzel ungesehen ist; die Aufgaben prüft sie von `stellung` aus, damit eine dort schon eingelöste nicht ein zweites Mal zählt. */
  const schaetzrechnungAb = (stellung: Stellung): Schaetzrechnung => ({
    stellung: wurzel,
    merker,
    aufgaben: aufgaben(stellung),
    zaehle: () => {
      bewertungen.schaetzung += 1;
    },
  });
  const schaetzrechnung = schaetzrechnungAb(wurzel);
  /** Die Bewertung nach einer Wahl, die verdeckt Karten auf die eigene Hand zieht: über Karten aus den ungesehenen gemittelt (siehe oben). */
  const ohneErratene = (stellung: Stellung, vorher: Sicht, nach: Stellung): number | null => {
    const ungesehen = wurzel.ungesehen();
    const ids = new Set(ungesehen.map((karte) => karte.id));
    const erraten = nach.sicht.hand.filter((karte) => ids.has(karte.id) && !vorher.hand.some((eintrag) => eintrag.id === karte.id));
    if (erraten.length === 0) return null;
    const weg = new Set(erraten.map((karte) => karte.id));
    const stand = ohneGerateneAufgaben(nach.sicht, bekannt);
    const wert = schaetzwert(schaetzrechnungAb(stellung));
    return mittel(kartensaetze(ungesehen, erraten.length).map((karten) => wert(mitHand(stand, karten, weg))));
  };

  /** Spielt `aktion` von `stellung` aus durch und bewertet die Sicht danach. */
  const folge = (stellung: Stellung, vorher: Sicht, aktion: SpielAktion): Folge => {
    const nach = folgeVon(stellung, aktion, ich);
    const sichtNach = nach.sicht;
    const wirkungslos = ohneWirkung(aktion, sichtNach);
    // Kriterium 4 mit den Punkten einer Aufgabe, die die Fusion erfüllt, auch einer, die erst am Zugende zählt (K4, Kriterium 1).
    const fusionSenkt = aktion.typ === 'FusionLegen' && mitAufgaben(nach, sichtNach) < mitAufgaben(stellung, vorher);
    const grubeOhneZug = aktion.typ === 'SchlangengrubeSpielen' && wirkungslos;
    const geschaetzt = aktion.typ === 'Entscheiden' ? ohneErratene(stellung, vorher, nach) : null;
    const wert = (geschaetzt ?? werte(nach)) - (wirkungslos ? OHNE_WIRKUNG : 0);
    return { aktion, stellung: nach, wert, punkte: sicher(sichtNach), gruppen: eigeneGruppen(sichtNach, merker), verworfen: fusionSenkt || grubeOhneZug, geschaetzt: geschaetzt !== null };
  };

  /**
   * Die Karten, die von `stand` aus in Frage kommen, durchgerechnet; mit `nachlese` weitere, solange keine erlaubt ist.
   * Was eine verdeckte Karte entscheidet, schätzen `risiko.ts` und `ziehen.ts`.
   */
  const kandidaten = (stellung: Stellung, stand: Sicht, aktionen: readonly SpielAktion[], anzahl: number, nachlese = 0): Folge[] => {
    const gesperrt = zumGegnerGesperrt(stand, aktionen, merker);
    const karten = aktionen.filter((aktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'RisikoKarteSpielen' && !ziehtVerdeckt(aktion) && !gesperrt(aktion));
    const { geordnet, bewertet } = vorauswahl(stand, karten, anzahl, merker, aufgaben(stellung));
    bewertungen.angeboten += karten.length;
    bewertungen.vorauswahl += bewertet;
    const folgen = geordnet.slice(0, anzahl).map((aktion) => folge(stellung, stand, aktion));
    for (const aktion of geordnet.slice(anzahl, anzahl + nachlese)) {
      if (folgen.some((eintrag) => !eintrag.verworfen)) break;
      folgen.push(folge(stellung, stand, aktion));
    }
    return folgen;
  };

  const ergebnis = (stellung: Stellung): Ergebnis => ({ wert: werte(stellung), punkte: sicher(stellung.sicht), gruppen: eigeneGruppen(stellung.sicht, merker) });
  return { wurzel, schaetzrechnung, schaetzrechnungAb, folge, kandidaten, ergebnis, gezaehlt: () => ({ ...bewertungen }) };
}

/**
 * Ob `folge` besser ist als `bisher`: höher bewertet; bei gleicher Bewertung (Abstand
 * höchstens GLEICH) mehr eigene Gruppen, dann mehr sichere Punkte (Kriterium 1, K2b).
 */
export function besser(folge: Ergebnis, bisher: Ergebnis): boolean {
  if (Math.abs(folge.wert - bisher.wert) > GLEICH) return folge.wert > bisher.wert;
  if (folge.gruppen !== bisher.gruppen) return folge.gruppen > bisher.gruppen;
  return folge.punkte > bisher.punkte;
}

/** Die beste Folge, bei Gleichstand die frühere; verworfene nur, wenn es keine andere gibt. */
export function beste(folgen: readonly Folge[]): Folge | undefined {
  const erlaubt = folgen.filter((folge) => !folge.verworfen);
  return (erlaubt.length > 0 ? erlaubt : folgen).reduce<Folge | undefined>((bisher, folge) => (bisher === undefined || besser(folge, bisher) ? folge : bisher), undefined);
}
