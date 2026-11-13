import type { Farbe } from '../../engine'
import type { Person, StatusAnsicht } from '../spiel/tischAnsicht'

/*
Alle Anzeigetexte des Spieltischs an einer Stelle (docs/regeln/web.md, „Texte“).
Der Mensch heisst am Tisch „du“; Gegner heissen, wie die Engine sie nennt.
*/

export const TISCH = {
  zurLobby: 'Zur Lobby',
  gegner: 'Gegner',
  mitte: 'Tischmitte',
  nachziehstapel: 'Nachziehstapel',
  nachziehstapelLeer: 'Nachziehstapel leer',
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
  schliessen: 'Schliessen',
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
  if (status.partiephase === 'Beendet') return { titel: 'Die Partie ist beendet.', text: '' }
  if (status.schwebend !== null) {
    const { karte, von: spieler, entscheidet } = status.schwebend
    const titel = `${spieler.ich ? 'Du spielst' : `${spieler.name} spielt`} ${karte}`
    const text = entscheidet.ich ? 'Du entscheidest, ob du abwehrst.' : `${entscheidet.name} entscheidet, ob abgewehrt wird.`
    return { titel, text }
  }
  const titel = status.amZug.ich ? 'Du bist dran' : `${status.amZug.name} ist dran`
  const teile: string[] = []
  if (status.teilzug === 2) teile.push('Zweiter Zug nach dem Verdoppler')
  if (status.amZug.ich) teile.push(status.abschnitt === 'Abwerfen' ? 'Lege überzählige Handkarten ab.' : 'Spiele Karten aus deiner Hand.')
  else if (status.abschnitt === 'Abwerfen') teile.push('legt überzählige Handkarten ab')
  return { titel, text: teile.join(': ') }
}
