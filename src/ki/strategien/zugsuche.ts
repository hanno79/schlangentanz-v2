import type { SpielAktion } from '../../engine';
import type { Sicht } from '../sicht';
import { wehrtAb } from './abwehr';
import { GLEICH, eigeneGruppen, gruppenwert, haltewert } from './bewertung';
import { ERSTZUG_HALTEN, imErstenZug, loestAufgabe, setztAuslageEin } from './eroeffnung';
import { folgeschluessel } from './folgeschluessel';
import { waehleRisiko } from './risiko';
import { besser, beste, erstelleSuche, istDurchlassen, ohneBewertung } from './suche';
import type { Bewertungen, Folge } from './suche';
import { erweitertZug } from './vorauswahl';
import { schaetzeZiehen } from './ziehen';

/*
Die Zugsuche der soliden KI (Plan K2, Vorgehen). Sie rechnet die Folgen eines Zuges
auf einem erratenen Zustand durch (`suche.ts`) und sieht dabei nur Sichten, nie einen
Zustand (Kriterium 7). Durchgerechnet werden nur Farbkarte, nur Sonderkarte und beide
in jeder Reihenfolge: erst jede Aktion der Vorauswahl, dann für die besten drei die
zweite Karte desselben Zuges. Nach einem Verdoppler beginnt mit dem zweiten Zug eine
neue Suche auf der echten neuen Hand.

Mit Erweiterung (Plan K4): Die Bewertung kennt Aufgaben, Auslage und eine Hand über 5
Karten (`erweiterungswert.ts`). Eine Aktion, die nur den Zug erweitert (Comeback-Karte,
Korb „aktionen“), bringt erst mit den Karten danach etwas; die beste davon wird deshalb
immer vertieft, auch ausserhalb der besten drei, und zwei Karten weit. Ebenso immer
vertieft wird die beste Aktion, die eine Aufgabe erfüllt (Kriterium 1). Im ersten Zug
setzt die KI Comeback-Karte, Risiko-Karte und Schlangenkorb nur mit Gruppe, Aufgabe oder
deutlich höherer Bewertung ein (`eroeffnung.ts`, Kriterium 2). Was eine
verdeckte Karte entscheidet, rechnet die Suche nicht auf dem erratenen Zustand durch,
sondern schätzt es mit den offenen Wahrscheinlichkeiten: Risiko-Karten (`risiko.ts`)
und verdecktes Ziehen (`ziehen.ts`). Bringt eine Risiko-Karte im Erwartungswert mehr,
als sie in der Auslage wert ist, spielt die KI sie vor den übrigen Karten; verdeckt
zieht sie, wenn die Schätzung über ihrem besten Plan liegt. Ein Gegner,
den eine Sonderkarte trifft, lässt sie in der Rechnung durch; ob er abwehrt, sieht die
KI nicht. Verlangt die Karte eines Gegners von ihr eine Wahl, rechnet sie die Wahlen
durch wie Karten (X5). Wird sie selbst gefragt, entscheidet `abwehr.ts` (Plan K3,
Kriterium 4).

Feste Regeln neben der Bewertung, Vorgaben des Autors (`suche.ts`):
- Eine Regenbogenschlange kommt nie in eine gegnerische Schlange, solange die
  Engine eine eigene als Ziel anbietet (Kriterium 3, D9).
- Keine Farbenfusion, die die eigenen Punkte samt erfüllter Aufgaben senkt (Kriterium 4).
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
damit die Regel nur zwischen gleich guten Plänen entscheidet.

Kriterium 8: Die Suche rechnet je Schritt höchstens GRENZE_SUCHE Stellungen durch
und bewertet sie (ERSTE_AUSWAHL + NACHLESE + (ZWEITE_TIEFE + 1) × ZWEITE_AUSWAHL +
DRITTE_AUSWAHL + 1). Die Vorauswahl bewertet dazu jede angebotene Aktion höchstens
einmal, ohne Simulation, ebenso die Schätzung der Risiko-Karten; alles meldet der
Zugplan getrennt.
*/

const ERSTE_AUSWAHL = 16;
const ZWEITE_TIEFE = 3;
const ZWEITE_AUSWAHL = 8;
/** Die dritte Karte, nur nach der besten Aktion, die den Zug erweitert. */
const DRITTE_AUSWAHL = 4;
const NACHLESE = 8;
/** Kriterium 8: mehr Stellungen rechnet die Zugsuche in einem Schritt nie durch. */
export const GRENZE_SUCHE = ERSTE_AUSWAHL + NACHLESE + (ZWEITE_TIEFE + 1) * ZWEITE_AUSWAHL + DRITTE_AUSWAHL + 1;

export interface Zugplan {
  aktion: SpielAktion;
  bewertungen: Bewertungen;
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

/** Karten ausspielen: Risiko-Karte, wenn sie sich lohnt; sonst jede Aktion der Vorauswahl, für die besten die nächste Karte, oder den Zug beenden. */
function spiele(sicht: Sicht, aktionen: readonly SpielAktion[], zufall: () => number): Zugplan {
  const suche = erstelleSuche(sicht, zufall);
  const risiko = waehleRisiko(sicht, aktionen, suche.schaetzrechnung);
  if (risiko !== null) return { aktion: risiko, bewertungen: suche.gezaehlt() };
  const weiter = (folge: Folge) => !folge.verworfen && !folge.geschaetzt && folge.stellung.entscheider === sicht.ich && gleicherZug(folge.stellung.sicht, sicht);
  const naechste = (folge: Folge, anzahl: number) => beste(suche.kandidaten(folge.stellung, folge.stellung.sicht, folge.stellung.aktionen(), anzahl));
  const erste = suche.kandidaten(suche.wurzel, sicht, aktionen, ERSTE_AUSWAHL, NACHLESE);
  const offen = erste.filter(weiter).sort((a, b) => b.wert - a.wert);
  // Vertieft werden die besten drei verschiedenen Züge; gleichwertige Varianten derselben Folge belegen nur einen Platz.
  // Dazu immer die beste Aktion, die den Zug erweitert, und die beste, die eine Aufgabe erfüllt (Kriterium 1); zusammen höchstens ZWEITE_TIEFE + 1.
  const vorn = verschiedene(offen, ZWEITE_TIEFE);
  const erweiternd = offen.find((folge) => erweitertZug(folge.aktion));
  const erfuellend = offen.find((folge) => loestAufgabe(sicht, folge.stellung.sicht));
  const dazu = [erweiternd, erfuellend === erweiternd ? undefined : erfuellend].filter((folge): folge is Folge => folge !== undefined && !vorn.includes(folge));
  const vertiefen = [...vorn.slice(0, ZWEITE_TIEFE + 1 - dazu.length), ...dazu];
  const vertieft = new Map<Folge, Folge>();
  for (const folge of vertiefen) {
    const zweite = naechste(folge, ZWEITE_AUSWAHL);
    // Nach Comeback oder Korb „aktionen“ ist auch „Zwei Karten abwerfen, drei ziehen“ eine Fortsetzung (A8.1, D46, D49); geschätzt wie an der Wurzel, die Aufgaben von der Folge aus.
    const gezogen = folge === erweiternd ? schaetzeZiehen(folge.stellung.sicht, folge.stellung.aktionen(), suche.schaetzrechnungAb(folge.stellung)) : null;
    const ziehen = gezogen === null ? undefined : { ...folge, wert: gezogen.wert, geschaetzt: true };
    const karte = zweite === undefined || zweite.verworfen || !besser(zweite, folge) ? undefined : zweite;
    const dritte = karte !== undefined && folge === erweiternd && weiter(karte) ? naechste(karte, DRITTE_AUSWAHL) : undefined;
    const fortsetzung = dritte !== undefined && karte !== undefined && !dritte.verworfen && besser(dritte, karte) ? dritte : karte;
    const plan = ziehen !== undefined && besser(ziehen, fortsetzung ?? folge) ? ziehen : fortsetzung;
    if (plan !== undefined) vertieft.set(folge, plan);
  }
  const beenden = aktionen.find((aktion) => aktion.typ === 'ZugBeenden');
  const erster = imErstenZug(sicht);
  const halten = beenden !== undefined || erster ? suche.ergebnis(suche.wurzel) : undefined;
  // Kriterium 2: im ersten Zug Comeback-Karte und Schlangenkorb nur mit Gruppe, Aufgabe oder deutlich höherer Bewertung (`eroeffnung.ts`).
  const erstzug = erster ? halten : undefined;
  const lohnt = (folge: Folge, plan: Folge) =>
    erstzug === undefined || !setztAuslageEin(folge.aktion) || plan.gruppen > erstzug.gruppen || loestAufgabe(sicht, plan.stellung.sicht) || plan.wert > erstzug.wert + ERSTZUG_HALTEN;
  // Wert und Punkte eines Plans sind die seiner besten Fortsetzung im selben Zug.
  const plaene = erste.map((folge) => {
    const plan = vertieft.get(folge) ?? folge;
    return { folge: { ...folge, wert: plan.wert, punkte: plan.punkte, gruppen: plan.gruppen }, erlaubt: lohnt(folge, plan) };
  });
  const gewaehlt = beste(plaene.filter((eintrag) => eintrag.erlaubt).map((eintrag) => eintrag.folge)) ?? beste(plaene.map((eintrag) => eintrag.folge));
  let plan: { aktion: SpielAktion; wert: number } | undefined = gewaehlt;
  if (beenden !== undefined && halten !== undefined) {
    if (gewaehlt === undefined || gewaehlt.verworfen || !besser(gewaehlt, halten)) plan = { aktion: beenden, wert: halten.wert };
  }
  // Verdecktes Ziehen nur, wenn es nach der Schätzung mehr bringt als der beste Plan (`ziehen.ts`), im ersten Zug mehr als ERSTZUG_HALTEN über dem Halten.
  const ziehen = schaetzeZiehen(sicht, aktionen, suche.schaetzrechnung);
  if (ziehen !== null && (plan === undefined || ziehen.wert > plan.wert + GLEICH) && (erstzug === undefined || ziehen.wert > erstzug.wert + ERSTZUG_HALTEN)) {
    return { aktion: ziehen.aktion, bewertungen: suche.gezaehlt() };
  }
  if (plan === undefined) throw new Error('Zugsuche: Die Engine bietet weder eine Karte noch „Zug beenden“ an.');
  return { aktion: plan.aktion, bewertungen: suche.gezaehlt() };
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
