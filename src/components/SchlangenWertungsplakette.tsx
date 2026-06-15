/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Kompakte Waldtanz-Wertungsplakette fuer eine eigene Schlange direkt in der Schlangenlichtung.
*/

import { berechneFarbgruppenPunkte } from '../engine'
import type { SchlangenZustand, Schlange } from '../engine'

interface SchlangenWertungsplaketteProps {
  id: string
  schlange: Schlange
}

function statusLabel(zustand: SchlangenZustand): string {
  switch (zustand) {
    case 'aktiv': return 'spielbereit'
    case 'blockiert': return 'gerade blockiert'
    case 'geschuetzt': return 'geschützt'
  }

  const nichtErfassterZustand: never = zustand
  return nichtErfassterZustand
}

export default function SchlangenWertungsplakette({ id, schlange }: SchlangenWertungsplaketteProps) {
  const wertung = berechneFarbgruppenPunkte(schlange)

  return (
    <div id={id} className="schlangekarte__wertung" aria-label={`Schlangenwert ${schlange.id}`}>
      <span className="schlangekarte__wertung-label">Waldpfad-Wertung</span>
      <strong className="schlangekarte__wertung-punkte">{wertung.gesamtPunkte} Punkte</strong>
      <span>{schlange.karten.length} {schlange.karten.length === 1 ? 'Karte' : 'Karten'}</span>
      <span className="schlangekarte__wertung-status">{statusLabel(schlange.zustand)}</span>
    </div>
  )
}
