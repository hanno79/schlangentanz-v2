/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: UI-Helfer für den ersten sicheren Schlangenhäutung-Fallback: eigene aktive Schlange umkehren und über den Engine-Aktionspfad ausführen.
*/

import type { SpielAktion, Spielzustand } from '../engine'
import { pruefeAktion } from '../engine'

export type SchlangenhaeutungUiAktion = Extract<SpielAktion, { typ: 'SchlangenhaeutungSpielen' }>

export function erstelleSchlangenhaeutungUmkehrAktionen(zustand: Spielzustand): SchlangenhaeutungUiAktion[] {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const schlangenhaeutung = aktiverSpieler.hand.find(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung',
  )
  if (!schlangenhaeutung) return []

  return aktiverSpieler.schlangen
    .filter((schlange) => schlange.zustand === 'aktiv' && schlange.karten.length > 1)
    .map((schlange) => ({
      typ: 'SchlangenhaeutungSpielen' as const,
      spielerId: aktiverSpieler.id,
      handkartenId: schlangenhaeutung.id,
      schlangenId: schlange.id,
      kartenIdsInNeuerReihenfolge: schlange.karten.map((karte) => karte.id).reverse(),
    }))
    .filter((aktion) => pruefeAktion(zustand, aktion).erlaubt)
}
