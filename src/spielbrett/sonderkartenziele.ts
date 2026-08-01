/*
Author: Claude Code (G-11)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Sonderkarten am Brett anspielen — Karte wählen, Ziel anklicken.

Farbkarten spielt man am Brett: Karte wählen, Startkreis oder Anlegeplatz
anklicken (`brettziele.ts`). Sonderkarten gingen nur über die Aktionsliste, wo
man aus vielen fast gleichlautenden Einträgen den heraussuchen musste, der den
richtigen Gegner meint. Dieses Modul macht den Brettweg auch für sie möglich.

**Gebaut wird hier keine Aktion.** Die Engine enumeriert bereits jede legale
Kombination samt Zielen; hier wird nur gefiltert. Eine Aktion selbst
zusammenzusetzen hieße, die Regeln ein zweites Mal zu schreiben — und die zweite
Fassung wäre die, die irgendwann abweicht.

Das Verfahren ist für alle Karten dasselbe: Jede Aktion wird auf ihre geordnete
Zielfolge abgebildet. Passt die bisherige Auswahl auf den Anfang dieser Folge,
bleibt die Aktion im Rennen; ihr nächstes Ziel ist anklickbar. Ist die Folge
aufgebraucht, ist die Aktion vollständig.

Daraus fällt der Sonderfall des Schlangenfrasses von selbst richtig heraus: Ein
Ziel auf eigener Schlange ist sofort vollständig, zwei gegnerische Ziele
brauchen einen zweiten Klick — ohne dass diese Regel hier noch einmal steht.
*/

import type { SpielAktion } from '../engine'

/** Ein anklickbarer Ort auf dem Brett. */
export type Brettziel =
  /** Die Plakette eines Gegners — der Gegner als Ganzes (Schlangengrube). */
  | { art: 'gegnerPlakette'; spielerId: string }
  /** Eine ganze gegnerische Schlange (Schlangenblockade). */
  | { art: 'gegnerSchlange'; spielerId: string; schlangenId: string }
  /** Eine ganze eigene Schlange (Farbenschutz). */
  | { art: 'eigeneSchlange'; schlangenId: string }
  /** Eine einzelne Karte in irgendeiner Schlange (Farbenfusion, Schlangenfrass, Farbendieb). */
  | { art: 'karte'; spielerId: string; schlangenId: string; kartenId: string }
  /** Ein Platz zwischen zwei Karten einer eigenen Schlange (Farbendieb). */
  | { art: 'einfuegeplatz'; schlangenId: string; index: number }

export interface Zielangebot {
  /** Was jetzt anklickbar ist. Jedes Ziel genau einmal. */
  offeneZiele: Brettziel[]
  /** Die Aktion, falls die Auswahl vollständig ist. */
  fertig: SpielAktion | null
}

/** Vergleichbare Kennung eines Ziels — für Gleichheit und als React-Key. */
export function zielSchluessel(ziel: Brettziel): string {
  switch (ziel.art) {
    case 'gegnerPlakette':
      return `plakette:${ziel.spielerId}`
    case 'gegnerSchlange':
      return `gegnerschlange:${ziel.spielerId}:${ziel.schlangenId}`
    case 'eigeneSchlange':
      return `eigeneschlange:${ziel.schlangenId}`
    case 'karte':
      return `karte:${ziel.spielerId}:${ziel.schlangenId}:${ziel.kartenId}`
    case 'einfuegeplatz':
      return `einfuegeplatz:${ziel.schlangenId}:${ziel.index}`
  }
}

/**
 * Die Ziele einer Aktion, in der Reihenfolge, in der sie angeklickt werden.
 *
 * Eine leere Folge heißt: Diese Aktion hat kein Brettziel (Verdoppler,
 * Pflichtabwurf). Sie bleibt Sache der Aktionsliste — ein Ziel zu erfinden,
 * damit sie hier hineinpasst, wäre Beiwerk ohne Nutzen.
 */
function zieleVon(aktion: SpielAktion): Brettziel[] {
  switch (aktion.typ) {
    // Schlangengrube: der Gegner als Ganzes.
    case 'SonderkarteSpielen':
      return [{ art: 'gegnerPlakette', spielerId: aktion.zielSpielerId }]

    case 'SchlangenblockadeSpielen':
      return [
        { art: 'gegnerSchlange', spielerId: aktion.zielSpielerId, schlangenId: aktion.zielSchlangenId },
      ]

    case 'FarbenschutzSpielen':
      return [{ art: 'eigeneSchlange', schlangenId: aktion.zielSchlangenId }]

    case 'FarbenfusionSpielen':
      return [
        {
          art: 'karte',
          spielerId: aktion.spielerId,
          schlangenId: aktion.zielSchlangenId,
          kartenId: aktion.zielKartenId,
        },
      ]

    case 'FarbendiebSpielen':
      return [
        {
          art: 'karte',
          spielerId: aktion.zielSpielerId,
          schlangenId: aktion.zielSchlangenId,
          kartenId: aktion.zielKartenId,
        },
        { art: 'einfuegeplatz', schlangenId: aktion.eigeneSchlangenId, index: aktion.einfügeIndex },
      ]

    case 'SchlangenfrassSpielen':
      return aktion.ziele.map((ziel) => ({
        art: 'karte',
        spielerId: ziel.spielerId,
        schlangenId: ziel.schlangenId,
        kartenId: ziel.kartenId,
      }))

    default:
      return []
  }
}

/**
 * Was ist jetzt anklickbar, und ist die Auswahl vollständig?
 *
 * @param aktionen   Legale Aktionen der gewählten Handkarte, aus der Engine.
 * @param teilauswahl Die bereits angeklickten Ziele, in Klickreihenfolge.
 */
export function ermittleZielangebot(
  aktionen: readonly SpielAktion[],
  teilauswahl: readonly Brettziel[],
): Zielangebot {
  const gewaehlt = teilauswahl.map(zielSchluessel)

  let fertig: SpielAktion | null = null
  const offeneZiele: Brettziel[] = []
  const gesehen = new Set<string>()

  for (const aktion of aktionen) {
    const ziele = zieleVon(aktion)
    if (ziele.length === 0) continue

    if (ziele.length < gewaehlt.length) continue
    // Die bisherige Auswahl muss der Anfang dieser Zielfolge sein.
    if (!gewaehlt.every((schluessel, index) => zielSchluessel(ziele[index]) === schluessel)) continue

    if (ziele.length === gewaehlt.length) {
      /* Vollständig. Die erste gewinnt: Zwei Aktionen mit identischer Zielfolge
         wären wirkungsgleich — sonst unterschieden sie sich in einem Ziel. */
      fertig ??= aktion
      continue
    }

    const naechstes = ziele[gewaehlt.length]
    const schluessel = zielSchluessel(naechstes)
    if (gesehen.has(schluessel)) continue
    gesehen.add(schluessel)
    offeneZiele.push(naechstes)
  }

  // Ist etwas fertig, wird nicht weitergeklickt — der Zug ist getan.
  return fertig === null ? { offeneZiele, fertig: null } : { offeneZiele: [], fertig }
}
