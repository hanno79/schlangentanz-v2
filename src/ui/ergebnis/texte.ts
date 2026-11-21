import type { AufgabenEintrag, Farbe, GewerteteGruppe, JokerFarbe } from '../../engine'
import type { Person } from '../spiel/tischAnsicht'
import type { ErgebnisEintrag } from '../spiel/ergebnisAnsicht'
import { anzahlKarten, punkteText } from '../tisch/texte'

/*
Alle Anzeigetexte der Wertung nach Spielende an einer Stelle
(docs/regeln/web.md, „Texte“). Die Zahlen darin stammen aus der Endwertung der
Engine; die Texte setzen sie nur in Worte. Die Posten heissen wie im Entwurf
aus O1 (Farbgruppen, Vielfalt, Längste Kette, Aufgaben).
*/

export const ERGEBNIS = {
  rangliste: 'Wertung',
  sieger: 'Sieger',
  nochEinmal: 'Noch einmal',
  farbgruppen: 'Farbgruppen',
  vielfalt: 'Vielfalt',
  kette: 'Längste Kette',
  aufgaben: 'Aufgaben',
  keineSchlange: 'Keine Schlange',
  keineGruppe: 'Keine Farbgruppe',
  /** D24: Eine Kette zählt erst ab 3 Farbkarten derselben Farbe. */
  keineKette: 'Keine Kette ab 3 Farbkarten',
  keineAufgabe: 'Keine erfüllte Aufgabe',
  keineVielfalt: 'keine Farbe',
}

/** Der Mensch heisst in der Wertung „Du“, wie im Entwurf. */
export const anzeigename = (person: Person): string => (person.ich ? 'Du' : person.name)

/** „A“, „A und B“, „A, B und C“. */
function aufzaehlung(namen: string[]): string {
  return namen.length <= 1 ? namen.join('') : `${namen.slice(0, -1).join(', ')} und ${namen[namen.length - 1]}`
}

/** Der Titel der Seite: wer gewonnen hat, bei Gleichstand alle (D22). */
export function siegerTitel(sieger: Person[]): string {
  if (sieger.length === 1) return sieger[0].ich ? 'Du gewinnst!' : `${sieger[0].name} gewinnt!`
  return `Gleichstand: ${aufzaehlung(sieger.map(anzeigename))} gewinnen!`
}

/** „mit 1 Punkt“, „mit 12 Punkten“. */
const mitPunkten = (anzahl: number): string => (anzahl === 1 ? '1 Punkt' : `${anzahl} Punkten`)

/** Unter dem Titel: mit wie vielen Punkten, und wo du stehst, wenn du nicht gewonnen hast. */
export function siegerText(hoechste: number, du: ErgebnisEintrag): string {
  const mit = `Mit ${mitPunkten(hoechste)}.`
  return du.sieger ? mit : `${mit} Du bist auf Platz ${du.platz} mit ${mitPunkten(du.wertung.summe)}.`
}

export const platzText = (platz: number): string => `${platz}.`

export const schlangeTitel = (nummer: number, punkte: number): string => `Schlange ${nummer}: ${punkteText(punkte)}`

export const gruppeText = (gruppe: GewerteteGruppe): string => `${gruppe.farbe} × ${gruppe.laenge}: ${punkteText(gruppe.punkte)}`

/** A11, A7.3, A7.7: als welche Farbe ein Joker gezählt hat. */
export const jokerText = (joker: JokerFarbe): string => (joker.farbe === null ? `${joker.art} in keiner Gruppe` : `${joker.art} als ${joker.farbe}`)

/** Die Farben, die in dieser Schlange für den Vielfaltbonus zählen (A11 Abschnitt 2, D32). */
export const vielfaltText = (farben: readonly Farbe[]): string => `${ERGEBNIS.vielfalt}: ${farben.length === 0 ? ERGEBNIS.keineVielfalt : farben.join(', ')}`

export const ketteText = (laenge: number): string => (laenge === 0 ? ERGEBNIS.keineKette : `${ERGEBNIS.kette}: ${anzahlKarten(laenge)}`)

export const aufgabeText = (aufgabe: AufgabenEintrag): string => `${aufgabe.name}${aufgabe.geheim ? ' (geheim)' : ''}: ${punkteText(aufgabe.punkte)}`
