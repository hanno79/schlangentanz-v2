import type { SpielAktion, Spielzustand } from '../engine'
import { karteAnzeigename } from '../kartenTexte'
import { name } from './namen'

/*
Die Beschriftung der Aktionsknöpfe am Entwicklertisch. Viele Karten haben je
Handkarte mehrere Ziele (jede Stelle jeder Schlange, zwei Karten zum Fressen);
damit man das richtige anklickt, nennt der Knopf das Ziel: Spieler, Schlange mit
Stelle oder Seite, Karten mit Namen und Id, die Option. Die ganze Aktion steht im
Tooltip und in `data-aktion`.
*/

/** Name und Id einer Karte auf einer Hand oder in einer Schlange; sonst nur die Id. */
function karteText(zustand: Spielzustand, karteId: string): string {
  const karte = zustand.spieler.flatMap((spieler) => [...spieler.hand, ...spieler.schlangen.flatMap((schlange) => schlange.karten)]).find((eintrag) => eintrag.id === karteId)
  return karte === undefined ? karteId : `${karteAnzeigename(karte)} (${karteId})`
}

const KARTENFELDER = new Set(['karteId', 'kartenIds', 'neueReihenfolge'])

/** Ein Feld eines Ziels lesbar; Listen und verschachtelte Ziele Feld für Feld. */
function zielText(zustand: Spielzustand, feld: string, wert: unknown): string {
  if (Array.isArray(wert)) return wert.map((eintrag) => zielText(zustand, feld, eintrag)).join(', ')
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .map(([unterfeld, inhalt]) => zielText(zustand, unterfeld, inhalt))
      .filter((text) => text !== '')
      .join(' ')
  }
  if (feld === 'zielSpielerId') return name(zustand, zustand.spieler.findIndex((spieler) => spieler.id === wert))
  if (KARTENFELDER.has(feld)) return karteText(zustand, String(wert))
  if (feld === 'position') return `Stelle ${String(wert)}`
  // `art` unterscheidet nur neue und bestehende Schlange; die bestehende nennt schon ihre Id.
  if (feld === 'art') return wert === 'neueSchlange' ? 'neue Schlange' : ''
  return String(wert)
}

/** Aktionstyp, gespielte Karte und das Ziel, etwa „BlockadeLegen: Schlangenblockade (…) → schlange-2 Stelle 1“. */
export function beschrifte(zustand: Spielzustand, aktion: SpielAktion): string {
  if (aktion.typ === 'UeberhandAbwerfen') return `${aktion.typ}: ${zielText(zustand, 'kartenIds', aktion.karteIds)}`
  if (aktion.typ === 'Reagieren') {
    return aktion.farbenschutzId === null ? 'Reagieren: durchlassen' : `Reagieren: abwehren mit ${karteText(zustand, aktion.farbenschutzId)}`
  }
  if (!('karteId' in aktion)) return aktion.typ
  const text = `${aktion.typ}: ${karteText(zustand, aktion.karteId)}`
  const ziel = Object.entries(aktion)
    .filter(([feld]) => feld !== 'typ' && feld !== 'spielerId' && feld !== 'karteId')
    .map(([feld, wert]) => zielText(zustand, feld, wert))
  return ziel.length === 0 ? text : `${text} → ${ziel.join(' · ')}`
}
