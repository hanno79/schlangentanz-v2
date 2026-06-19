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
  standardOffen?: boolean
  kompakteSchublade?: boolean
}

const BADGE_LABEL = 'Entwicklungsdaten:'

export default function DebugGruppe({ titel, children, standardOffen = true, kompakteSchublade = false }: DebugGruppeProps) {
  const badgeId = useId()
  const summaryTextId = useId()
  const klasse = `debug-gruppe-entwicklungsdaten${kompakteSchublade ? ' debug-gruppe-entwicklungsdaten--spielschublade' : ''}`

  return (
    <aside className={klasse} aria-labelledby={`${badgeId} ${summaryTextId}`}>
      <span id={badgeId} className="debug-gruppe__badge">{BADGE_LABEL}</span>
      <details open={standardOffen} className="debug-gruppe">
        <summary><span id={summaryTextId}>{titel}</span></summary>
        {children}
      </details>
    </aside>
  )
}
