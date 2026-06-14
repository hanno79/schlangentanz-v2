/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahe Waldpfad-Zugleiste fuer Zugreihenfolge, aktuelle Spielfigur und KI-Stationen.
*/

import type { Spielzustand } from '../engine'
import { zugphaseLabel } from '../zugphaseLabels'

interface ZugpfadProps {
  zustand: Spielzustand
  kiZugProtokoll: string[]
}

function steuerungsLabel(steuerung: Spielzustand['spieler'][number]['steuerung']): string {
  switch (steuerung) {
    case 'Mensch':
      return 'Du'
    case 'KI':
      return 'KI'
  }
}

export default function Zugpfad({ zustand, kiZugProtokoll }: ZugpfadProps) {
  const aktiverIndex = zustand.aktiverSpielerIndex
  const naechsterSpieler = zustand.spieler[(aktiverIndex + 1) % zustand.spieler.length]
  const hatAbgeschlossenenGegnerzug = zustand.spieler[aktiverIndex].steuerung === 'Mensch' && kiZugProtokoll.length > 0

  return (
    <section className="zugpfad" aria-label="Zugpfad">
      <div className="zugpfad__kopf">
        <h4>Zugpfad</h4>
        <p>Nächster Halt: {naechsterSpieler.name}</p>
      </div>
      <ol className="zugpfad__strecke">
        {zustand.spieler.map((spieler, index) => {
          const istAktiv = index === aktiverIndex

          return (
            <li
              key={spieler.id}
              className={`zugpfad__station${istAktiv ? ' zugpfad__station--aktiv' : ''}`}
              aria-current={istAktiv ? 'step' : undefined}
            >
              <span className="zugpfad__avatar" aria-hidden="true">{index + 1}</span>
              <strong>{spieler.name}</strong>
              <span className="zugpfad__badge">{steuerungsLabel(spieler.steuerung)}</span>
              {istAktiv ? <span>am Zug</span> : <span>wartet</span>}
              {istAktiv && <span className="zugpfad__phase">{zugphaseLabel(zustand.zugphase)}</span>}
            </li>
          )
        })}
      </ol>
      {hatAbgeschlossenenGegnerzug && <p className="zugpfad__status">Gegnerzug abgeschlossen. Du bist wieder dran.</p>}
    </section>
  )
}
