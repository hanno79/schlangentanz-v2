import { anwendeAktion, erstellePartie, ermittleAktionen, ermittleEntscheider, offeneHandkarteDer, zugInSicht } from '../engine';
import type {
  AufgabenkarteInfo,
  Auslagekarte,
  AusliegendeGrube,
  OffeneEntscheidung,
  Partiephase,
  Schlange,
  SchwebendeKarte,
  Sonderkartenname,
  SpielAktion,
  Spieler,
  Spielkarte,
  Spielzustand,
  Steuerung,
  Zug,
} from '../engine';

/*
Die Sicht eines Spielers (U5): was er am Tisch sehen darf, und nichts darüber
hinaus. Nur diese Datei liest den vollen Spielzustand. Jede andere Datei unter
`src/ki/` bekommt die Sicht oder reicht den Zustand unverändert an die Engine
weiter; der Architekturtest prüft das.

Offen liegt: die eigene Hand und die eigene geheime Aufgabe, alle Schlangen
samt der Karten unter einer Farbenfusion, alle Ablagestapel vollständig (D28),
die Auslage vor jedem Spieler (A4), erfüllte offene Aufgaben (A9), ausliegende
Gruben (A7.6), was aus dem Spiel ist, die angesagte Sonderkarte (A6, B2), eine
offene Entscheidung samt den aufgedeckten und der für Risiko-Aktion 2 offen
benannten Karte (X3, A8.2, D52) und wie viele Schlangen bisher angelegt
wurden, weil jede neue Schlange am Tisch zu sehen war.
Verdeckt bleibt (B2): fremde Handkarten, von denen nur die Zahl zu sehen ist;
die Reihenfolge von Nachzieh- und Aufgabenstapel, von denen nur die Grösse zu
sehen ist; fremde geheime Aufgaben und ob sie erfüllt sind, weil sie erst bei
der Wertung aufgedeckt werden (A9).

Die Sicht ist eine Abschrift: Wer sie verändert, verändert den Zustand nicht.
*/

/** Was jeder von einem Spieler sieht, auch von sich selbst. */
export interface SpielerSicht {
  id: string;
  name: string;
  steuerung: Steuerung;
  /** Nur die Zahl der Handkarten; welche es sind, sieht allein ihr Besitzer (`Sicht.hand`). */
  handgroesse: number;
  schlangen: Schlange[];
  /** D28: vollständig, unterste Karte zuerst. */
  ablagestapel: Spielkarte[];
  ausgespielteSonderkarten: Sonderkartenname[];
  schlangenhaeutungDreiergruppen: number;
  erfuellteAufgaben: AufgabenkarteInfo[];
  comeback: Spieler['comeback'];
  risikoKarten: Auslagekarte[];
}

export interface Sicht {
  /** Für wen die Sicht gilt: seine Stelle in `spieler`. */
  ich: number;
  hand: Spielkarte[];
  geheimeAufgabe: AufgabenkarteInfo | null;
  geheimeAufgabeErfuellt: boolean;
  /** Alle Spieler in Sitzordnung, der Betrachter eingeschlossen. */
  spieler: SpielerSicht[];
  erweiterung: boolean;
  partiephase: Partiephase;
  zug: Zug;
  /** Wer gerade entscheidet: der Spieler am Zug oder, bei einer angesagten Karte, der Gefragte (A6); `null` nach Spielende. */
  entscheider: number | null;
  schlussrundeAusloeser: number | null;
  nachziehstapelGroesse: number;
  aufgabenstapelGroesse: number;
  offeneAufgaben: AufgabenkarteInfo[];
  ausliegendeGruben: AusliegendeGrube[];
  /** Die angesagte Sonderkarte mit Ziel, über die Betroffene noch entscheiden (A6, B2); `null`, wenn keine schwebt. */
  angesagt: SchwebendeKarte | null;
  /** X3: die offene Entscheidung mit Entscheider und Wahl (D52); `null`, wenn keine offen ist. */
  entscheidung: OffeneEntscheidung | null;
  /** X3: die offen aufgedeckten Karten vom Nachziehstapel (A8.2). */
  aufgedeckt: Spielkarte[];
  ausDemSpiel: Array<Spielkarte | Auslagekarte>;
  /** Wie viele Schlangen bisher angelegt wurden; jede neue lag offen am Tisch. Daraus entsteht die Id der nächsten. */
  schlangenZaehler: number;
}

/** Verweist noch auf den Zustand; `sichtFuer` schreibt alles zusammen ab. */
function spielerSicht(spieler: Spieler): SpielerSicht {
  return {
    id: spieler.id,
    name: spieler.name,
    steuerung: spieler.steuerung,
    handgroesse: spieler.hand.length,
    schlangen: spieler.schlangen,
    ablagestapel: spieler.ablagestapel,
    ausgespielteSonderkarten: spieler.ausgespielteSonderkarten,
    schlangenhaeutungDreiergruppen: spieler.schlangenhaeutungDreiergruppen,
    erfuellteAufgaben: spieler.erfuellteAufgaben,
    comeback: spieler.comeback,
    risikoKarten: spieler.risikoKarten,
  };
}

/** Die Sicht, die noch auf den Zustand verweist; `sichtFuer` schreibt sie ab. */
function sichtAus(zustand: Spielzustand, spielerIndex: number): Sicht {
  const ich = zustand.spieler[spielerIndex];
  if (ich === undefined) {
    throw new Error(`Sicht: Einen Spieler an Stelle ${spielerIndex} gibt es bei ${zustand.spieler.length} Spielern nicht.`);
  }
  return {
    ich: spielerIndex,
    hand: ich.hand,
    geheimeAufgabe: ich.geheimeAufgabe,
    geheimeAufgabeErfuellt: ich.geheimeAufgabeErfuellt,
    spieler: zustand.spieler.map(spielerSicht),
    erweiterung: zustand.erweiterung,
    partiephase: zustand.partiephase,
    zug: zugInSicht(zustand, spielerIndex),
    entscheider: ermittleEntscheider(zustand),
    schlussrundeAusloeser: zustand.schlussrundeAusloeser,
    nachziehstapelGroesse: zustand.nachziehstapel.length,
    aufgabenstapelGroesse: zustand.aufgabenStapel.length,
    offeneAufgaben: zustand.offeneAufgaben,
    ausliegendeGruben: zustand.ausliegendeGruben,
    angesagt: zustand.schwebend,
    entscheidung: zustand.entscheidung,
    aufgedeckt: zustand.aufgedeckt,
    ausDemSpiel: zustand.ausDemSpiel,
    schlangenZaehler: zustand.schlangenZaehler,
  };
}

/** Die Sicht des Spielers an Stelle `spielerIndex`. */
export function sichtFuer(zustand: Spielzustand, spielerIndex: number): Sicht {
  return structuredClone(sichtAus(zustand, spielerIndex));
}

export interface Entscheider {
  index: number;
  name: string;
  steuerung: Steuerung;
}

/** Wer gerade entscheidet, mit Namen und ob Mensch oder KI; `null` nach Spielende. */
export function entscheiderVon(zustand: Spielzustand): Entscheider | null {
  const index = ermittleEntscheider(zustand);
  if (index === null) return null;
  const { name, steuerung } = zustand.spieler[index];
  return { index, name, steuerung };
}

/** Wie viele Spieler am Tisch sitzen. */
export function spielerzahl(zustand: Spielzustand): number {
  return zustand.spieler.length;
}

/*
Simulation ohne verdeckte Information (Plan K2, Vorgabe aus P0.3d): Eine
Strategie bekommt nie einen Zustand, auch nicht für die Zugsuche. Der Rahmen
errät deshalb aus der Sicht einen Zustand (Determinisierung): Was der Spieler
nicht sieht, die fremden Handkarten, der Nachziehstapel, die fremden geheimen
Aufgaben und der Aufgabenstapel, füllt er zufällig aus den Karten auf, die nirgends
offen liegen. Der erratene Zustand hängt nur von der Sicht und vom Zufall der KI ab,
nie vom echten Zustand. Darauf spielt die Strategie Aktionen durch und sieht nach
jeder wieder nur die Sicht danach (`Stellung`).

Was der erratene Zustand darüber hinaus festlegt, ist geraten: Ob eine fremde
geheime Aufgabe erfüllt ist, sieht niemand (A9); geraten wird „nicht erfüllt“. An
den Aktionen des Spielers und an den Schlangen ändert das nichts.
*/

/** Alle Spielkarten und Aufgabenkarten einer Partie dieser Grösse, gemischt mit `zufall` (A1, A4). */
function gemischtesMaterial(spielerzahl: number, erweiterung: boolean, zufall: () => number) {
  const partie = erstellePartie({ spielerzahl, erweiterung, zufall });
  return {
    karten: [...partie.spieler.flatMap((spieler) => spieler.hand), ...partie.nachziehstapel],
    // Auch Aufgaben, die schon zu Beginn des ersten Zuges eingelöst sind (A9), gehören zum Material.
    aufgaben: [
      ...partie.offeneAufgaben,
      ...partie.spieler.flatMap((spieler) => [...spieler.erfuellteAufgaben, ...(spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe])]),
      ...partie.aufgabenStapel,
    ],
  };
}

/** Die Ids aller Spielkarten, die der Spieler sieht: eigene Hand, Schlangen samt Karten unter Fusionen, Ablagestapel, Gruben, die angesagte Karte, die aufgedeckten, was aus dem Spiel ist. */
function offeneKarten(sicht: Sicht): Set<string> {
  return new Set([
    ...sicht.hand.map((karte) => karte.id),
    ...sicht.spieler.flatMap((spieler) => [
      ...spieler.schlangen.flatMap((schlange) => [...schlange.karten, ...schlange.fusionen.flatMap((fusion) => fusion.unter)].map((karte) => karte.id)),
      ...spieler.ablagestapel.map((karte) => karte.id),
    ]),
    ...sicht.ausliegendeGruben.map((grube) => grube.karte.id),
    ...(sicht.angesagt === null ? [] : [sicht.angesagt.karte.id]),
    ...sicht.aufgedeckt.map((karte) => karte.id),
    ...sicht.ausDemSpiel.map((karte) => karte.id),
  ]);
}

/** Die Ids aller Aufgabenkarten, die der Spieler sieht: offene, erfüllte und die eigene geheime (A9). */
function offeneAufgabenIds(sicht: Sicht): Set<string> {
  return new Set([
    ...sicht.offeneAufgaben.map((aufgabe) => aufgabe.id),
    ...sicht.spieler.flatMap((spieler) => spieler.erfuellteAufgaben.map((aufgabe) => aufgabe.id)),
    ...(sicht.geheimeAufgabe === null ? [] : [sicht.geheimeAufgabe.id]),
  ]);
}

/**
 * Ein Zustand, der zur Sicht passt: `sichtFuer(bestimmeZustand(sicht, zufall), sicht.ich)`
 * ist wieder `sicht`. Das Verdeckte ist mit `zufall` aus den ungesehenen Karten gefüllt.
 * Passt die Sicht zu keinem Zustand, etwa weil Karten fehlen, ist das ein Fehler.
 */
export function bestimmeZustand(sicht: Sicht, zufall: () => number): Spielzustand {
  const kopie = structuredClone(sicht);
  const { karten, aufgaben } = gemischtesMaterial(kopie.spieler.length, kopie.erweiterung, zufall);
  const gesehen = offeneKarten(kopie);
  // D52: Eine offen benannte Karte einer fremden Hand liegt dort; nur der Rest der Hand ist verdeckt.
  const genannt = offeneHandkarteDer(kopie.entscheidung);
  const benannt = genannt === null || genannt.spielerIndex === kopie.ich ? null : { ...genannt, karte: karten.find((karte) => karte.id === genannt.karteId) };
  const verdeckt = karten.filter((karte) => !gesehen.has(karte.id) && karte !== benannt?.karte);
  const fremde = kopie.spieler.filter((_, index) => index !== kopie.ich);
  const fremdeHandkarten = fremde.reduce((summe, spieler) => summe + spieler.handgroesse, 0) - (benannt === null ? 0 : 1);
  if (verdeckt.length !== fremdeHandkarten + kopie.nachziehstapelGroesse) {
    throw new Error(
      `Simulation: Verdeckt sind ${verdeckt.length} Karten, die Sicht verlangt ${fremdeHandkarten} in fremden Händen und ${kopie.nachziehstapelGroesse} im Nachziehstapel.`,
    );
  }
  const bekannteAufgaben = offeneAufgabenIds(kopie);
  const verdeckteAufgaben = aufgaben.filter((aufgabe) => !bekannteAufgaben.has(aufgabe.id));
  const fremdeGeheime = verdeckteAufgaben.length - kopie.aufgabenstapelGroesse;
  if (fremdeGeheime !== 0 && fremdeGeheime !== fremde.length) {
    throw new Error(
      `Simulation: Verdeckt sind ${verdeckteAufgaben.length} Aufgaben; zu ${kopie.aufgabenstapelGroesse} im Aufgabenstapel passen weder keine noch ${fremde.length} fremde geheime.`,
    );
  }
  const spieler = kopie.spieler.map(({ handgroesse, ...offen }, index): Spieler => {
    if (index === kopie.ich) return { ...offen, hand: kopie.hand, geheimeAufgabe: kopie.geheimeAufgabe, geheimeAufgabeErfuellt: kopie.geheimeAufgabeErfuellt };
    const geheimeAufgabe = fremdeGeheime === 0 ? null : (verdeckteAufgaben.shift() ?? null);
    const bekannt = benannt?.spielerIndex === index && benannt.karte !== undefined ? [benannt.karte] : [];
    return { ...offen, hand: [...bekannt, ...verdeckt.splice(0, handgroesse - bekannt.length)], geheimeAufgabe, geheimeAufgabeErfuellt: false };
  });
  return {
    version: 2,
    erweiterung: kopie.erweiterung,
    spieler,
    partiephase: kopie.partiephase,
    zug: kopie.zug,
    schlussrundeAusloeser: kopie.schlussrundeAusloeser,
    nachziehstapel: verdeckt,
    ausliegendeGruben: kopie.ausliegendeGruben,
    schwebend: kopie.angesagt,
    entscheidung: kopie.entscheidung,
    aufgedeckt: kopie.aufgedeckt,
    ausDemSpiel: kopie.ausDemSpiel,
    offeneAufgaben: kopie.offeneAufgaben,
    aufgabenStapel: verdeckteAufgaben,
    schlangenZaehler: kopie.schlangenZaehler,
  };
}

/**
 * Eine Stellung auf einem erratenen Zustand; die Strategie sieht davon nur Sichten
 * und Aktionen. Die Sicht einer Stellung ist keine Abschrift, sondern verweist auf
 * den erratenen Zustand, weil jede Abschrift die Suche bremst: Wer sie verändert,
 * verdirbt nur die eigene Simulation. Den echten Zustand erreicht sie nie.
 */
export interface Stellung {
  /** Die Sicht des Spielers, für den simuliert wird; nur lesen. */
  readonly sicht: Sicht;
  /** Wer jetzt entscheidet, als Stelle in `sicht.spieler`; `null` nach Spielende. */
  readonly entscheider: number | null;
  /** Die Aktionen, die der Entscheider jetzt hat, wie die Engine sie aufzählt. */
  aktionen(): SpielAktion[];
  /** Die Stellung nach `aktion`; eine unerlaubte Aktion lehnt die Engine mit ihrem Grund ab. */
  nach(aktion: SpielAktion): Stellung;
}

function stellung(zustand: Spielzustand, ich: number): Stellung {
  let sicht: Sicht | null = null;
  let aktionen: SpielAktion[] | null = null;
  return {
    get sicht() {
      sicht ??= sichtAus(zustand, ich);
      return sicht;
    },
    entscheider: ermittleEntscheider(zustand),
    aktionen() {
      aktionen ??= ermittleAktionen(zustand);
      return [...aktionen];
    },
    nach(aktion) {
      return stellung(anwendeAktion(zustand, aktion).zustand, ich);
    },
  };
}

/** Die Stellung zur Sicht, auf einem mit `zufall` erratenen Zustand (`bestimmeZustand`). */
export function simuliere(sicht: Sicht, zufall: () => number): Stellung {
  return stellung(bestimmeZustand(sicht, zufall), sicht.ich);
}
