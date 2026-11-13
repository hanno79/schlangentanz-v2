import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import App from '../../App'
import { erstellePartie } from '../../engine'
import { speichereSpielstand } from '../../spielstand'

/*
O2 K5: In der Lobby läuft keine Partie im Hintergrund.

Jede Funktion der Engine-Schnittstelle wird umhüllt und jeder Aufruf
mitgeschrieben. Solange `/` angezeigt wird, darf die Lobby höchstens den
gespeicherten Stand lesen (`deserialisiere`, um „Weiterspielen“ anzubieten),
aber keine Partie anlegen, keinen Zug ausführen und keinen Zeitgeber stellen.
*/

const aufrufe = vi.hoisted(() => [] as string[])

vi.mock('../../engine', async (importOriginal) => {
  const echt = await importOriginal<Record<string, unknown>>()
  return Object.fromEntries(
    Object.entries(echt).map(([name, wert]) => [
      name,
      typeof wert === 'function'
        ? (...argumente: unknown[]) => {
            aufrufe.push(name)
            return (wert as (...a: unknown[]) => unknown)(...argumente)
          }
        : wert,
    ]),
  )
})

const ERLAUBT_IN_DER_LOBBY = new Set(['deserialisiere'])

function fremdeAufrufe(): string[] {
  return aufrufe.filter((name) => !ERLAUBT_IN_DER_LOBBY.has(name))
}

beforeEach(() => {
  aufrufe.length = 0
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('O2 K5: keine Partie im Hintergrund', () => {
  it('O2 K5: die Lobby ohne Spielstand ruft die Engine nicht auf und stellt keinen Zeitgeber', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByTestId('lobby')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(10_000))

    expect(fremdeAufrufe(), 'Engine-Aufrufe, während die Lobby angezeigt wird').toEqual([])
    expect(vi.getTimerCount(), 'offene Zeitgeber in der Lobby').toBe(0)
  })

  it('O2 K5: mit Spielstand liest die Lobby ihn nur und lässt die Partie ruhen', () => {
    speichereSpielstand(erstellePartie({ spielerzahl: 4, erweiterung: false, zufall: Math.random }))
    aufrufe.length = 0

    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Weiterspielen' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(10_000))

    expect(fremdeAufrufe(), 'Engine-Aufrufe, während die Lobby angezeigt wird').toEqual([])
    expect(vi.getTimerCount(), 'offene Zeitgeber in der Lobby').toBe(0)
  })
})
