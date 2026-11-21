import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../../App'
import { serialisiere } from '../../engine'
import { starteEntwicklerPartie } from '../../entwicklung/partie'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { SPIELSTAND_SCHLUESSEL, speichereSpielstand } from '../../spielstand'
import { gespeichert, istEinSchritt, roh } from './__tests__/steuerung'

/*
O3 am App-Rahmen: `/spiel` spielt die gespeicherte Partie mit der Pause aus
`useSpiel`, ohne Pause bei „weniger Bewegung“. Ein alter Spielstand wird
verworfen und einmal gemeldet. Im Testhook-Build (Vitest läuft wie der
Dev-Server mit Testhooks) nimmt `/spiel` die Parameter `szenario`, `seed` und
`tempo` (Plan O3, Kriterium 7).
*/

function oeffne(adresse: string) {
  window.history.pushState({}, '', adresse)
  return render(<App />)
}

/** Stellt `prefers-reduced-motion` nach, wie der Browser es meldet. */
function wenigerBewegung(an: boolean): void {
  vi.stubGlobal('matchMedia', (abfrage: string) => ({
    matches: an && abfrage === '(prefers-reduced-motion: reduce)',
    media: abfrage,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('O3 K1: Pause vor jedem KI-Schritt am Tisch', () => {
  it('O3 K1: ohne „weniger Bewegung“ spielt die KI nach 700 ms, nicht vorher', () => {
    vi.useFakeTimers()
    wenigerBewegung(false)
    const start = erzeugeSzenario('schlussrunde-ohne-dich')
    speichereSpielstand(start)
    oeffne('/spiel')
    act(() => vi.advanceTimersByTime(699))
    expect(roh()).toBe(serialisiere(start))
    act(() => vi.advanceTimersByTime(1))
    expect(istEinSchritt(start, gespeichert()!)).toBe(true)
  })

  it('O3 K1: mit „weniger Bewegung“ folgt der KI-Schritt sofort, aber einzeln', () => {
    vi.useFakeTimers()
    wenigerBewegung(true)
    const start = erzeugeSzenario('schlussrunde-ohne-dich')
    speichereSpielstand(start)
    oeffne('/spiel')
    act(() => vi.advanceTimersByTime(0))
    const erster = gespeichert()!
    expect(istEinSchritt(start, erster)).toBe(true)
    act(() => vi.advanceTimersByTime(0))
    expect(istEinSchritt(erster, gespeichert()!)).toBe(true)
  })

  it('O3: „Zur Lobby“ hält die KI an; in der Lobby läuft nichts weiter (O2 K5)', () => {
    vi.useFakeTimers()
    const start = erzeugeSzenario('schlussrunde-ohne-dich')
    speichereSpielstand(start)
    oeffne('/spiel')
    fireEvent.click(screen.getByRole('link', { name: 'Zur Lobby' }))
    act(() => vi.advanceTimersByTime(5000))
    expect(roh()).toBe(serialisiere(start))
    expect(screen.getByRole('button', { name: 'Weiterspielen' })).toBeInTheDocument()
  })
})

describe('O3 K3: Ein alter Spielstand wird verworfen, und es wird einmal gesagt', () => {
  const ALT = JSON.stringify({ version: 1, spieler: [] })

  it('O3 K3: die Lobby sagt es beim ersten Öffnen und danach nicht mehr', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    window.localStorage.setItem(SPIELSTAND_SCHLUESSEL, ALT)
    const erst = oeffne('/')
    expect(screen.getByTestId('spielstand-verworfen')).toHaveTextContent('älteren Speicherformat')
    expect(roh()).toBeNull()
    erst.unmount()
    oeffne('/')
    expect(screen.queryByTestId('spielstand-verworfen')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Weiterspielen' })).toBeNull()
  })

  it('O3 K3: wer direkt /spiel öffnet, liest es dort einmal; die Lobby danach schweigt', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    window.localStorage.setItem(SPIELSTAND_SCHLUESSEL, ALT)
    oeffne('/spiel')
    expect(screen.getByTestId('spielstand-verworfen')).toHaveTextContent('verworfen')
    expect(screen.queryByRole('region', { name: 'Deine Hand' })).toBeNull()
    fireEvent.click(screen.getByRole('link', { name: 'Zurück zur Lobby' }))
    expect(screen.getByTestId('lobby')).toBeInTheDocument()
    expect(screen.queryByTestId('spielstand-verworfen')).toBeNull()
  })
})

describe('O3 K7: Testhooks unter /spiel', () => {
  it('O3 K7: ?szenario= legt den Stand an, die Adresse behält danach nur das Tempo', async () => {
    oeffne('/spiel?szenario=angriff-auf-dich&tempo=sofort')
    expect(await screen.findByRole('region', { name: 'Deine Hand' })).toBeInTheDocument()
    expect(roh()).toBe(serialisiere(erzeugeSzenario('angriff-auf-dich')))
    expect(window.location.pathname).toBe('/spiel')
    expect(window.location.search).toBe('?tempo=sofort')
    expect(screen.getByRole('status')).toHaveTextContent('Du entscheidest, ob du abwehrst.')
  })

  it('O3 K7: ?seed= mit spieler und erweiterung beginnt die Partie aus dieser Saat, wie am Entwicklertisch', async () => {
    oeffne('/spiel?seed=3&spieler=3&erweiterung=1')
    expect(await screen.findByRole('region', { name: 'Deine Hand' })).toBeInTheDocument()
    expect(roh()).toBe(serialisiere(starteEntwicklerPartie(3, 3, true)))
    expect(window.location.search).toBe('')
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })

  it('O3 K1/K7: ?tempo=sofort spielt die KI ohne Pause, ohne Tempo wartet sie', async () => {
    const start = erzeugeSzenario('schlussrunde-ohne-dich')
    oeffne('/spiel?szenario=schlussrunde-ohne-dich')
    await screen.findByRole('region', { name: 'Deine Hand' })
    await new Promise((fertig) => setTimeout(fertig, 300))
    expect(roh(), 'ohne Tempo spielt die KI nicht vor 700 ms').toBe(serialisiere(start))
  })

  it('O3 K7: mit ?tempo=sofort folgt der erste KI-Schritt ohne Pause', async () => {
    const start = erzeugeSzenario('schlussrunde-ohne-dich')
    oeffne('/spiel?szenario=schlussrunde-ohne-dich&tempo=sofort')
    await screen.findByRole('region', { name: 'Deine Hand' })
    await waitFor(() => expect(roh()).not.toBe(serialisiere(start)), { timeout: 300 })
  })

  it.each([
    { adresse: '/spiel?szenario=gibtsnicht', meldung: /gibtsnicht/ },
    { adresse: '/spiel?seed=abc&spieler=2', meldung: /seed/ },
    { adresse: '/spiel?tempo=schnell', meldung: /tempo/ },
  ])('O3 K7: $adresse sagt, was falsch ist, und führt zur Lobby', async ({ adresse, meldung }) => {
    speichereSpielstand(erzeugeSzenario('start-2'))
    const vorher = roh()
    oeffne(adresse)
    expect(await screen.findByRole('alert')).toHaveTextContent(meldung)
    expect(screen.getByRole('link', { name: 'Zurück zur Lobby' })).toBeInTheDocument()
    expect(roh(), 'eine falsche Adresse überschreibt keinen Spielstand').toBe(vorher)
  })

  it('O3 K7: nur ?tempo=sofort ohne Spielstand zeigt, dass keine Partie läuft', async () => {
    oeffne('/spiel?tempo=sofort')
    expect(await screen.findByText('Es läuft keine Partie. Starte in der Lobby eine neue.')).toBeInTheDocument()
  })
})
