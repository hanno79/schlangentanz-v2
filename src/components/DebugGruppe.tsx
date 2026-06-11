/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: Wiederverwendbare DebugGruppe-Komponente – kennzeichnet Entwicklungsdaten-Bereiche als ARIA-complementary mit Badge.
*/

import { useId, type ReactNode } from 'react'

interface DebugGruppeProps {
  titel: string
  children: ReactNode
}

const BADGE_LABEL = 'Entwicklungsdaten:'

export default function DebugGruppe({ titel, children }: DebugGruppeProps) {
  const badgeId = useId()
  const summaryTextId = useId()

  return (
    <aside className="debug-gruppe-entwicklungsdaten" aria-labelledby={`${badgeId} ${summaryTextId}`}>
      <span id={badgeId} className="debug-gruppe__badge">{BADGE_LABEL}</span>
      <details open className="debug-gruppe">
        <summary><span id={summaryTextId}>{titel}</span></summary>
        {children}
      </details>
    </aside>
  )
}
