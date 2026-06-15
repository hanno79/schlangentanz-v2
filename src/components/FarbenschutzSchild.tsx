/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Waldtanz-Schutzschild fuer board-nahe Farbenschutz-Ziele.
*/

import type { MouseEvent } from 'react'
import type { SpielAktion } from '../engine'

interface FarbenschutzSchildProps {
  aktion: Extract<SpielAktion, { typ: 'FarbenschutzSpielen' }>
  label: string
  onAktion: (aktion: SpielAktion) => void
}

export default function FarbenschutzSchild({ aktion, label, onAktion }: FarbenschutzSchildProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onAktion(aktion)
  }

  return (
    <button
      type="button"
      className="schlangekarte__schutzschild schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--schutz"
      aria-label={`Farbenschutz im Schlangenbereich mit Karte ${aktion.handkartenId} auf Schlange ${aktion.zielSchlangenId}`}
      title={label}
      onClick={handleClick}
    >
      <span className="schlangekarte__schutzschild-card" aria-hidden="true">🛡️</span>
      <span className="schlangekarte__schutzschild-text">
        <span className="schlangekarte__schutzschild-label">Schutzschild</span>
        <strong>{aktion.handkartenId}</strong>
        <span>auf</span>
        <strong className="schlangekarte__schutzschild-ziel">{aktion.zielSchlangenId}</strong>
      </span>
      <span className="schlangekarte__schutzschild-chip">Klick legt den Schild auf diese Schlange.</span>
    </button>
  )
}
