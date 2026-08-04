/*
Author: Claude Code (Etappe 6)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Handkarte ziehen und über einem Ziel loslassen — als zweite Bedienart,
              nicht als zweiter Regelweg.

**Der Kern der Entscheidung.** Ziehen erzeugt hier **keine** Aktion. Es wählt die
Karte über denselben Weg wie ein Klick und löst beim Loslassen den Ziel-Knopf aus,
der ohnehin dasteht (`element.click()`). Damit ist strukturell garantiert, was ein
Vertrag sonst nur behaupten könnte: Jede per Drag erreichbare Aktion ist auch per
Klick erreichbar, und beide gehen durch `zielAnklicken` beziehungsweise
`fuhreAktionAus`. Ein eigener Aktionspfad wäre die zweite Regelquelle, die
auseinanderläuft — genau der Fehler, den der gelöschte Vorgänger-Hook hatte
(`useSchlangenDragDrop.ts`, an den Zonenbegriff des entfallenen
`Schlangenbereich.tsx` gebunden).

**Warum Pointer-Events und nicht HTML5-Drag.** `dragstart`/`drop` funktioniert auf
Touch-Geräten nicht und lässt sich in Playwright nur über synthetische
DataTransfer-Objekte nachstellen. Pointer-Events gelten für Maus, Stift und Finger
gleich und sind mit `mouse.move`/`down`/`up` direkt messbar.

**Was bewusst nicht zieht.** Mehrschrittige Sonderkarten (Schlangenfrass,
Farbendieb, Schlangenblockade) brauchen mehrere Ziele in Folge; „loslassen" hat dort
keine sinnvolle Bedeutung. Sie bleiben beim Klicken, und der Hook rührt sie nicht
an: Er zieht nur, was die Hand als einschrittige Aktion anbietet.
*/

import { useCallback, useEffect, useRef, useState } from 'react'

/** Attribut, das ein Element als Ablageziel ausweist. */
export const DROP_ZIEL_ATTRIBUT = 'data-drop-ziel'

/** Ab wieviel Pixel Bewegung gilt es als Ziehen und nicht als Klick. */
const ZIEH_SCHWELLE_PX = 6

interface Ziehzustand {
  karteId: string
  /** Erst ab der Schwelle wahr — vorher ist es ein gewöhnlicher Klick. */
  zieht: boolean
  x: number
  y: number
}

export interface KarteZiehen {
  /** Die gerade gezogene Karte, oder `null`. Für die Optik. */
  gezogeneKarteId: string | null
  /** Das Ziel unter dem Zeiger, oder `null`. Für die Optik. */
  aktivesZiel: string | null
  /** Handler für eine Handkarte. `undefined`, wenn die Karte nicht ziehbar ist. */
  ziehHandler: (karteId: string) => {
    onPointerDown: (ereignis: React.PointerEvent<HTMLElement>) => void
  }
}

function zielUnterZeiger(x: number, y: number): HTMLElement | null {
  const treffer = document.elementFromPoint(x, y)
  if (treffer === null) return null
  const ziel = treffer.closest(`[${DROP_ZIEL_ATTRIBUT}]`)
  return ziel instanceof HTMLElement ? ziel : null
}

/**
 * Ziehen für Handkarten.
 *
 * @param karteWaehlen Wählt eine Handkarte aus — derselbe Aufruf, den der Klick
 *   auf die Karte macht. Der Hook kennt die Auswahlmechanik nicht selbst.
 */
export function useKarteZiehen(karteWaehlen: (karteId: string) => void): KarteZiehen {
  const [zustand, setZustand] = useState<Ziehzustand | null>(null)
  const [aktivesZiel, setAktivesZiel] = useState<string | null>(null)
  /* Der Zustand wird in Handlern gelesen, die an `window` hängen. Ohne Ref läse
     ein Handler den Wert von seinem Registrierungszeitpunkt.

     Beschrieben wird die Ref ausschließlich in den Handlern selbst — ein
     `laufend.current = zustand` beim Rendern stand hier zuerst und war beides:
     überflüssig (die Handler setzen sie ohnehin) und von React verboten
     (`react-hooks/refs`). Gefunden von eslint. */
  const laufend = useRef<Ziehzustand | null>(null)

  const aufraeumen = useCallback(() => {
    setZustand(null)
    setAktivesZiel(null)
    laufend.current = null
  }, [])

  useEffect(() => {
    if (zustand === null) return

    function bewegen(ereignis: PointerEvent): void {
      const aktuell = laufend.current
      if (aktuell === null) return
      const weit =
        Math.abs(ereignis.clientX - aktuell.x) > ZIEH_SCHWELLE_PX ||
        Math.abs(ereignis.clientY - aktuell.y) > ZIEH_SCHWELLE_PX
      if (!weit) return
      /* Erst hier wird aus dem Druck ein Zug — und erst hier wird die Karte
         gewählt.

         ÄNDERUNG [04.08.2026]: Ein erster Entwurf wählte schon im `pointerdown`.
         Das machte die **Klick**-Bedienung kaputt: Ein gewöhnlicher Klick löst
         `pointerdown` *und* `click` aus, also wählte der erste Schritt die Karte und
         der zweite toggelte sie sofort wieder ab. Gefunden hat es der Vertrag
         „dasselbe Ziel per Klick erreicht dasselbe" — die zweite Bedienart hätte
         die erste mitgenommen. */
      if (!aktuell.zieht) {
        const gestartet = { ...aktuell, zieht: true }
        laufend.current = gestartet
        setZustand(gestartet)
        karteWaehlen(aktuell.karteId)
      }
      const ziel = zielUnterZeiger(ereignis.clientX, ereignis.clientY)
      setAktivesZiel(ziel === null ? null : ziel.getAttribute(DROP_ZIEL_ATTRIBUT))
    }

    function loslassen(ereignis: PointerEvent): void {
      const aktuell = laufend.current
      aufraeumen()
      if (aktuell === null || !aktuell.zieht) return
      const ziel = zielUnterZeiger(ereignis.clientX, ereignis.clientY)
      /* Der eigentliche Punkt: Losgelassen wird der Knopf, der auch beim Klicken
         gedrückt würde. Kein eigener Aktionspfad. */
      if (ziel !== null && !ziel.hasAttribute('disabled')) ziel.click()
    }

    function abbrechen(): void {
      aufraeumen()
    }

    window.addEventListener('pointermove', bewegen)
    window.addEventListener('pointerup', loslassen)
    window.addEventListener('pointercancel', abbrechen)
    return () => {
      window.removeEventListener('pointermove', bewegen)
      window.removeEventListener('pointerup', loslassen)
      window.removeEventListener('pointercancel', abbrechen)
    }
  }, [zustand, aufraeumen, karteWaehlen])

  const ziehHandler = useCallback(
    (karteId: string) => ({
      onPointerDown: (ereignis: React.PointerEvent<HTMLElement>) => {
        // Nur die primäre Taste; ein Rechtsklick soll das Kontextmenü behalten.
        if (ereignis.button !== 0) return
        /* Hier wird **nicht** gewählt. Ein Klick löst `pointerdown` und `click`
           aus; wählte dieser Schritt schon, toggelte `onClick` gleich wieder ab und
           die Karte ließe sich per Klick nicht mehr auswählen. Gewählt wird erst,
           wenn die Bewegung die Schwelle überschreitet — dann ist es ein Zug. */
        const start = { karteId, zieht: false, x: ereignis.clientX, y: ereignis.clientY }
        laufend.current = start
        setZustand(start)
      },
    }),
    [],
  )

  return {
    gezogeneKarteId: zustand?.zieht === true ? zustand.karteId : null,
    aktivesZiel,
    ziehHandler,
  }
}
