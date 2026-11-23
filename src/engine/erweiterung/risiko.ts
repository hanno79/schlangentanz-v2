import type { Ereignis, RisikoKarteSpielenAktion, Risikoaktion } from '../aktionen/typen';
import { trageEntscheidungenEin } from '../entscheidungsregister';
import type { EntscheidungsDefinition } from '../entscheidungsregister';
import { farbkarte } from '../karten/farbkarte';
import { kartenartVon } from '../karten/register';
import { wirkeUndMeldeVersetzte } from '../kartenorte';
import { verlangeEntscheidung } from '../reaktion';
import { deckeAuf, zieheVomStapel } from '../stapel';
import type { FarbkarteInfo, OffeneEntscheidung, Spieler, Spielkarte, Spielzustand } from '../types';
import { entnehmeHandkarte, mitspielerImUhrzeigersinn, spielerIndexVon } from '../zugablauf';
import { einmalJeRundeGesperrt, merkeEinmalJeRunde } from '../zuggrenzen';

/*
Die Risiko-Belohnungs-Karten (A8.2, X5). Jeder Spieler hat mit Erweiterung
zwei offen vor sich (A4). In seinem Zug spielt er höchstens eine je Runde; der
zweite Zug nach einem Verdoppler gehört zur selben Runde (D50, Grenze in
`zuggrenzen.ts`). Der Einsatz zählt nicht als reguläre Aktion: Er belegt keinen
Platz des Zuges und ist keine Zugerweiterung (A8.2, D47). Die Karte kommt aus
dem Spiel und liegt nie auf einem Ablagestapel (D54).

Gespielt wird mit Ansage (B2): welche der vier Aktionen und, bei Aktion 2 und
3, welche Karte. Dann wird die oberste Karte des Nachziehstapels offen
aufgedeckt; eine Farbkarte heisst Erfolg, eine Sonderkarte Misserfolg (bei
Aktion 3 zählt auch der Punktewert). Bei leerem Stapel und in der Schlussrunde
ist keine Risiko-Karte spielbar (D55). Nimmt die Aktion die letzte Karte,
beginnt die Schlussrunde, ausgelöst vom Spieler am Zug, auch wenn ein Gegner
sie gezogen hat (D55, `stapel.ts`).

Wo eine Wahl nötig ist, verlangt die Wirkung eine Entscheidung (X3): Bei
Misserfolg wählt der Spieler am Zug frei den begünstigten Gegner, und wo der
Gegner eine Wahl hat, trifft er sie selbst (D52, D54). Wahlen aus der eigenen
Hand stehen verdeckt (`verdeckteWahlen`), damit keine Entscheidung eine
Handkarte verrät (B2). Offen ist die Farbkarte, die der Spieler für Aktion 2
benennt: Benennen ist eine Ansage wie in A6 („Der Spieler benennt das Ziel“),
wie bei Aktion 3, und der begünstigte Gegner wählt zwischen ihr und der
obersten Stapelkarte (D52). Sie steht deshalb in der Ansage und in der
Entscheidung (`offeneHandkarte`).

Annahmen, die Teil A und D nicht ausdrücklich hergeben, stehen im PR von X5:
Aktion 2 braucht eine eigene Schlange; bei Aktion 3 darf der Spieler auf den
Tausch verzichten („Du darfst den Tausch ausführen“).
*/

/** D50: So heisst die Risiko-Karte in der Runde des Zuges. */
const RISIKO = 'Risiko-Belohnung';

/** A8.2: die vier Aktionen mit ihrem Namen auf der Website. */
const RISIKOAKTIONEN: Readonly<Record<Risikoaktion, string>> = {
  1: 'Zusätzliche Karten ziehen',
  2: 'Zusätzliche Farbkarte spielen',
  3: 'Karten tauschen',
  4: 'Karten aus dem Ablagestapel oder Nachziehstapel nehmen',
};

/** „Aktion 2 (Zusätzliche Farbkarte spielen)“, für Protokolle und Knöpfe. */
export function risikoaktionText(nummer: Risikoaktion): string {
  return `Aktion ${nummer} (${RISIKOAKTIONEN[nummer]})`;
}

export function istRisikoaktion(wert: unknown): wert is Risikoaktion {
  return wert === 1 || wert === 2 || wert === 3 || wert === 4;
}

/** Die Arten der Risiko-Entscheidungen im Entscheidungsregister. */
const GEGNERWAHL = 'Risiko: begünstigten Gegner wählen';
const GEPLANTE_ODER_STAPEL = 'Risiko: geplante Farbkarte oder oberste Stapelkarte';
const ABLAGE_ODER_STAPEL = 'Risiko: Karte vom eigenen Ablagestapel oder oberste Stapelkarte';
const ANLEGEN = 'Risiko: zusätzliche Farbkarte anlegen';
const TAUSCH = 'Risiko: Farbkarte der Hand zum Tauschen wählen';
const SEITE = 'Risiko: aufgedeckte Karte davor oder dahinter legen';

const STAPEL = 'stapel';
const KEIN_TAUSCH = 'kein Tausch';
const ABLAGE = 'ablagestapel-';

/** Die Stelle im Ablagestapel, die eine Wahl „ablagestapel-n“ nennt (A8.2 Aktion 4), sonst `null`. */
export function ablagestapelStelle(wahl: string): number | null {
  return wahl.startsWith(ABLAGE) ? Number(wahl.slice(ABLAGE.length)) : null;
}

function istFarbkarte(karte: Spielkarte): karte is FarbkarteInfo {
  return karte.typ === 'Farbkarte';
}

/** „stapel“, solange der Nachziehstapel eine Karte hat (D55); aus leerem Stapel zieht niemand. */
function stapelOption(zustand: Spielzustand): string[] {
  return zustand.nachziehstapel.length > 0 ? [STAPEL] : [];
}

/** D52: Für Aktion 2 benennbar ist jede Farbkarte der Hand, wenn es eine eigene Schlange gibt, an die sie darf (Annahme, siehe oben). */
function planbareFarbkarten(spieler: Spieler): FarbkarteInfo[] {
  return spieler.schlangen.length === 0 ? [] : spieler.hand.filter(istFarbkarte);
}

/** A8.2 Aktion 3: jede Farbkarte, die offen in einer eigenen Schlange liegt; die unter einer Farbenfusion nicht. */
function tauschbareSchlangenkarten(spieler: Spieler): FarbkarteInfo[] {
  return spieler.schlangen.flatMap((schlange) => schlange.karten.filter(istFarbkarte));
}

/** Die Farbkarte `karteId` in einer eigenen Schlange, oder `undefined`. */
function eigeneSchlangenkarte(spieler: Spieler, karteId: string | null): FarbkarteInfo | undefined {
  for (const schlange of spieler.schlangen) {
    const karte = schlange.karten.find((eintrag) => eintrag.id === karteId);
    if (karte !== undefined) return istFarbkarte(karte) ? karte : undefined;
  }
  return undefined;
}

/** D50, D55: Der Grund, warum in diesem Zug keine Risiko-Karte geht, oder `null`. */
function rundensperre(zustand: Spielzustand): string | null {
  if (zustand.partiephase !== 'Laufend' || zustand.nachziehstapel.length === 0) {
    return 'In der Schlussrunde und bei leerem Nachziehstapel ist keine Risiko-Belohnungs-Karte spielbar; es gibt keine Karte zum Aufdecken (D55).';
  }
  return einmalJeRundeGesperrt(zustand.zug, RISIKO);
}

/**
 * A8.2: Was der Spieler am Zug jetzt mit einer Risiko-Karte spielen darf; je
 * Aktion und benannter Karte eine Aktion. Beide Karten wirken gleich; angeboten
 * wird die erste, damit keine Aktion doppelt dasteht. Spielen darf er jede
 * eigene (`pruefeRisikoKarte`).
 */
export function risikoAktionen(zustand: Spielzustand, spielerIndex: number): RisikoKarteSpielenAktion[] {
  const spieler = zustand.spieler[spielerIndex];
  const karte = spieler.risikoKarten[0];
  if (karte === undefined || rundensperre(zustand) !== null) return [];
  const basis = { typ: 'RisikoKarteSpielen', spielerId: spieler.id, risikoKarteId: karte.id } as const;
  return [
    { ...basis, risikoAktion: 1, benannt: null },
    ...planbareFarbkarten(spieler).map((benannt): RisikoKarteSpielenAktion => ({ ...basis, risikoAktion: 2, benannt: benannt.id })),
    ...tauschbareSchlangenkarten(spieler).map((benannt): RisikoKarteSpielenAktion => ({ ...basis, risikoAktion: 3, benannt: benannt.id })),
    { ...basis, risikoAktion: 4, benannt: null },
  ];
}

/** Der Grund, warum diese Risiko-Aktion nicht geht, oder `null`. Wer am Zug ist und ob eine Entscheidung offen ist, prüft die Aktionsschicht. */
export function pruefeRisikoKarte(zustand: Spielzustand, spielerIndex: number, aktion: RisikoKarteSpielenAktion): string | null {
  const spieler = zustand.spieler[spielerIndex];
  if (!spieler.risikoKarten.some((karte) => karte.id === aktion.risikoKarteId)) {
    return `Die Risiko-Belohnungs-Karte ${aktion.risikoKarteId} liegt nicht in der eigenen Auslage; spielen lässt sich nur eine eigene, noch nicht gespielte (A4, A8.2).`;
  }
  const sperre = rundensperre(zustand);
  if (sperre !== null) return sperre;
  const { risikoAktion, benannt } = aktion;
  if (risikoAktion === 1 || risikoAktion === 4) {
    return benannt === null ? null : `Risiko-Aktion ${risikoAktion} benennt keine Karte; benannt wird nur bei Aktion 2 und 3 (A8.2, D52).`;
  }
  if (risikoAktion === 2) {
    if (spieler.schlangen.length === 0) return 'Für Risiko-Aktion 2 braucht der Spieler eine eigene Schlange: Die zusätzliche Farbkarte darf nur an ein Ende einer eigenen Schlange (D52).';
    if (spieler.hand.some((karte) => karte.id === benannt && istFarbkarte(karte))) return null;
    return `Für Risiko-Aktion 2 benennt der Spieler vorher eine Farbkarte seiner Hand; ${String(benannt)} ist keine (D52).`;
  }
  if (eigeneSchlangenkarte(spieler, benannt) !== undefined) return null;
  return `Für Risiko-Aktion 3 benennt der Spieler vorher eine Farbkarte seiner eigenen Schlange; ${String(benannt)} ist keine (A8.2).`;
}

interface Pruefung {
  spielerIndex: number;
  aktion: RisikoKarteSpielenAktion;
  aufgedeckt: Spielkarte;
  erfolg: boolean;
}

/** A8.2: Erfolg ist eine Farbkarte, bei Aktion 3 eine mit dem Punktewert der benannten Schlangenkarte. */
function istErfolg(spieler: Spieler, aktion: RisikoKarteSpielenAktion, aufgedeckt: Spielkarte): boolean {
  if (!istFarbkarte(aufgedeckt)) return false;
  return aktion.risikoAktion !== 3 || eigeneSchlangenkarte(spieler, aktion.benannt)?.punkte === aufgedeckt.punkte;
}

/**
 * Spielt die Risiko-Karte (A8.2): Sie kommt aus dem Spiel, die oberste Karte
 * wird offen aufgedeckt, dann wirkt die Aktion. Was das Aufdecken und was die
 * Aktion bewegt, meldet je ein `KartenVersetzt` (Plan E4b), dazwischen steht
 * `RisikoKarteGespielt` mit dem Ausgang der Prüfung.
 */
export function spieleRisikoKarte(zustand: Spielzustand, aktion: RisikoKarteSpielenAktion, ereignisse: Ereignis[]): Spielzustand {
  const spielerIndex = spielerIndexVon(zustand, aktion.spielerId);
  const spieler = zustand.spieler[spielerIndex];
  const karteId = aktion.risikoKarteId;
  merkeEinmalJeRunde(zustand.zug, RISIKO);
  zustand.ausDemSpiel.push(...spieler.risikoKarten.splice(spieler.risikoKarten.findIndex((karte) => karte.id === karteId), 1));
  wirkeUndMeldeVersetzte(zustand, spielerIndex, karteId, (jetzt) => {
    if (deckeAuf(jetzt) === null) throw new Error('Der Nachziehstapel ist leer; ohne aufgedeckte Karte gibt es keine Risikoprüfung (D55).');
    return jetzt;
  }, ereignisse);
  // `deckeAuf` legt die Karte hinten an die aufgedeckten; ohne offene Entscheidung war vorher keine aufgedeckt (Invariante).
  const karte = zustand.aufgedeckt.at(-1)!;
  const erfolg = istErfolg(spieler, aktion, karte);
  ereignisse.push({ typ: 'RisikoKarteGespielt', spielerIndex, karteId, risikoAktion: aktion.risikoAktion, benannt: aktion.benannt, aufgedeckt: karte.id, erfolg });
  return wirkeUndMeldeVersetzte(zustand, spielerIndex, karteId, (jetzt) => {
    wirkeAktion(jetzt, { spielerIndex, aktion, aufgedeckt: karte, erfolg });
    return jetzt;
  }, ereignisse);
}

/** D51: Die aufgedeckte Karte kommt auf eine Hand oder einen Ablagestapel. */
function legeAufgedeckte(zustand: Spielzustand, ziel: Spielkarte[]): void {
  ziel.push(...zustand.aufgedeckt.splice(0));
}

/** Verlangt eine Risiko-Entscheidung zur Risiko-Karte `karteId`, ausgelöst vom Spieler am Zug. */
function verlange(zustand: Spielzustand, art: string, karteId: string, entscheider: number, optionen: string[], daten: OffeneEntscheidung['daten'] = {}): void {
  verlangeEntscheidung(zustand, { art, karteId, entscheider, ausgeloestVon: zustand.zug.spielerIndex, optionen, daten });
}

/**
 * A8.2 Aktion 4, D54: Der Begünstigte nimmt eine beliebige Karte von seinem
 * Ablagestapel oder die oberste Stapelkarte. Gewählt wird die Stelle im offenen
 * Ablagestapel, nicht die Id, weil die Karte danach verdeckt auf der Hand liegt
 * und kein Ereignis eine Handkarte nennt (B2). Der Schlangenkorb lässt sich
 * nicht vom Ablagestapel nehmen (A8.2); geht beides nicht, bekommt er nichts.
 */
function verlangeAblageOderStapel(zustand: Spielzustand, karteId: string, beguenstigt: number): void {
  const ablage = zustand.spieler[beguenstigt].ablagestapel.flatMap((karte, position) => (kartenartVon(karte) === 'Schlangenkorb des Glücks' ? [] : [`${ABLAGE}${position}`]));
  const optionen = [...ablage, ...stapelOption(zustand)];
  if (optionen.length > 0) verlange(zustand, ABLAGE_ODER_STAPEL, karteId, beguenstigt, optionen);
}

/**
 * Was die Aktion nach der Prüfung bewirkt (A8.2, D51 bis D54). Bei Erfolg kommt
 * die aufgedeckte Farbkarte auf die eigene Hand. Bei Misserfolg geht sie bei
 * Aktion 1 an den gewählten Gegner, bei 2 und 4 auf den eigenen Ablagestapel,
 * und der Spieler wählt den begünstigten Gegner. Aktion 3 verläuft eigen.
 */
function wirkeAktion(zustand: Spielzustand, { spielerIndex, aktion, aufgedeckt, erfolg }: Pruefung): void {
  const spieler = zustand.spieler[spielerIndex];
  const karteId = aktion.risikoKarteId;
  if (aktion.risikoAktion === 3) {
    const daten = { schlangenkarte: aktion.benannt! };
    if (erfolg) {
      legeAufgedeckte(zustand, spieler.hand);
      verlange(zustand, TAUSCH, karteId, spielerIndex, ['Farbkarte der Hand', KEIN_TAUSCH], daten);
    } else if (istFarbkarte(aufgedeckt)) verlange(zustand, SEITE, karteId, spielerIndex, ['davor', 'dahinter'], daten);
    else legeAufgedeckte(zustand, spieler.ablagestapel);
    return;
  }
  if (!erfolg) {
    if (aktion.risikoAktion !== 1) legeAufgedeckte(zustand, spieler.ablagestapel);
    // D52: Bei Aktion 2 merkt sich die Entscheidung die offen benannte Farbkarte.
    const daten: OffeneEntscheidung['daten'] = aktion.risikoAktion === 2 ? { risikoAktion: 2, benannt: aktion.benannt! } : { risikoAktion: aktion.risikoAktion };
    const gegner = mitspielerImUhrzeigersinn(zustand, spielerIndex).map((index) => zustand.spieler[index].id);
    verlange(zustand, GEGNERWAHL, karteId, spielerIndex, gegner, daten);
    return;
  }
  legeAufgedeckte(zustand, spieler.hand);
  if (aktion.risikoAktion === 1) zieheVomStapel(zustand, spielerIndex, 2);
  else if (aktion.risikoAktion === 2) verlange(zustand, ANLEGEN, karteId, spielerIndex, ['Farbkarte der Hand an ein Ende einer eigenen Schlange']);
  else verlangeAblageOderStapel(zustand, karteId, spielerIndex);
}

/** Die Schlange des Entscheiders, in der die benannte Karte liegt, und ihre Stelle dort. */
function stelleDerSchlangenkarte(zustand: Spielzustand, entscheidung: OffeneEntscheidung): { karten: Spielkarte[]; stelle: number } {
  const karteId = String(entscheidung.daten.schlangenkarte);
  const schlange = zustand.spieler[entscheidung.entscheider].schlangen.find((eintrag) => eintrag.karten.some((karte) => karte.id === karteId));
  if (schlange === undefined) throw new Error(`Die benannte Karte ${karteId} liegt in keiner eigenen Schlange (A8.2).`);
  return { karten: schlange.karten, stelle: schlange.karten.findIndex((karte) => karte.id === karteId) };
}

/** D52: Die benannte Farbkarte liegt auf der Hand dessen, der die Risiko-Karte gespielt hat. */
function benannteFarbkarte(entscheidung: OffeneEntscheidung): { spielerIndex: number; karteId: string } | null {
  const { benannt } = entscheidung.daten;
  return typeof benannt === 'string' ? { spielerIndex: entscheidung.ausgeloestVon, karteId: benannt } : null;
}

const ENTSCHEIDUNGEN: readonly EntscheidungsDefinition[] = [
  {
    // A8.2: Wahl ist die Id des Gegners. Aktion 1 gibt ihm die aufgedeckte Sonderkarte; bei Aktion 2 und 4 wählt er danach selbst (D52, D54).
    art: GEGNERWAHL,
    offeneHandkarte: benannteFarbkarte,
    loese(zustand, entscheidung, wahl) {
      const gegner = spielerIndexVon(zustand, wahl);
      const { risikoAktion, benannt } = entscheidung.daten;
      if (risikoAktion === 1) legeAufgedeckte(zustand, zustand.spieler[gegner].hand);
      else if (risikoAktion === 2) verlange(zustand, GEPLANTE_ODER_STAPEL, entscheidung.karteId, gegner, ['geplante', ...stapelOption(zustand)], { benannt: String(benannt) });
      else verlangeAblageOderStapel(zustand, entscheidung.karteId, gegner);
      return zustand;
    },
  },
  {
    // D52: Der begünstigte Gegner nimmt die benannte Farbkarte von der Hand des Spielers oder die oberste Stapelkarte.
    art: GEPLANTE_ODER_STAPEL,
    offeneHandkarte: benannteFarbkarte,
    loese(zustand, entscheidung, wahl) {
      if (wahl === STAPEL) zieheVomStapel(zustand, entscheidung.entscheider, 1);
      else zustand.spieler[entscheidung.entscheider].hand.push(entnehmeHandkarte(zustand, zustand.spieler[entscheidung.ausgeloestVon].id, String(entscheidung.daten.benannt)));
      return zustand;
    },
  },
  {
    // D54: bei Erfolg der Spieler, bei Misserfolg der Gegner; die aufgedeckte Karte zählt bei Erfolg als erste der zwei.
    art: ABLAGE_ODER_STAPEL,
    loese(zustand, entscheidung, wahl) {
      const spieler = zustand.spieler[entscheidung.entscheider];
      const stelle = ablagestapelStelle(wahl);
      if (stelle === null) zieheVomStapel(zustand, entscheidung.entscheider, 1);
      else spieler.hand.push(...spieler.ablagestapel.splice(stelle, 1));
      return zustand;
    },
  },
  {
    // A8.2 Aktion 2, D52: eine Farbkarte der Hand, auch die aufgedeckte, an ein Ende einer eigenen Schlange; D9 gilt hier nicht.
    art: ANLEGEN,
    verdeckteWahlen(zustand, entscheidung) {
      const spieler = zustand.spieler[entscheidung.entscheider];
      return spieler.hand.filter(istFarbkarte).flatMap((karte) => spieler.schlangen.flatMap((schlange) => ['anfang', 'ende'].map((seite) => `${karte.id} ${schlange.id} ${seite}`)));
    },
    loese(zustand, entscheidung, wahl) {
      const [karteId, schlangenId, seite] = wahl.split(' ');
      const spielerId = zustand.spieler[entscheidung.entscheider].id;
      return farbkarte.wirke(zustand, { typ: 'FarbkarteLegen', spielerId, karteId, ziel: { art: 'schlange', schlangenId, seite: seite === 'anfang' ? 'anfang' : 'ende' } }, []);
    },
  },
  {
    // A8.2 Aktion 3, D51, D53: jede Farbkarte der Hand ersetzt die benannte, die ersetzte kommt auf die Hand; „Du darfst“ lässt den Verzicht zu.
    art: TAUSCH,
    verdeckteWahlen(zustand, entscheidung) {
      return [...zustand.spieler[entscheidung.entscheider].hand.filter(istFarbkarte).map((karte) => karte.id), KEIN_TAUSCH];
    },
    loese(zustand, entscheidung, wahl) {
      if (wahl === KEIN_TAUSCH) return zustand;
      const { karten, stelle } = stelleDerSchlangenkarte(zustand, entscheidung);
      const ersatz = entnehmeHandkarte(zustand, zustand.spieler[entscheidung.entscheider].id, wahl);
      zustand.spieler[entscheidung.entscheider].hand.push(...karten.splice(stelle, 1, ersatz));
      return zustand;
    },
  },
  {
    // A8.2 Aktion 3, D53: Farbkarte mit anderem Punktewert zusätzlich an die Stelle der gewählten, davor oder dahinter.
    art: SEITE,
    loese(zustand, entscheidung, wahl) {
      const { karten, stelle } = stelleDerSchlangenkarte(zustand, entscheidung);
      karten.splice(wahl === 'davor' ? stelle : stelle + 1, 0, ...zustand.aufgedeckt.splice(0));
      return zustand;
    },
  },
];

trageEntscheidungenEin(ENTSCHEIDUNGEN);
