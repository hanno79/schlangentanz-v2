import { HANDKARTEN } from '../../engine'
import type { KartenAktion, SonderkarteWirkungslosAblegenAktion } from '../../engine'
import { kartenkurzname } from '../karten/kartentexte'
import type { Person, TischAnsicht } from '../spiel/tischAnsicht'
import { satzanfang } from './erweiterungstexte'
import { anzahlKarten } from './texte'
import { ansage, tischnamen } from './zugtexte'
import type { Tischnamen } from './zugtexte'

/*
Die Texte des Protokolls, der Abwehrfrage und der Gegnerzüge (Plan O6) an einer
Stelle (docs/regeln/web.md, „Texte“). Sie beschreiben, was die Engine gemeldet
hat; eine Regel steht hier keine. Du heisst „du“, die Gegner heissen, wie die
Engine sie nennt.
*/

export const PROTOKOLL = {
  titel: 'Protokoll',
  leer: 'Noch kein Schritt',
  schneller: 'Schneller',
  ausgesetzt: 'Du hast wegen der Schlangengrube einen Zug ausgesetzt.',
}

export const ABWEHRFRAGE = {
  titel: 'Abwehrfrage',
  abwehren: 'Abwehren',
  durchlassen: 'Durchlassen',
  // A6, A7.2: Der Farbenschutz kommt auf deinen Ablagestapel; wer ausserhalb seines Zuges spielt, füllt erst zu Beginn seines nächsten Zuges auf.
  mitSchutz: 'Mit einem Farbenschutz wehrst du sie ab. Er kommt auf deine Ablage, und du ziehst erst zu Beginn deines nächsten Zuges nach.',
  ohneSchutz: 'Du hast keinen Farbenschutz auf der Hand und kannst nur durchlassen.',
}

/** „bei dir“, „bei KI-Gegner 2“. */
const bei = (person: Person) => (person.ich ? 'dir' : person.name)

export const SCHRITT = {
  spielt: (person: Person, karte: string) => `${satzanfang(person, 'Du spielst', 'spielt')}: ${karte}`,
  sagtAn: (person: Person, karte: string) => `${satzanfang(person, 'Du sagst an', 'sagt an')}: ${karte}`,
  wehrtAb: (person: Person, karte: string) => `${satzanfang(person, 'Du wehrst', 'wehrt')} ${karte} mit Farbenschutz ab.`,
  laesstDurch: (person: Person, karte: string) => `${satzanfang(person, 'Du lässt', 'lässt')} ${karte} durch.`,
  wirkt: (karte: string, abgewehrt: readonly Person[]) =>
    abgewehrt.length === 0 ? `${karte} wirkt.` : `${karte} wirkt, nicht aber bei ${abgewehrt.map(bei).join(' und ')}.`,
  ohneWirkung: (karte: string) => `${karte} bleibt ohne Wirkung.`,
  setztAus: (person: Person) => `${satzanfang(person, 'Du setzt', 'setzt')} diesen Zug aus (Schlangengrube).`,
  // D29: Wer keinen Zug mehr hat, für den bleibt die Schlangengrube ohne Wirkung.
  grubeOhneZug: (person: Person) =>
    person.ich ? 'Die Schlangengrube vor dir bleibt ohne Wirkung: Du hast keinen Zug mehr.' : `Die Schlangengrube vor ${person.name} bleibt ohne Wirkung: ${person.name} hat keinen Zug mehr.`,
  istDran: (person: Person, teilzug: 1 | 2) => {
    if (teilzug === 2) return `${satzanfang(person, 'Du spielst', 'spielt')} den zweiten Zug nach dem Verdoppler.`
    return person.ich ? 'Du bist dran.' : `${person.name} ist dran.`
  },
  zieht: (person: Person, anzahl: number) => `${satzanfang(person, 'Du ziehst', 'zieht')} ${anzahlKarten(anzahl)}.`,
  // A5, A8.2: Wer am Zugende mehr als 5 Karten hält, zieht nichts nach und legt die überzähligen ab.
  mussAblegen: (person: Person, anzahl: number) =>
    `${satzanfang(person, 'Du hältst', 'hält')} mehr als ${HANDKARTEN} Karten und ${person.ich ? 'legst' : 'legt'} ${anzahlKarten(anzahl)} ab.`,
  legtAb: (person: Person, anzahl: number) =>
    `${satzanfang(person, 'Du legst', 'legt')} ${anzahl === 1 ? '1 überzählige Karte' : `${anzahl} überzählige Karten`} ab.`,
  // A8.2: Welche Aktion gespielt ist, ist offen; was aufgedeckt ist und wie die Wahl ausgeht, sagen die Sätze aus `erweiterungstexte.ts` (O10).
  risiko: (person: Person, aktion: string, benannt: string | null) =>
    `${satzanfang(person, 'Du spielst', 'spielt')} eine Risiko-Belohnungs-Karte: ${aktion}${benannt === null ? '' : `, benannt: ${benannt}`}.`,
  // X4, A8.1, D49: die Comeback-Karte und ihre Zusatzaktion „Zwei Karten abwerfen, drei ziehen“.
  comeback: (person: Person) =>
    person.ich ? 'Du setzt die Comeback-Karte ein und hast zwei zusätzliche Aktionen.' : `${person.name} setzt die Comeback-Karte ein und hat zwei zusätzliche Aktionen.`,
  wirftAb: (person: Person, anzahl: number) => `${satzanfang(person, 'Du wirfst', 'wirft')} ${anzahlKarten(anzahl)} ab.`,
  // A9, D5: Eine offene Aufgabe ist erfüllt, eine neue rückt nach; die geheime meldet die Engine nicht (D35, B2).
  aufgabeErfuellt: (person: Person, aufgabe: string) => `${satzanfang(person, 'Du erfüllst', 'erfüllt')} die Aufgabe ${aufgabe}.`,
  aufgabeAufgedeckt: (aufgabe: string) => `Neu offen liegt die Aufgabe ${aufgabe}.`,
  aufgabenstapelLeer: 'Der Aufgabenstapel ist leer; es rückt keine Aufgabe nach.',
  schlussrunde: 'Der Nachziehstapel ist leer: Die Schlussrunde beginnt.',
  beendet: 'Die Partie ist beendet.',
}

/**
 * Karte und Ziel eines Schritts, wie in der Ansage (`ansage`). Was die Ansage in
 * deiner Bedienung anders sagt, steht hier für jeden Spieler: der Verdoppler und
 * das Ablegen ohne Wirkung (A7.8, D13).
 */
export function kartenSatz(aktion: KartenAktion | SonderkarteWirkungslosAblegenAktion, namen: Tischnamen, wer: Person): string {
  const kurz = kartenkurzname(namen.karte(aktion.karteId))
  switch (aktion.typ) {
    case 'VerdopplerSpielen':
      return 'Verdoppler, danach folgt ein zweiter Zug.'
    case 'SonderkarteWirkungslosAblegen':
      return `${kurz} ohne Wirkung auf ${wer.ich ? 'deine' : 'die eigene'} Ablage.`
    default:
      return ansage(aktion, namen)
  }
}

/** Die offene Ansage als Satz, wie sie das Protokoll nennt: „KI-Gegner 1 sagt an: …“ (Abwehrfrage, O6). */
export function ansageSatz(ansicht: TischAnsicht): string {
  const { schwebend } = ansicht.status
  if (schwebend === null) throw new Error('Abwehrfrage: Es schwebt keine Karte, über die du entscheidest (A6).')
  return SCHRITT.sagtAn(schwebend.von, kartenSatz(schwebend.ansage, tischnamen(ansicht), schwebend.von))
}
