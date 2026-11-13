import type { AufgabenkarteInfo, Auslagekarte, Farbe, Spielkarte } from '../../engine'

/** Alles, was als Kartenbild erscheint: Spielkarte, Aufgabe, Comeback- oder Risiko-Karte. */
export type Bildkarte = Spielkarte | AufgabenkarteInfo | Auslagekarte

/*
Zuordnung Kartenname → Bild unter `public/karten/`.

Die Bilder stammen von schlangentanz.ch, der Website des Autors, und sind mit
`scripts/kartenbilder_zuschneiden.py` zugeschnitten: ohne grauen Rand, mit
durchsichtigen runden Ecken, alle im Seitenverhältnis der Farbkarten.

Schlüssel sind die Namen, unter denen die Engine die Karten führt. Ein
unbekannter Name ist ein Fehler und kein leeres Bild: Eine Karte ohne Bild soll
beim Bauen auffallen, nicht am Tisch als Lücke.
*/

const ORDNER = '/karten/'

/** Seitengrösse, mit der eine Karte ins Layout geht, bevor ihr Bild geladen ist. */
export const KARTENBILD_BREITE = 470
export const KARTENBILD_HOEHE = 766

export const LOGO_BILD = `${ORDNER}logo.webp`

/** Bis der Autor eine eigene Rückseite liefert; der Austausch ist diese eine Datei. */
export const RUECKSEITE_BILD = `${ORDNER}rueckseite-platzhalter.svg`

const FARBKARTEN: Readonly<Record<Farbe, string>> = {
  Blau: 'farbe-blau',
  Rot: 'farbe-rot',
  Gelb: 'farbe-gelb',
  Violett: 'farbe-violett',
  Braun: 'farbe-braun',
  Grün: 'farbe-gruen',
}

const SONDERKARTEN: Readonly<Record<string, string>> = {
  Farbenschutz: 'sonder-farbenschutz',
  Regenbogenschlange: 'sonder-regenbogenschlange',
  Schlangenfrass: 'sonder-schlangenfrass',
  Schlangenblockade: 'sonder-schlangenblockade',
  Farbendieb: 'sonder-farbendieb',
  Schlangengrube: 'sonder-schlangengrube',
  Farbenfusion: 'sonder-farbenfusion',
  Verdoppler: 'sonder-verdoppler',
  Schlangenhäutung: 'sonder-schlangenhaeutung',
  'Schlangenkorb des Glücks': 'sonder-schlangenkorb-des-gluecks',
  Comeback: 'comeback',
  'Risiko-Belohnung': 'risiko-belohnung',
}

const AUFGABEN: Readonly<Record<string, string>> = {
  Farbenpracht: 'aufgabe-farbenpracht',
  Farbharmonie: 'aufgabe-farbharmonie',
  Farbkombination: 'aufgabe-farbkombination',
  Farbvielfalt: 'aufgabe-farbvielfalt',
  Vielfaltskönig: 'aufgabe-vielfaltskoenig',
  Farbwechsler: 'aufgabe-farbwechsler',
  Fusionsexperte: 'aufgabe-fusionsexperte',
  Schlangenbeschwörer: 'aufgabe-schlangenbeschwoerer',
  Schlangenmeister: 'aufgabe-schlangenmeister',
  Schlangenrepertoire: 'aufgabe-schlangenrepertoire',
  Schlangenbändiger: 'aufgabe-schlangenbaendiger',
  Schlangentanz: 'aufgabe-schlangentanz',
  Symmetriemeister: 'aufgabe-symmetriemeister',
  'Gelber Schatz': 'aufgabe-gelber-schatz',
  'Lila Riese': 'aufgabe-lila-riese',
}

/** Wie Teil A der Spec das Zusatzmaterial nennt → Name der Karte im Spiel. */
export const ZUSATZKARTEN: Readonly<Record<string, string>> = {
  'Comeback-Karten': 'Comeback',
  'Risiko-Belohnungs-Karten': 'Risiko-Belohnung',
}

function bild(tabelle: Readonly<Record<string, string>>, name: string, art: string): string {
  if (!Object.hasOwn(tabelle, name)) {
    throw new Error(`Kein Kartenbild für ${art} „${name}“. Zuordnung in src/ui/karten/kartenbilder.ts ergänzen.`)
  }
  return `${ORDNER}${tabelle[name]}.webp`
}

export const farbkartenbild = (farbe: Farbe): string => bild(FARBKARTEN, farbe, 'die Farbkarte')
export const sonderkartenbild = (name: string): string => bild(SONDERKARTEN, name, 'die Sonderkarte')
export const aufgabenbild = (name: string): string => bild(AUFGABEN, name, 'die Aufgabe')

export function kartenbild(karte: Bildkarte): string {
  switch (karte.typ) {
    case 'Farbkarte':
      return farbkartenbild(karte.farbe)
    case 'Sonderkarte':
      return sonderkartenbild(karte.name)
    case 'Aufgabenkarte':
      return aufgabenbild(karte.name)
    case 'Comeback':
    case 'Risiko-Belohnung':
      return sonderkartenbild(karte.typ)
  }
}
