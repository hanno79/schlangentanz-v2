/*
Author: Claude Code (G-2)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Die Darstellung einer einzelnen Spielkarte auf dem neuen Brett.

Das Kartenvokabular kommt unverändert aus `src/kartenTexte.ts` — dieselben
Namen („Wasserwirbel", „Feuerkeim") wie bisher. Neu ist nur die Form: eine
Karte, ein Rahmen, keine Verschachtelung.
*/

import type { Spielkarte } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'
import { karteAnzeigename, karteSymbol, karteWertLabel } from '../kartenTexte'

interface KartenmarkeProps {
  karte: Spielkarte
  gewaehlt?: boolean
  verdeckt?: boolean
  onWaehlen?: () => void
  zusatz?: string
}

function farbklasse(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? ` brett-karte--${farbeCssKlasse(karte.farbe)}` : ''
}

export default function Kartenmarke({ karte, gewaehlt, verdeckt, onWaehlen, zusatz }: KartenmarkeProps) {
  if (verdeckt) {
    return (
      <li className="brett-karte brett-karte--verdeckt" aria-label="Verdeckte Handkarte">
        <span className="brett-karte__farbe" aria-hidden="true" />
        <span className="brett-karte__name">Verdeckt</span>
      </li>
    )
  }

  const name = karteAnzeigename(karte)
  const wert = karteWertLabel(karte)
  const beschriftung = [name, wert, zusatz].filter(Boolean).join(', ')

  return (
    <li>
      <button
        type="button"
        className={`brett-karte${farbklasse(karte)}${gewaehlt ? ' brett-karte--gewaehlt' : ''}`}
        aria-pressed={onWaehlen ? Boolean(gewaehlt) : undefined}
        aria-label={beschriftung}
        onClick={onWaehlen}
        disabled={!onWaehlen}
      >
        <span className="brett-karte__farbe" aria-hidden="true" />
        <span className="brett-karte__name">
          <span aria-hidden="true">{karteSymbol(karte)} </span>
          {name}
        </span>
        <span className="brett-karte__zeile">{wert}</span>
        {zusatz ? <span className="brett-karte__zeile">{zusatz}</span> : null}
      </button>
    </li>
  )
}
