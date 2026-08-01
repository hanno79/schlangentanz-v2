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
  /** `abwurf` färbt die Markierung als Warnung — der Klick wirft die Karte weg,
      er wählt sie nicht aus. Derselbe Klick darf nicht gleich aussehen.
      `ziel` markiert eine Karte am Brett, die gerade angeklickt werden kann
      (Schlangenfrass, Farbenfusion, Farbendieb-Beute). */
  variante?: 'auswahl' | 'abwurf' | 'ziel'
  /** Platz in der Reihe, 1-basiert. Eine Hand aus elf blauen Karten ergäbe sonst
      elf gleichnamige Knöpfe — für Screenreader nicht unterscheidbar. */
  platz?: number
  /** Länge der Reihe, für „Karte 3 von 11". */
  vonWievielen?: number
}

function farbklasse(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? ` brett-karte--${farbeCssKlasse(karte.farbe)}` : ''
}

export default function Kartenmarke({
  karte,
  gewaehlt,
  verdeckt,
  onWaehlen,
  zusatz,
  variante = 'auswahl',
  platz,
  vonWievielen,
}: KartenmarkeProps) {
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
  const ortsangabe = platz !== undefined && vonWievielen !== undefined ? `Karte ${platz} von ${vonWievielen}` : null
  const beschriftung = [name, wert, ortsangabe, zusatz].filter(Boolean).join(', ')

  return (
    <li>
      <button
        type="button"
        className={
          `brett-karte${farbklasse(karte)}` +
          (variante === 'ziel' ? ' brett-karte--ziel' : '') +
          (gewaehlt ? (variante === 'abwurf' ? ' brett-karte--abwurf' : ' brett-karte--gewaehlt') : '')
        }
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
