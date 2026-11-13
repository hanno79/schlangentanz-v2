import { aufgabenPool, erstelleErweiterungsSonderkarten, erstelleFarbkarten, erstelleSonderkarten } from '../../engine'
import type { AufgabenkarteInfo, Farbe, Spielkarte } from '../../engine'

/*
Feste Beispieldaten für die Entwurfsseiten unter /dev/entwurf.

Die Karten kommen aus dem echten Material der Engine, damit Bilder und Namen
stimmen; welche Karte wo liegt und was als Ziel angeboten wird, ist von Hand
gesetzt. Hier wird nichts nach Regeln berechnet: Die Entwürfe zeigen, wie der
Tisch aussieht, nicht was erlaubt ist. Das liefert später allein die Engine.
*/

/** Eine Schlange im Entwurf. `gruppe` markiert Karten, die zu einer Farbgruppe gehören. */
export interface BeispielSchlange {
  id: string
  karten: { karte: Spielkarte; gruppe?: boolean }[]
}

export interface BeispielGegner {
  name: string
  handkarten: number
  ablage: { anzahl: number; oben: Spielkarte }
  schlangen: BeispielSchlange[]
}

/** Wie der Entwurf eine gewählte Handkarte behandelt: welche Art Ziel er hervorhebt. */
export type Zielart = 'schlangenenden' | 'gegnerkarten' | 'gegner' | 'ablage'

export interface BeispielHandkarte {
  karte: Spielkarte
  zielart: Zielart
  auftrag: string
}

class Vorrat {
  private karten: Spielkarte[] = [...erstelleFarbkarten(), ...erstelleSonderkarten(), ...erstelleErweiterungsSonderkarten()]

  private nimm(passt: (karte: Spielkarte) => boolean, wer: string): Spielkarte {
    const index = this.karten.findIndex(passt)
    if (index < 0) throw new Error(`Beispieldaten: keine Karte „${wer}“ mehr im Vorrat`)
    return this.karten.splice(index, 1)[0]
  }

  farbe(farbe: Farbe): Spielkarte {
    return this.nimm((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe, farbe)
  }

  sonder(name: string): Spielkarte {
    return this.nimm((karte) => karte.typ === 'Sonderkarte' && karte.name === name, name)
  }
}

function aufgabe(name: string): AufgabenkarteInfo {
  const treffer = aufgabenPool.find((karte) => karte.name === name)
  if (treffer === undefined) throw new Error(`Beispieldaten: keine Aufgabe „${name}“`)
  return treffer
}

const vorrat = new Vorrat()

/* Zuerst die Hand, damit ihre Karten die ersten IDs tragen (`rot-01`,
   `farbendieb-01`): Die Adressen der Entwürfe und die Layout-Verträge nennen sie. */
export const HAND: BeispielHandkarte[] = [
  { karte: vorrat.farbe('Rot'), zielart: 'schlangenenden', auftrag: 'Lege die Farbkarte an ein Ende einer Schlange.' },
  { karte: vorrat.farbe('Grün'), zielart: 'schlangenenden', auftrag: 'Lege die Farbkarte an ein Ende einer Schlange.' },
  { karte: vorrat.sonder('Farbendieb'), zielart: 'gegnerkarten', auftrag: 'Wähle die Karte, die du stehlen willst.' },
  { karte: vorrat.sonder('Schlangengrube'), zielart: 'gegner', auftrag: 'Wähle, wer einen Zug aussetzt.' },
  {
    karte: vorrat.sonder('Farbenschutz'),
    zielart: 'ablage',
    auftrag: 'Farbenschutz wehrt Angriffe ab. Jetzt gespielt, kommt er ohne Wirkung auf deine Ablage.',
  },
]

const FARBEN: readonly string[] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün'] satisfies Farbe[]
const istFarbe = (wert: string): wert is Farbe => FARBEN.includes(wert)

/** Eine Schlange aus Farb- und Sonderkartennamen; `gruppen` als [Anfang, Länge]. */
function schlange(id: string, farben: (Farbe | string)[], gruppen: [number, number][] = []): BeispielSchlange {
  return {
    id,
    karten: farben.map((wert, index) => ({
      karte: istFarbe(wert) ? vorrat.farbe(wert) : vorrat.sonder(wert),
      gruppe: gruppen.some(([start, laenge]) => index >= start && index < start + laenge),
    })),
  }
}

export const GEGNER: BeispielGegner[] = [
  {
    name: 'Mia',
    handkarten: 5,
    ablage: { anzahl: 3, oben: vorrat.sonder('Verdoppler') },
    schlangen: [
      schlange('mia-1', ['Blau', 'Blau', 'Blau', 'Rot', 'Rot'], [[0, 3]]),
      schlange('mia-2', ['Grün', 'Grün', 'Violett']),
    ],
  },
  {
    name: 'Ben',
    handkarten: 4,
    ablage: { anzahl: 5, oben: vorrat.sonder('Schlangenfrass') },
    schlangen: [
      schlange('ben-1', ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Braun', 'Braun', 'Regenbogenschlange', 'Braun'], [
        [0, 4],
        [4, 4],
      ]),
      schlange('ben-2', ['Violett', 'Violett']),
    ],
  },
  {
    name: 'Lea',
    handkarten: 6,
    ablage: { anzahl: 2, oben: vorrat.sonder('Farbenfusion') },
    schlangen: [schlange('lea-1', ['Rot', 'Grün', 'Blau', 'Gelb', 'Violett', 'Braun', 'Rot', 'Rot', 'Rot'], [[6, 3]])],
  },
]

export const EIGENE_SCHLANGEN: BeispielSchlange[] = [
  schlange('du-1', ['Rot', 'Rot', 'Blau', 'Blau', 'Blau', 'Schlangenblockade'], [[2, 3]]),
  schlange('du-2', ['Grün', 'Grün', 'Violett', 'Violett']),
]

export const EIGENE_ABLAGE = { anzahl: 4, oben: vorrat.sonder('Schlangenhäutung') }
export const NACHZIEHSTAPEL = 42
export const OFFENE_AUFGABEN = [aufgabe('Farbenpracht'), aufgabe('Farbkombination'), aufgabe('Lila Riese')]
export const GEHEIME_AUFGABE = aufgabe('Gelber Schatz')
export const ZUSATZKARTEN = [vorrat.sonder('Comeback'), vorrat.sonder('Risiko-Belohnung'), vorrat.sonder('Risiko-Belohnung')]

/** Die Lobby kennt einen gespeicherten Spielstand, damit „Weiterspielen“ zu sehen ist. */
export const GESPEICHERTE_PARTIE = { datum: '12.11.2026', gegner: 3, erweiterung: true, zug: 14 }

/** Endwertung des Ergebnis-Entwurfs. Die Zahlen sind ausgedacht, nicht gerechnet. */
export const WERTUNG = [
  { name: 'Mia', farbgruppen: 38, vielfalt: 3, kette: 5, aufgaben: 6 },
  { name: 'Du', farbgruppen: 33, vielfalt: 2, kette: 5, aufgaben: 7 },
  { name: 'Ben', farbgruppen: 26, vielfalt: 1, kette: 0, aufgaben: 4 },
  { name: 'Lea', farbgruppen: 21, vielfalt: 2, kette: 0, aufgaben: 5 },
]
