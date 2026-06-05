/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: Fokus-Hook für das Sprungziel der Spielerführung im Aktionsbereich.
*/

import { useEffect } from 'react'

export default function useAktionszielFokus(aktionszielId: string | null) {
  useEffect(() => {
    if (!aktionszielId) return

    const zielElement = document.getElementById(aktionszielId)
    if (!zielElement) return

    const scrollIntoView = zielElement.scrollIntoView
    if (typeof scrollIntoView === 'function') {
      scrollIntoView.call(zielElement, { block: 'center', inline: 'nearest' })
    }
    zielElement.focus({ preventScroll: true })
  }, [aktionszielId])
}
