import { expect } from 'vitest'
import type { AbwerfenUndZiehenAktion, Korbbonus, SchlangenkorbSpielenAktion, SpielAktion, Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import { pruefeSchritt } from './rahmen_hilfen'
import { aktionen, fuehreAus } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
Hilfen für die Tests des Schlangenkorbs (X6, A7.10, D42 bis D47, D54). Sie
wählen nur, was die Engine aufzählt; jeder Schritt muss nachrechenbar sein,
darf keine Handkarte nennen und hält jede Invariante (`pruefeSchritt`).
*/

export const KORB: Kartenwahl = 'Schlangenkorb des Glücks'

/** Hände der Gegner, wenn es auf sie nicht ankommt. */
export const GEGNERHAND: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']

/** Zwei Spieler mit Erweiterung; Spieler 1 hält `hand`, der Gegner fünf Farbkarten. */
export function korbtisch(hand: Kartenwahl[], gegner: Kartenwahl[] = GEGNERHAND, spielerzahl = 2): Baukasten {
  const bau = baukasten({ spielerzahl, erweiterung: true }).hand(0, hand).hand(1, gegner)
  for (let index = 2; index < spielerzahl; index += 1) bau.hand(index, GEGNERHAND)
  return bau
}

/** Die Id des Korbs auf der Hand des Spielers. */
export function korbId(zustand: Spielzustand, spieler = 0): string {
  const karte = zustand.spieler[spieler].hand.find((eintrag) => eintrag.typ === 'Sonderkarte' && eintrag.name === 'Schlangenkorb des Glücks')
  if (karte === undefined) throw new Error(`Testaufbau: Spieler ${spieler + 1} hält keinen Schlangenkorb.`)
  return karte.id
}

/** Alle aufgezählten Korb-Aktionen, auf Wunsch nur die eines Bonus. */
export function korbAktionen(zustand: Spielzustand, art?: Korbbonus['art']): SchlangenkorbSpielenAktion[] {
  return aktionen(zustand, 'SchlangenkorbSpielen').filter(
    (aktion): aktion is SchlangenkorbSpielenAktion => aktion.typ === 'SchlangenkorbSpielen' && (art === undefined || aktion.bonus.art === art),
  )
}

/** Die Boni, die die Engine gerade anbietet, je einmal, in ihrer Reihenfolge. */
export function angeboteneBoni(zustand: Spielzustand): Korbbonus['art'][] {
  return [...new Set(korbAktionen(zustand).map((aktion) => aktion.bonus.art))]
}

/** Die erste aufgezählte Korb-Aktion dieses Bonus, die `passt`; sie muss angeboten sein. */
export function korb(zustand: Spielzustand, art: Korbbonus['art'], passt: (aktion: SchlangenkorbSpielenAktion) => boolean = () => true): SchlangenkorbSpielenAktion {
  const gefunden = korbAktionen(zustand, art).find(passt)
  expect(gefunden, `Schlangenkorb mit Bonus „${art}“ ist nicht aufgezählt`).toBeDefined()
  return gefunden!
}

/** Spielt diese aufgezählte Aktion und prüft den Schritt (nachrechenbar, B2, Invarianten; `pruefeSchritt`). */
export function spiele(zustand: Spielzustand, aktion: SpielAktion): Schritt {
  return pruefeSchritt(zustand, fuehreAus(zustand, aktion))
}

/** Spielt den Korb mit dem ersten aufgezählten Bonus dieser Art. */
export function spieleKorb(zustand: Spielzustand, art: Korbbonus['art'], passt?: (aktion: SchlangenkorbSpielenAktion) => boolean): Schritt {
  return spiele(zustand, korb(zustand, art, passt))
}

/** Die aufgezählte Aktion, die diese Handkarte mit Wirkung spielt, oder `undefined`. */
function angebotMitWirkung(zustand: Spielzustand, karteId: string): SpielAktion | undefined {
  return aktionen(zustand).find((aktion) => aktion.typ !== 'SonderkarteWirkungslosAblegen' && 'karteId' in aktion && aktion.karteId === karteId)
}

/** Spielt die aufgezählte Aktion, die diese Handkarte mit Wirkung spielt. */
export function spieleKarte(zustand: Spielzustand, karteId: string): Schritt {
  const angebot = angebotMitWirkung(zustand, karteId)
  if (angebot === undefined) throw new Error(`Testaufbau: ${karteId} ist nicht mit Wirkung aufgezählt.`)
  return spiele(zustand, angebot)
}

/** Lässt sich diese Handkarte jetzt mit Wirkung spielen? */
export function mitWirkung(zustand: Spielzustand, karteId: string): boolean {
  return angebotMitWirkung(zustand, karteId) !== undefined
}

/** Die aufgezählten Zusatzaktionen „Zwei Karten abwerfen, drei ziehen“ (A8.1, D46). */
export function abwerfenUndZiehen(zustand: Spielzustand): AbwerfenUndZiehenAktion[] {
  return aktionen(zustand, 'AbwerfenUndZiehen').filter((aktion): aktion is AbwerfenUndZiehenAktion => aktion.typ === 'AbwerfenUndZiehen')
}

/** Die Ids der Karten in der `nummer`-ten Schlange des Spielers; leer, wenn es sie nicht gibt. */
export function schlangenIds(zustand: Spielzustand, spieler: number, nummer = 0): string[] {
  return zustand.spieler[spieler].schlangen[nummer]?.karten.map((karte) => karte.id) ?? []
}

/** Liegt die Karte auf irgendeinem Ablagestapel? */
export function aufEinemAblagestapel(zustand: Spielzustand, karteId: string): boolean {
  return zustand.spieler.some((spieler) => spieler.ablagestapel.some((karte) => karte.id === karteId))
}

/** Die Ids der Handkarten einer Art (Farbe oder Name der Sonderkarte). */
export function handIds(zustand: Spielzustand, spieler: number, art: string): string[] {
  return zustand.spieler[spieler].hand.filter((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name) === art).map((karte) => karte.id)
}
