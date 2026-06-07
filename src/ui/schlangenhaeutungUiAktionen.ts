/*
Author: rahn
Datum: 07.06.2026
Version: 1.1
Beschreibung: UI-Helfer für sichere Schlangenhäutung-Auswahlkandidaten, die über den Engine-Aktionspfad ausgeführt werden.
# ÄNDERUNG 07.06.2026: R101 ergänzt neben dem Umkehr-Fallback eine kleine Auswahlaktion "erste Karte ans Ende".
# Beide Kandidaten werden dedupliziert und über die Engine-Legalitätsprüfung gefiltert.
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

function eindeutigeErlaubteOptionen(zustand: Spielzustand, optionen: SchlangenhaeutungUiOption[]): SchlangenhaeutungUiOption[] {
  const geseheneReihenfolgen = new Set<string>()
  return optionen.filter((option) => {
    const reihenfolgeKey = `${option.aktion.schlangenId}:${option.aktion.kartenIdsInNeuerReihenfolge.join(',')}`
    if (geseheneReihenfolgen.has(reihenfolgeKey)) return false
    geseheneReihenfolgen.add(reihenfolgeKey)
    return pruefeAktion(zustand, option.aktion).erlaubt
  })
}

export function erstelleSchlangenhaeutungUiOptionen(zustand: Spielzustand): SchlangenhaeutungUiOption[] {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const schlangenhaeutung = aktiverSpieler.hand.find(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung',
  )
  if (!schlangenhaeutung) return []

  const optionen = aktiverSpieler.schlangen
    .filter((schlange) => schlange.zustand === 'aktiv' && schlange.karten.length > 1)
    .flatMap((schlange) => {
      const kartenIds = schlange.karten.map((karte) => karte.id)
      const basisAktion = {
        typ: 'SchlangenhaeutungSpielen' as const,
        spielerId: aktiverSpieler.id,
        handkartenId: schlangenhaeutung.id,
        schlangenId: schlange.id,
      }
      return [
        {
          key: `${schlangenhaeutung.id}-${schlange.id}-umkehren`,
          ariaLabel: `Schlangenhäutung: Schlange ${schlange.id} umkehren`,
          label: `Schlange ${schlange.id} umkehren`,
          aktion: { ...basisAktion, kartenIdsInNeuerReihenfolge: [...kartenIds].reverse() },
        },
        {
          key: `${schlangenhaeutung.id}-${schlange.id}-erste-karte-ans-ende`,
          ariaLabel: `Schlangenhäutung: Schlange ${schlange.id} erste Karte ans Ende setzen`,
          label: `Schlange ${schlange.id}: erste Karte ans Ende`,
          aktion: { ...basisAktion, kartenIdsInNeuerReihenfolge: [...kartenIds.slice(1), kartenIds[0]] },
        },
      ]
    })

  return eindeutigeErlaubteOptionen(zustand, optionen)
}

export function erstelleSchlangenhaeutungUmkehrAktionen(zustand: Spielzustand): SchlangenhaeutungUiAktion[] {
  return erstelleSchlangenhaeutungUiOptionen(zustand)
    .filter((option) => option.key.endsWith('-umkehren'))
    .map((option) => option.aktion)
}
