import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../App'
import { erstelleEinzelspielerSpielzustand } from '../../engine'
import { meldeFehler } from '../../fehlerdienst'
import { SPIELSTAND_SCHLUESSEL, ladeSpielstand, speichereSpielstand } from '../../spielstand'

/*
O2 K4: Ein Fehler beim Start wird sichtbar gemeldet.

Zwei Wege, auf denen der Start scheitern kann: Die Engine wirft beim Anlegen
der Partie (im Klick, den eine Fehlergrenze allein nicht sieht), oder schon das
Zeichnen der Lobby wirft. Beide Male erscheint der Fehlerfang mit dem Grund, und
der Fehler geht an den Fehlerdienst.
*/

vi.mock('../../fehlerdienst', () => ({
  meldeFehler: vi.fn(),
  starteFehlerdienst: vi.fn(),
  fehlerdienstAktiv: () => false,
}))

vi.mock('../../engine', async (importOriginal) => {
  const echt = await importOriginal<typeof import('../../engine')>()
  return { ...echt, erstelleEinzelspielerSpielzustand: vi.fn(echt.erstelleEinzelspielerSpielzustand) }
})

vi.mock('../../spielstand', async (importOriginal) => {
  const echt = await importOriginal<typeof import('../../spielstand')>()
  return { ...echt, ladeSpielstand: vi.fn(echt.ladeSpielstand) }
})

beforeEach(() => {
  // React und der Fehlerfang schreiben einen gefangenen Fehler zusätzlich in die Konsole.
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.mocked(meldeFehler).mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
  // `mockReset` setzt die Durchreichung an die echte Funktion wieder ein.
  vi.mocked(erstelleEinzelspielerSpielzustand).mockReset()
  vi.mocked(ladeSpielstand).mockReset()
})

describe('O2 K4: Fehler beim Start', () => {
  it('O2 K4: wirft die Engine beim Anlegen der Partie, zeigt der Fehlerfang den Grund und meldet ihn', () => {
    const fehler = new Error('Ungültiger Zufallswert beim Mischen')
    vi.mocked(erstelleEinzelspielerSpielzustand).mockImplementationOnce(() => {
      throw fehler
    })
    window.history.pushState({}, '', '/')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Ungültiger Zufallswert beim Mischen')
    expect(meldeFehler).toHaveBeenCalledWith(fehler, expect.anything())
    expect(window.location.pathname).toBe('/')
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  it('O2 K4: nach dem Fehler führt der Fehlerfang zurück in eine bedienbare Lobby', () => {
    vi.mocked(erstelleEinzelspielerSpielzustand).mockImplementationOnce(() => {
      throw new Error('kaputt')
    })
    window.history.pushState({}, '', '/')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))

    fireEvent.click(screen.getByRole('button', { name: 'Zurück zur Lobby' }))

    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(window.location.pathname).toBe('/spiel')
  })

  it('O2 K4: wirft schon das Laden des Spielstands, erscheint der Fehlerfang statt einer leeren Seite', () => {
    speichereSpielstand(erstelleEinzelspielerSpielzustand(1))
    const fehler = new Error('Speicher nicht lesbar')
    vi.mocked(ladeSpielstand).mockImplementation(() => {
      throw fehler
    })
    window.history.pushState({}, '', '/')
    render(<App />)

    expect(screen.getByRole('alert')).toHaveTextContent('Speicher nicht lesbar')
    expect(meldeFehler).toHaveBeenCalledWith(fehler, expect.anything())
  })
})
