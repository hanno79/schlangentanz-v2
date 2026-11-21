import type { SpielAktion } from '../../engine';
import { simuliere } from '../sicht';
import type { Sicht, Stellung } from '../sicht';
import { bewerte, eigenePunkte, haltewert, neuerMerker } from './bewertung';
import type { Wertungsmerker } from './bewertung';
import { vorauswahl } from './vorauswahl';

/*
Die Zugsuche der soliden KI (Plan K2, Vorgehen). Sie rechnet die Folgen eines Zuges
auf einem erratenen Zustand durch (`simuliere` aus dem Rahmen) und sieht dabei nur
Sichten, nie einen Zustand (Kriterium 7). Durchgerechnet werden nur Farbkarte, nur
Sonderkarte und beide in jeder Reihenfolge: erst jede Aktion der Vorauswahl, dann
für die besten drei die zweite Karte desselben Zuges. Nach einem Verdoppler beginnt
mit dem zweiten Zug eine neue Suche auf der echten neuen Hand.

Ein Gegner, den eine Sonderkarte trifft, lässt sie in der Rechnung durch; ob er
abwehrt, sieht die KI nicht. Wer selbst gefragt wird, wehrt ab, wenn die Stellung
danach besser ist als mit der Karte.

Feste Regeln neben der Bewertung, Vorgaben des Autors:
- Eine Regenbogenschlange kommt nie in eine gegnerische Schlange, solange die
  Engine eine eigene als Ziel anbietet (Kriterium 3, D9).
- Keine Farbenfusion, die die eigenen Punkte senkt (Kriterium 4).
- Keine Schlangengrube auf einen Spieler, der keinen Zug mehr hat; die Engine
  erlaubt sie (D29), sie bringt aber nichts. Nur wenn nichts anderes geht, spielt
  die KI einen solchen Zug.
- Eine Karte ohne Wirkung gilt etwas weniger als derselbe Stand mit der Karte in
  Wirkung, damit sie nie gewählt wird, wenn ein gleich guter Zug möglich ist (Kriterium 5).

Verletzt jede durchgerechnete erste Aktion eine dieser Regeln, rechnet die Suche
die nächsten nach dem Vorwert durch, bis eine erlaubt ist (Nachlese, höchstens
NACHLESE). Die Zahl der Bewertungen je Schritt ist begrenzt (Kriterium 8): höchstens
ERSTE_AUSWAHL + NACHLESE + ZWEITE_TIEFE × ZWEITE_AUSWAHL + 1.
*/

const ERSTE_AUSWAHL = 16;
const ZWEITE_TIEFE = 3;
const ZWEITE_AUSWAHL = 8;
const NACHLESE = 8;
/** Kriterium 8: mehr Stellungen bewertet die Zugsuche in einem Schritt nie. */
export const GRENZE_BEWERTUNGEN = ERSTE_AUSWAHL + NACHLESE + ZWEITE_TIEFE * ZWEITE_AUSWAHL + 1;
/** Abzug für eine Karte, die nichts bewirkt (Kriterium 5). */
const OHNE_WIRKUNG = 0.05;

export interface Zugplan {
  aktion: SpielAktion;
  /** Wie viele Stellungen die Suche dafür bewertet hat (Kriterium 8). */
  bewertungen: number;
}

interface Folge {
  aktion: SpielAktion;
  stellung: Stellung;
  wert: number;
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

/** Kriterium 3: keine Regenbogenschlange in eine gegnerische Schlange, wenn die Engine eine eigene als Ziel anbietet. */
function regenbogenZumGegner(sicht: Sicht, aktion: SpielAktion, aktionen: readonly SpielAktion[]): boolean {
  if (aktion.typ !== 'RegenbogenschlangeLegen') return false;
  const eigene = new Set(sicht.spieler[sicht.ich].schlangen.map((schlange) => schlange.id));
  return !eigene.has(aktion.schlangenId) && aktionen.some((angeboten) => angeboten.typ === 'RegenbogenschlangeLegen' && eigene.has(angeboten.schlangenId));
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
  let bewertungen = 0;
  const ich = sicht.ich;
  const wurzel = simuliere(sicht, zufall);
  const merker: Wertungsmerker = neuerMerker();

  const werte = (stand: Sicht) => {
    bewertungen += 1;
    return bewerte(stand, merker);
  };

  /** Spielt `aktion` von `stellung` aus durch und bewertet die Sicht danach. */
  const folge = (stellung: Stellung, vorher: Sicht, aktion: SpielAktion): Folge => {
    const nach = folgeVon(stellung, aktion, ich);
    const sichtNach = nach.sicht;
    const wirkungslos = ohneWirkung(aktion, sichtNach);
    const fusionSenkt = aktion.typ === 'FusionLegen' && eigenePunkte(sichtNach, merker) < eigenePunkte(vorher, merker);
    const grubeOhneZug = aktion.typ === 'SchlangengrubeSpielen' && wirkungslos;
    return { aktion, stellung: nach, wert: werte(sichtNach) - (wirkungslos ? OHNE_WIRKUNG : 0), verworfen: fusionSenkt || grubeOhneZug };
  };

  /** Die Karten, die von `stand` aus in Frage kommen, durchgerechnet; mit `nachlese` weitere, solange keine erlaubt ist. */
  const kandidaten = (stellung: Stellung, stand: Sicht, aktionen: readonly SpielAktion[], anzahl: number, nachlese = 0): Folge[] => {
    const karten = aktionen.filter((aktion) => aktion.typ !== 'ZugBeenden' && !regenbogenZumGegner(stand, aktion, aktionen));
    const geordnet = vorauswahl(stand, karten, anzahl, merker);
    const folgen = geordnet.slice(0, anzahl).map((aktion) => folge(stellung, stand, aktion));
    for (const aktion of geordnet.slice(anzahl, anzahl + nachlese)) {
      if (folgen.some((eintrag) => !eintrag.verworfen)) break;
      folgen.push(folge(stellung, stand, aktion));
    }
    return folgen;
  };

  return { wurzel, werte, folge, kandidaten, gezaehlt: () => bewertungen };
}

/** Die beste Folge, bei gleichem Wert die frühere; verworfene nur, wenn es keine andere gibt. */
function beste(folgen: readonly Folge[]): Folge | undefined {
  const erlaubt = folgen.filter((folge) => !folge.verworfen);
  return (erlaubt.length > 0 ? erlaubt : folgen).reduce<Folge | undefined>((bisher, folge) => (bisher === undefined || folge.wert > bisher.wert ? folge : bisher), undefined);
}

/** Karten ausspielen: jede Aktion der Vorauswahl, für die besten drei die zweite Karte, oder den Zug beenden. */
function spiele(sicht: Sicht, aktionen: readonly SpielAktion[], zufall: () => number): Zugplan {
  const suche = erstelleSuche(sicht, zufall);
  const erste = suche.kandidaten(suche.wurzel, sicht, aktionen, ERSTE_AUSWAHL, NACHLESE);
  const vertieft = new Map<Folge, number>();
  const vertiefen = erste
    .filter((folge) => !folge.verworfen && folge.stellung.entscheider === sicht.ich && gleicherZug(folge.stellung.sicht, sicht))
    .sort((a, b) => b.wert - a.wert)
    .slice(0, ZWEITE_TIEFE);
  for (const folge of vertiefen) {
    const zweite = beste(suche.kandidaten(folge.stellung, folge.stellung.sicht, folge.stellung.aktionen(), ZWEITE_AUSWAHL));
    if (zweite !== undefined && !zweite.verworfen) vertieft.set(folge, Math.max(folge.wert, zweite.wert));
  }
  // Der Wert eines Plans ist der seiner besten Fortsetzung im selben Zug.
  const gewaehlt = beste(erste.map((folge) => ({ ...folge, wert: vertieft.get(folge) ?? folge.wert })));
  const beenden = aktionen.find((aktion) => aktion.typ === 'ZugBeenden');
  if (beenden !== undefined && (gewaehlt === undefined || gewaehlt.verworfen || gewaehlt.wert <= suche.werte(sicht))) {
    return { aktion: beenden, bewertungen: suche.gezaehlt() };
  }
  if (gewaehlt === undefined) throw new Error('Zugsuche: Die Engine bietet weder eine Karte noch „Zug beenden“ an.');
  return { aktion: gewaehlt.aktion, bewertungen: suche.gezaehlt() };
}

/** Abwehren oder durchlassen (A6, A7.2): was die Stellung danach besser macht; bei Gleichstand durchlassen. */
function reagiere(sicht: Sicht, aktionen: readonly SpielAktion[], zufall: () => number): Zugplan {
  const suche = erstelleSuche(sicht, zufall);
  const geordnet = [...aktionen.filter(istDurchlassen), ...aktionen.filter((aktion) => !istDurchlassen(aktion))];
  const gewaehlt = beste(geordnet.map((aktion) => suche.folge(suche.wurzel, sicht, aktion)));
  if (gewaehlt === undefined) throw new Error('Zugsuche: Für die Abwehr bietet die Engine keine Aktion an.');
  return { aktion: gewaehlt.aktion, bewertungen: suche.gezaehlt() };
}

/** Überzählige Karten abwerfen (A5): die Wahl, deren Karten auf der Hand am wenigsten wert sind. */
function werfeAb(sicht: Sicht, aktionen: readonly SpielAktion[]): Zugplan {
  const verlust = (aktion: SpielAktion) =>
    aktion.typ !== 'UeberhandAbwerfen' ? 0 : sicht.hand.filter((karte) => aktion.karteIds.includes(karte.id)).reduce((summe, karte) => summe + haltewert(karte, sicht), 0);
  return { aktion: aktionen.reduce((bisher, aktion) => (verlust(aktion) < verlust(bisher) ? aktion : bisher)), bewertungen: 0 };
}

/** Plant den nächsten Schritt aus der Sicht des Entscheiders; die gewählte Aktion ist eine aus `aktionen`. */
export function planeZug(sicht: Sicht, aktionen: readonly SpielAktion[], zufall: () => number): Zugplan {
  const erste = aktionen[0];
  if (erste === undefined) throw new Error('Zugsuche: Es gibt keine Aktion zur Auswahl.');
  if (aktionen.length === 1) return { aktion: erste, bewertungen: 0 };
  if (erste.typ === 'Reagieren') return reagiere(sicht, aktionen, zufall);
  if (erste.typ === 'UeberhandAbwerfen') return werfeAb(sicht, aktionen);
  return spiele(sicht, aktionen, zufall);
}
