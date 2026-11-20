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
  if (!Number.isInteger(spielerIndex) || ich === undefined) {
    throw new Error(`Sicht: Einen Spieler an Stelle ${spielerIndex} gibt es bei ${zustand.spieler.length} Spielern nicht.`);
  }
  return structuredClone({
    ich: spielerIndex,
    hand: ich.hand,
    geheimeAufgabe: ich.geheimeAufgabe,
    geheimeAufgabeErfuellt: ich.geheimeAufgabeErfuellt,
    spieler: zustand.spieler.map(spielerSicht),
    erweiterung: zustand.erweiterung,
    partiephase: zustand.partiephase,
    zug: zustand.zug,
    entscheider: ermittleEntscheider(zustand),
    schlussrundeAusloeser: zustand.schlussrundeAusloeser,
    nachziehstapelGroesse: zustand.nachziehstapel.length,
    aufgabenstapelGroesse: zustand.aufgabenStapel.length,
    offeneAufgaben: zustand.offeneAufgaben,
    ausliegendeGruben: zustand.ausliegendeGruben,
    angesagt: zustand.schwebend,
    ausDemSpiel: zustand.ausDemSpiel,
  });
}

/** Wer gerade entscheidet und ob Mensch oder KI; `null` nach Spielende. */
export function entscheiderVon(zustand: Spielzustand): { index: number; steuerung: Steuerung } | null {
  const index = ermittleEntscheider(zustand);
  if (index === null) return null;
  return { index, steuerung: zustand.spieler[index].steuerung };
}
