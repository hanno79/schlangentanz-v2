/*
Author: Claude Code (AP-4)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Drag-&-Drop-Verhalten des Schlangenbereichs (AP-4, Onboarding-Finding 12).

`Schlangenbereich.tsx` war mit 599 Zeilen die größte Nicht-CSS-Datei des Projekts.
Der Drag-&-Drop-Teil ist darin eine geschlossene Einheit: ein Stück Zustand
(`dragOverZone`) plus die Handler, die es setzen. Genau diese Naht wird hier
herausgezogen — reines Verschieben, kein Verhaltenswechsel. Die bestehenden
F36-Drag-Drop-Tests sind der Beweis dafür.

Bewusst NICHT mit herausgezogen sind die `finde*Aktion`-Funktionen: sie
beantworten „welche Aktion gehört zu dieser Karte an dieser Stelle" und werden
auch beim Klick, bei Tastatur und im Rendering gebraucht — sie gehören zur
Aktionslogik, nicht zum Ziehen.
*/

import { useState } from 'react'
import type { DragEvent, KeyboardEvent, MouseEvent, MutableRefObject } from 'react'
import type { SpielAktion } from '../engine'

/** Welche Zone hebt gerade als Ablageziel hervor? */
export type DragTarget = { kind: 'startzone' } | { kind: 'schlange'; id: string } | { kind: 'ungueltig' }

function erlaubeDrop(event: DragEvent<HTMLElement>) {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

/**
 * Gezogene Karte ermitteln. Der Ref ist der Rückfall für Browser bzw. jsdom, die
 * `dataTransfer` beim dragover-Ereignis nicht befüllen.
 */
function leseGezogeneKarteId(
  event: DragEvent<HTMLElement>,
  gezogeneHandkarteIdRef: MutableRefObject<string | null>,
) {
  return event.dataTransfer.getData('text/plain') || gezogeneHandkarteIdRef.current
}

interface SchlangenDragDropOptionen {
  gezogeneHandkarteIdRef: MutableRefObject<string | null>
  ausgewaehlteHandkarteId: string | null
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
  /** Liefert die Anlege-Aktion für Schlange + Karte, oder null. */
  findeAktionFuerKarte: (schlangeId: string, handkartenId: string | null) => SpielAktion | null
  /** Liefert die Start-Aktion für eine Karte, oder null. */
  findeNeueSchlangeAktion: (handkartenId: string | null) => SpielAktion | null
  /** Führt eine Aktion aus, sofern sie nicht null ist. */
  fuehreAktion: (aktion: SpielAktion | null) => void
}

export default function useSchlangenDragDrop({
  gezogeneHandkarteIdRef,
  ausgewaehlteHandkarteId,
  neueSchlangeStartenAktionen,
  findeAktionFuerKarte,
  findeNeueSchlangeAktion,
  fuehreAktion,
}: SchlangenDragDropOptionen) {
  const [dragOverZone, setDragOverZone] = useState<DragTarget | null>(null)

  function handleSchlangeClick(event: MouseEvent<HTMLElement>, schlangeId: string) {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }

    fuehreAktion(findeAktionFuerKarte(schlangeId, ausgewaehlteHandkarteId))
  }

  function handleSchlangeKeyDown(event: KeyboardEvent<HTMLElement>, schlangeId: string) {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    fuehreAktion(findeAktionFuerKarte(schlangeId, ausgewaehlteHandkarteId))
  }

  function handleSchlangeDragOver(event: DragEvent<HTMLElement>, schlangeId: string) {
    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    if (!findeAktionFuerKarte(schlangeId, kartenId)) {
      if (dragOverZone?.kind !== 'ungueltig') setDragOverZone({ kind: 'ungueltig' })
      return
    }

    erlaubeDrop(event)
    if (dragOverZone?.kind !== 'schlange' || dragOverZone.id !== schlangeId) {
      setDragOverZone({ kind: 'schlange', id: schlangeId })
    }
  }

  function handleSchlangeDrop(event: DragEvent<HTMLElement>, schlangeId: string) {
    event.preventDefault()
    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    const aktion = findeAktionFuerKarte(schlangeId, kartenId)
    fuehreAktion(aktion)
    setDragOverZone(aktion ? null : { kind: 'ungueltig' })
  }

  function handleNeueSchlangeZoneClick(event: MouseEvent<HTMLElement>) {
    const ziel = event.target as HTMLElement
    if (ziel.closest('.schlangen-startzone__faehrte-button') || ziel.closest('li.schlangekarte--eigene')) {
      return
    }

    fuehreAktion(
      findeNeueSchlangeAktion(ausgewaehlteHandkarteId) ??
        (ausgewaehlteHandkarteId ? null : neueSchlangeStartenAktionen[0] ?? null),
    )
  }

  function handleNeueSchlangeZoneKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    fuehreAktion(findeNeueSchlangeAktion(ausgewaehlteHandkarteId))
  }

  function handleNeueSchlangeZoneDragOver(event: DragEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('li.schlangekarte--eigene')) {
      return
    }

    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    if (!neueSchlangeStartenAktionen.some((aktion) => aktion.handkartenId === kartenId)) {
      if (dragOverZone?.kind !== 'ungueltig') setDragOverZone({ kind: 'ungueltig' })
      return
    }

    erlaubeDrop(event)
    if (dragOverZone?.kind !== 'startzone') setDragOverZone({ kind: 'startzone' })
  }

  function handleNeueSchlangeZoneDrop(event: DragEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('li.schlangekarte--eigene')) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
    const aktion = neueSchlangeStartenAktionen.find((eintrag) => eintrag.handkartenId === kartenId) ?? null
    fuehreAktion(aktion)
    setDragOverZone(aktion ? null : { kind: 'ungueltig' })
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      setDragOverZone(null)
    }
  }

  function makeAktionsButtonDragOver(aktionsKartenId: string, zone: DragTarget) {
    return (event: DragEvent<HTMLElement>) => {
      event.stopPropagation()
      const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
      if (kartenId !== aktionsKartenId) {
        setDragOverZone({ kind: 'ungueltig' })
        return
      }
      erlaubeDrop(event)
      setDragOverZone(zone)
    }
  }

  function makeAktionsButtonDrop(findeAktion: (kartenId: string | null) => SpielAktion | null) {
    return (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      event.stopPropagation()
      const kartenId = leseGezogeneKarteId(event, gezogeneHandkarteIdRef)
      const zielAktion = findeAktion(kartenId)
      fuehreAktion(zielAktion)
      setDragOverZone(zielAktion ? null : { kind: 'ungueltig' })
    }
  }

  return {
    dragOverZone,
    setDragOverZone,
    handleSchlangeClick,
    handleSchlangeKeyDown,
    handleSchlangeDragOver,
    handleSchlangeDrop,
    handleNeueSchlangeZoneClick,
    handleNeueSchlangeZoneKeyDown,
    handleNeueSchlangeZoneDragOver,
    handleNeueSchlangeZoneDrop,
    handleDragLeave,
    makeAktionsButtonDragOver,
    makeAktionsButtonDrop,
  }
}
