/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R102 UI-Komponente für eine lokale Schlangenhäutung-Reihenfolge-Auswahl ohne Drag-and-Drop.
# ÄNDERUNG 07.06.2026: Lokale Auswahl ergänzt, um eine gewählte Karte einer eigenen aktiven Schlange ans Ende zu setzen.
*/

import { useState } from 'react'
import type { SpielAktion, Spielzustand } from '../engine'
import { pruefeAktion } from '../engine'

type SchlangenhaeutungAktion = Extract<SpielAktion, { typ: 'SchlangenhaeutungSpielen' }>

function baueKarteAnsEndeAktion(
  zustand: Spielzustand,
  schlangenId: string,
  kartenId: string,
): SchlangenhaeutungAktion | null {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const schlangenhaeutung = aktiverSpieler.hand.find(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung',
  )
  const schlange = aktiverSpieler.schlangen.find(
    (kandidat) => kandidat.id === schlangenId && kandidat.zustand === 'aktiv',
  )
  if (!schlangenhaeutung || !schlange || schlange.karten.length < 2) return null
  if (!schlange.karten.some((karte) => karte.id === kartenId)) return null

  return {
    typ: 'SchlangenhaeutungSpielen',
    spielerId: aktiverSpieler.id,
    handkartenId: schlangenhaeutung.id,
    schlangenId: schlange.id,
    kartenIdsInNeuerReihenfolge: [
      ...schlange.karten.filter((karte) => karte.id !== kartenId).map((karte) => karte.id),
      kartenId,
    ],
  }
}

interface SchlangenhaeutungReihenfolgeAuswahlProps {
  zustand: Spielzustand
  onAktionAusfuehren: (aktion: SpielAktion) => void
}

export default function SchlangenhaeutungReihenfolgeAuswahl({
  zustand,
  onAktionAusfuehren,
}: SchlangenhaeutungReihenfolgeAuswahlProps) {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const hatSchlangenhaeutung = aktiverSpieler.hand.some(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung',
  )
  const schlangen = hatSchlangenhaeutung
    ? aktiverSpieler.schlangen.filter((schlange) => schlange.zustand === 'aktiv' && schlange.karten.length > 1)
    : []
  const [auswahlNachSchlange, setAuswahlNachSchlange] = useState<Record<string, string>>({})

  if (schlangen.length === 0) return null

  return (
    <div className="aktions-hinweis-aktionen" role="group" aria-label="Schlangenhäutung-Reihenfolge-Auswahl">
      <p>Wähle lokal eine Karte, die ans Ende dieser Schlange gesetzt wird.</p>
      {schlangen.map((schlange) => {
        const ausgewaehlteKarteId = auswahlNachSchlange[schlange.id] ?? schlange.karten[0].id
        const aktion = baueKarteAnsEndeAktion(zustand, schlange.id, ausgewaehlteKarteId)
        const istErlaubt = aktion ? pruefeAktion(zustand, aktion).erlaubt : false

        return (
          <div key={schlange.id} className="aktions-hinweis-aktionen">
            <label>
              Karte aus Schlange {schlange.id} ans Ende setzen
              <select
                aria-label={`Karte aus Schlange ${schlange.id} ans Ende setzen`}
                value={ausgewaehlteKarteId}
                onChange={(event) =>
                  setAuswahlNachSchlange((aktuell) => ({ ...aktuell, [schlange.id]: event.target.value }))
                }
              >
                {schlange.karten.map((karte) => (
                  <option key={karte.id} value={karte.id}>{karte.id}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="aktions-button"
              aria-label={`Schlangenhäutung: gewählte Karte aus Schlange ${schlange.id} ans Ende setzen`}
              disabled={!istErlaubt || !aktion}
              onClick={() => {
                if (aktion && istErlaubt) onAktionAusfuehren(aktion)
              }}
            >
              Gewählte Karte ans Ende setzen
            </button>
          </div>
        )
      })}
    </div>
  )
}
