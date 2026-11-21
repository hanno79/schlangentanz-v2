import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import App from '../../App'
import Fehlerfang from '../../components/Fehlerfang'
import type { Spielzustand } from '../../engine'
import { findeSzenario } from '../../entwicklung/szenarien'
import { STRATEGIEN } from '../../ki/strategien'
import { SPIELSTAND_SCHLUESSEL, speichereSpielstand } from '../../spielstand'
import { mittelspiel } from '../tisch/__tests__/szenarien'
import { GEGNER_STRATEGIE, KI_PAUSE, useSpiel } from './useSpiel'

/*
O3 K5: Wirft Engine oder KI einen Fehler, friert nichts ein. Der Fehlerfang des
App-Rahmens zeigt die Meldung und den Weg zurück zur Lobby; danach läuft kein
KI-Schritt mehr. Die Engine wird hier nur für den Fall „Engine wirft“ ersetzt
und reicht sonst an die echte durch.
*/

const engineKaputt = vi.hoisted(() => ({ an: false }))

vi.mock('../../fehlerdienst', () => ({
  meldeFehler: vi.fn(),
  starteFehlerdienst: vi.fn(),
  fehlerdienstAktiv: () => false,
}))

vi.mock('../../engine', async (importOriginal) => {
  const echt = await importOriginal<typeof import('../../engine')>()
  return {
    ...echt,
    anwendeAktion: (...argumente: Parameters<typeof echt.anwendeAktion>) => {
      if (engineKaputt.an) throw new Error('Engine im Test absichtlich defekt.')
      return echt.anwendeAktion(...argumente)
    },
  }
})

function szenario(name: string): Spielzustand {
  const gefunden = findeSzenario(name)
  if (gefunden === undefined) throw new Error(`Szenario ${name} fehlt`)
  return gefunden.erzeuge()
}

function oeffneMitKiAmZug(): void {
  speichereSpielstand(szenario('schlussrunde-4'))
  window.history.pushState({}, '', '/spiel')
  render(<App />)
}

function warte(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/** Nach dem Fehler: Meldung, Weg zur Lobby, und danach spielt nichts weiter. */
function erwarteFehlerfangMitWegZurLobby(meldung: RegExp): void {
  const fang = screen.getByRole('alert')
  expect(fang).toHaveTextContent('Hier ist ein Fehler aufgetreten')
  expect(fang).toHaveTextContent(meldung)
  fireEvent.click(screen.getByRole('button', { name: 'Zurück zur Lobby' }))
  expect(screen.getByTestId('lobby')).toBeInTheDocument()
  expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL), 'der Stand, an dem es scheiterte, ist verworfen').toBeNull()
  warte(10 * KI_PAUSE)
  expect(screen.queryByRole('alert')).toBeNull()
  expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL), 'nach dem Fehler läuft kein KI-Schritt').toBeNull()
}

beforeEach(() => {
  vi.useFakeTimers()
  // React und der Fehlerfang schreiben einen gefangenen Fehler zusätzlich in die Konsole.
  vi.spyOn(console, 'error').mockImplementation(() => {})
  engineKaputt.an = false
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('O3 K5: Ein Fehler friert nichts ein', () => {
  it('O3 K5: wirft die KI beim Wählen, zeigt der Tisch die Meldung und führt zur Lobby', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => ({
      name: 'Kaputte KI',
      waehle: () => {
        throw new Error('KI im Test absichtlich defekt.')
      },
    }))
    oeffneMitKiAmZug()
    warte(KI_PAUSE)
    erwarteFehlerfangMitWegZurLobby(/KI im Test absichtlich defekt/)
  })

  it('O3 K5/U3: wählt die KI eine Aktion, die die Engine nicht aufgezählt hat, steht der Grund da', () => {
    vi.spyOn(STRATEGIEN, GEGNER_STRATEGIE).mockImplementation(() => ({
      name: 'Schummel-KI',
      waehle: () => ({ typ: 'ZugBeenden', spielerId: 'spieler-1' }),
    }))
    oeffneMitKiAmZug()
    warte(KI_PAUSE)
    erwarteFehlerfangMitWegZurLobby(/nicht aufgezählt/)
  })

  it('O3 K5: wirft die Engine beim KI-Schritt, zeigt der Tisch die Meldung und führt zur Lobby', () => {
    oeffneMitKiAmZug()
    engineKaputt.an = true
    warte(KI_PAUSE)
    erwarteFehlerfangMitWegZurLobby(/Engine im Test absichtlich defekt/)
  })

  it('O3 K5: wirft die Engine bei einer erlaubten Aktion des Menschen, fängt der Fehlerfang sie', () => {
    function Probe({ start }: { start: Spielzustand }) {
      const { ansicht, fuehreAus } = useSpiel(start, { pause: 0 })
      return (
        <button type="button" onClick={() => fuehreAus(ansicht.aktionen[0])}>
          Probe
        </button>
      )
    }
    const zurueck = vi.fn()
    render(
      <Fehlerfang onZurueckZurLobby={zurueck}>
        <Probe start={mittelspiel()} />
      </Fehlerfang>,
    )
    engineKaputt.an = true
    fireEvent.click(screen.getByRole('button', { name: 'Probe' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Engine im Test absichtlich defekt')
    fireEvent.click(screen.getByRole('button', { name: 'Zurück zur Lobby' }))
    expect(zurueck).toHaveBeenCalledTimes(1)
  })
})
