/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Körperliche Waldtanz-Blockadefessel für board-nahe Schlangenblockade-Ziele.
*/
import type { SpielAktion } from '../engine'

interface SchlangenblockadeFesselProps {
  aktion: Extract<SpielAktion, { typ: 'SchlangenblockadeSpielen' }>
  zielSchlangenId: string
  onAktion: (aktion: SpielAktion) => void
  aktionsLabel: (aktion: SpielAktion) => string
}

export default function SchlangenblockadeFessel({ aktion, zielSchlangenId, onAktion, aktionsLabel }: SchlangenblockadeFesselProps) {
  return (
    <div className="schlangenblockade-fessel" role="group" aria-label={`Schlangenblockade-Fessel für ${zielSchlangenId}`}>
      <span className="schlangenblockade-fessel__icon" aria-hidden="true">🌿</span>
      <div className="schlangenblockade-fessel__text">
        <strong>Blockade-Fessel</strong>
        <span>{aktion.handkartenId}</span>
        <span>Ziel: {zielSchlangenId}</span>
      </div>
      <button
        type="button"
        className="schlangenblockade-fessel__button schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--blockade"
        aria-label={`Schlangenblockade-Fessel mit Karte ${aktion.handkartenId} um Schlange ${zielSchlangenId} legen`}
        title={aktionsLabel(aktion)}
        onClick={() => onAktion(aktion)}
      >
        Rankenfessel legen
      </button>
      <span className="schlangenblockade-fessel__chip">Klick legt die Ranken um diese Schlange.</span>
    </div>
  )
}
