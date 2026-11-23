import type { Ablehnung, Spielergrund } from '../../engine'
import type { Person } from '../spiel/tischAnsicht'

/*
Gründe der Engine am Tisch (Plan O6, Weg A des Orchestrators). Nennt ein Grund
einen Spieler, liefert die Engine die Art und die Werte; ist einer davon der
Mensch, steht der Satz hier in der Du-Form. Alle anderen Gründe stehen
wörtlich da, wie die Engine sie schreibt (U12). Die Sätze folgen dem Wortlaut
der Engine, nur die Ansprache ändert sich.
*/

type Form<A extends Spielergrund['art']> = (nennt: Extract<Spielergrund, { art: A }>, person: (index: number) => Person) => string | null

/** Je Art der Satz in der Du-Form, oder `null`, wenn der Grund dich nicht nennt. */
export const DU_FORM: { [A in Spielergrund['art']]: Form<A> } = {
  entscheidetNicht: ({ spielerIndex, entscheider }, person) => {
    const [spieler, dran] = [person(spielerIndex), person(entscheider)]
    if (spieler.ich) return `Du entscheidest gerade nicht; dran ist ${dran.name} (A6).`
    return dran.ich ? `${spieler.name} entscheidet gerade nicht; dran bist du (A6).` : null
  },
  nichtAmZug: ({ spielerIndex, amZug }, person) => {
    const spieler = person(spielerIndex)
    const dran = amZug === null ? null : person(amZug)
    if (spieler.ich) return `Du bist nicht am Zug; am Zug ist ${dran?.name ?? 'niemand'} (A5).`
    return dran?.ich ? `${spieler.name} ist nicht am Zug; am Zug bist du (A5).` : null
  },
  kartenpflicht: ({ spielerIndex }, person) =>
    person(spielerIndex).ich ? 'Du musst erst mindestens eine Karte spielen; beenden ohne Karte geht nur mit leerer Hand (A5, D12).' : null,
  nichtAufHand: ({ spielerIndex, karteId }, person) => (person(spielerIndex).ich ? `Die Karte ${karteId} liegt nicht auf deiner Hand.` : null),
  abwerfenAnzahl: ({ spielerIndex, haelt, abwerfen, genannt }, person) =>
    person(spielerIndex).ich ? `Du hältst ${haelt} Karten und legst genau ${abwerfen} Karten ab, nicht ${genannt} (A5).` : null,
}

function duForm(nennt: Spielergrund, person: (index: number) => Person): string | null {
  switch (nennt.art) {
    case 'entscheidetNicht':
      return DU_FORM.entscheidetNicht(nennt, person)
    case 'nichtAmZug':
      return DU_FORM.nichtAmZug(nennt, person)
    case 'kartenpflicht':
      return DU_FORM.kartenpflicht(nennt, person)
    case 'nichtAufHand':
      return DU_FORM.nichtAufHand(nennt, person)
    case 'abwerfenAnzahl':
      return DU_FORM.abwerfenAnzahl(nennt, person)
  }
}

/** Der Grund einer Ablehnung, wie er am Tisch steht: dich spricht er mit „du“ an, sonst wörtlich. */
export function grundFuerDich(ablehnung: Ablehnung, person: (index: number) => Person): string {
  return ablehnung.nennt === undefined ? ablehnung.grund : (duForm(ablehnung.nennt, person) ?? ablehnung.grund)
}
