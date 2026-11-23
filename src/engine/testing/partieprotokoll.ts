import { ermittleAktionen } from '../aktionen/enumerieren';
import type { Ereignis, Kartenort, Korbbonus, SpielAktion } from '../aktionen/typen';
import { AUFGABENNAMEN } from '../aufgabenKarten';
import { alleSpielkarten } from '../invarianten';
import { findeSchlange } from '../schlangen';
import { berechneEndwertung } from '../scoring';
import type { Schlange, Spielkarte, Spielzustand } from '../types';
import { spielerIndexVon } from '../zugablauf';
import { ENGINE_MOTOR, spieleDauerlaufPartie } from './dauerlauf';
import type { DauerlaufPartie, Motor, SchrittPruefer } from './dauerlauf';

/*
Das lesbare Protokoll einer Zufallspartie, Zug für Zug (E11, Kriterium 5). Es
ist der Golden Master der Basis-Engine: Ein Prüfer liest es gegen Teil A,
bevor es eingefroren wird, und der Test vergleicht danach jede Partie mit ihm.

Gespielt wird wie im Dauerlauf (`dauerlauf.ts`, mit Invarianten, Speichern
und Laden und der Prüfung jeder aufgezählten Aktion; weitere Prüfer gibt der
Aufrufer mit); gewählt wird gleichverteilt unter den aufgezählten Aktionen, die
vorher nach ihrer JSON-Form sortiert sind. So ändert eine neue Reihenfolge der
Aufzählung die Partie nicht, eine neue Regel aber schon.

Der Tisch steht offen da, auch die Hände: Das Protokoll ist für Prüfer, nicht
für Spieler (B2 gilt für die Oberfläche).
*/

export interface Partieprotokoll {
  text: string;
  schritte: number;
}

/** Sortiert die Aufzählung, bevor der Lauf wählt; prüft und wendet an wie die Engine. */
const SORTIERTER_MOTOR: Motor = {
  ...ENGINE_MOTOR,
  aktionen: (zustand) =>
    ermittleAktionen(zustand)
      .map((aktion) => [JSON.stringify(aktion), aktion] as const)
      .sort(([links], [rechts]) => (links < rechts ? -1 : links > rechts ? 1 : 0))
      .map(([, aktion]) => aktion),
};

function karten(anzahl: number): string {
  return `${anzahl} ${anzahl === 1 ? 'Karte' : 'Karten'}`;
}

function kartenname(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? karte.farbe : karte.name;
}

function aufgabe(id: string): string {
  return `${AUFGABENNAMEN.get(id) ?? id} (${id})`;
}

class Schreiber {
  readonly zeilen: string[] = [];
  /** Jede Spielkarte nach Id; die Ids ändern sich nie, deshalb reicht der Anfang. */
  private readonly bekannt: ReadonlyMap<string, Spielkarte>;
  private zustand: Spielzustand;

  constructor(anfang: Spielzustand) {
    this.zustand = anfang;
    this.bekannt = new Map(alleSpielkarten(anfang).map((karte) => [karte.id, karte]));
  }

  setze(zustand: Spielzustand): void {
    this.zustand = zustand;
  }

  zeile(text: string): void {
    this.zeilen.push(text);
  }

  spieler(index: number): string {
    return this.zustand.spieler[index].name;
  }

  spielerMitId(id: string): string {
    const index = spielerIndexVon(this.zustand, id);
    return index < 0 ? id : this.spieler(index);
  }

  karte(id: string): string {
    const karte = this.bekannt.get(id);
    return karte === undefined ? id : `${kartenname(karte)} (${id})`;
  }

  besitzerVon(schlangenId: string): string {
    const gefunden = findeSchlange(this.zustand, schlangenId);
    return gefunden === null ? schlangenId : `${schlangenId} von ${this.spieler(gefunden.besitzer)}`;
  }

  schlange(schlange: Schlange): string {
    const glieder = schlange.karten.map((karte) => {
      const fusion = schlange.fusionen.find((eintrag) => eintrag.karteId === karte.id);
      return fusion === undefined ? kartenname(karte) : `Farbenfusion[${fusion.unter.map(kartenname).join('+')}]`;
    });
    return `${schlange.id}: ${glieder.join(' - ')}`;
  }

  ort(ort: Kartenort): string {
    switch (ort.ort) {
      case 'Schlange':
        return `${this.besitzerVon(ort.schlangenId)}, Stelle ${ort.position}`;
      case 'UnterFusion':
        return `unter ${this.karte(ort.fusionId)} in ${this.besitzerVon(ort.schlangenId)}, Stelle ${ort.position}`;
      case 'Ablagestapel':
        return `Ablagestapel von ${this.spieler(ort.spielerIndex)}`;
      case 'VorSpieler':
        return `vor ${this.spieler(ort.spielerIndex)}`;
      case 'Hand':
        return `Hand von ${this.spieler(ort.spielerIndex)}`;
      case 'Nachziehstapel':
        return 'Nachziehstapel';
      case 'Schwebend':
        return 'angesagt';
      case 'AusDemSpiel':
        return 'aus dem Spiel';
      case 'Aufgedeckt':
        return `aufgedeckt, Stelle ${ort.position}`;
    }
  }

  aktion(aktion: SpielAktion): string {
    const wer = this.spielerMitId(aktion.spielerId);
    switch (aktion.typ) {
      case 'FarbkarteLegen':
        return aktion.ziel.art === 'neueSchlange'
          ? `${wer} beginnt mit ${this.karte(aktion.karteId)} eine neue Schlange.`
          : `${wer} legt ${this.karte(aktion.karteId)} an ${aktion.ziel.seite === 'anfang' ? 'den Anfang' : 'das Ende'} von ${this.besitzerVon(aktion.ziel.schlangenId)}.`;
      case 'RegenbogenschlangeLegen':
      case 'BlockadeLegen':
        return `${wer} legt ${this.karte(aktion.karteId)} in ${this.besitzerVon(aktion.schlangenId)} an Stelle ${aktion.position}.`;
      case 'FusionLegen':
        return `${wer} legt ${this.karte(aktion.karteId)} auf ${aktion.kartenIds.map((id) => this.karte(id)).join(' und ')} in ${this.besitzerVon(aktion.schlangenId)}.`;
      case 'FarbendiebSpielen': {
        const ziel = aktion.ziel.art === 'neueSchlange' ? 'als neue eigene Schlange' : `in ${this.besitzerVon(aktion.ziel.schlangenId)} an Stelle ${aktion.ziel.position}`;
        return `${wer} stiehlt mit ${this.karte(aktion.karteId)} ${this.karte(aktion.quelle.karteId)} aus ${this.besitzerVon(aktion.quelle.schlangenId)} und legt sie ${ziel}.`;
      }
      case 'SchlangenfrassSpielen': {
        const option = { eigeneKarte: 'a', eigeneBlockade: 'b', gegnerischeKarten: 'c' }[aktion.option];
        const ziele = aktion.ziele.map((ziel) => `${this.karte(ziel.karteId)} aus ${this.besitzerVon(ziel.schlangenId)}`).join(' und ');
        return `${wer} frisst mit ${this.karte(aktion.karteId)}, Option ${option}), ${ziele}.`;
      }
      case 'SchlangengrubeSpielen':
        return `${wer} spielt ${this.karte(aktion.karteId)} auf ${this.spielerMitId(aktion.zielSpielerId)}.`;
      case 'VerdopplerSpielen':
        return `${wer} spielt ${this.karte(aktion.karteId)}.`;
      case 'SchlangenhaeutungSpielen':
        return `${wer} ordnet mit ${this.karte(aktion.karteId)} in ${this.besitzerVon(aktion.schlangenId)} neu: ${aktion.neueReihenfolge.map((id) => this.karte(id)).join(', ')}.`;
      case 'SonderkarteWirkungslosAblegen':
        return `${wer} legt ${this.karte(aktion.karteId)} ohne Wirkung ab.`;
      case 'ZugBeenden':
        return `${wer} beendet den Zug.`;
      case 'UeberhandAbwerfen':
        return `${wer} wirft ab: ${aktion.karteIds.map((id) => this.karte(id)).join(', ')}.`;
      case 'Reagieren':
        return aktion.farbenschutzId === null ? `${wer} lässt durch.` : `${wer} wehrt mit ${this.karte(aktion.farbenschutzId)} ab.`;
      case 'Entscheiden':
        return `${wer} wählt „${aktion.wahl}“.`;
      case 'SchlangenkorbSpielen':
        return `${wer} spielt ${this.karte(aktion.karteId)}: ${this.korbbonus(aktion.bonus)}.`;
      case 'AbwerfenUndZiehen':
        return `${wer} wirft ${aktion.karteIds.map((id) => this.karte(id)).join(' und ')} ab und zieht bis zu drei Karten.`;
    }
  }

  korbbonus(bonus: Korbbonus): string {
    switch (bonus.art) {
      case 'ziehen':
        return 'zieht 3 Karten und spielt bis zu 2 davon';
      case 'tauschen':
        return `tauscht ${bonus.tausch.map((paar) => `${this.karte(paar.karteId)} aus ${this.besitzerVon(paar.schlangenId)} gegen ${this.karte(paar.handkarteId)}`).join(' und ')}`;
      case 'entfernen':
        return `entfernt ${this.karte(bonus.ziel.karteId)} aus ${this.besitzerVon(bonus.ziel.schlangenId)}`;
      case 'aktionen':
        return 'zwei zusätzliche Aktionen';
    }
  }

  ereignis(ereignis: Ereignis): string | null {
    switch (ereignis.typ) {
      case 'KarteGespielt':
        return `${this.karte(ereignis.karteId)} liegt jetzt: ${this.ort(ereignis.nach)}.`;
      case 'KarteAngesagt':
        return `${this.karte(ereignis.karteId)} ist angesagt; betroffen: ${ereignis.betroffene.map((index) => this.spieler(index)).join(', ')}.`;
      case 'AbwehrGefragt':
        return `${this.spieler(ereignis.spielerIndex)} entscheidet, ob er abwehrt.`;
      case 'AnsageEntschieden': {
        const abgewehrt = ereignis.abgewehrt.length === 0 ? 'niemand hat abgewehrt' : `abgewehrt von ${ereignis.abgewehrt.map((index) => this.spieler(index)).join(', ')}`;
        return `Entschieden, ${abgewehrt}${ereignis.ohneWirkung ? ', ohne Wirkung' : ''}; ${this.karte(ereignis.karteId)} liegt jetzt: ${this.ort(ereignis.nach)}.`;
      }
      case 'KartenVersetzt': {
        const versetzt = ereignis.karten.map((karte) => `${karte.karteId === null ? 'eine verdeckte Karte' : this.karte(karte.karteId)} von ${this.ort(karte.von)} nach ${this.ort(karte.nach)}`);
        const aufgeloest = ereignis.aufgeloest.length === 0 ? '' : `; aufgelöst: ${ereignis.aufgeloest.join(', ')}`;
        return `Versetzt: ${versetzt.join('; ')}${aufgeloest}.`;
      }
      case 'KartenGezogen':
        return `${this.spieler(ereignis.spielerIndex)} zieht ${karten(ereignis.anzahl)}.`;
      case 'AbwerfenVerlangt':
        return `${this.spieler(ereignis.spielerIndex)} hält mehr als 5 Karten und wirft ${ereignis.anzahl} ab.`;
      case 'KartenAbgeworfen':
        return `Abgeworfen auf den eigenen Ablagestapel: ${ereignis.karteIds.map((id) => this.karte(id)).join(', ')}.`;
      case 'ZugBegonnen':
        // Steht als Überschrift des nächsten Zuges da.
        return null;
      case 'Abgewehrt':
        return `${this.spieler(ereignis.spielerIndex)} wehrt ${this.karte(ereignis.gegen)} mit ${this.karte(ereignis.karteId)} ab.`;
      case 'Ausgesetzt':
        return `${this.spieler(ereignis.spielerIndex)} setzt aus; ${this.karte(ereignis.karteId)} kommt auf den Ablagestapel von ${this.spieler(ereignis.ablagestapelVon)}.`;
      case 'GrubeOhneWirkung':
        return `${this.spieler(ereignis.spielerIndex)} hat keinen Zug mehr; ${this.karte(ereignis.karteId)} kommt ohne Wirkung auf den Ablagestapel von ${this.spieler(ereignis.ablagestapelVon)}.`;
      case 'EntscheidungVerlangt':
        return `${this.spieler(ereignis.spielerIndex)} entscheidet über „${ereignis.art}“ zu ${this.karte(ereignis.karteId)}: ${ereignis.optionen.join(', ')}.`;
      case 'Entschieden':
        return `${this.spieler(ereignis.spielerIndex)} hat bei „${ereignis.art}“ „${ereignis.wahl}“ gewählt.`;
      case 'SchlussrundeBegonnen':
        return `Der Nachziehstapel ist leer: Die Schlussrunde beginnt, ausgelöst von ${this.spieler(ereignis.ausloeser)}.`;
      case 'PartieBeendet':
        return 'Die Partie ist beendet.';
      case 'AufgabeErfuellt':
        return `${this.spieler(ereignis.spielerIndex)} erfüllt die Aufgabe ${aufgabe(ereignis.aufgabeId)} und nimmt sie zu sich.`;
      case 'AufgabeAufgedeckt':
        return `Vom Aufgabenstapel aufgedeckt: ${aufgabe(ereignis.aufgabeId)}, an der Stelle von ${aufgabe(ereignis.anStelleVon)}.`;
      case 'AufgabenstapelLeer':
        return `Der Aufgabenstapel ist leer; der Platz von ${aufgabe(ereignis.anStelleVon)} bleibt leer.`;
    }
  }

  lage(): void {
    for (const spieler of this.zustand.spieler) {
      const hand = spieler.hand.length === 0 ? 'leer' : spieler.hand.map((karte) => `${kartenname(karte)} (${karte.id})`).join(', ');
      const schlangen = spieler.schlangen.length === 0 ? 'keine' : spieler.schlangen.map((schlange) => this.schlange(schlange)).join(' | ');
      const oben = spieler.ablagestapel.at(-1);
      const ablage = oben === undefined ? karten(0) : `${karten(spieler.ablagestapel.length)}, oben ${kartenname(oben)}`;
      this.zeile(`    ${spieler.name}: Hand ${hand}`);
      this.zeile(`      Schlangen: ${schlangen}; Ablagestapel: ${ablage}`);
    }
    const gruben = this.zustand.ausliegendeGruben.map((grube) => `${this.karte(grube.karte.id)} vor ${this.spieler(grube.vor)}`);
    this.zeile(`    Nachziehstapel: ${karten(this.zustand.nachziehstapel.length)}${gruben.length === 0 ? '' : `; liegt aus: ${gruben.join(', ')}`}`);
  }

  zugkopf(): void {
    const { zug, partiephase } = this.zustand;
    const teil = zug.teilzug === 2 ? ', zweiter Zug nach dem Verdoppler' : '';
    this.zeile('');
    this.zeile(`Zug von ${this.spieler(zug.spielerIndex)}${teil}${partiephase === 'Schlussrunde' ? ' (Schlussrunde)' : ''}`);
    this.lage();
  }

  wertung(): void {
    const endwertung = berechneEndwertung(this.zustand);
    this.zeile('');
    this.zeile('Endwertung (A11)');
    for (const wertung of endwertung.spieler) {
      this.zeile(`  ${wertung.name}: Summe ${wertung.summe}`);
      for (const schlange of wertung.schlangen) {
        const gruppen = schlange.gruppen.map((gruppe) => `${gruppe.farbe} ×${gruppe.laenge} = ${gruppe.punkte}`).join(', ');
        const joker = schlange.joker.map((eintrag) => `${this.karte(eintrag.karteId)} als ${eintrag.farbe ?? 'keine Farbe'}`).join(', ');
        this.zeile(`    ${schlange.schlangenId}: Gruppen ${gruppen === '' ? 'keine' : gruppen}, zusammen ${schlange.gruppenPunkte}${joker === '' ? '' : `; Joker: ${joker}`}`);
      }
      const kette = wertung.kette === null || wertung.kette.laenge === 0 ? 'keine Kette ab 3 Farbkarten' : `Kette ${wertung.kette.laenge}, Bonus ${wertung.kette.bonus}`;
      this.zeile(`    Gruppenpunkte ${wertung.gruppenPunkte}; ${kette}`);
    }
    const gewinner = endwertung.spieler.filter((wertung) => endwertung.gewinner.includes(wertung.spielerId)).map((wertung) => wertung.name);
    this.zeile(`  Gewonnen: ${gewinner.join(', ')} mit ${endwertung.hoechstePunktzahl} Punkten.`);
  }
}

/**
 * Spielt die Partie und schreibt ihr Protokoll. `pruefer` sieht jeden Schritt
 * wie im Dauerlauf. Endet die Partie nicht regulär oder meldet ein Prüfer einen
 * Verstoss, wirft die Funktion mit dem Befund, statt ein Protokoll zu liefern.
 */
export function protokolliere(partie: DauerlaufPartie, pruefer: SchrittPruefer = () => null): Partieprotokoll {
  let schreiber: Schreiber | null = null;
  let schritt = 0;

  const schreibe: SchrittPruefer = (vorher, aktion, ergebnis) => {
    if (schreiber === null) {
      schreiber = new Schreiber(vorher);
      schreiber.zeile(`Partie aus Saat ${partie.saat}, ${partie.spielerzahl} Spieler, ${partie.erweiterung ? 'mit' : 'ohne'} Erweiterung`);
      schreiber.zeile('Gewählt wird gleichverteilt unter den aufgezählten Aktionen (nach ihrer JSON-Form sortiert).');
      schreiber.zeile(`Aufbau (A4): je 5 Handkarten, ${karten(vorher.nachziehstapel.length)} im Nachziehstapel.`);
      schreiber.zugkopf();
    }
    schritt += 1;
    // `vorher` ist der Zustand nach dem vorigen Schritt; der Schreiber steht schon dort.
    schreiber.zeile(`  ${schritt}. ${schreiber.aktion(aktion)}`);
    schreiber.setze(ergebnis.zustand);
    for (const ereignis of ergebnis.ereignisse) {
      const text = schreiber.ereignis(ereignis);
      if (text !== null) schreiber.zeile(`     ${text}`);
    }
    if (ergebnis.ereignisse.some((ereignis) => ereignis.typ === 'ZugBegonnen')) schreiber.zugkopf();
    return pruefer(vorher, aktion, ergebnis);
  };

  const ergebnis = spieleDauerlaufPartie(partie, { motor: SORTIERTER_MOTOR, neuerPruefer: () => schreibe });
  // Ohne Schritt gäbe es weder Aufbau noch Ende; eine Partie endet aber nie ohne Zug.
  const fertig = schreiber as Schreiber | null;
  if (ergebnis.ausgang !== 'beendet' || fertig === null) {
    throw new Error(`Partie aus Saat ${partie.saat} endet nicht regulär: ${ergebnis.ausgang}, ${ergebnis.detail}`);
  }
  fertig.zeile('');
  fertig.zeile('Lage am Ende');
  fertig.lage();
  fertig.wertung();
  return { text: `${fertig.zeilen.join('\n')}\n`, schritte: ergebnis.schritte };
}
