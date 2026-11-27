import { ablagestapelStelle } from '../../engine'
import type { Spielkarte } from '../../engine'
import { kartenkurzname, kartenname } from '../karten/kartentexte'
import { ENTSCHEIDUNGSART, KEIN_TAUSCH, entscheidungsart } from '../spiel/entscheidungsarten'
import type { Entscheidungsart } from '../spiel/entscheidungsarten'
import type { EntscheidungAnsicht, Person, TischAnsicht } from '../spiel/tischAnsicht'
import { satzanfang } from './erweiterungstexte'
import { schlangeImSatz, tischnamen } from './zugtexte'
import type { Tischnamen } from './zugtexte'

/*
Was eine Entscheidung der Erweiterung fragt und wie ihre Wahlen heissen (O10,
X3, A8.2), je Art an einer Stelle: die Frage an dich in der Zugleiste, der
Name jeder festen Möglichkeit, die Ansage vor dem Ausführen und die Sätze des
Protokolls, wenn ein Spieler jetzt wählt und wenn er gewählt hat. Genannt
werden nur offene Karten: die aufgedeckte, die für Aktion 2 angesagte (D52,
D77), Karten in Schlangen und deine Ablage. Was ein Gegner aus seiner Ablage
nimmt, bleibt ungenannt (B2).
*/

/** Was die Texte einer Entscheidung brauchen: die Namen am Tisch, die offene Entscheidung und die offen aufgedeckten Karten. */
export interface Entscheidungskontext {
  namen: Tischnamen
  entscheidung: EntscheidungAnsicht
  aufgedeckt: readonly Spielkarte[]
  /** Der Ablagestapel dessen, der entscheidet, wenn du es bist; aus ihm wählst du bei Risiko-Aktion 4 (D54). */
  deineAblage: readonly Spielkarte[]
}

/** Eine feste Möglichkeit als Knopf; mit Karte, wenn sie eine Karte nennt. */
export interface Moeglichkeit {
  name: string
  karte: Spielkarte | null
}

interface Deutung {
  frage: (k: Entscheidungskontext) => string
  moeglichkeit: (wahl: string, k: Entscheidungskontext) => Moeglichkeit
  ansage: (wahl: string, k: Entscheidungskontext) => string
  /** Was der Entscheider jetzt wählt, als Rest des Satzes „… wählt jetzt“. */
  verlangt: string
  gewaehlt: (wahl: string, wer: Person, k: Entscheidungskontext) => string
}

const STAPEL = 'stapel'
const OBERSTE = 'die oberste Karte vom Nachziehstapel'
/** Die Möglichkeit „stapel“ als Knopf und als Ansage, gleich bei welcher Entscheidung (D52, D54). */
const STAPEL_KNOPF = 'Oberste Karte vom Nachziehstapel'
const STAPEL_ANSAGE = 'Du ziehst die oberste Karte vom Nachziehstapel.'
const nurText = (name: string): Moeglichkeit => ({ name, karte: null })
const kurz = (k: Entscheidungskontext, id: string) => kartenkurzname(k.namen.karte(id))

/** D52, D77: die angesagte Karte; ohne sie ist die Entscheidung falsch gebaut. */
function angesagt(k: Entscheidungskontext): Spielkarte {
  if (k.entscheidung.angesagt === null) throw new Error(`Die Entscheidung „${k.entscheidung.art}“ nennt keine angesagte Karte (D52).`)
  return k.entscheidung.angesagt
}

/** A8.2 Aktion 3: die benannte Karte der Schlange. */
function benannt(k: Entscheidungskontext): string {
  if (k.entscheidung.schlangenkarte === null) throw new Error(`Die Entscheidung „${k.entscheidung.art}“ nennt keine Karte der Schlange (A8.2).`)
  return k.entscheidung.schlangenkarte
}

/** Die Schlange, in der die benannte Karte liegt, im Dativ: „deiner Schlange 1“. */
function schlangeDerBenannten(k: Entscheidungskontext): string {
  const id = benannt(k)
  const schlange = k.namen.schlangeMitKarte(id)
  return schlangeImSatz(schlange, 'dativ')
}

function aufgedeckteKarte(k: Entscheidungskontext): Spielkarte {
  const [karte] = k.aufgedeckt
  if (karte === undefined) throw new Error(`Die Entscheidung „${k.entscheidung.art}“ wartet auf eine aufgedeckte Karte, es liegt keine offen (A8.2).`)
  return karte
}

/** D54: die Karte an dieser Stelle deiner Ablage. */
function ablagekarte(wahl: string, k: Entscheidungskontext): Spielkarte {
  const stelle = ablagestapelStelle(wahl)
  const karte = stelle === null ? undefined : k.deineAblage[stelle]
  if (karte === undefined) throw new Error(`Die Wahl „${wahl}“ nennt keine Karte deiner Ablage (D54).`)
  return karte
}

const gegnerwahl: Deutung = {
  frage: () => 'Die Risiko-Aktion ist gescheitert. Wähle den Gegner, der die Ersatzbelohnung bekommt.',
  moeglichkeit: (wahl, k) => nurText(k.namen.spieler(wahl).name),
  ansage: (wahl, k) => `${k.namen.spieler(wahl).name} bekommt die Ersatzbelohnung.`,
  verlangt: ' den Gegner, der die Ersatzbelohnung bekommt',
  gewaehlt: (wahl, wer, k) => {
    const ziel = k.namen.spieler(wahl)
    return `${satzanfang(wer, 'Du wählst', 'wählt')} ${ziel.ich ? 'dich' : ziel.name} als begünstigten Gegner.`
  },
}

/** Die angesagte (D52) oder aufgedeckte Karte gegen die oberste Stapelkarte; `karte` ist die Möglichkeit, die nicht „stapel“ heisst, `wie` ihr Partizip („angesagt“). */
function karteOderStapel(karte: (k: Entscheidungskontext) => Spielkarte, wie: string, frage: (k: Entscheidungskontext) => string): Deutung {
  return {
    frage,
    moeglichkeit: (wahl, k) =>
      wahl === STAPEL ? nurText(STAPEL_KNOPF) : { name: `${kartenname(karte(k))} von ${k.entscheidung.ausgeloestVon.name}`, karte: karte(k) },
    ansage: (wahl, k) => (wahl === STAPEL ? STAPEL_ANSAGE : `Du nimmst ${kartenkurzname(karte(k))} von ${k.entscheidung.ausgeloestVon.name}.`),
    verlangt: ` zwischen der ${wie}en Karte und der obersten Karte vom Nachziehstapel`,
    gewaehlt: (wahl, wer) => `${satzanfang(wer, 'Du wählst', 'wählt')} ${wahl === STAPEL ? OBERSTE : `die ${wie}e Karte`}.`,
  }
}

const DEUTUNGEN: Readonly<Record<Entscheidungsart, Deutung>> = {
  [ENTSCHEIDUNGSART.gegnerwahl]: gegnerwahl,
  [ENTSCHEIDUNGSART.geplanteOderStapel]: karteOderStapel(angesagt, 'angesagt', (k) =>
    `Du bist begünstigt: Nimm die angesagte ${kartenkurzname(angesagt(k))} von ${k.entscheidung.ausgeloestVon.name} oder die oberste Karte vom Nachziehstapel.`,
  ),
  [ENTSCHEIDUNGSART.ablageOderStapel]: {
    frage: (k) => `${k.entscheidung.ausgeloestVon.ich ? 'Erfolg' : 'Du bist begünstigt'}: Nimm eine Karte von deiner Ablage oder die oberste Karte vom Nachziehstapel.`,
    moeglichkeit: (wahl, k) => (wahl === STAPEL ? nurText(STAPEL_KNOPF) : { name: `${kartenname(ablagekarte(wahl, k))} von deiner Ablage`, karte: ablagekarte(wahl, k) }),
    ansage: (wahl, k) => (wahl === STAPEL ? STAPEL_ANSAGE : `Du nimmst ${kartenkurzname(ablagekarte(wahl, k))} von deiner Ablage.`),
    verlangt: ' zwischen einer Karte der eigenen Ablage und der obersten Karte vom Nachziehstapel',
    gewaehlt: (wahl, wer) => `${satzanfang(wer, 'Du wählst', 'wählt')} ${wahl === STAPEL ? OBERSTE : `eine Karte von ${wer.ich ? 'deiner' : 'der eigenen'} Ablage`}.`,
  },
  [ENTSCHEIDUNGSART.anlegen]: {
    frage: () => 'Erfolg: Lege eine Farbkarte deiner Hand an ein Ende deiner Schlange.',
    moeglichkeit: (wahl) => {
      throw new Error(`Die Wahl „${wahl}“ wählt man am Tisch mit Karte und Ende der Schlange, nicht als Knopf (D52).`)
    },
    ansage: (wahl, k) => {
      const [karteId, schlangenId, seite] = wahl.split(' ')
      return `${kurz(k, karteId)} an ${seite === 'anfang' ? 'den Anfang' : 'das Ende'} ${schlangeImSatz(k.namen.schlange(schlangenId), 'dativ')}.`
    },
    verlangt: ' die Farbkarte, die zusätzlich angelegt wird',
    gewaehlt: (_wahl, wer) => `${satzanfang(wer, 'Du legst', 'legt')} eine zusätzliche Farbkarte an.`,
  },
  [ENTSCHEIDUNGSART.tausch]: {
    frage: (k) => `Erfolg: Wähle die Farbkarte deiner Hand, die ${kurz(k, benannt(k))} in ${schlangeDerBenannten(k)} ersetzt, oder tausche nicht.`,
    moeglichkeit: () => nurText('Nicht tauschen'),
    ansage: (wahl, k) =>
      wahl === KEIN_TAUSCH
        ? 'Kein Tausch: Die Schlange bleibt, wie sie ist.'
        : `${kurz(k, wahl)} ersetzt ${kurz(k, benannt(k))} in ${schlangeDerBenannten(k)}; ${kurz(k, benannt(k))} kommt auf deine Hand.`,
    verlangt: ', ob und mit welcher Farbkarte der Hand getauscht wird',
    gewaehlt: (wahl, wer) =>
      wahl === KEIN_TAUSCH ? `${satzanfang(wer, 'Du verzichtest', 'verzichtet')} auf den Tausch.` : `${satzanfang(wer, 'Du tauschst', 'tauscht')} die benannte Karte gegen eine Farbkarte der Hand.`,
  },
  [ENTSCHEIDUNGSART.seite]: {
    frage: (k) => `Misserfolg: ${kartenkurzname(aufgedeckteKarte(k))} kommt zusätzlich in ${schlangeDerBenannten(k)}. Lege sie vor oder hinter ${kurz(k, benannt(k))}.`,
    moeglichkeit: (wahl, k) => nurText(`${wahl === 'davor' ? 'Vor' : 'Hinter'} ${kurz(k, benannt(k))} legen`),
    ansage: (wahl, k) => `${kartenkurzname(aufgedeckteKarte(k))} ${wahl === 'davor' ? 'vor' : 'hinter'} ${kurz(k, benannt(k))} in ${schlangeDerBenannten(k)}.`,
    verlangt: ', ob die aufgedeckte Karte davor oder dahinter kommt',
    gewaehlt: (wahl, wer) => `${satzanfang(wer, 'Du legst', 'legt')} die aufgedeckte Karte ${wahl === 'davor' ? 'davor' : 'dahinter'}.`,
  },
  [ENTSCHEIDUNGSART.testGegner]: { ...gegnerwahl, frage: () => 'Test-Entscheidung: Wähle einen Gegner.' },
  [ENTSCHEIDUNGSART.testKarte]: karteOderStapel(aufgedeckteKarte, 'aufgedeckt', () => 'Test-Entscheidung: Nimm die aufgedeckte Karte oder die oberste Karte vom Nachziehstapel.'),
}

const deutung = (art: string): Deutung => DEUTUNGEN[entscheidungsart(art)]

/** Die Frage an dich in der Zugleiste. */
export const entscheidungsFrage = (k: Entscheidungskontext): string => deutung(k.entscheidung.art).frage(k)

/** Der Name einer festen Möglichkeit (`{ art: 'entscheiden' }`), mit Karte, wenn sie eine nennt. */
export const entscheidungsMoeglichkeit = (wahl: string, k: Entscheidungskontext): Moeglichkeit => deutung(k.entscheidung.art).moeglichkeit(wahl, k)

/** Die Ansage einer fertigen Wahl vor dem Ausführen (B2). */
export const entscheidungsAnsage = (wahl: string, k: Entscheidungskontext): string => deutung(k.entscheidung.art).ansage(wahl, k)

/** „KI-Gegner 1 wählt jetzt …“: Wer nun entscheidet und worüber (Protokoll). */
export const verlangtSatz = (art: string, wer: Person): string => `${satzanfang(wer, 'Du wählst', 'wählt')} jetzt${deutung(art).verlangt}.`

/** Was der Entscheider gewählt hat (Protokoll). */
export const gewaehltSatz = (wahl: string, wer: Person, k: Entscheidungskontext): string => deutung(k.entscheidung.art).gewaehlt(wahl, wer, k)

/** Der Kontext einer offenen Entscheidung am Tisch, mit schon gebauten Namen, falls es sie gibt; wirft, wenn keine Entscheidung offen ist. */
export function kontextAmTisch(ansicht: TischAnsicht, namen: Tischnamen = tischnamen(ansicht)): Entscheidungskontext {
  if (ansicht.entscheidung === null) throw new Error('Es ist keine Entscheidung offen, zu der der Tisch etwas sagen könnte (X3).')
  return { namen, entscheidung: ansicht.entscheidung, aufgedeckt: ansicht.aufgedeckt, deineAblage: ansicht.ich.ablagestapel }
}
