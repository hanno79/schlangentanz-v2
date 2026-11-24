import { ablagestapelStelle, risikoaktionText } from '../engine'
import type { SpielAktion, Spielkarte, Spielzustand } from '../engine'
import { karteAnzeigename } from '../kartenTexte'
import { name } from './namen'

/*
Die Beschriftung der Aktionsknöpfe am Entwicklertisch. Viele Karten haben je
Handkarte mehrere Ziele (jede Stelle jeder Schlange, zwei Karten zum Fressen);
damit man das richtige anklickt, nennt der Knopf das Ziel. Erkannt wird am Wert,
nicht am Feldnamen: Eine Karten-Id wird zur Karte mit Namen und Id, eine
Spieler-Id zum Spieler; Schlangen-Ids, Seiten und Optionen stehen, wie sie sind.
Nur `position` („Stelle n“) und `art` (neue oder bestehende Schlange; der
Bonus des Schlangenkorbs steht, wie er heisst) brauchen eigene Worte. Die ganze
Aktion steht im Tooltip und in `data-aktion`.

Eine Risiko-Aktion nennt ihre Nummer und ihren Namen aus A8.2 und die benannte
Karte. Eine Wahl aus mehreren Wörtern („blau-01 schlange-2 ende“) wird Wort für
Wort beschriftet; „ablagestapel-n“ nennt die Karte an dieser Stelle des
Ablagestapels dessen, der entscheidet (X5).
*/

interface Tisch {
  zustand: Spielzustand
  karten: ReadonlyMap<string, Spielkarte>
}

/** Jede Karte, die ein Ziel nennen kann: auf den Händen, in den Schlangen, unter Fusionen und auf den Ablagestapeln. */
function kartenAmTisch(zustand: Spielzustand): Map<string, Spielkarte> {
  const karten = zustand.spieler.flatMap((spieler) => [
    ...spieler.hand,
    ...spieler.ablagestapel,
    ...spieler.schlangen.flatMap((schlange) => [...schlange.karten, ...schlange.fusionen.flatMap((fusion) => fusion.unter)]),
  ])
  return new Map(karten.map((karte) => [karte.id, karte]))
}

/** Ein Wert eines Ziels lesbar; Listen und verschachtelte Ziele Feld für Feld. */
function zielText(tisch: Tisch, feld: string, wert: unknown): string {
  if (Array.isArray(wert)) return wert.map((eintrag) => zielText(tisch, feld, eintrag)).join(', ')
  if (typeof wert === 'object' && wert !== null) {
    return Object.entries(wert)
      .map(([unterfeld, inhalt]) => zielText(tisch, unterfeld, inhalt))
      .filter((text) => text !== '')
      .join(' ')
  }
  if (feld === 'position') return `Stelle ${String(wert)}`
  // Die bestehende Schlange nennt schon ihre Id; nur die neue braucht ein Wort. Der Bonus des Schlangenkorbs steht, wie er heisst (X6).
  if (feld === 'art') return wert === 'neueSchlange' ? 'neue Schlange' : wert === 'schlange' ? '' : String(wert)
  const karte = tisch.karten.get(String(wert))
  if (karte !== undefined) return `${karteAnzeigename(karte)} (${karte.id})`
  const spieler = tisch.zustand.spieler.findIndex((eintrag) => eintrag.id === wert)
  return spieler >= 0 ? name(tisch.zustand, spieler) : String(wert)
}

/** Ein Wort einer Wahl; eine Stelle im Ablagestapel wird zur Karte dort (A8.2 Aktion 4). */
function wahlText(tisch: Tisch, spielerId: string, wort: string): string {
  const stelle = ablagestapelStelle(wort)
  const karte = stelle === null ? undefined : tisch.zustand.spieler.find((spieler) => spieler.id === spielerId)?.ablagestapel[stelle]
  return karte === undefined ? zielText(tisch, 'wahl', wort) : `Ablagestapel ${zielText(tisch, 'karteId', karte.id)}`
}

/** Aktionstyp, gespielte Karte und das Ziel, etwa „BlockadeLegen: Schlangenblockade (…) → schlange-2 · Stelle 1“. */
export function beschrifte(zustand: Spielzustand, aktion: SpielAktion): string {
  const tisch: Tisch = { zustand, karten: kartenAmTisch(zustand) }
  if ('karteIds' in aktion) return `${aktion.typ}: ${zielText(tisch, 'karteIds', aktion.karteIds)}`
  // X4: Die Comeback-Karte liegt offen vor dem Spieler, nicht auf der Hand.
  if (aktion.typ === 'ComebackEinsetzen') return `${aktion.typ}: Comeback-Karte (${aktion.comebackId})`
  if (aktion.typ === 'Reagieren') {
    return aktion.farbenschutzId === null ? 'Reagieren: durchlassen' : `Reagieren: abwehren mit ${zielText(tisch, 'farbenschutzId', aktion.farbenschutzId)}`
  }
  // X3: Die Wahl nennt einen Spieler oder steht, wie sie ist.
  if (aktion.typ === 'Entscheiden') return `Entscheiden: ${aktion.wahl.split(' ').map((teil) => wahlText(tisch, aktion.spielerId, teil)).join(' · ')}`
  if (aktion.typ === 'RisikoKarteSpielen') {
    const benannt = aktion.benannt === null ? '' : ` · benennt ${zielText(tisch, 'benannt', aktion.benannt)}`
    return `${aktion.typ}: ${risikoaktionText(aktion.risikoAktion)} mit ${aktion.risikoKarteId}${benannt}`
  }
  if (!('karteId' in aktion)) return aktion.typ
  const text = `${aktion.typ}: ${zielText(tisch, 'karteId', aktion.karteId)}`
  const ziel = Object.entries(aktion)
    .filter(([feld]) => feld !== 'typ' && feld !== 'spielerId' && feld !== 'karteId')
    .map(([feld, wert]) => zielText(tisch, feld, wert))
  return ziel.length === 0 ? text : `${text} → ${ziel.join(' · ')}`
}
