import { expect } from 'vitest'
import type { Spielkarte, Spielzustand } from '../index'
import { findeSchlange } from '../schlangen'
import type { EinfuegeAktion } from '../karten/schlangenstelle'
import { aktionen, fuehreAus } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
Hilfen für die Tests zum Legen (E5): Regenbogenschlange und Schlangenblockade
kommen an eine Lücke einer bestehenden Schlange (A7.3, A7.5, D16).
*/

/** Die aufgezählten Einfügeaktionen dieses Typs für die Karte `karteId`. */
function einfuegeAktionen(zustand: Spielzustand, typ: EinfuegeAktion['typ'], karteId: string): EinfuegeAktion[] {
  return aktionen(zustand, typ).filter((aktion): aktion is EinfuegeAktion => aktion.typ === typ && aktion.karteId === karteId)
}

/** Die aufgezählten Lücken, an die die Karte `karteId` mit `typ` kommt, als „Schlange Stelle“. */
export function luecken(zustand: Spielzustand, typ: EinfuegeAktion['typ'], karteId: string): string[] {
  return einfuegeAktionen(zustand, typ, karteId).map((aktion) => `${aktion.schlangenId} ${aktion.position}`)
}

/** Die aufgezählte Aktion, die die Karte `karteId` an die Lücke `position` der Schlange legt. */
export function einfuegen(zustand: Spielzustand, typ: EinfuegeAktion['typ'], karteId: string, schlangenId: string, position: number): EinfuegeAktion {
  const passend = einfuegeAktionen(zustand, typ, karteId).find((aktion) => aktion.schlangenId === schlangenId && aktion.position === position)
  expect(passend, `${typ} ${karteId} → ${schlangenId} Stelle ${position} ist nicht aufgezählt`).toBeDefined()
  return passend!
}

/** Spieler 1 legt seine erste Handkarte `name` mit `typ` an die Lücke `position` der Schlange. */
export function lege(zustand: Spielzustand, typ: EinfuegeAktion['typ'], name: string, schlangenId: string, position: number): Schritt {
  return fuehreAus(zustand, einfuegen(zustand, typ, handkarte(zustand, 0, name), schlangenId, position))
}

/** Alle Lücken 0 bis Länge dieser Schlangen, in dieser Reihenfolge. */
export function alleLuecken(zustand: Spielzustand, schlangenIds: string[]): string[] {
  return schlangenIds.flatMap((id) => {
    const { schlange } = findeSchlange(zustand, id)!
    return Array.from({ length: schlange.karten.length + 1 }, (_, position) => `${id} ${position}`)
  })
}

export function schlangenKarten(zustand: Spielzustand, spieler: number, schlange = 0): string[] {
  return zustand.spieler[spieler].schlangen[schlange].karten.map((karte) => karte.id)
}

/** Farbe einer Farbkarte, Name einer Sonderkarte. */
export function kartenname(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? karte.farbe : karte.name
}

/** Die Schlange als Folge von Farben und Sonderkartennamen. */
export function schlangenNamen(zustand: Spielzustand, spieler: number, schlange = 0): string[] {
  return zustand.spieler[spieler].schlangen[schlange].karten.map(kartenname)
}

/** Die erste Handkarte dieses Namens. */
export function handkarte(zustand: Spielzustand, spieler: number, name: string): string {
  const karte = zustand.spieler[spieler].hand.find((eintrag) => kartenname(eintrag) === name)
  expect(karte, `${name} liegt nicht auf der Hand von Spieler ${spieler}`).toBeDefined()
  return karte!.id
}

/** `karten` mit `neu` an der Lücke `position`. */
export function mitEingefuegt(karten: string[], position: number, neu: string): string[] {
  return [...karten.slice(0, position), neu, ...karten.slice(position)]
}
