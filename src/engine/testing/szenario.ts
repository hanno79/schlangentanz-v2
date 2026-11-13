import type { KartenAktion } from '../aktionen/typen';
import { FARBEN } from '../deck';
import { pruefeInvarianten } from '../invarianten';
import { erstelleTisch, schlangenIdFuer, teileReihumAus } from '../state';
import type { TischOptionen } from '../state';
import type { FarbkarteInfo, Farbe, Schlange, Sonderkartenname, SonderkarteInfo, Spielkarte, Spielzustand } from '../types';

/*
Der Szenario-Baukasten (Plan E1, Kriterium 8) baut Zustände für Tests und den
Entwicklertisch nur aus echtem Material: Jede Karte kommt aus dem Nachziehstapel
eines Tisches nach A4, keine wird erfunden. Was am Ende herauskommt, erfüllt
jede Invariante, sonst wirft `zustand()`.
*/

/** Eine Karte nach Farbe, nach Name der Sonderkarte oder genau diese Id. */
export type Kartenwahl = Farbe | Sonderkartenname | { id: string };

/** Ein Glied einer Schlange; `fusion` legt eine Farbenfusion auf die zwei genannten Farbkarten. */
export type Schlangenglied = Kartenwahl | { fusion: [Kartenwahl, Kartenwahl] };

export interface Baukasten {
  hand(spieler: number, karten: Kartenwahl[]): Baukasten;
  schlange(spieler: number, glieder: Schlangenglied[]): Baukasten;
  ablage(spieler: number, karten: Kartenwahl[]): Baukasten;
  /** Eine Schlangengrube, die `gespieltVon` vor `vor` gelegt hat (A7.6). */
  grube(gespieltVon: number, vor: number): Baukasten;
  ausDemSpiel(karten: Kartenwahl[]): Baukasten;
  /** Legt diese Karten in dieser Reihenfolge oben auf den Nachziehstapel. */
  stapelOben(karten: Kartenwahl[]): Baukasten;
  /** Lässt die obersten `anzahl` Karten im Nachziehstapel und legt die übrigen reihum auf die Ablagestapel. */
  stapelBehalten(anzahl: number): Baukasten;
  /** Teilt reihum von oben aus, bis jeder 5 Handkarten hat oder der Stapel leer ist. */
  haendeAuffuellen(): Baukasten;
  amZug(spieler: number, teilzug?: 1 | 2): Baukasten;
  /** Eine angesagte Sonderkarte von `spieler`, über die `ausstehend` noch entscheiden (A6). */
  schwebend(spieler: number, karte: Kartenwahl, aktion: (karteId: string, spielerId: string) => KartenAktion, ausstehend: number[]): Baukasten;
  schlussrunde(ausloeser: number): Baukasten;
  beendet(ausloeser: number): Baukasten;
  /** Für alles Übrige; `zustand()` prüft danach trotzdem jede Invariante. */
  aendere(veraendere: (zustand: Spielzustand) => void): Baukasten;
  /** Die Karten, die noch frei im Nachziehstapel liegen, oberste zuerst. Nur lesen. */
  frei(): readonly Spielkarte[];
  zustand(): Spielzustand;
}

function beschreibe(wahl: Kartenwahl): string {
  return typeof wahl === 'string' ? `„${wahl}“` : `der Id ${wahl.id}`;
}

function passt(karte: Spielkarte, wahl: Kartenwahl): boolean {
  if (typeof wahl !== 'string') return karte.id === wahl.id;
  if ((FARBEN as readonly string[]).includes(wahl)) return karte.typ === 'Farbkarte' && karte.farbe === wahl;
  return karte.typ === 'Sonderkarte' && karte.name === wahl;
}

export function baukasten(optionen: TischOptionen): Baukasten {
  const zustand = erstelleTisch(optionen);

  function spieler(index: number) {
    const gefunden = zustand.spieler[index];
    if (gefunden === undefined) throw new Error(`Baukasten: Spieler ${index} gibt es bei ${zustand.spieler.length} Spielern nicht.`);
    return gefunden;
  }

  function nimm(wahl: Kartenwahl): Spielkarte {
    const index = zustand.nachziehstapel.findIndex((karte) => passt(karte, wahl));
    if (index < 0) {
      const ohne = zustand.erweiterung ? '' : ' (Partie ohne Erweiterung)';
      throw new Error(`Baukasten: Keine freie Karte mit ${beschreibe(wahl)} mehr im Nachziehstapel${ohne}.`);
    }
    return zustand.nachziehstapel.splice(index, 1)[0];
  }

  function nimmSonderkarte(wahl: Kartenwahl): SonderkarteInfo {
    const karte = nimm(wahl);
    if (karte.typ !== 'Sonderkarte') throw new Error(`Baukasten: ${karte.id} ist keine Sonderkarte.`);
    return karte;
  }

  function nimmFarbkarte(wahl: Kartenwahl): FarbkarteInfo {
    const karte = nimm(wahl);
    if (karte.typ !== 'Farbkarte') throw new Error(`Baukasten: Unter einer Farbenfusion liegen Farbkarten, ${karte.id} ist keine.`);
    return karte;
  }

  const bau: Baukasten = {
    hand(index, karten) {
      spieler(index).hand.push(...karten.map(nimm));
      return bau;
    },
    schlange(index, glieder) {
      const besitzer = spieler(index);
      zustand.schlangenZaehler += 1;
      const schlange: Schlange = { id: schlangenIdFuer(zustand.schlangenZaehler), karten: [], fusionen: [] };
      for (const glied of glieder) {
        if (typeof glied === 'object' && 'fusion' in glied) {
          const unter: [FarbkarteInfo, FarbkarteInfo] = [nimmFarbkarte(glied.fusion[0]), nimmFarbkarte(glied.fusion[1])];
          const fusion = nimmSonderkarte('Farbenfusion');
          schlange.karten.push(fusion);
          schlange.fusionen.push({ karteId: fusion.id, unter });
        } else {
          schlange.karten.push(nimm(glied));
        }
      }
      besitzer.schlangen.push(schlange);
      return bau;
    },
    ablage(index, karten) {
      spieler(index).ablagestapel.push(...karten.map(nimm));
      return bau;
    },
    grube(gespieltVon, vor) {
      spieler(gespieltVon);
      spieler(vor);
      zustand.ausliegendeGruben.push({ karte: nimmSonderkarte('Schlangengrube'), gespieltVon, vor });
      return bau;
    },
    ausDemSpiel(karten) {
      zustand.ausDemSpiel.push(...karten.map(nimm));
      return bau;
    },
    stapelOben(karten) {
      const oben = karten.map(nimm);
      zustand.nachziehstapel.unshift(...oben);
      return bau;
    },
    stapelBehalten(anzahl) {
      const rest = zustand.nachziehstapel.splice(anzahl);
      rest.forEach((karte, index) => zustand.spieler[index % zustand.spieler.length].ablagestapel.push(karte));
      return bau;
    },
    haendeAuffuellen() {
      teileReihumAus(zustand);
      return bau;
    },
    amZug(index, teilzug = 1) {
      spieler(index);
      zustand.zug = { ...zustand.zug, spielerIndex: index, teilzug };
      return bau;
    },
    schwebend(index, wahl, aktion, ausstehend) {
      const karte = nimmSonderkarte(wahl);
      zustand.schwebend = { karte, aktion: aktion(karte.id, spieler(index).id), ausstehend, abgewehrt: [] };
      return bau;
    },
    schlussrunde(ausloeser) {
      zustand.partiephase = 'Schlussrunde';
      zustand.schlussrundeAusloeser = ausloeser;
      return bau;
    },
    beendet(ausloeser) {
      zustand.partiephase = 'Beendet';
      zustand.schlussrundeAusloeser = ausloeser;
      return bau;
    },
    aendere(veraendere) {
      veraendere(zustand);
      return bau;
    },
    frei() {
      return [...zustand.nachziehstapel];
    },
    zustand() {
      const ergebnis = structuredClone(zustand);
      const verletzt = pruefeInvarianten(ergebnis).filter((befund) => befund.verletzt);
      if (verletzt.length > 0) {
        throw new Error(`Baukasten: Der Zustand verletzt ${verletzt.map((befund) => `„${befund.name}“ (${befund.detail})`).join(', ')}.`);
      }
      return ergebnis;
    },
  };
  return bau;
}
