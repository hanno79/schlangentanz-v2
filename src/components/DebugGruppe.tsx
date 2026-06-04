/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: Wiederverwendbare DebugGruppe-Komponente – kennzeichnet Entwicklungsdaten-Bereiche als ARIA-complementary mit Badge.
*/

import type { ReactNode } from 'react'

interface DebugGruppeProps {
  titel: string
  children: ReactNode
}

const BADGE_LABEL = 'Entwicklungsdaten'

export default function DebugGruppe({ titel, children }: DebugGruppeProps) {
  return (
    <aside className="debug-gruppe-entwicklungsdaten" aria-label={`${BADGE_LABEL}: ${titel}`}>
      <span className="debug-gruppe__badge">{BADGE_LABEL}</span>
      <details open className="debug-gruppe">
        <summary>{titel}</summary>
        {children}
      </details>
    </aside>
  )
}
