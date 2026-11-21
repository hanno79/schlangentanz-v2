import { expect } from 'vitest'
import type { BlockadeLegenAktion, RegenbogenschlangeLegenAktion, Spielzustand } from '../index'
import { aktionen } from './zugablauf_hilfen'

/*
Hilfen für die Tests von Regenbogenschlange und Schlangenblockade (E5): Beide
kommen an eine Lücke einer bestehenden Schlange (A7.3, A7.5, D16).
*/

export type Einfuegen = RegenbogenschlangeLegenAktion | BlockadeLegenAktion

/** Die aufgezählten Lücken, an die die Karte `karteId` mit `typ` kommt, als „Schlange Stelle“. */
export function luecken(zustand: Spielzustand, typ: Einfuegen['typ'], karteId: string): string[] {
  return aktionen(zustand, typ).flatMap((aktion) =>
    (aktion.typ === 'RegenbogenschlangeLegen' || aktion.typ === 'BlockadeLegen') && aktion.karteId === karteId ? [`${aktion.schlangenId} ${aktion.position}`] : [],
  )
}

/** Die aufgezählte Aktion, die die Karte `karteId` an die Lücke `position` der Schlange legt. */
export function einfuegen(zustand: Spielzustand, typ: Einfuegen['typ'], karteId: string, schlangenId: string, position: number): Einfuegen {
  const passend = aktionen(zustand, typ).find(
    (aktion): aktion is Einfuegen =>
      (aktion.typ === 'RegenbogenschlangeLegen' || aktion.typ === 'BlockadeLegen') &&
      aktion.karteId === karteId &&
      aktion.schlangenId === schlangenId &&
      aktion.position === position,
  )
  expect(passend, `${typ} ${karteId} → ${schlangenId} Stelle ${position} ist nicht aufgezählt`).toBeDefined()
  return passend!
}

/** Alle Lücken 0 bis Länge dieser Schlangen, in dieser Reihenfolge. */
export function alleLuecken(zustand: Spielzustand, schlangenIds: string[]): string[] {
  const alle = zustand.spieler.flatMap((spieler) => spieler.schlangen)
  return schlangenIds.flatMap((id) => {
    const schlange = alle.find((eintrag) => eintrag.id === id)!
    return Array.from({ length: schlange.karten.length + 1 }, (_, position) => `${id} ${position}`)
  })
}

export function schlangenKarten(zustand: Spielzustand, spieler: number, schlange = 0): string[] {
  return zustand.spieler[spieler].schlangen[schlange].karten.map((karte) => karte.id)
}

/** Die erste Handkarte dieses Namens. */
export function handkarte(zustand: Spielzustand, spieler: number, name: string): string {
  const karte = zustand.spieler[spieler].hand.find((eintrag) => (eintrag.typ === 'Sonderkarte' ? eintrag.name : eintrag.farbe) === name)
  expect(karte, `${name} liegt nicht auf der Hand von Spieler ${spieler}`).toBeDefined()
  return karte!.id
}

/** `karten` mit `neu` an der Lücke `position`. */
export function mitEingefuegt(karten: string[], position: number, neu: string): string[] {
  return [...karten.slice(0, position), neu, ...karten.slice(position)]
}
