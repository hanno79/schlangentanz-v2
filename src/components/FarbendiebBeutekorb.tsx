/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Körperlicher Waldtanz-Beutekorb für Farbendieb-Zielkarten mit Einfügeplätzen.
*/
import type { SpielAktion } from '../engine'

interface FarbendiebBeutekorbProps {
  aktionen: Extract<SpielAktion, { typ: 'FarbendiebSpielen' }>[]
  beuteKartenId: string
  onAktion: (aktion: SpielAktion) => void
  aktionsLabel: (aktion: SpielAktion) => string
}

export default function FarbendiebBeutekorb({ aktionen, beuteKartenId, onAktion, aktionsLabel }: FarbendiebBeutekorbProps) {
  if (aktionen.length === 0) return null

  const zielSchlangenIds = Array.from(new Set(aktionen.map((aktion) => aktion.eigeneSchlangenId)))
  const zielLabel = zielSchlangenIds.join(', ')

  return (
    <div className="farbendieb-beutekorb" role="group" aria-label={`Farbendieb-Beutekorb für ${beuteKartenId}`}>
      <div className="farbendieb-beutekorb__kopf">
        <span className="farbendieb-beutekorb__icon" aria-hidden="true">🧺</span>
        <div>
          <strong>Beutekorb</strong>
          <span>Beutekarte {beuteKartenId}</span>
          <span>Ziel: {zielLabel}</span>
        </div>
      </div>
      <div className="farbendieb-beutekorb__plaetze" role="group" aria-label={`Einfügeplätze für ${beuteKartenId}`}>
        {aktionen.map((aktion) => (
          <button
            key={`${aktion.handkartenId}-${aktion.eigeneSchlangenId}-${aktion.einfügeIndex}`}
            type="button"
            className="farbendieb-beutekorb__platz"
            aria-label={`Farbendieb-Beutekorb mit Karte ${aktion.handkartenId}: ${aktion.zielKartenId} in ${aktion.eigeneSchlangenId} an Platz ${aktion.einfügeIndex + 1} legen`}
            title={aktionsLabel(aktion)}
            onClick={() => onAktion(aktion)}
          >
            <span>Platz {aktion.einfügeIndex + 1}</span>
            <small>Beute legen</small>
          </button>
        ))}
      </div>
    </div>
  )
}
