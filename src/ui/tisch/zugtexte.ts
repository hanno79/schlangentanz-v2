import type { SchlangenfrassSpielenAktion, SpielAktion, Spielkarte } from '../../engine'
import { kartenkurzname, kartenname } from '../karten/kartentexte'
import type { Wahl } from '../spiel/auswahl'
import type { SchlangeAnsicht, TischAnsicht } from '../spiel/tischAnsicht'
import { anzahlKarten, schlangenTitel } from './texte'

/*
Die Texte der Bedienung (O5) an einer Stelle (docs/regeln/web.md, „Texte“):
Zugleiste, Namen der Ziele, die Ansage vor dem Ausführen und der Dialog zum
Abwerfen. Sie beschreiben nur, was die Engine aufgezählt hat; eine Regel steht
hier keine. Wo ein Satz aus der Spielanleitung stammt, steht der Abschnitt
daneben.
*/

export const ZUGLEISTE = {
  titel: 'Zugleiste',
  ansehen: 'Ansehen',
  abbrechen: 'Abbrechen',
  ausfuehren: 'Ausführen',
  zugBeenden: 'Zug beenden',
  kartenWaehlen: 'Karten wählen',
  /** A5, „Wichtig“: steht neben dem gesperrten „Zug beenden“. */
  mindestensEine: 'Du musst immer mindestens eine Karte spielen.',
  karteWaehlen: 'Wähle eine Karte aus deiner Hand.',
  karteOderBeenden: 'Wähle eine Karte aus deiner Hand oder beende deinen Zug.',
  nurBeenden: 'Beende deinen Zug.',
  warten: 'Warte, bis du dran bist.',
  beendet: 'Die Partie ist beendet.',
  ansage: 'Ansage:',
}

/** Der Name einer gesperrten Handkarte. */
export const gesperrteKarte = (name: string): string => `${name} (jetzt nicht spielbar)`

/** Eine Stelle zwischen den Karten einer Schlange; 0 ist vor der ersten. */
export function stelleText(position: number, laenge: number): string {
  if (position === 0) return 'vor Karte 1'
  if (position >= laenge) return `hinter Karte ${laenge}`
  return `zwischen Karte ${position} und ${position + 1}`
}

/** Die zugänglichen Namen der Ziele am Tisch, je mit dem Titel der Schlange („Deine Schlange 1“). */
export const ZIELNAME = {
  ende: (titel: string, seite: 'anfang' | 'ende') => `${titel}: ${seite === 'anfang' ? 'Anfang' : 'Ende'}`,
  luecke: (titel: string, position: number, laenge: number) => `${titel}: ${stelleText(position, laenge)}`,
  karte: (titel: string, nummer: number, karte: Spielkarte) => `${titel}, Karte ${nummer}: ${kartenname(karte)}`,
  schlange: (titel: string) => `${titel} wählen`,
  spieler: (name: string) => `${name} wählen`,
  neueSchlange: 'Neue Schlange',
  ablage: 'Ohne Wirkung auf deine Ablage',
}

/** Die drei Möglichkeiten des Schlangenfrass, nach A7.4. */
export const FRASS_OPTION: Readonly<Record<SchlangenfrassSpielenAktion['option'], string>> = {
  eigeneKarte: 'a) Eine beliebige Karte aus deiner eigenen Schlange',
  eigeneBlockade: 'b) Eine Schlangenblockade aus deiner eigenen Schlange',
  gegnerischeKarten: 'c) Zwei beliebige Karten aus den Schlangen der Mitspieler',
}

/** Was im nächsten Schritt zu wählen ist, aus den Arten der angebotenen Wahlen. */
export function auftrag(angebote: readonly Wahl[], karte: Spielkarte): string {
  const arten = new Set(angebote.map((wahl) => wahl.art))
  const oderNeu = arten.has('neueSchlange') ? ' oder beginne eine neue Schlange' : ''
  if (arten.has('frass')) return 'Wähle, was der Schlangenfrass entfernt.'
  if (arten.has('spieler')) return 'Wähle den Mitspieler, der seinen nächsten Zug aussetzt.'
  if (arten.has('ablage')) return 'Lege die Karte ohne Wirkung auf deine Ablage: Tippe die Ablage an.'
  if (arten.has('schlange')) return 'Wähle die Schlange.'
  if (arten.has('schlangenende')) return `Lege die Karte an ein Ende einer Schlange (+)${oderNeu}.`
  if (arten.has('luecke')) return `Wähle die Stelle (+) in der Schlange${oderNeu}.`
  if (arten.has('neueSchlange')) return 'Beginne eine neue Schlange.'
  if (arten.has('schlangenkarte')) {
    if (karte.typ === 'Sonderkarte' && karte.name === 'Farbendieb') return 'Wähle die Karte, die du stiehlst.'
    if (karte.typ === 'Sonderkarte' && karte.name === 'Farbenfusion') return 'Wähle die zwei Karten nebeneinander, auf die die Farbenfusion kommt.'
    if (karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass') return 'Wähle, was der Schlangenfrass frisst.'
    return 'Wähle eine Karte in einer Schlange.'
  }
  return ''
}

interface SchlangeAmTisch {
  ansicht: SchlangeAnsicht
  /** „Deine Schlange 1“ oder „KI-Gegner 1, Schlange 1“. */
  titel: string
  eigene: boolean
  besitzer: string
  nummer: number
}

/** Karten, Schlangen und Spieler am Tisch nach ihrer Id, für die Ansage. */
export interface Tischnamen {
  karte: (id: string) => Spielkarte
  schlange: (id: string) => SchlangeAmTisch
  spieler: (id: string) => string
}

export function tischnamen(ansicht: TischAnsicht): Tischnamen {
  const karten = new Map<string, Spielkarte>(ansicht.ich.hand.map((karte) => [karte.id, karte]))
  const schlangen = new Map<string, SchlangeAmTisch>()
  const spieler = new Map<string, string>(ansicht.gegner.map((gegner) => [gegner.id, gegner.name]))
  for (const platz of [ansicht.ich, ...ansicht.gegner]) {
    const eigene = platz === ansicht.ich
    platz.schlangen.forEach((schlange, index) => {
      const nummer = index + 1
      schlangen.set(schlange.id, { ansicht: schlange, titel: schlangenTitel({ name: platz.name, ich: eigene }, nummer), eigene, besitzer: platz.name, nummer })
      for (const glied of schlange.karten) karten.set(glied.karte.id, glied.karte)
    })
  }
  const finde = <T,>(tabelle: Map<string, T>, id: string, was: string): T => {
    const wert = tabelle.get(id)
    if (wert === undefined) throw new Error(`Die Ansage nennt ${was} ${id}, die am Tisch nicht zu sehen ist.`)
    return wert
  }
  return {
    karte: (id) => finde(karten, id, 'die Karte'),
    schlange: (id) => finde(schlangen, id, 'die Schlange'),
    spieler: (id) => finde(spieler, id, 'den Spieler'),
  }
}

/** „deine Schlange 1“ oder „die Schlange 1 von KI-Gegner 1“ (Akkusativ), „deiner …“ bzw. „der …“ (Dativ). */
function schlangeImSatz({ eigene, nummer, besitzer }: SchlangeAmTisch, fall: 'akkusativ' | 'dativ'): string {
  if (eigene) return `${fall === 'akkusativ' ? 'deine' : 'deiner'} Schlange ${nummer}`
  return `${fall === 'akkusativ' ? 'die' : 'der'} Schlange ${nummer} von ${besitzer}`
}

/** Die Stelle einer Karte in ihrer Schlange, ab 1. */
const nummerIn = (schlange: SchlangeAmTisch, karteId: string) => schlange.ansicht.karten.findIndex((glied) => glied.karte.id === karteId) + 1

/** Die Ansage einer fertigen Auswahl (B2): Karte und Ziel in einem Satz, bevor sie ausgeführt wird. */
export function ansage(aktion: SpielAktion, namen: Tischnamen): string {
  const kurz = (id: string) => kartenkurzname(namen.karte(id))
  switch (aktion.typ) {
    case 'FarbkarteLegen': {
      const { ziel } = aktion
      if (ziel.art === 'neueSchlange') return `${kurz(aktion.karteId)} beginnt eine neue Schlange.`
      return `${kurz(aktion.karteId)} an ${ziel.seite === 'anfang' ? 'den Anfang' : 'das Ende'} ${schlangeImSatz(namen.schlange(ziel.schlangenId), 'dativ')}.`
    }
    case 'RegenbogenschlangeLegen':
    case 'BlockadeLegen': {
      const schlange = namen.schlange(aktion.schlangenId)
      return `${kurz(aktion.karteId)} in ${schlangeImSatz(schlange, 'akkusativ')}, ${stelleText(aktion.position, schlange.ansicht.karten.length)}.`
    }
    case 'FusionLegen': {
      const schlange = namen.schlange(aktion.schlangenId)
      const [links, rechts] = aktion.kartenIds
      return `Farbenfusion auf ${kurz(links)} und ${kurz(rechts)} (Karte ${nummerIn(schlange, links)} und ${nummerIn(schlange, rechts)}) ${schlangeImSatz(schlange, 'dativ')}.`
    }
    case 'FarbendiebSpielen': {
      const quelle = `${kurz(aktion.quelle.karteId)} aus ${schlangeImSatz(namen.schlange(aktion.quelle.schlangenId), 'dativ')}`
      const { ziel } = aktion
      if (ziel.art === 'neueSchlange') return `Farbendieb: ${quelle} beginnt eine neue Schlange.`
      const schlange = namen.schlange(ziel.schlangenId)
      return `Farbendieb: ${quelle} in ${schlangeImSatz(schlange, 'akkusativ')}, ${stelleText(ziel.position, schlange.ansicht.karten.length)}.`
    }
    case 'SchlangenfrassSpielen':
      return `Schlangenfrass frisst ${aktion.ziele.map((ziel) => `${kurz(ziel.karteId)} aus ${schlangeImSatz(namen.schlange(ziel.schlangenId), 'dativ')}`).join(' und ')}.`
    case 'SchlangengrubeSpielen':
      return `Schlangengrube auf ${namen.spieler(aktion.zielSpielerId)}.`
    case 'VerdopplerSpielen':
      // A7.8: „Du füllst deine Handkarten auf und spielst sofort einen zweiten Zug.“
      return 'Verdoppler: Danach füllst du deine Handkarten auf und spielst sofort einen zweiten Zug.'
    case 'SonderkarteWirkungslosAblegen':
      return `${kurz(aktion.karteId)} ohne Wirkung auf deine Ablage.`
    default:
      throw new Error(`Für ${aktion.typ} gibt es in O5 keine Ansage.`)
  }
}

/** Die Texte des Dialogs zum Abwerfen (A5). */
export const ABWERFEN = {
  titel: 'Zu viele Handkarten',
  text: (hand: number, abwerfen: number) => `Du hast ${anzahlKarten(hand)} auf der Hand. Lege ${abwerfen} davon auf deine Ablage.`,
  gewaehlt: (gewaehlt: number, abwerfen: number) => `Gewählt: ${gewaehlt} von ${abwerfen}`,
  noch: (anzahl: number) => `Wähle noch ${anzahlKarten(anzahl)}.`,
  zumTisch: 'Zum Tisch',
  ablegen: 'Ablegen',
  zugleiste: (abwerfen: number) => (abwerfen === 1 ? 'Lege 1 überzählige Karte ab.' : `Lege ${abwerfen} überzählige Karten ab.`),
}
