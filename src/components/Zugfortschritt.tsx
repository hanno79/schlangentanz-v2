/*
Author: rahn
Datum: 04.06.2026
Version: 1.1
Beschreibung: Zeigt den aktuellen Zugfortschritt als Schrittleiste an.
# ÄNDERUNG 07.06.2026: R115 labelt die Region über eine komponentenlokale Überschriften-ID.
# ÄNDERUNG 11.06.2026: R160 macht den sichtbaren Zugfortschritt zur höflichen Live-Region.
*/

import { useId } from 'react'
import type { Zugphase } from '../engine'
import { zugphaseLabel } from '../zugphaseLabels'

const ZUGPHASEN: Zugphase[] = [
  'Nachziehphase', 'Ausspielphase', 'Aufgabenpruefung', 'Zugabschluss', 'Spielende',
]

interface ZugfortschrittProps {
  zugphase: Zugphase
}

function Zugfortschritt({ zugphase }: ZugfortschrittProps) {
  const titelId = useId()

  return (
    <section className="zugfortschritt" aria-labelledby={titelId} aria-live="polite">
      <h3 id={titelId}>Zugfortschritt</h3>
      <p>Aktuelle Phase: {zugphaseLabel(zugphase)}</p>
      <ol className="zugfortschritt-liste">
        {ZUGPHASEN.map((phase, index) => {
          const istAktiv = phase === zugphase

          return (
            <li
              key={phase}
              className={`zugfortschritt-schritt${istAktiv ? ' zugfortschritt-schritt--aktiv' : ''}`}
              aria-current={istAktiv ? 'step' : undefined}
            >
              <strong>{index + 1}. {zugphaseLabel(phase)}</strong>
              <span>{istAktiv ? 'Aktiv' : 'Wartet'}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default Zugfortschritt
