import { SPIELER_MAX, SPIELER_MIN, anwendeAktion, berechneEndwertung, erstellePartie, erzeugeZufall, fehlertext, pruefeInvarianten } from '../engine';
import type { SpielAktion, Spielzustand } from '../engine';
import { waehleFuer } from './schritt';
import type { Ki } from './strategien/strategie';
import { entscheiderVon, spielerzahl } from './sicht';

/*
Das Turnier (Plan K1, gebraucht von K5): N Partien KI gegen KI, jede aus einer
festen Saat, der Sitz rotiert von Partie zu Partie. Vor jedem Schritt werden die
Invarianten geprüft. Gleiche Saaten ergeben denselben Verlauf, denn aller Zufall
kommt aus Quellen, die aus ihnen entstehen (U4). Partie und KIs haben getrennte
Saaten, damit eine KI aus ihrem Zufall die Partie nicht zurückrechnet (P0.3d).
*/

/** Ein Teilnehmer baut je Partie eine frische KI aus einer eigenen Zufallsquelle. */
export interface Teilnehmer {
  name: string;
  erstelle(zufall: () => number): Ki;
}

export type PartieAusgang = 'beendet' | 'invariante' | 'schrittgrenze';

/** Wie eine Partie gelaufen ist, je Sitz. */
export interface PartieVerlauf {
  ausgang: PartieAusgang;
  /** Ausgeführte Aktionen bis zum Ausgang. */
  schritte: number;
  /** Was die Partie angehalten hat; leer, wenn sie beendet ist. */
  detail: string;
  verlauf: SpielAktion[];
  /** Die Sitze der Sieger (D22); leer, wenn die Partie nicht beendet ist. */
  siegerSitze: number[];
  /** Die Summe der Endwertung je Sitz (A11); leer, wenn die Partie nicht beendet ist. */
  punkteSitze: number[];
}

/** Eine Turnierpartie; Sieger und Punkte je Teilnehmer statt je Sitz. */
export interface TurnierPartie extends Omit<PartieVerlauf, 'siegerSitze' | 'punkteSitze'> {
  saat: number;
  /** Je Sitz die Nummer des Teilnehmers, der dort spielt. */
  sitze: number[];
  /** Die Teilnehmer, die gewonnen haben, aufsteigend; bei Gleichstand alle (D22). */
  sieger: number[];
  /** Die Punkte je Teilnehmer. */
  punkte: number[];
}

export interface TurnierErgebnis {
  partien: TurnierPartie[];
  /** Je Teilnehmer die Zahl seiner Siege; ein geteilter Sieg zählt für jeden (D22). */
  siege: number[];
}

export interface TurnierOptionen {
  /** 2 bis 4 (A2); so viele Spieler hat jede Partie. */
  teilnehmer: readonly Teilnehmer[];
  partien: number;
  /** Partie `n` (ab 0) spielt mit Saat `ersteSaat + n`; für Messläufe gross und zufällig gewählt (K5). */
  ersteSaat: number;
  /**
   * Die Nummer der ersten Partie dieses Aufrufs, ohne Angabe 0. Ein Messlauf, der in
   * Abschnitten spielt (K5), setzt sie auf die Zahl der schon gespielten Partien: Dann
   * sind Saaten, Sitzordnung und KI-Saaten dieselben wie in einem einzigen Turnier.
   */
  erstePartie?: number;
  /**
   * Saat für die Zufallsquellen der KIs, getrennt von der Partiesaat (P0.3d): Hinge
   * der KI-Zufall an der Partiesaat, rechnete eine Strategie aus ihrem ersten
   * Zufallswert die Saat und damit alle Starthände und den Stapel zurück.
   */
  kiSaat: number;
  /** B1: mit oder ohne Erweiterung. */
  erweiterung: boolean;
  schrittGrenze?: number;
}

const SCHRITTGRENZE = 5000;

/** Je Sitz der Teilnehmer in Partie `partie` (ab 0): Teilnehmer 0 beginnt in Partie 0, Teilnehmer 1 in Partie 1 und so weiter. */
export function sitzordnung(partie: number, teilnehmerzahl: number): number[] {
  return Array.from({ length: teilnehmerzahl }, (_, sitz) => (sitz + partie) % teilnehmerzahl);
}

/** Die Saat der Zufallsquelle für die KI am Sitz `sitz` in Partie `nummer`; aus `kiSaat`, nie aus der Partiesaat. */
function kiSaatFuer(kiSaat: number, nummer: number, sitz: number): number {
  return (Math.imul(kiSaat ^ Math.imul(nummer + 1, 0x85ebca6b), 0x9e3779b1) + sitz + 1) >>> 0;
}

/**
 * Spielt eine Partie von `start` bis zum Ende; `kis[sitz]` entscheidet für
 * diesen Sitz, auch bei einer Abwehr ausserhalb seines Zuges. `wo` steht in
 * jeder Fehlermeldung.
 */
export function spielePartie(start: Spielzustand, kis: readonly Ki[], schrittGrenze = SCHRITTGRENZE, wo = 'Partie'): PartieVerlauf {
  const sitze = spielerzahl(start);
  if (kis.length !== sitze) throw new Error(`Turnier: ${kis.length} KIs für ${sitze} Sitze; jeder Sitz braucht genau eine KI.`);
  const verlauf: SpielAktion[] = [];
  const ende = (ausgang: PartieAusgang, detail: string): PartieVerlauf => ({ ausgang, schritte: verlauf.length, detail, verlauf, siegerSitze: [], punkteSitze: [] });

  let zustand = start;
  for (;;) {
    const verletzt = pruefeInvarianten(zustand).filter((befund) => befund.verletzt);
    if (verletzt.length > 0) return ende('invariante', verletzt.map((befund) => `${befund.name}: ${befund.detail}`).join(' | '));
    const entscheider = entscheiderVon(zustand);
    if (entscheider === null) {
      const wertung = berechneEndwertung(zustand);
      return {
        ...ende('beendet', ''),
        siegerSitze: wertung.spieler.flatMap((spieler, sitz) => (wertung.gewinner.includes(spieler.spielerId) ? [sitz] : [])),
        punkteSitze: wertung.spieler.map((spieler) => spieler.summe),
      };
    }
    if (verlauf.length >= schrittGrenze) return ende('schrittgrenze', `Nach ${schrittGrenze} Schritten nicht beendet.`);
    try {
      const aktion = waehleFuer(zustand, entscheider, kis[entscheider.index]);
      zustand = anwendeAktion(zustand, aktion).zustand;
      verlauf.push(aktion);
    } catch (fehler) {
      throw new Error(`Turnier, ${wo}, Schritt ${verlauf.length}: ${fehlertext(fehler)}`, { cause: fehler });
    }
  }
}

function pruefeOptionen({ teilnehmer, partien, erstePartie = 0 }: TurnierOptionen): void {
  if (teilnehmer.length < SPIELER_MIN || teilnehmer.length > SPIELER_MAX) {
    throw new Error(`Turnier: ${teilnehmer.length} Teilnehmer; eine Partie hat ${SPIELER_MIN} bis ${SPIELER_MAX} Spieler (A2).`);
  }
  if (!Number.isInteger(partien) || partien < 1) throw new Error(`Turnier: Ungültige Zahl der Partien ${partien}; erwartet eine ganze Zahl ab 1.`);
  if (!Number.isInteger(erstePartie) || erstePartie < 0) throw new Error(`Turnier: Ungültige Nummer der ersten Partie ${erstePartie}; erwartet eine ganze Zahl ab 0.`);
}

/** Spielt `partien` Partien mit festen Saaten und rotierendem Sitz. */
export function turnier(optionen: TurnierOptionen): TurnierErgebnis {
  pruefeOptionen(optionen);
  const { teilnehmer, partien, ersteSaat, kiSaat, erweiterung, schrittGrenze, erstePartie = 0 } = optionen;
  const siege = teilnehmer.map(() => 0);

  const ergebnisse = Array.from({ length: partien }, (_, index): TurnierPartie => {
    const nummer = erstePartie + index;
    const saat = ersteSaat + nummer;
    const sitze = sitzordnung(nummer, teilnehmer.length);
    const start = erstellePartie({ spielerzahl: teilnehmer.length, erweiterung, zufall: erzeugeZufall(saat) });
    const kis = sitze.map((wer, sitz) => teilnehmer[wer].erstelle(erzeugeZufall(kiSaatFuer(kiSaat, nummer, sitz))));
    const { siegerSitze, punkteSitze, ...lauf } = spielePartie(start, kis, schrittGrenze, `Partie mit Saat ${saat}`);
    const sieger = siegerSitze.map((sitz) => sitze[sitz]).sort((a, b) => a - b);
    for (const wer of sieger) siege[wer] += 1;
    const punkte = punkteSitze.length === 0 ? [] : teilnehmer.map((_, wer) => punkteSitze[sitze.indexOf(wer)]);
    return { ...lauf, saat, sitze, sieger, punkte };
  });
  return { partien: ergebnisse, siege };
}
