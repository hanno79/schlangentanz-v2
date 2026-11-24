import type { SpielAktion } from '../../engine';
import { simuliere } from '../sicht';
import type { Sicht, Stellung } from '../sicht';
import { wehrtAb } from './abwehr';
import { GLEICH, bewerte, eigeneGruppen, eigenePunkte, gruppenwert, haltewert, neuerMerker, sichtbarePunkte } from './bewertung';
import type { Wertungsmerker } from './bewertung';
import { folgeschluessel } from './folgeschluessel';
import { punkteNach, vorauswahl } from './vorauswahl';

/*
Die Zugsuche der soliden KI (Plan K2, Vorgehen). Sie rechnet die Folgen eines Zuges
auf einem erratenen Zustand durch (`simuliere` aus dem Rahmen) und sieht dabei nur
Sichten, nie einen Zustand (Kriterium 7). Durchgerechnet werden nur Farbkarte, nur
Sonderkarte und beide in jeder Reihenfolge: erst jede Aktion der Vorauswahl, dann
für die besten drei die zweite Karte desselben Zuges. Nach einem Verdoppler beginnt
mit dem zweiten Zug eine neue Suche auf der echten neuen Hand.

Ein Gegner, den eine Sonderkarte trifft, lässt sie in der Rechnung durch; ob er
abwehrt, sieht die KI nicht. Eine Risiko-Belohnungs-Karte (A8.2) spielt die solide KI
noch nicht; das lernt sie mit K4. Verlangt die Karte eines Gegners von ihr eine
Wahl, rechnet sie die Wahlen durch wie Karten (X5). Wird sie selbst gefragt, entscheidet `abwehr.ts`
(Plan K3, Kriterium 4).

Feste Regeln neben der Bewertung, Vorgaben des Autors:
- Eine Regenbogenschlange kommt nie in eine gegnerische Schlange, solange die
  Engine eine eigene als Ziel anbietet (Kriterium 3, D9).
- Keine Farbenfusion, die die eigenen Punkte senkt (Kriterium 4).
- Keine Schlangengrube auf einen Spieler, der keinen Zug mehr hat; die Engine
  erlaubt sie (D29), sie bringt aber nichts. Nur wenn nichts anderes geht, spielt
  die KI einen solchen Zug.
- Eine Farbkarte kommt nur dann in eine gegnerische Schlange, wenn keine Farbkarte
  der Hand in einer eigenen Schlange die eigenen Punkte hebt (Plan K3, Kriterium 3).
- Eine Karte ohne Wirkung gilt etwas weniger als derselbe Stand mit der Karte in
  Wirkung, damit sie nie gewählt wird, wenn ein gleich guter Zug möglich ist (Kriterium 5).

Verletzt jede durchgerechnete erste Aktion eine dieser Regeln, rechnet die Suche
die nächsten nach dem Vorwert durch, bis eine erlaubt ist (Nachlese, höchstens
NACHLESE).

Sind zwei durchgerechnete Züge gleich bewertet (Abstand höchstens GLEICH), entscheidet
nicht ihre Reihenfolge, sondern zuerst die Zahl der eigenen Gruppen, dann die Punkte,
die die Sicht schon sicher zeigt (`sichtbarePunkte`, mit erfüllten Aufgaben). So
vollendet die KI eine Gruppe, wenn kein anderer Zug nachweislich besser bewertet ist
(Kriterium 1, K2b), und spielt eine Karte, die sicher Punkte bringt, statt den Zug zu
beenden (Entscheidung des Orchestrators vom 21.11.2026: die KI spielt auf Sieg). Das
gilt für die Wahl zwischen den Plänen, für die zweite Karte und gegen „Zug beenden“;
welche Züge durchgerechnet und vertieft werden, ordnen weiter Vorwert und Bewertung,
damit die Regel nur zwischen gleich guten Plänen entscheidet. Die Bewertung selbst
kennt keine Aufgaben; dass die KI sie gezielt verfolgt, ist Plan K4.

Kriterium 8: Die Suche rechnet je Schritt höchstens GRENZE_SUCHE Stellungen durch
und bewertet sie (ERSTE_AUSWAHL + NACHLESE + ZWEITE_TIEFE × ZWEITE_AUSWAHL + 1).
Die Vorauswahl bewertet dazu jede angebotene Aktion höchstens einmal, ohne
Simulation; beides meldet der Zugplan getrennt.
*/

const ERSTE_AUSWAHL = 16;
const ZWEITE_TIEFE = 3;
const ZWEITE_AUSWAHL = 8;
const NACHLESE = 8;
/** Kriterium 8: mehr Stellungen rechnet die Zugsuche in einem Schritt nie durch. */
export const GRENZE_SUCHE = ERSTE_AUSWAHL + NACHLESE + ZWEITE_TIEFE * ZWEITE_AUSWAHL + 1;
/** Abzug für eine Karte, die nichts bewirkt (Kriterium 5). */
const OHNE_WIRKUNG = 0.05;

/** Wie oft ein Schritt `bewerte` aufgerufen hat (Kriterium 8). */
export interface Bewertungen {
  /** Für Stellungen, die die Suche durchgerechnet hat, und den Stand vor „Zug beenden“. */
  suche: number;
  /** In der Vorauswahl, ohne Simulation. */
  vorauswahl: number;
  /** Wie viele Aktionen der Vorauswahl angeboten waren, über alle Stände des Schritts. */
  angeboten: number;
}

export interface Zugplan {
  aktion: SpielAktion;
  bewertungen: Bewertungen;
}

/** Ein Schritt ohne jede Bewertung; je Aufruf ein neues Objekt, weil eine Strategie auf der Modulebene nichts Veränderliches hält (U5). */
function ohneBewertung(): Bewertungen {
  return { suche: 0, vorauswahl: 0, angeboten: 0 };
}

/** Was beim Vergleich zweier Züge zählt: erst die Bewertung, bei Gleichstand die Zahl der eigenen Gruppen, dann die sicheren Punkte. */
interface Ergebnis {
  wert: number;
  gruppen: number;
  punkte: number;
}

/** Eine durchgerechnete Aktion; `punkte` (`sichtbarePunkte`) und `gruppen` sind die eigenen nach ihr (A9, A11). */
interface Folge extends Ergebnis {
  aktion: SpielAktion;
  stellung: Stellung;
  /** Verletzt die Aktion eine der festen Regeln oben? Dann nur, wenn nichts anderes geht. */
  verworfen: boolean;
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

/** Die ersten `anzahl` Folgen mit verschiedenem Folgeschlüssel, in der gegebenen Reihenfolge. */
function verschiedene(folgen: readonly Folge[], anzahl: number): Folge[] {
  const gesehen = new Set<string>();
  const auswahl: Folge[] = [];
  for (const folge of folgen) {
    const schluessel = folgeschluessel(folge.stellung.sicht);
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    auswahl.push(folge);
    if (auswahl.length === anzahl) break;
  }
  return auswahl;
}

/** Ob gerade derselbe Zug des Spielers läuft, in dem er noch Karten spielt. */
function gleicherZug(sicht: Sicht, vorher: Sicht): boolean {
  const { zug } = sicht;
  return sicht.angesagt === null && zug.spielerIndex === sicht.ich && zug.teilzug === vorher.zug.teilzug && zug.abschnitt === 'Ausspielen';
}

function istDurchlassen(aktion: SpielAktion): boolean {
  return aktion.typ === 'Reagieren' && aktion.farbenschutzId === null;
}

/** Die Stellung nach `aktion`: Fragt die Engine danach Gegner, ob sie eine angesagte Karte abwehren, lassen sie in der Rechnung durch. */
function folgeVon(stellung: Stellung, aktion: SpielAktion, ich: number): Stellung {
  let jetzt = stellung.nach(aktion);
  while (jetzt.entscheider !== null && jetzt.entscheider !== ich) {
    const angeboten = jetzt.aktionen();
    const durchlassen = angeboten.find(istDurchlassen);
    if (durchlassen === undefined || !angeboten.every((eintrag) => eintrag.typ === 'Reagieren')) break;
    jetzt = jetzt.nach(durchlassen);
  }
  return jetzt;
}

/** Die Suche eines Schritts; sie zählt ihre Bewertungen und merkt sich die Wertung gleicher Schlangen. */
function erstelleSuche(sicht: Sicht, zufall: () => number) {
  const bewertungen: Bewertungen = { suche: 0, vorauswahl: 0, angeboten: 0 };
  const ich = sicht.ich;
  const wurzel = simuliere(sicht, zufall);
  const merker: Wertungsmerker = neuerMerker();

  const werte = (stand: Sicht) => {
    bewertungen.suche += 1;
    return bewerte(stand, merker);
  };

  /** Spielt `aktion` von `stellung` aus durch und bewertet die Sicht danach. */
  const folge = (stellung: Stellung, vorher: Sicht, aktion: SpielAktion): Folge => {
    const nach = folgeVon(stellung, aktion, ich);
    const sichtNach = nach.sicht;
    const wirkungslos = ohneWirkung(aktion, sichtNach);
    const fusionSenkt = aktion.typ === 'FusionLegen' && eigenePunkte(sichtNach, merker) < eigenePunkte(vorher, merker);
    const grubeOhneZug = aktion.typ === 'SchlangengrubeSpielen' && wirkungslos;
    const wert = werte(sichtNach) - (wirkungslos ? OHNE_WIRKUNG : 0);
    return { aktion, stellung: nach, wert, punkte: sichtbarePunkte(sichtNach, merker), gruppen: eigeneGruppen(sichtNach, merker), verworfen: fusionSenkt || grubeOhneZug };
  };

  /** Die Karten, die von `stand` aus in Frage kommen, durchgerechnet; mit `nachlese` weitere, solange keine erlaubt ist. */
  const kandidaten = (stellung: Stellung, stand: Sicht, aktionen: readonly SpielAktion[], anzahl: number, nachlese = 0): Folge[] => {
    const gesperrt = zumGegnerGesperrt(stand, aktionen, merker);
    const karten = aktionen.filter((aktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'RisikoKarteSpielen' && !gesperrt(aktion));
    const { geordnet, bewertet } = vorauswahl(stand, karten, anzahl, merker);
    bewertungen.angeboten += karten.length;
    bewertungen.vorauswahl += bewertet;
    const folgen = geordnet.slice(0, anzahl).map((aktion) => folge(stellung, stand, aktion));
    for (const aktion of geordnet.slice(anzahl, anzahl + nachlese)) {
      if (folgen.some((eintrag) => !eintrag.verworfen)) break;
      folgen.push(folge(stellung, stand, aktion));
    }
    return folgen;
  };

  const ergebnis = (stand: Sicht): Ergebnis => ({ wert: werte(stand), punkte: sichtbarePunkte(stand, merker), gruppen: eigeneGruppen(stand, merker) });
  return { wurzel, werte, folge, kandidaten, gezaehlt: () => ({ ...bewertungen }), ergebnis };
}

/**
 * Ob `folge` besser ist als `bisher`: höher bewertet; bei gleicher Bewertung (Abstand
 * höchstens GLEICH) mehr eigene Gruppen, dann mehr sichere Punkte (Kriterium 1, K2b).
 */
function besser(folge: Ergebnis, bisher: Ergebnis): boolean {
  if (Math.abs(folge.wert - bisher.wert) > GLEICH) return folge.wert > bisher.wert;
  if (folge.gruppen !== bisher.gruppen) return folge.gruppen > bisher.gruppen;
  return folge.punkte > bisher.punkte;
}

/** Die beste Folge, bei Gleichstand die frühere; verworfene nur, wenn es keine andere gibt. */
function beste(folgen: readonly Folge[]): Folge | undefined {
  const erlaubt = folgen.filter((folge) => !folge.verworfen);
  return (erlaubt.length > 0 ? erlaubt : folgen).reduce<Folge | undefined>((bisher, folge) => (bisher === undefined || besser(folge, bisher) ? folge : bisher), undefined);
}

/** Karten ausspielen: jede Aktion der Vorauswahl, für die besten drei die zweite Karte, oder den Zug beenden. */
function spiele(sicht: Sicht, aktionen: readonly SpielAktion[], zufall: () => number): Zugplan {
  const suche = erstelleSuche(sicht, zufall);
  const erste = suche.kandidaten(suche.wurzel, sicht, aktionen, ERSTE_AUSWAHL, NACHLESE);
  const vertieft = new Map<Folge, Folge>();
  // Vertieft werden die besten drei verschiedenen Züge; gleichwertige Varianten derselben Folge belegen nur einen Platz.
  const vertiefen = verschiedene(
    erste.filter((folge) => !folge.verworfen && folge.stellung.entscheider === sicht.ich && gleicherZug(folge.stellung.sicht, sicht)).sort((a, b) => b.wert - a.wert),
    ZWEITE_TIEFE,
  );
  for (const folge of vertiefen) {
    const zweite = beste(suche.kandidaten(folge.stellung, folge.stellung.sicht, folge.stellung.aktionen(), ZWEITE_AUSWAHL));
    if (zweite !== undefined && !zweite.verworfen && besser(zweite, folge)) vertieft.set(folge, zweite);
  }
  // Wert und Punkte eines Plans sind die seiner besten Fortsetzung im selben Zug.
  const gewaehlt = beste(
    erste.map((folge) => {
      const plan = vertieft.get(folge) ?? folge;
      return { ...folge, wert: plan.wert, punkte: plan.punkte, gruppen: plan.gruppen };
    }),
  );
  const beenden = aktionen.find((aktion) => aktion.typ === 'ZugBeenden');
  if (beenden !== undefined && (gewaehlt === undefined || gewaehlt.verworfen || !besser(gewaehlt, suche.ergebnis(sicht)))) {
    return { aktion: beenden, bewertungen: suche.gezaehlt() };
  }
  if (gewaehlt === undefined) throw new Error('Zugsuche: Die Engine bietet weder eine Karte noch „Zug beenden“ an.');
  return { aktion: gewaehlt.aktion, bewertungen: suche.gezaehlt() };
}

/**
 * Abwehren oder durchlassen (A6, A7.2, Plan K3 Kriterium 4) nach `wehrtAb`, gerechnet
 * auf je einer Stellung danach. Alle Farbenschutz-Karten wirken gleich; gerechnet wird
 * mit der ersten angebotenen.
 */
function reagiere(sicht: Sicht, aktionen: readonly SpielAktion[], zufall: () => number): Zugplan {
  const durchlassen = aktionen.find(istDurchlassen);
  const abwehren = aktionen.find((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId !== null);
  const schutz = abwehren?.typ === 'Reagieren' ? sicht.hand.find((karte) => karte.id === abwehren.farbenschutzId) : undefined;
  if (durchlassen === undefined || abwehren === undefined || schutz === undefined) {
    throw new Error('Zugsuche: Für die Abwehr bietet die Engine nicht Durchlassen und einen Farbenschutz der eigenen Hand an.');
  }
  const suche = erstelleSuche(sicht, zufall);
  const [durch, abgewehrt] = [durchlassen, abwehren].map((aktion) => suche.folge(suche.wurzel, sicht, aktion));
  const lage = {
    durchgelassen: durch.wert,
    abgewehrt: abgewehrt.wert,
    schutzwert: haltewert(schutz, sicht),
    schlussrunde: sicht.partiephase === 'Schlussrunde',
    gruppenpunkte: { vorher: gruppenwert(sicht.spieler[sicht.ich], sicht.erweiterung), nachher: gruppenwert(durch.stellung.sicht.spieler[sicht.ich], sicht.erweiterung) },
    gruppen: { vorher: eigeneGruppen(sicht), nachher: durch.gruppen },
  };
  return { aktion: wehrtAb(lage) ? abwehren : durchlassen, bewertungen: suche.gezaehlt() };
}

/** Überzählige Karten abwerfen (A5): die Wahl, deren Karten auf der Hand am wenigsten wert sind. */
function werfeAb(sicht: Sicht, aktionen: readonly SpielAktion[]): Zugplan {
  const verlust = (aktion: SpielAktion) =>
    aktion.typ !== 'UeberhandAbwerfen' ? 0 : sicht.hand.filter((karte) => aktion.karteIds.includes(karte.id)).reduce((summe, karte) => summe + haltewert(karte, sicht), 0);
  return { aktion: aktionen.reduce((bisher, aktion) => (verlust(aktion) < verlust(bisher) ? aktion : bisher)), bewertungen: ohneBewertung() };
}

/** Plant den nächsten Schritt aus der Sicht des Entscheiders; die gewählte Aktion ist eine aus `aktionen`. */
export function planeZug(sicht: Sicht, aktionen: readonly SpielAktion[], zufall: () => number): Zugplan {
  const erste = aktionen[0];
  if (erste === undefined) throw new Error('Zugsuche: Es gibt keine Aktion zur Auswahl.');
  if (aktionen.length === 1) return { aktion: erste, bewertungen: ohneBewertung() };
  if (erste.typ === 'Reagieren') return reagiere(sicht, aktionen, zufall);
  if (erste.typ === 'UeberhandAbwerfen') return werfeAb(sicht, aktionen);
  return spiele(sicht, aktionen, zufall);
}
