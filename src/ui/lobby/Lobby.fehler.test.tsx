import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StrictMode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../App'
import { erstellePartie, serialisiere } from '../../engine'
import { meldeFehler } from '../../fehlerdienst'
import { SPIELSTAND_SCHLUESSEL } from '../../spielstand'

/*
O2 K4: Ein Fehler beim Start wird sichtbar gemeldet.

Zwei Wege, auf denen der Start scheitern kann: Die Engine wirft beim Anlegen
der Partie (im Klick, den eine Fehlergrenze allein nicht sieht), oder der
gespeicherte Spielstand lässt sich beim Öffnen nicht lesen. Im ersten Fall
erscheint der Fehlerfang, im zweiten sagt die Seite, dass und warum die Partie
verworfen wurde. Beschädigte Stände gehen an den Fehlerdienst; ein Stand im
älteren Speicherformat ist erwartet (Plan 2.3) und wird nur protokolliert.
*/

vi.mock('../../fehlerdienst', () => ({
  meldeFehler: vi.fn(),
  starteFehlerdienst: vi.fn(),
  fehlerdienstAktiv: () => false,
}))

vi.mock('../../engine', async (importOriginal) => {
  const echt = await importOriginal<typeof import('../../engine')>()
  return { ...echt, erstellePartie: vi.fn(echt.erstellePartie) }
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
  vi.mocked(erstellePartie).mockReset()
})

function oeffne(pfad: string, strikt = false): void {
  window.history.pushState({}, '', pfad)
  render(
    strikt ? (
      <StrictMode>
        <App />
      </StrictMode>
    ) : (
      <App />
    ),
  )
}

describe('O2 K4: Fehler beim Start', () => {
  it('O2 K4: wirft die Engine beim Anlegen der Partie, zeigt der Fehlerfang den Grund und meldet ihn', () => {
    const fehler = new Error('Ungültiger Zufallswert beim Mischen')
    vi.mocked(erstellePartie).mockImplementationOnce(() => {
      throw fehler
    })
    oeffne('/')

    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Ungültiger Zufallswert beim Mischen')
    expect(meldeFehler).toHaveBeenCalledWith(fehler, expect.anything())
    expect(window.location.pathname).toBe('/')
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  it('O2 K4: nach dem Fehler führt der Fehlerfang zurück in eine bedienbare Lobby', () => {
    vi.mocked(erstellePartie).mockImplementationOnce(() => {
      throw new Error('kaputt')
    })
    oeffne('/')
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))

    fireEvent.click(screen.getByRole('button', { name: 'Zurück zur Lobby' }))

    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(window.location.pathname).toBe('/spiel')
  })
})

/** Legt einen rohen Eintrag in den Speicher, wie ihn eine ältere Fassung oder ein Defekt hinterlässt. */
function legeRohenStandAb(roh: string): void {
  window.localStorage.setItem(SPIELSTAND_SCHLUESSEL, roh)
}

describe('O2 K4: unlesbarer Spielstand beim Öffnen', () => {
  it.each([
    ['ein ungültiger Zustand', '{"version":2,"kaputt":true}'],
    ['kein JSON', '{kaputt'],
    ['eine leere Zeichenkette', ''],
    ['ein unbekanntes neueres Format', '{"version":99}'],
  ])('O2 K4: %s wird sichtbar als beschädigt verworfen und gemeldet', (_, roh) => {
    legeRohenStandAb(roh)
    oeffne('/')

    const hinweis = screen.getByTestId('spielstand-verworfen')
    expect(hinweis).toHaveAttribute('role', 'alert')
    expect(hinweis).toHaveTextContent(/nicht laden/)
    expect(hinweis).toHaveTextContent(/beschädigt/)
    expect(screen.queryByRole('button', { name: 'Weiterspielen' })).toBeNull()
    expect(meldeFehler).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalled()
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  it('O2 K4: der Hinweis nennt den Grund der Engine', () => {
    legeRohenStandAb('{"version":2,"kaputt":true}')
    oeffne('/')
    expect(screen.getByTestId('spielstand-verworfen')).toHaveTextContent('Ungültiger Spielstand')
  })

  it('E1: ein echter Stand im Format 1 gilt als älteres Speicherformat und wird verworfen, nicht gemeldet', () => {
    const formatEins = { ...JSON.parse(serialisiere(erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: Math.random }))), version: 1 }
    legeRohenStandAb(JSON.stringify(formatEins))
    oeffne('/')
    expect(screen.getByTestId('spielstand-verworfen')).toHaveTextContent(/älteren Speicherformat/)
    expect(meldeFehler).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  it('O2 K4: ein Stand im älteren Speicherformat wird sichtbar verworfen, aber nicht als Fehler gemeldet', () => {
    legeRohenStandAb('{"version":0,"spieler":[]}')
    oeffne('/')

    expect(screen.getByTestId('spielstand-verworfen')).toHaveTextContent(/älteren Speicherformat/)
    expect(meldeFehler).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalled()
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })

  it('O2 K4: auch /spiel sagt beim direkten Aufruf, dass der Stand verworfen wurde', () => {
    legeRohenStandAb('{kaputt')
    oeffne('/spiel')
    expect(screen.getByTestId('spielstand-verworfen')).toHaveTextContent(/beschädigt/)
    expect(meldeFehler).toHaveBeenCalledTimes(1)
  })

  it('O2 K4: im StrictMode bleibt der Hinweis stehen und der Fehler wird nur einmal gemeldet', () => {
    legeRohenStandAb('{"version":2,"kaputt":true}')
    oeffne('/', true)
    expect(screen.getByTestId('spielstand-verworfen')).toBeInTheDocument()
    expect(meldeFehler).toHaveBeenCalledTimes(1)
  })

  it('O2 K4: der Hinweis erscheint nur einmal; danach ist die Lobby leer und bedienbar', () => {
    legeRohenStandAb('{kaputt')
    const { unmount } = render(<App />)
    unmount()

    oeffne('/')
    expect(screen.queryByTestId('spielstand-verworfen')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(window.location.pathname).toBe('/spiel')
  })
})
