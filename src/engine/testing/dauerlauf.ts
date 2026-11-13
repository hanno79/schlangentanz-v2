import { anwendeAktion } from '../aktionen/anwenden';
import { ermittleAktionen } from '../aktionen/enumerieren';
import { pruefeAktion } from '../aktionen/pruefen';
import type { AktionsErgebnis, Pruefergebnis, SpielAktion } from '../aktionen/typen';
import { pruefeInvarianten } from '../invarianten';
import { fehlertext } from '../form';
import { pruefeSpeichernUndLaden } from '../serialization';
import { erstellePartie } from '../state';
import type { Spielzustand } from '../types';
import { erzeugeZufall } from './zufall';

/*
Dauerlauf (Plan 3.6, Punkt 7; ab E2 Pflicht): Zufallspartien mit fester Saat,
in jedem Schritt Invarianten und Speichern/Laden geprüft, gewählt wird nur unter
den aufgezählten Aktionen. Der Lauf meldet, wie jede Partie ausging; er wirft
nicht, damit ein Test alle Befunde auf einmal sieht.
*/

export interface DauerlaufPartie {
  saat: number;
  spielerzahl: number;
  erweiterung: boolean;
}

export type DauerlaufAusgang =
  | 'beendet'
  | 'festgefahren'
  | 'schrittgrenze'
  | 'invariante'
  | 'speichern'
  | 'abgelehnt'
  | 'verstoss'
  | 'fehler';

export interface DauerlaufErgebnis {
  partie: DauerlaufPartie;
  ausgang: DauerlaufAusgang;
  /** Ausgeführte Aktionen bis zum Ausgang. */
  schritte: number;
  detail: string;
}

/** Was der Lauf von der Engine braucht; im Test lässt es sich ersetzen. */
export interface Motor {
  aktionen(zustand: Spielzustand): SpielAktion[];
  pruefe(zustand: Spielzustand, aktion: SpielAktion): Pruefergebnis;
  anwende(zustand: Spielzustand, aktion: SpielAktion): AktionsErgebnis;
}

export const ENGINE_MOTOR: Motor = { aktionen: ermittleAktionen, pruefe: pruefeAktion, anwende: anwendeAktion };

/** Sieht jeden ausgeführten Schritt; meldet er einen Text, hält der Lauf mit „verstoss“ an. */
export type SchrittPruefer = (vorher: Spielzustand, aktion: SpielAktion, ergebnis: AktionsErgebnis) => string | null;

export interface DauerlaufOptionen {
  schrittGrenze?: number;
  motor?: Motor;
  /** Baut je Partie einen frischen Prüfer, damit er sich über die Schritte etwas merken darf. */
  neuerPruefer?: () => SchrittPruefer;
}

/** `anzahl` Partien mit Saat 1, 2, 3 … und reihum 2, 3 und 4 Spielern. */
export function dauerlaufPartien(anzahl: number, erweiterung: boolean, ersteSaat = 1): DauerlaufPartie[] {
  return Array.from({ length: anzahl }, (_, index) => ({ saat: ersteSaat + index, spielerzahl: 2 + (index % 3), erweiterung }));
}

/** Der Befund des Zustands, bevor die nächste Aktion gewählt wird, oder `null`. */
function befundVorDemSchritt(zustand: Spielzustand): { ausgang: DauerlaufAusgang; detail: string } | null {
  const verletzt = pruefeInvarianten(zustand).filter((befund) => befund.verletzt);
  if (verletzt.length > 0) return { ausgang: 'invariante', detail: verletzt.map((befund) => `${befund.name}: ${befund.detail}`).join(' | ') };
  const speichern = pruefeSpeichernUndLaden(zustand);
  return speichern.length > 0 ? { ausgang: 'speichern', detail: speichern.join(' ') } : null;
}

/** Wer gerade dran ist und wie viele Handkarten er hält, für die Meldung „festgefahren“. */
function handlage(zustand: Spielzustand): string {
  const spieler = zustand.spieler[zustand.zug.spielerIndex];
  return spieler === undefined ? 'niemand ist am Zug' : `${spieler.name} hält ${spieler.hand.length} Handkarten`;
}

export function spieleDauerlaufPartie(partie: DauerlaufPartie, optionen: DauerlaufOptionen = {}): DauerlaufErgebnis {
  const { schrittGrenze = 5000, motor = ENGINE_MOTOR, neuerPruefer } = optionen;
  const pruefeSchritt = neuerPruefer?.() ?? null;
  const wahl = erzeugeZufall(partie.saat ^ 0x5eed);
  let zustand = erstellePartie({ spielerzahl: partie.spielerzahl, erweiterung: partie.erweiterung, zufall: erzeugeZufall(partie.saat) });
  const ergebnis = (ausgang: DauerlaufAusgang, schritte: number, detail: string): DauerlaufErgebnis => ({ partie, ausgang, schritte, detail });

  for (let schritt = 0; ; schritt += 1) {
    let aktion: SpielAktion | null = null;
    try {
      const befund = befundVorDemSchritt(zustand);
      if (befund !== null) return ergebnis(befund.ausgang, schritt, befund.detail);
      if (zustand.partiephase === 'Beendet') return ergebnis('beendet', schritt, '');
      if (schritt >= schrittGrenze) return ergebnis('schrittgrenze', schritt, `Nach ${schrittGrenze} Schritten nicht beendet.`);

      const aktionen = motor.aktionen(zustand);
      // Plan E2, Kriterium 12: Solange die Partie läuft, gibt es immer eine erlaubte Aktion.
      if (aktionen.length === 0) return ergebnis('festgefahren', schritt, `Die Engine zählt keine Aktion auf, die Partie läuft aber noch; ${handlage(zustand)}.`);
      for (const angeboten of aktionen) {
        const pruefung = motor.pruefe(zustand, angeboten);
        if (!pruefung.erlaubt) return ergebnis('abgelehnt', schritt, `Aufgezählt, aber abgelehnt: ${JSON.stringify(angeboten)}: ${pruefung.grund}`);
      }
      aktion = aktionen[Math.floor(wahl() * aktionen.length)];
      const ausgefuehrt = motor.anwende(zustand, aktion);
      const verstoss = pruefeSchritt?.(zustand, aktion, ausgefuehrt) ?? null;
      zustand = ausgefuehrt.zustand;
      if (verstoss !== null) return ergebnis('verstoss', schritt + 1, `Saat ${partie.saat}, nach ${JSON.stringify(aktion)}: ${verstoss}`);
    } catch (fehler) {
      const bei = aktion === null ? '' : `${JSON.stringify(aktion)}: `;
      return ergebnis('fehler', schritt, `Saat ${partie.saat}, Schritt ${schritt}: ${bei}${fehlertext(fehler)}`);
    }
  }
}

export function dauerlauf(partien: readonly DauerlaufPartie[], optionen: DauerlaufOptionen = {}): DauerlaufErgebnis[] {
  return partien.map((partie) => spieleDauerlaufPartie(partie, optionen));
}
