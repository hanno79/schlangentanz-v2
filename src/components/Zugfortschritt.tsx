/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: Zeigt den aktuellen Zugfortschritt als Schrittleiste an.
*/

import type { Zugphase } from '../engine'

const ZUGPHASEN: Zugphase[] = [
  'Nachziehphase', 'Ausspielphase', 'Aufgabenpruefung', 'Zugabschluss', 'Spielende',
]

interface ZugfortschrittProps {
  zugphase: Zugphase
}

function zugphaseLabel(phase: Zugphase): string {
  return phase === 'Aufgabenpruefung' ? 'Aufgabenprüfung' : phase
}

function Zugfortschritt({ zugphase }: ZugfortschrittProps) {
  return (
    <section className="zugfortschritt" aria-label="Zugfortschritt">
      <h3>Zugfortschritt</h3>
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
