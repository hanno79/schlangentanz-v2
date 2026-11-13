import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../App'
import { erstellePartie, serialisiere } from '../../engine'
import { SPIELSTAND_SCHLUESSEL, ladeSpielstand, speichereSpielstand } from '../../spielstand'

/*
Die Lobby wird über die ganze App geprüft: „Neue Partie“ und „Weiterspielen“
führen auf `/spiel`, und erst dort zeigt sich, ob die Einstellungen
angekommen sind.
*/

function oeffneLobby() {
  window.history.pushState({}, '', '/')
  return render(<App />)
}

/** Wie viele Gegner der Spieltisch zeigt. */
function gegnerAmTisch(): number {
  return within(screen.getByRole('region', { name: 'Gegner' })).getAllByRole('article').length
}

/** Mit Erweiterung liegen am Tisch die offenen Aufgaben (A4). */
function erweiterungAmTisch(): boolean {
  return screen.queryByRole('region', { name: 'Offene Aufgaben' }) !== null
}

function kiGegner(): number {
  const zustand = ladeSpielstand()
  if (zustand === null) throw new Error('kiGegner: erwartet einen Spielstand, gefunden: keinen')
  return zustand.spieler.filter((spieler) => spieler.steuerung === 'KI').length
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('O2 K1: Einstellungen und neue Partie', () => {
  it('O2 K1: die Lobby bietet 1, 2 oder 3 Gegner, die Erweiterung als Schalter und „Neue Partie“', () => {
    oeffneLobby()
    const gegner = within(screen.getByRole('radiogroup', { name: /Gegner/ }))
    expect(gegner.getAllByRole('radio').map((knopf) => knopf.getAttribute('value'))).toEqual(['1', '2', '3'])
    expect(gegner.getAllByRole('radio').filter((knopf) => (knopf as HTMLInputElement).checked)).toHaveLength(1)
    expect(screen.getByRole('checkbox', { name: /Erweiterung/ })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Neue Partie' })).toBeEnabled()
  })

  it.each([1, 2, 3])('O2 K1: „Neue Partie“ mit %i Gegnern legt einen Spielstand mit so vielen KI-Gegnern an', (anzahl) => {
    oeffneLobby()
    fireEvent.click(screen.getByRole('radio', { name: `${anzahl} Gegner` }))
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))

    expect(kiGegner()).toBe(anzahl)
    expect(window.location.pathname).toBe('/spiel')
    expect(gegnerAmTisch()).toBe(anzahl)
  })

  it.each([
    [true, 'an'],
    [false, 'aus'],
  ])('O2 K1: der Erweiterungs-Schalter (%s) kommt auf dem Spieltisch an, auch nach neuem Laden', (an) => {
    oeffneLobby()
    if (an) fireEvent.click(screen.getByRole('checkbox', { name: /Erweiterung/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(erweiterungAmTisch()).toBe(an)

    cleanup()
    render(<App />)
    expect(erweiterungAmTisch()).toBe(an)
  })

  it('E1: der Erweiterungs-Schalter erreicht die Engine; es gibt keinen Ersatzschlüssel und keine Warnung mehr', () => {
    oeffneLobby()
    fireEvent.click(screen.getByRole('checkbox', { name: /Erweiterung/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(ladeSpielstand()?.erweiterung).toBe(true)
    expect(window.localStorage.getItem('schlangentanz-v2:erweiterung')).toBeNull()
    expect(screen.queryByTestId('hinweis-erweiterung')).toBeNull()
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('O2 K1: der Spieltisch bietet einen Weg zurück in die Lobby', () => {
    oeffneLobby()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(screen.getByTestId('spiel')).toContainElement(screen.getByRole('region', { name: 'Deine Hand' }))
    fireEvent.click(screen.getByRole('link', { name: 'Zur Lobby' }))
    expect(window.location.pathname).toBe('/')
    expect(screen.getByTestId('lobby')).toBeInTheDocument()
  })
})

describe('O2 K2: Weiterspielen und Rückfrage', () => {
  function legeSpielstandAn(gegner: number, erweiterung = false): string {
    speichereSpielstand(erstellePartie({ spielerzahl: gegner + 1, erweiterung, zufall: Math.random }))
    const roh = window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)
    if (roh === null) throw new Error('legeSpielstandAn: Spielstand wurde nicht geschrieben')
    return roh
  }

  it('O2 K2: ohne Spielstand gibt es kein „Weiterspielen“ und keine Rückfrage', () => {
    oeffneLobby()
    expect(screen.queryByRole('button', { name: 'Weiterspielen' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(window.location.pathname).toBe('/spiel')
  })

  it('O2 K2: mit Spielstand bietet die Lobby „Weiterspielen“ und nennt die laufende Partie', () => {
    legeSpielstandAn(2)
    oeffneLobby()
    expect(screen.getByTestId('laufende-partie')).toHaveTextContent('2 Gegner')
    fireEvent.click(screen.getByRole('button', { name: 'Weiterspielen' }))
    expect(window.location.pathname).toBe('/spiel')
    expect(gegnerAmTisch()).toBe(2)
  })

  it.each([
    [true, 'an'],
    [false, 'aus'],
  ])('E1: Lobby und Spieltisch lesen die Erweiterung (%s) aus dem Spielstand selbst', (erweiterung, wort) => {
    legeSpielstandAn(1, erweiterung)
    oeffneLobby()
    expect(screen.getByTestId('laufende-partie')).toHaveTextContent(`Erweiterung ${wort}`)
    fireEvent.click(screen.getByRole('button', { name: 'Weiterspielen' }))
    expect(erweiterungAmTisch()).toBe(erweiterung)
  })

  it('O2 K2: „Neue Partie“ fragt erst nach; Abbrechen lässt den Spielstand unverändert', () => {
    const vorher = legeSpielstandAn(3)
    oeffneLobby()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))

    const frage = screen.getByRole('alertdialog')
    expect(frage).toHaveTextContent(/überschr/)
    expect(window.location.pathname).toBe('/')

    fireEvent.click(within(frage).getByRole('button', { name: 'Abbrechen' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBe(vorher)
    expect(screen.getByRole('button', { name: 'Weiterspielen' })).toBeInTheDocument()
  })

  it('O2 K2: Escape schliesst die Rückfrage wie Abbrechen', () => {
    const vorher = legeSpielstandAn(1)
    oeffneLobby()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBe(vorher)
  })

  it('O2 K2: die Rückfrage hat den Fokus, damit sie mit der Tastatur erreichbar ist', () => {
    legeSpielstandAn(1)
    oeffneLobby()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(screen.getByRole('alertdialog').contains(document.activeElement)).toBe(true)
  })

  it('O2 K2: Bestätigen überschreibt den Spielstand mit der neuen Partie', () => {
    const vorher = legeSpielstandAn(3)
    oeffneLobby()
    fireEvent.click(screen.getByRole('radio', { name: '1 Gegner' }))
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /neue Partie/i }))

    expect(window.location.pathname).toBe('/spiel')
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).not.toBe(vorher)
    expect(kiGegner()).toBe(1)
    expect(serialisiere(ladeSpielstand()!)).toBe(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL))
  })
})
