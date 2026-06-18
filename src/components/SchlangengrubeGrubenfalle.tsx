/*
Author: rahn
Datum: 18.06.2026
Version: 1.0
Beschreibung: Körperliche Waldtanz-Grubenfalle für board-nahe Schlangengrube-Spielerziele.
*/
import type { RefObject } from 'react'
import type { SpielAktion } from '../engine'

interface SchlangengrubeGrubenfalleProps {
  aktion: Extract<SpielAktion, { typ: 'SonderkarteSpielen' }>
  zielSpielerName: string
  buttonRef?: RefObject<HTMLButtonElement | null>
  onAktion: (aktion: SpielAktion) => void
}

export default function SchlangengrubeGrubenfalle({
  aktion,
  zielSpielerName,
  buttonRef,
  onAktion,
}: SchlangengrubeGrubenfalleProps) {
  return (
    <div
      className="schlangengrube-grubenfalle"
      role="group"
      aria-label={`Schlangengrube-Grubenfalle für ${zielSpielerName} mit Karte ${aktion.handkartenId}`}
    >
      <span className="schlangengrube-grubenfalle__icon" aria-hidden="true">🕳️</span>
      <div className="schlangengrube-grubenfalle__text">
        <span className="schlangengrube-grubenfalle__eyebrow">Spielerziel</span>
        <strong>Grubenfalle</strong>
        <span>Zauberkarte {aktion.handkartenId}</span>
        <span>Ziel: {zielSpielerName}</span>
        <span>verdeckte Karten werden verwirbelt</span>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className="schlangengrube-grubenfalle__button"
        aria-label={`Schlangengrube im Spielerrahmen mit Karte ${aktion.handkartenId} auf ${zielSpielerName}`}
        onClick={() => onAktion(aktion)}
      >
        Falle zuschnappen lassen
      </button>
    </div>
  )
}
