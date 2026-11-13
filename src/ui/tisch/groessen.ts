/*
Wie breit die Karten je Bereich des Tischs höchstens werden, als `sizes` für die
Kartenbilder: Handy, ab 700 px, ab 1100 px (DESIGN.md, „Grössen am Tisch“). Die
Stufen und Werte entsprechen den Variablen `--karte-*` in tisch.css; dort wird
gezeichnet, hier erfährt der Browser nur, welche Bildfassung reicht.
*/

const AB_700 = '(min-width: 700px) and (min-height: 501px)'
const AB_1100 = '(min-width: 1100px) and (min-height: 501px)'

function sizes(handy: number, ab700: number, ab1100: number): string {
  return `${AB_1100} ${ab1100}px, ${AB_700} ${ab700}px, ${handy}px`
}

export const KARTENGROESSE = {
  gegner: sizes(30, 34, 40),
  eigene: sizes(36, 48, 56),
  mitte: sizes(44, 52, 60),
  hand: sizes(64, 80, 96),
  klein: '22px',
} as const
