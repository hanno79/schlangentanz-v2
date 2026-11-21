import { act } from '@testing-library/react'
import { vi } from 'vitest'
import { anwendeAktion, deserialisiere, ermittleAktionen, serialisiere } from '../../../engine'
import type { Spielzustand } from '../../../engine'
import { SPIELSTAND_SCHLUESSEL } from '../../../spielstand'

/*
Hilfen für die Tests der Partie-Steuerung (O3): den Spielstand so lesen, wie er
im Speicher liegt, prüfen, dass zwischen zwei Ständen genau ein Schritt liegt,
und die künstlichen Zeitgeber vorstellen.
*/

/** Der Spielstand als Text, wie er im Speicher liegt; `null`, wenn noch nichts geschrieben ist. */
export function roh(): string | null {
  return window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)
}

/** Der gespeicherte Spielstand; `null`, wenn noch nichts geschrieben ist. */
export function gespeichert(): Spielzustand | null {
  const text = roh()
  return text === null ? null : deserialisiere(text)
}

/** Ob `nachher` aus `vorher` mit genau einer aufgezählten Aktion entsteht. */
export function istEinSchritt(vorher: Spielzustand, nachher: Spielzustand): boolean {
  const ziel = serialisiere(nachher)
  return ermittleAktionen(vorher).some((aktion) => serialisiere(anwendeAktion(vorher, aktion).zustand) === ziel)
}

/** Stellt die künstlichen Zeitgeber um `ms` vor. */
export function warte(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}
