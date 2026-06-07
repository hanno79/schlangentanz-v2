/*
Author: rahn
Datum: 07.06.2026
Version: 1.2
Beschreibung: UI-Helfer für sichere Schlangenhäutung-Auswahlkandidaten, die über den Engine-Aktionspfad ausgeführt werden.
# ÄNDERUNG 07.06.2026: R101 ergänzt neben dem Umkehr-Fallback eine kleine Auswahlaktion "erste Karte ans Ende".
# ÄNDERUNG 07.06.2026: R103 entfernt die Quick-Option "erste Karte ans Ende" – sie wird durch die lokale Reihenfolge-Auswahl (R102) abgedeckt.
*/

import type { SpielAktion, Spielzustand } from '../engine'
import { pruefeAktion } from '../engine'

export type SchlangenhaeutungUiAktion = Extract<SpielAktion, { typ: 'SchlangenhaeutungSpielen' }>

export interface SchlangenhaeutungUiOption {
  key: string
  ariaLabel: string
  label: string
  aktion: SchlangenhaeutungUiAktion
}

export function erstelleSchlangenhaeutungUiOptionen(zustand: Spielzustand): SchlangenhaeutungUiOption[] {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const schlangenhaeutung = aktiverSpieler.hand.find(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung',
  )
  if (!schlangenhaeutung) return []

  return aktiverSpieler.schlangen
    .filter((schlange) => schlange.zustand === 'aktiv' && schlange.karten.length > 1)
    .map((schlange) => {
      const kartenIds = schlange.karten.map((karte) => karte.id)
      const basisAktion = {
        typ: 'SchlangenhaeutungSpielen' as const,
        spielerId: aktiverSpieler.id,
        handkartenId: schlangenhaeutung.id,
        schlangenId: schlange.id,
      }
      return {
        key: `${schlangenhaeutung.id}-${schlange.id}-umkehren`,
        ariaLabel: `Schlangenhäutung: Schlange ${schlange.id} umkehren`,
        label: `Schlange ${schlange.id} umkehren`,
        aktion: { ...basisAktion, kartenIdsInNeuerReihenfolge: [...kartenIds].reverse() },
      }
    })
    .filter((option) => pruefeAktion(zustand, option.aktion).erlaubt)
}

export function erstelleSchlangenhaeutungUmkehrAktionen(zustand: Spielzustand): SchlangenhaeutungUiAktion[] {
  return erstelleSchlangenhaeutungUiOptionen(zustand).map((option) => option.aktion)
}
