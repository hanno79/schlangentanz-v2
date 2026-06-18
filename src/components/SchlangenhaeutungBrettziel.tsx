/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: M2d rendert Schlangenhäutung als board-nahe Aktionsfläche direkt an einer eigenen Schlange.
*/

import type { SpielAktion, Spielzustand } from '../engine'
import {
  baueSchlangenhaeutungAktion,
  findeSchlangenhaeutung,
  reihenfolgeLabel,
  type EigeneSchlange,
} from './schlangenhaeutungBrettzielLogik'

interface SchlangenhaeutungBrettzielProps {
  zustand: Spielzustand
  schlange: EigeneSchlange
  ausgewaehlteHandkarteId: string | null
  onAktion: (aktion: SpielAktion) => void
}

export default function SchlangenhaeutungBrettziel({
  zustand,
  schlange,
  ausgewaehlteHandkarteId,
  onAktion,
}: SchlangenhaeutungBrettzielProps) {
  const schlangenhaeutung = findeSchlangenhaeutung(zustand, ausgewaehlteHandkarteId)
  if (!schlangenhaeutung || schlange.zustand !== 'aktiv' || schlange.karten.length < 2) return null

  const aktuelleIds = schlange.karten.map((karte) => karte.id)
  const umkehrIds = [...aktuelleIds].reverse()
  const ersteAnsEndeIds = [...aktuelleIds.slice(1), aktuelleIds[0]]
  const umkehrAktion = baueSchlangenhaeutungAktion(zustand, schlange, schlangenhaeutung.id, umkehrIds)
  const ersteAnsEndeAktion = baueSchlangenhaeutungAktion(zustand, schlange, schlangenhaeutung.id, ersteAnsEndeIds)
  if (!umkehrAktion && !ersteAnsEndeAktion) return null

  return (
    <div className="schlangenhaeutung-brettziel schlangenhaeutung-haeutungsring" role="group" aria-label={`Schlangenhäutung am Brett für Schlange ${schlange.id}`}>
      <span className="schlangenhaeutung-haeutungsring__icon" aria-hidden="true">🌀</span>
      <div className="schlangenhaeutung-haeutungsring__text">
        <strong>Schlangenhäutung-Häutungsring</strong>
        <span className="schlangenhaeutung-haeutungsring__chip">Kartenhaut lösen</span>
        <span>Aktuell: {reihenfolgeLabel(aktuelleIds)}</span>
        {umkehrAktion && <span>Umkehr: {reihenfolgeLabel(umkehrIds)}</span>}
        {ersteAnsEndeAktion && <span>Erste Karte ans Ende: {reihenfolgeLabel(ersteAnsEndeIds)}</span>}
      </div>
      {umkehrAktion && (
        <button
          type="button"
          className="schlangekarte__sonderaktion-button schlangenhaeutung-brettziel__button schlangenhaeutung-haeutungsring__button"
          aria-label={`Schlangenhäutung am Brett mit Karte ${schlangenhaeutung.id}: Schlange ${schlange.id} umkehren`}
          onClick={(event) => {
            event.stopPropagation()
            onAktion(umkehrAktion)
          }}
        >
          Schlange umkehren
        </button>
      )}
      {ersteAnsEndeAktion && (
        <button
          type="button"
          className="schlangekarte__sonderaktion-button schlangenhaeutung-brettziel__button schlangenhaeutung-haeutungsring__button"
          aria-label={`Schlangenhäutung am Brett mit Karte ${schlangenhaeutung.id}: erste Karte von Schlange ${schlange.id} ans Ende setzen`}
          onClick={(event) => {
            event.stopPropagation()
            onAktion(ersteAnsEndeAktion)
          }}
        >
          Erste Karte ans Ende
        </button>
      )}
    </div>
  )
}
