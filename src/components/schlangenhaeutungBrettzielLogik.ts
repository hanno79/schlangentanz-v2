/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: M2d Hilfslogik für board-nahe Schlangenhäutung-Aktionen ohne React-Komponentenexport.
*/

import type { SpielAktion, Spielzustand } from '../engine'
import { pruefeAktion } from '../engine'

export type EigeneSchlange = Spielzustand['spieler'][number]['schlangen'][number]
export type SchlangenhaeutungAktion = Extract<SpielAktion, { typ: 'SchlangenhaeutungSpielen' }>

export function findeSchlangenhaeutung(zustand: Spielzustand, ausgewaehlteHandkarteId: string | null) {
  if (!ausgewaehlteHandkarteId) return null
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  return aktiverSpieler.hand.find(
    (karte) => karte.id === ausgewaehlteHandkarteId && karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung',
  ) ?? null
}

export function reihenfolgeLabel(kartenIds: string[]): string {
  return kartenIds.join(' → ')
}

export function baueSchlangenhaeutungAktion(
  zustand: Spielzustand,
  schlange: EigeneSchlange,
  handkartenId: string,
  kartenIdsInNeuerReihenfolge: string[],
): SchlangenhaeutungAktion | null {
  const aktion: SchlangenhaeutungAktion = {
    typ: 'SchlangenhaeutungSpielen',
    spielerId: zustand.spieler[zustand.aktiverSpielerIndex].id,
    handkartenId,
    schlangenId: schlange.id,
    kartenIdsInNeuerReihenfolge,
  }

  return pruefeAktion(zustand, aktion).erlaubt ? aktion : null
}

export function hatSchlangenhaeutungBrettziel(
  zustand: Spielzustand,
  schlange: EigeneSchlange,
  ausgewaehlteHandkarteId: string | null,
): boolean {
  if (schlange.zustand !== 'aktiv' || schlange.karten.length < 2) return false
  const schlangenhaeutung = findeSchlangenhaeutung(zustand, ausgewaehlteHandkarteId)
  if (!schlangenhaeutung) return false
  const aktuelleIds = schlange.karten.map((karte) => karte.id)
  return Boolean(baueSchlangenhaeutungAktion(zustand, schlange, schlangenhaeutung.id, [...aktuelleIds].reverse()))
}
