import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../App'
import { erstellePartie } from '../../engine'
import { speichereSpielstand } from '../../spielstand'

/*
O2b, TF-APP-016: Wer das Gerät bei offener Rückfrage dreht, sieht sie danach
noch. Ob sie wirklich im Bild liegt, misst der Layout-Vertrag in
`tests/layout/lobby.spec.ts`; hier steht, dass die Lobby sie bei jeder
Grössenänderung des Fensters in den sichtbaren Bereich holt, und nur solange
sie offen ist. jsdom kennt `scrollIntoView` nicht, der Test setzt es selbst.
*/

let geholt: ReturnType<typeof vi.fn>

beforeEach(() => {
  speichereSpielstand(erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: Math.random }))
  geholt = vi.fn()
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, writable: true, value: geholt })
  window.history.pushState({}, '', '/')
  render(<App />)
})

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

function oeffneRueckfrage(): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
  return screen.getByRole('alertdialog')
}

describe('O2b TF-APP-016: die Rückfrage geht beim Drehen mit', () => {
  it('O2b TF-APP-016: nach einer Grössenänderung des Fensters holt die Lobby die offene Rückfrage ins Bild', () => {
    const frage = oeffneRueckfrage()
    geholt.mockClear()

    fireEvent(window, new Event('resize'))

    expect(geholt).toHaveBeenCalledTimes(1)
    expect(geholt.mock.contexts[0]).toBe(frage)
    expect(geholt).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
  })

  it('O2b TF-APP-016: ist die Rückfrage geschlossen, verschiebt eine Grössenänderung nichts', () => {
    const frage = oeffneRueckfrage()
    fireEvent.click(within(frage).getByRole('button', { name: 'Abbrechen' }))
    geholt.mockClear()

    fireEvent(window, new Event('resize'))

    expect(geholt).not.toHaveBeenCalled()
  })
})
