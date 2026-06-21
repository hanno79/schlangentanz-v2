/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: Sichtbare Brettschritt-Stempel der letzten drei Ablagekarten auf dem Waldtanz-Arenenstein.
*/

import type { Spielkarte, Spielzustand } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

interface WaldtanzBrettschrittStempelProps {
  zustand: Spielzustand
}

function kartenStempelLabel(karte: Spielkarte): string {
  if (karte.typ === 'Farbkarte') {
    return `${karte.id} · ${karte.farbe} · ${karte.punkte}`
  }
  return `${karte.id} · ${karte.name}`
}

function stempelKlasse(karte: Spielkarte, index: number, anzahl: number): string {
  const basis = `brettschritt-stempel brettschritt-stempel--${karte.typ === 'Farbkarte' ? 'farbkarte' : 'sonderkarte'}`
  const rollenSuffix = index === anzahl - 1 ? ' brettschritt-stempel--aktuell' : ' brettschritt-stempel--vergangen'
  const farbSuffix = karte.typ === 'Farbkarte' ? ` schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}` : ''
  return `${basis}${rollenSuffix}${farbSuffix}`
}

export default function WaldtanzBrettschrittStempel({ zustand }: WaldtanzBrettschrittStempelProps) {
  const letzteDrei = zustand.ablagestapel.slice(-3)
  if (letzteDrei.length === 0) return null

  return (
    <div className="waldtanz-arenastein__stempel" role="group" aria-label="Brettschritt-Stempel der letzten Ablage">
      <ol className="brettschritt-stempel-reihe" aria-label="Brettschritt-Stempel">
        {letzteDrei.map((karte, index) => (
          <li key={karte.id} className={stempelKlasse(karte, index, letzteDrei.length)} aria-label={`Brettschritt-Stempel ${kartenStempelLabel(karte)}`}>
            <span className="brettschritt-stempel__rolle" aria-hidden="true">{index === letzteDrei.length - 1 ? 'aktuell' : 'vergangen'}</span>
            <strong className="brettschritt-stempel__id">{karte.id}</strong>
            <span className="brettschritt-stempel__label">{kartenStempelLabel(karte)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
