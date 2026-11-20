import { ermittleEntscheider } from '../engine';
import type {
  AufgabenkarteInfo,
  Auslagekarte,
  AusliegendeGrube,
  Partiephase,
  Schlange,
  SchwebendeKarte,
  Sonderkartenname,
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
Gruben (A7.6), was aus dem Spiel ist, und die angesagte Sonderkarte (A6, B2).
Verdeckt bleibt (B2): fremde Handkarten, von denen nur die Zahl zu sehen ist;
die Reihenfolge von Nachzieh- und Aufgabenstapel, von denen nur die Grösse zu
sehen ist; fremde geheime Aufgaben und ob sie erfüllt sind, weil sie erst bei
der Wertung aufgedeckt werden (A9); und bei einer angesagten Karte, wer gefragt
wird, solange man es nicht selbst ist. Gefragt wird nur, wer Farbenschutz hält
(Plan E4), die Frage verriete also eine fremde Handkarte.

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

/** Die angesagte Sonderkarte mit Ziel (A6, B2) und wer sie schon abgewehrt hat (A7.2); wer noch gefragt wird, fehlt (B2). */
export type AngesagteKarte = Pick<SchwebendeKarte, 'karte' | 'aktion' | 'abgewehrt'>

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
  /**
   * Wer gerade entscheidet: der Spieler am Zug, bei einer angesagten Karte nur
   * dann, wenn ich selbst gefragt bin (A6, B2). `null` nach Spielende und
   * während andere über eine angesagte Karte entscheiden.
   */
  entscheider: number | null;
  schlussrundeAusloeser: number | null;
  nachziehstapelGroesse: number;
  aufgabenstapelGroesse: number;
  offeneAufgaben: AufgabenkarteInfo[];
  ausliegendeGruben: AusliegendeGrube[];
  /** Die angesagte Sonderkarte, über die Betroffene noch entscheiden; `null`, wenn keine schwebt. */
  angesagt: AngesagteKarte | null;
  ausDemSpiel: Array<Spielkarte | Auslagekarte>;
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

/** Die Sicht des Spielers an Stelle `spielerIndex`. */
export function sichtFuer(zustand: Spielzustand, spielerIndex: number): Sicht {
  const ich = zustand.spieler[spielerIndex];
  if (ich === undefined) {
    throw new Error(`Sicht: Einen Spieler an Stelle ${spielerIndex} gibt es bei ${zustand.spieler.length} Spielern nicht.`);
  }
  const { schwebend } = zustand;
  const entscheider = ermittleEntscheider(zustand);
  return structuredClone({
    ich: spielerIndex,
    hand: ich.hand,
    geheimeAufgabe: ich.geheimeAufgabe,
    geheimeAufgabeErfuellt: ich.geheimeAufgabeErfuellt,
    spieler: zustand.spieler.map(spielerSicht),
    erweiterung: zustand.erweiterung,
    partiephase: zustand.partiephase,
    zug: zustand.zug,
    entscheider: schwebend !== null && entscheider !== spielerIndex ? null : entscheider,
    schlussrundeAusloeser: zustand.schlussrundeAusloeser,
    nachziehstapelGroesse: zustand.nachziehstapel.length,
    aufgabenstapelGroesse: zustand.aufgabenStapel.length,
    offeneAufgaben: zustand.offeneAufgaben,
    ausliegendeGruben: zustand.ausliegendeGruben,
    angesagt: schwebend === null ? null : { karte: schwebend.karte, aktion: schwebend.aktion, abgewehrt: schwebend.abgewehrt },
    ausDemSpiel: zustand.ausDemSpiel,
  });
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
