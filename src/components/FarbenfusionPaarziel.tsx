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
    return <span className="farbenfusion-paarziel__partner">Paarpartner für Farbenfusion</span>
  }

  return (
    <>
      <span className="farbenfusion-paarziel__plakette">
        Fusion: {paar.ersteKartenId} + {paar.zweiteKartenId} · {paar.punkte} Punkte
      </span>
      <button
        type="button"
        className="schlangekarte__sonderaktion-button schlangekarte__sonderaktion-button--fusion"
        aria-label={`Farbenfusion-Paar im Schlangenbereich mit Karte ${paar.aktion.handkartenId}: ${paar.ersteKartenId} und ${paar.zweiteKartenId} fusionieren`}
        title={`Farbenfusion mit Karte ${paar.aktion.handkartenId} auf Schlange ${paar.aktion.zielSchlangenId} bei Karte ${paar.aktion.zielKartenId} spielen`}
        onClick={(event) => {
          event.stopPropagation()
          onAktion(paar.aktion)
        }}
      >
        Paar fusionieren
      </button>
    </>
  )
}
