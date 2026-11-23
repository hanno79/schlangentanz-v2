import type { Ereignis, RisikoKarteSpielenAktion, Risikoaktion } from '../aktionen/typen';
import { trageEntscheidungenEin } from '../entscheidungsregister';
import type { EntscheidungsDefinition } from '../entscheidungsregister';
import { farbkarte } from '../karten/farbkarte';
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
obersten Stapelkarte (D52). Sie steht deshalb als `benannt` in der Ansage und
in der Entscheidung (`benannteHandkarten`).

Annahmen, die Teil A und D nicht ausdrücklich hergeben, stehen im PR von X5:
Aktion 2 braucht eine eigene Schlange; bei Aktion 3 darf der Spieler auf den
Tausch verzichten („Du darfst den Tausch ausführen“).
*/

/** D50: So heisst die Risiko-Karte in der Runde des Zuges. */
const RISIKO = 'Risiko-Belohnung';

/** A8.2: die vier Aktionen mit ihrem Namen auf der Website. */
export const RISIKOAKTIONEN: Readonly<Record<Risikoaktion, string>> = {
  1: 'Zusätzliche Karten ziehen',
  2: 'Zusätzliche Farbkarte spielen',
  3: 'Karten tauschen',
  4: 'Karten aus dem Ablagestapel oder Nachziehstapel nehmen',
};

export function istRisikoaktion(wert: unknown): wert is Risikoaktion {
  return wert === 1 || wert === 2 || wert === 3 || wert === 4;
}

/** Die Arten der Risiko-Entscheidungen im Entscheidungsregister. */
export const RISIKO_GEGNERWAHL = 'Risiko: begünstigten Gegner wählen';
export const RISIKO_GEPLANTE_ODER_STAPEL = 'Risiko: geplante Farbkarte oder oberste Stapelkarte';
export const RISIKO_ABLAGE_ODER_STAPEL = 'Risiko: Karte vom eigenen Ablagestapel oder oberste Stapelkarte';
export const RISIKO_ANLEGEN = 'Risiko: zusätzliche Farbkarte anlegen';
export const RISIKO_TAUSCH = 'Risiko: Farbkarte der Hand zum Tauschen wählen';
export const RISIKO_SEITE = 'Risiko: aufgedeckte Karte davor oder dahinter legen';

const STAPEL = 'stapel';
const KEIN_TAUSCH = 'kein Tausch';
const ABLAGE = 'ablagestapel-';

function istFarbkarte(karte: Spielkarte): karte is FarbkarteInfo {
  return karte.typ === 'Farbkarte';
}

/** D52: Für Aktion 2 benennbar ist jede Farbkarte der Hand, wenn es eine eigene Schlange gibt, an die sie darf (Annahme, siehe oben). */
function planbareFarbkarten(spieler: Spieler): FarbkarteInfo[] {
  return spieler.schlangen.length === 0 ? [] : spieler.hand.filter(istFarbkarte);
}

/** A8.2 Aktion 3: jede Farbkarte, die offen in einer eigenen Schlange liegt; die unter einer Farbenfusion nicht. */
function tauschbareSchlangenkarten(spieler: Spieler): FarbkarteInfo[] {
  return spieler.schlangen.flatMap((schlange) => schlange.karten.filter(istFarbkarte));
}

/** D50, D55: Der Grund, warum in diesem Zug keine Risiko-Karte geht, oder `null`. */
function rundensperre(zustand: Spielzustand): string | null {
  if (zustand.partiephase !== 'Laufend' || zustand.nachziehstapel.length === 0) {
    return 'In der Schlussrunde und bei leerem Nachziehstapel ist keine Risiko-Belohnungs-Karte spielbar; es gibt keine Karte zum Aufdecken (D55).';
  }
  return einmalJeRundeGesperrt(zustand.zug, RISIKO);
}

/** A8.2: Was der Spieler am Zug jetzt mit seiner nächsten Risiko-Karte spielen darf; je Aktion und benannter Karte eine Aktion. */
export function risikoAktionen(zustand: Spielzustand, spielerIndex: number): RisikoKarteSpielenAktion[] {
  const spieler = zustand.spieler[spielerIndex];
  const karte = spieler.risikoKarten[0];
  if (karte === undefined || rundensperre(zustand) !== null) return [];
  const basis = { typ: 'RisikoKarteSpielen', spielerId: spieler.id, karteId: karte.id } as const;
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
  if (!spieler.risikoKarten.some((karte) => karte.id === aktion.karteId)) {
    return `Die Risiko-Belohnungs-Karte ${aktion.karteId} liegt nicht in der eigenen Auslage; spielen lässt sich nur eine eigene, noch nicht gespielte (A4, A8.2).`;
  }
  const sperre = rundensperre(zustand);
  if (sperre !== null) return sperre;
  const { risikoAktion, benannt } = aktion;
  if (risikoAktion === 1 || risikoAktion === 4) {
    return benannt === null ? null : `Risiko-Aktion ${risikoAktion} benennt keine Karte; benannt wird nur bei Aktion 2 und 3 (A8.2, D52).`;
  }
  if (risikoAktion === 2) {
    if (spieler.schlangen.length === 0) return 'Für Risiko-Aktion 2 braucht der Spieler eine eigene Schlange: Die zusätzliche Farbkarte darf nur an ein Ende einer eigenen Schlange (D52).';
    if (planbareFarbkarten(spieler).some((karte) => karte.id === benannt)) return null;
    return `Für Risiko-Aktion 2 benennt der Spieler vorher eine Farbkarte seiner Hand; ${String(benannt)} ist keine (D52).`;
  }
  if (tauschbareSchlangenkarten(spieler).some((karte) => karte.id === benannt)) return null;
  return `Für Risiko-Aktion 3 benennt der Spieler vorher eine Farbkarte seiner eigenen Schlange; ${String(benannt)} ist keine (A8.2).`;
}

/** A8.2 Aktion 3: Erfolg ist eine Farbkarte mit dem Punktewert der benannten Schlangenkarte; sonst eine Farbkarte. */
function istErfolg(zustand: Spielzustand, spielerIndex: number, aktion: RisikoKarteSpielenAktion, aufgedeckt: Spielkarte): boolean {
  if (!istFarbkarte(aufgedeckt)) return false;
  if (aktion.risikoAktion !== 3) return true;
  return tauschbareSchlangenkarten(zustand.spieler[spielerIndex]).some((karte) => karte.id === aktion.benannt && karte.punkte === aufgedeckt.punkte);
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
  merkeEinmalJeRunde(zustand.zug, RISIKO);
  const stelle = spieler.risikoKarten.findIndex((karte) => karte.id === aktion.karteId);
  zustand.ausDemSpiel.push(...spieler.risikoKarten.splice(stelle, 1));
  wirkeUndMeldeVersetzte(zustand, spielerIndex, aktion.karteId, (jetzt) => {
    if (deckeAuf(jetzt) === null) throw new Error('Der Nachziehstapel ist leer; ohne aufgedeckte Karte gibt es keine Risikoprüfung (D55).');
    return jetzt;
  }, ereignisse);
  const aufgedeckt = zustand.aufgedeckt[0];
  const erfolg = istErfolg(zustand, spielerIndex, aktion, aufgedeckt);
  ereignisse.push({ typ: 'RisikoKarteGespielt', spielerIndex, karteId: aktion.karteId, risikoAktion: aktion.risikoAktion, benannt: aktion.benannt, aufgedeckt: aufgedeckt.id, erfolg });
  return wirkeUndMeldeVersetzte(zustand, spielerIndex, aktion.karteId, (jetzt) => {
    FOLGEN[aktion.risikoAktion](jetzt, { spielerIndex, aktion, erfolg });
    return jetzt;
  }, ereignisse);
}

interface Pruefung {
  spielerIndex: number;
  aktion: RisikoKarteSpielenAktion;
  erfolg: boolean;
}

/** D51: Die aufgedeckte Karte kommt bei Erfolg auf die eigene Hand, bei Misserfolg (ausser Aktion 1) auf den eigenen Ablagestapel. */
function legeAufgedeckte(zustand: Spielzustand, ziel: Spielkarte[]): void {
  ziel.push(...zustand.aufgedeckt.splice(0));
}

/** Verlangt eine Risiko-Entscheidung zur Karte `karteId`, ausgelöst vom Spieler am Zug. */
function verlange(zustand: Spielzustand, art: string, karteId: string, entscheider: number, optionen: string[], daten: OffeneEntscheidung['daten'] = {}): void {
  verlangeEntscheidung(zustand, { art, karteId, entscheider, ausgeloestVon: zustand.zug.spielerIndex, optionen, daten });
}

/** A8.2 „Freie Wahl bei Misserfolg“: Der Spieler am Zug wählt den begünstigten Gegner. */
function verlangeGegnerwahl(zustand: Spielzustand, { spielerIndex, aktion }: Pruefung): void {
  // D52: Bei Aktion 2 merkt sich die Entscheidung die offen benannte Farbkarte.
  const daten: OffeneEntscheidung['daten'] = { risikoAktion: aktion.risikoAktion };
  if (aktion.risikoAktion === 2) daten.benannt = aktion.benannt!;
  const gegner = mitspielerImUhrzeigersinn(zustand, spielerIndex).map((index) => zustand.spieler[index].id);
  verlange(zustand, RISIKO_GEGNERWAHL, aktion.karteId, spielerIndex, gegner, daten);
}

/**
 * A8.2 Aktion 4, D54: Der Begünstigte nimmt eine beliebige Karte von seinem
 * Ablagestapel oder die oberste Stapelkarte. Gewählt wird die Stelle im offenen
 * Ablagestapel, nicht die Id, weil die Karte danach verdeckt auf der Hand liegt
 * (B2). Der Schlangenkorb lässt sich nicht vom Ablagestapel nehmen (A8.2); geht
 * beides nicht, bekommt er nichts.
 */
function verlangeAblageOderStapel(zustand: Spielzustand, karteId: string, beguenstigt: number): void {
  const ablage = zustand.spieler[beguenstigt].ablagestapel.flatMap((karte, position) =>
    karte.typ === 'Sonderkarte' && karte.name === 'Schlangenkorb des Glücks' ? [] : [`${ABLAGE}${position}`],
  );
  const optionen = [...ablage, ...(zustand.nachziehstapel.length > 0 ? [STAPEL] : [])];
  if (optionen.length > 0) verlange(zustand, RISIKO_ABLAGE_ODER_STAPEL, karteId, beguenstigt, optionen);
}

/** Was jede Aktion nach der Prüfung bewirkt (A8.2, D51 bis D54). */
const FOLGEN: Readonly<Record<Risikoaktion, (zustand: Spielzustand, pruefung: Pruefung) => void>> = {
  1(zustand, pruefung) {
    if (!pruefung.erfolg) return verlangeGegnerwahl(zustand, pruefung);
    legeAufgedeckte(zustand, zustand.spieler[pruefung.spielerIndex].hand);
    zieheVomStapel(zustand, pruefung.spielerIndex, 2);
  },
  2(zustand, pruefung) {
    const { spielerIndex, aktion } = pruefung;
    if (!pruefung.erfolg) {
      legeAufgedeckte(zustand, zustand.spieler[spielerIndex].ablagestapel);
      return verlangeGegnerwahl(zustand, pruefung);
    }
    legeAufgedeckte(zustand, zustand.spieler[spielerIndex].hand);
    verlange(zustand, RISIKO_ANLEGEN, aktion.karteId, spielerIndex, ['Farbkarte der Hand an ein Ende einer eigenen Schlange']);
  },
  3(zustand, { spielerIndex, aktion, erfolg }) {
    const daten = { schlangenkarte: aktion.benannt! };
    if (erfolg) {
      legeAufgedeckte(zustand, zustand.spieler[spielerIndex].hand);
      verlange(zustand, RISIKO_TAUSCH, aktion.karteId, spielerIndex, ['Farbkarte der Hand', KEIN_TAUSCH], daten);
    } else if (istFarbkarte(zustand.aufgedeckt[0])) verlange(zustand, RISIKO_SEITE, aktion.karteId, spielerIndex, ['davor', 'dahinter'], daten);
    else legeAufgedeckte(zustand, zustand.spieler[spielerIndex].ablagestapel);
  },
  4(zustand, pruefung) {
    const { spielerIndex, aktion } = pruefung;
    if (!pruefung.erfolg) {
      legeAufgedeckte(zustand, zustand.spieler[spielerIndex].ablagestapel);
      return verlangeGegnerwahl(zustand, pruefung);
    }
    legeAufgedeckte(zustand, zustand.spieler[spielerIndex].hand);
    verlangeAblageOderStapel(zustand, aktion.karteId, spielerIndex);
  },
};

/** Die Schlange des Entscheiders, in der die benannte Karte liegt, und ihre Stelle dort. */
function stelleDerSchlangenkarte(zustand: Spielzustand, entscheidung: OffeneEntscheidung): { karten: Spielkarte[]; stelle: number } {
  const karteId = String(entscheidung.daten.schlangenkarte);
  const schlange = zustand.spieler[entscheidung.entscheider].schlangen.find((eintrag) => eintrag.karten.some((karte) => karte.id === karteId));
  if (schlange === undefined) throw new Error(`Die benannte Karte ${karteId} liegt in keiner eigenen Schlange (A8.2).`);
  return { karten: schlange.karten, stelle: schlange.karten.findIndex((karte) => karte.id === karteId) };
}

const ENTSCHEIDUNGEN: readonly EntscheidungsDefinition[] = [
  {
    // A8.2: Wahl ist die Id des Gegners. Aktion 1 gibt ihm die aufgedeckte Sonderkarte; bei Aktion 2 und 4 wählt er danach selbst (D52, D54).
    art: RISIKO_GEGNERWAHL,
    loese(zustand, entscheidung, wahl) {
      const gegner = spielerIndexVon(zustand, wahl);
      const { risikoAktion, benannt } = entscheidung.daten;
      if (risikoAktion === 1) legeAufgedeckte(zustand, zustand.spieler[gegner].hand);
      else if (risikoAktion === 2) {
        const optionen = ['geplante', ...(zustand.nachziehstapel.length > 0 ? [STAPEL] : [])];
        verlange(zustand, RISIKO_GEPLANTE_ODER_STAPEL, entscheidung.karteId, gegner, optionen, { benannt: String(benannt) });
      } else verlangeAblageOderStapel(zustand, entscheidung.karteId, gegner);
      return zustand;
    },
  },
  {
    // D52: Der begünstigte Gegner nimmt die benannte Farbkarte von der Hand des Spielers oder die oberste Stapelkarte.
    art: RISIKO_GEPLANTE_ODER_STAPEL,
    loese(zustand, entscheidung, wahl) {
      if (wahl === STAPEL) zieheVomStapel(zustand, entscheidung.entscheider, 1);
      else zustand.spieler[entscheidung.entscheider].hand.push(entnehmeHandkarte(zustand, zustand.spieler[entscheidung.ausgeloestVon].id, String(entscheidung.daten.benannt)));
      return zustand;
    },
  },
  {
    // D54: bei Erfolg der Spieler, bei Misserfolg der Gegner; die aufgedeckte Karte zählt bei Erfolg als erste der zwei.
    art: RISIKO_ABLAGE_ODER_STAPEL,
    loese(zustand, entscheidung, wahl) {
      const spieler = zustand.spieler[entscheidung.entscheider];
      if (wahl === STAPEL) zieheVomStapel(zustand, entscheidung.entscheider, 1);
      else spieler.hand.push(...spieler.ablagestapel.splice(Number(wahl.slice(ABLAGE.length)), 1));
      return zustand;
    },
  },
  {
    // A8.2 Aktion 2, D52: eine Farbkarte der Hand, auch die aufgedeckte, an ein Ende einer eigenen Schlange; D9 gilt hier nicht.
    art: RISIKO_ANLEGEN,
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
    art: RISIKO_TAUSCH,
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
    art: RISIKO_SEITE,
    loese(zustand, entscheidung, wahl) {
      const { karten, stelle } = stelleDerSchlangenkarte(zustand, entscheidung);
      karten.splice(wahl === 'davor' ? stelle : stelle + 1, 0, ...zustand.aufgedeckt.splice(0));
      return zustand;
    },
  },
];

trageEntscheidungenEin(ENTSCHEIDUNGEN);

/**
 * D52: Die Handkarten, die in einer offenen Entscheidung offen benannt sind,
 * mit dem Spieler, auf dessen Hand sie liegen. Die KI legt sie beim Erraten des
 * Verdeckten dorthin (Plan K2); jeder andere Teil der Hand bleibt verdeckt (B2).
 */
export function benannteHandkarten(entscheidung: OffeneEntscheidung | null): { spielerIndex: number; karteId: string }[] {
  const benannt = entscheidung?.daten.benannt;
  return entscheidung === null || typeof benannt !== 'string' ? [] : [{ spielerIndex: entscheidung.ausgeloestVon, karteId: benannt }];
}
