/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R51 UI-Regressionstest für zufällig gemischte Start-Handkarten.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('R51 Zufällige Startkarten im App-Standardzustand', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('nutzt Math.random für das Hauptdeck statt einer sortierten blauen Reihenfolge', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1)

    render(<App />)

    const handkartenDetails = within(screen.getByRole('region', { name: 'Spieltisch' })).getByRole('region', { name: 'Handkarten' })

    expect(handkartenDetails).toHaveTextContent('rot-15')
    expect(handkartenDetails).toHaveTextContent('violett-05')
    expect(handkartenDetails).not.toHaveTextContent('Sonderkarte Sonderkarte')
    expect(handkartenDetails).toHaveTextContent(
      /Sonderkarte (Farbenschutz|Regenbogenschlange|Schlangenfrass|Schlangenblockade|Farbendieb|Schlangengrube|Farbenfusion|Verdoppler)/i
    )
    expect(handkartenDetails).not.toHaveTextContent('blau-01, blau-03, blau-05, blau-07, blau-09')

    const zufallsaufrufeNachStart = randomSpy.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: /neue schlange starten mit feuerkeim/i }))
    expect(randomSpy).toHaveBeenCalledTimes(zufallsaufrufeNachStart)
  })
})
