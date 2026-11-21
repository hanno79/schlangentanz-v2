import { useCallback, useState } from 'react'

/**
 * Ein Wurf im Klick oder im Zeitgeber erreicht keine Fehlergrenze von React.
 * Der Hook hält ihn fest und wirft ihn beim nächsten Zeichnen; dann zeigt ihn
 * der Fehlerfang des App-Rahmens mit dem Weg zurück zur Lobby und meldet ihn an
 * den Fehlerdienst (O2 K4, O3 K5). Die zurückgegebene Funktion nimmt den Fehler.
 */
export function useWurfImZeichnen(): (fehler: unknown) => void {
  const [festgehalten, setzeFestgehalten] = useState<{ fehler: unknown } | null>(null)
  const halteFest = useCallback((fehler: unknown) => setzeFestgehalten({ fehler }), [])
  if (festgehalten !== null) throw festgehalten.fehler
  return halteFest
}
