/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahe Farbenfusion-Paaranzeige für den Waldtanz-Schlangenbereich.
*/
import type { SpielAktion } from '../engine'
import type { FarbenfusionPaarInfo } from './farbenfusionPaarInfo'

interface FarbenfusionPaarzielProps {
  paar: FarbenfusionPaarInfo | null
  onAktion: (aktion: SpielAktion) => void
}

export default function FarbenfusionPaarziel({ paar, onAktion }: FarbenfusionPaarzielProps) {
  if (!paar) return null
  if (!paar.istStartkarte) {
    return <span className="farbenfusion-rankenring__partner">Rankenpartner</span>
  }

  return (
    <span className="farbenfusion-rankenring" role="group" aria-label={`Farbenfusion-Rankenring für ${paar.ersteKartenId} und ${paar.zweiteKartenId}`}>
      <span className="farbenfusion-rankenring__icon" aria-hidden="true">🌿</span>
      <span className="farbenfusion-rankenring__text">
        <span className="farbenfusion-rankenring__eyebrow">Farbenfusion-Rankenring</span>
        <span>Zauberkarte {paar.aktion.handkartenId}</span>
        <strong>{paar.ersteKartenId} + {paar.zweiteKartenId}</strong>
        <span>{paar.punkte} Punkte werden verschmolzen</span>
      </span>
      <button
        type="button"
        className="farbenfusion-rankenring__button schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--fusion"
        aria-label={`Farbenfusion-Paar im Schlangenbereich mit Karte ${paar.aktion.handkartenId}: ${paar.ersteKartenId} und ${paar.zweiteKartenId} fusionieren`}
        title={`Farbenfusion mit Karte ${paar.aktion.handkartenId} auf Schlange ${paar.aktion.zielSchlangenId} bei Karte ${paar.aktion.zielKartenId} spielen`}
        onClick={(event) => {
          event.stopPropagation()
          onAktion(paar.aktion)
        }}
      >
        Rankenpaar verschmelzen
      </button>
    </span>
  )
}
