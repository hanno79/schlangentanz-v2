import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../App'
import { berechneEndwertung } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { speichereSpielstand } from '../../spielstand'
import { vorlesendeBereiche as vorlesend } from '../tisch/__tests__/bedienen'
import { gespeichert, warte } from './__tests__/steuerung'

/*
O8 am App-Rahmen: Endet die Partie, steht unter `/spiel` die Wertung statt des
Tischs, auch nach dem Neuladen. „Noch einmal“ beginnt eine neue Partie mit
denselben Einstellungen, „Zur Lobby“ führt zurück, und die Lobby führt danach
nicht mehr in die beendete Partie (Kriterium 4).
*/

function oeffne(adresse: string) {
  window.history.pushState({}, '', adresse)
  return render(<App />)
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const ergebnis = () => screen.getByTestId('ergebnis')

describe('O8: Nach Spielende steht die Wertung da', () => {
  it('O8/A10: spielen die KI-Gegner die Schlussrunde zu Ende, erscheint die Wertung der Engine', () => {
    vi.useFakeTimers()
    speichereSpielstand(erzeugeSzenario('schlussrunde-ohne-dich'))
    oeffne('/spiel')
    for (let schritt = 0; schritt < 40 && screen.queryByTestId('ergebnis') === null; schritt += 1) warte(700)
    const ende = gespeichert()!
    expect(ende.partiephase).toBe('Beendet')
    const endwertung = berechneEndwertung(ende)
    const liste = within(ergebnis()).getByRole('list', { name: 'Wertung' })
    for (const wertung of endwertung.spieler) {
      const name = wertung.spielerId === 'spieler-1' ? 'Du' : wertung.name
      expect(within(liste).getByRole('listitem', { name })).toHaveTextContent(`${wertung.summe} Punkte`)
    }
    expect(screen.queryByRole('region', { name: 'Deine Hand' })).toBeNull()
  })

  it('O8: eine beendete Partie im Speicher öffnet unter /spiel die Wertung, auch nach dem Neuladen', () => {
    speichereSpielstand(erzeugeSzenario('wertung-beispiele'))
    const erst = oeffne('/spiel')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('KI-Gegner 2 gewinnt!')
    erst.unmount()
    oeffne('/spiel')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('KI-Gegner 2 gewinnt!')
    expect(gespeichert()!.partiephase).toBe('Beendet')
  })
})

describe('O11 K1/K2: Spielende mit Tastatur und Bildschirmleser (TF-TISCH-045)', () => {
  it('O11 K1/K2: endet die Partie am Tisch, steht der Fokus auf der Überschrift der Wertung, und das Ergebnis wird vorgelesen', () => {
    vi.useFakeTimers()
    speichereSpielstand(erzeugeSzenario('schlussrunde-ohne-dich'))
    oeffne('/spiel')
    // Wie mit der Tastatur: Der Fokus steht am Tisch, solange die Gegner spielen.
    within(screen.getByRole('region', { name: 'Zugleiste' })).getByRole('button', { name: 'Schneller' }).focus()
    for (let schritt = 0; schritt < 40 && screen.queryByTestId('ergebnis') === null; schritt += 1) warte(700)
    const titel = within(ergebnis()).getByRole('heading', { level: 1 })
    expect(document.activeElement, 'nach dem Spielende steht der Fokus auf der leeren Seite').toBe(titel)
    warte(0)
    const meldung = vorlesend().find((bereich) => (bereich.textContent ?? '').includes(titel.textContent ?? '—'))
    expect(meldung, `kein vorlesender Bereich nennt „${titel.textContent}“`).toBeDefined()
    expect(meldung).toHaveTextContent(/Mit \d+ Punkt/)
  })

  it('O11 K2: wer die Wertung später öffnet, bekommt sie ebenso vorgelesen, und der Fokus steht auf der Überschrift', () => {
    speichereSpielstand(erzeugeSzenario('wertung-beispiele'))
    oeffne('/spiel')
    const titel = screen.getByRole('heading', { level: 1 })
    expect(document.activeElement).toBe(titel)
    expect(vorlesend().some((bereich) => (bereich.textContent ?? '').includes('KI-Gegner 2 gewinnt!'))).toBe(true)
  })
})

describe('O8 K4: Noch einmal und Zur Lobby', () => {
  it.each([
    ['wertung-beispiele', 3, true],
    ['wertung-beispiele-kette', 2, false],
  ])('O8 K4: „Noch einmal“ nach %s beginnt eine neue Partie mit %i Gegnern, Erweiterung %s', (name, gegner, erweiterung) => {
    speichereSpielstand(erzeugeSzenario(name))
    oeffne('/spiel')
    fireEvent.click(screen.getByRole('button', { name: 'Noch einmal' }))
    const neu = gespeichert()!
    expect(neu.partiephase).toBe('Laufend')
    expect(neu.spieler.filter((spieler) => spieler.steuerung === 'KI')).toHaveLength(gegner)
    expect(neu.erweiterung).toBe(erweiterung)
    expect(neu.spieler.every((spieler) => spieler.schlangen.length === 0), 'eine frische Partie').toBe(true)
    expect(screen.queryByTestId('ergebnis')).toBeNull()
    expect(within(screen.getByRole('region', { name: 'Gegner' })).getAllByRole('article')).toHaveLength(gegner)
    expect(screen.getByRole('status')).toHaveTextContent('Du bist')
    expect(window.location.pathname).toBe('/spiel')
  })

  it('O8 K4: „Zur Lobby“ führt zurück; die Lobby bietet kein „Weiterspielen“ in die beendete Partie', () => {
    speichereSpielstand(erzeugeSzenario('wertung-beispiele'))
    oeffne('/spiel')
    fireEvent.click(screen.getByRole('link', { name: 'Zur Lobby' }))
    expect(screen.getByTestId('lobby')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Weiterspielen' })).toBeNull()
  })
})
