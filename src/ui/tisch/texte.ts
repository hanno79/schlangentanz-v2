import type { Farbe } from '../../engine'
import type { Person, StatusAnsicht } from '../spiel/tischAnsicht'
import { zusatzaktionenText } from './erweiterungstexte'

/*
Alle Anzeigetexte des Spieltischs an einer Stelle (docs/regeln/web.md, „Texte“).
Der Mensch heisst am Tisch „du“; Gegner heissen, wie die Engine sie nennt.
*/

export const TISCH = {
  zurLobby: 'Zur Lobby',
  gegner: 'Gegner',
  flaeche: 'Tischfläche',
  mitte: 'Tischmitte',
  nachziehstapel: 'Nachziehstapel',
  nachziehstapelLeer: 'Nachziehstapel leer',
  /** Kurz in der Kopfleiste. */
  stapel: 'Stapel',
  leer: 'leer',
  offeneAufgaben: 'Offene Aufgaben',
  auslage: 'Deine Auslage',
  geheim: 'geheim',
  verbraucht: 'verbraucht',
  deinPlatz: 'Dein Platz',
  deineSchlangen: 'Deine Schlangen',
  deineHand: 'Deine Hand',
  handkartenListe: 'Handkarten',
  keineSchlange: 'Noch keine Schlange',
  keineHandkarte: 'Keine Karte auf der Hand',
  istDran: 'ist dran',
  schlussrunde: 'Schlussrunde',
  unterFusion: 'Unter der Farbenfusion',
  /** Vorgelesen vor den Punkten am Tisch (O8, Kriterium 5). */
  zwischenstand: 'Zwischenstand ohne Kettenbonus:',
}

/** „1 Punkt“ oder „12 Punkte“, am Tisch und in der Wertung. */
export const punkteText = (anzahl: number): string => (anzahl === 1 ? '1 Punkt' : `${anzahl} Punkte`)

/** Das Zeichen am Rand eines Bereichs, hinter dem noch etwas liegt (`Weiter`); mit `ziel` liegt dort auch ein Ziel (O5). */
export const WEITER = {
  rechts: (anzahl: number, ziel: boolean) => `${ziel ? 'Ziel ' : ''}${anzahl > 0 ? `+${anzahl} ` : ''}›`,
  links: (anzahl: number, ziel: boolean) => `‹${anzahl > 0 ? ` +${anzahl}` : ''}${ziel ? ' Ziel' : ''}`,
  unten: 'mehr ↓',
  oben: 'mehr ↑',
}

export const anzahlKarten = (anzahl: number): string => (anzahl === 1 ? '1 Karte' : `${anzahl} Karten`)

export const handkartenText = (anzahl: number): string => (anzahl === 1 ? '1 Handkarte' : `${anzahl} Handkarten`)

export const ablageText = (anzahl: number, eigene: boolean): string => {
  const titel = eigene ? 'Deine Ablage' : 'Ablage'
  return anzahl === 0 ? `${titel} leer` : `${titel} ${anzahl}`
}

export const deineHandTitel = (anzahl: number): string => `${TISCH.deineHand} · ${anzahlKarten(anzahl)}`

/** „von dir“ oder „von KI-Gegner 1“. */
const von = (person: Person): string => (person.ich ? 'von dir' : `von ${person.name}`)

export const grubeText = (person: Person): string => `Schlangengrube ${von(person)}`

export const geheimeAufgabeName = (kartenname: string): string => `Deine geheime ${kartenname}`

/** „Deine Schlange 1“ oder „KI-Gegner 2, Schlange 1“. */
export const schlangenTitel = (besitzer: Person, nummer: number): string =>
  besitzer.ich ? `Deine Schlange ${nummer}` : `${besitzer.name}, Schlange ${nummer}`

/** Der zugängliche Name einer Schlange: Länge und Farbgruppen in Worten, weil der Balken darunter nur zu sehen ist. */
export function schlangenName(titel: string, laenge: number, farbgruppen: { farbe: Farbe; laenge: number }[]): string {
  const gruppen = farbgruppen.length === 0 ? 'keine Farbgruppe' : `Farbgruppen ${farbgruppen.map((gruppe) => `${gruppe.farbe} (${gruppe.laenge})`).join(', ')}`
  return `${titel}: ${anzahlKarten(laenge)}, ${gruppen}`
}

/** Die Statuszeile: wer ist dran, was steht an. Die Schlussrunde zeigt die Statuszeile als eigenes Abzeichen. */
export function statusText(status: StatusAnsicht): { titel: string; text: string } {
  const { amZug } = status
  if (amZug === null) return { titel: 'Die Partie ist beendet.', text: '' }
  if (status.schwebend !== null) {
    const { karte, von: spieler, entscheidet } = status.schwebend
    const titel = `${spieler.ich ? 'Du spielst' : `${spieler.name} spielt`} ${karte}`
    const text = entscheidet.ich ? 'Du entscheidest, ob du abwehrst.' : `${entscheidet.name} entscheidet, ob abgewehrt wird.`
    return { titel, text }
  }
  // „ist dran“ bleibt beisammen; umbrechen darf die Zeile nur vor „ist“.
  const titel = amZug.ich ? 'Du bist\u00a0dran' : `${amZug.name} ist\u00a0dran`
  const teile: string[] = []
  // X3: Eine Entscheidung der Erweiterung trifft auch einer, der nicht am Zug ist.
  if (status.entscheidet !== null) return { titel, text: status.entscheidet.ich ? 'Du entscheidest.' : `${status.entscheidet.name} entscheidet.` }
  if (status.teilzug === 2) teile.push('Zweiter Zug nach dem Verdoppler')
  // A8.1, A7.10: Comeback-Karte und Schlangenkorb geben dem Zug Zusatzaktionen; dann steht das statt „Spiele Karten …“, damit die Zeile kurz bleibt.
  if (status.zusatzaktionen > 0 && status.abschnitt === 'Ausspielen') teile.push(zusatzaktionenText(status.zusatzaktionen))
  else if (amZug.ich) teile.push(status.abschnitt === 'Abwerfen' ? 'Lege überzählige Handkarten ab.' : 'Spiele Karten aus deiner Hand.')
  else if (status.abschnitt === 'Abwerfen') teile.push('legt überzählige Handkarten ab')
  return { titel, text: teile.join(': ') }
}
