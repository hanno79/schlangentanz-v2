import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../App'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { ladeSpielstand, speichereSpielstand } from '../../spielstand'

/*
O8 K4 und O2 K2: Eine beendete Partie bleibt gespeichert, damit ihre Wertung
ein Neuladen übersteht. Die Lobby bietet sie aber nicht zum Weiterspielen an,
sondern zum Ansehen der Wertung, und eine neue Partie überschreibt sie ohne
Rückfrage: Verloren geht dabei kein Spiel, das noch läuft.
*/

function oeffneLobby() {
  window.history.pushState({}, '', '/')
  return render(<App />)
}

describe('O8 K4: Die Lobby nach einer beendeten Partie', () => {
  it('O8 K4: kein „Weiterspielen“, dafür „Ergebnis ansehen“, das zur Wertung führt', () => {
    speichereSpielstand(erzeugeSzenario('wertung-beispiele'))
    oeffneLobby()
    expect(screen.queryByRole('button', { name: 'Weiterspielen' })).toBeNull()
    expect(screen.getByTestId('beendete-partie')).toHaveTextContent('Letzte Partie: 3 Gegner, Erweiterung an, beendet')
    fireEvent.click(screen.getByRole('button', { name: 'Ergebnis ansehen' }))
    expect(window.location.pathname).toBe('/spiel')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('KI-Gegner 2 gewinnt!')
  })

  it('O8 K4/O2 K2: „Neue Partie“ fragt nach einer beendeten Partie nicht nach und beginnt sofort', () => {
    speichereSpielstand(erzeugeSzenario('wertung-beispiele'))
    oeffneLobby()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(window.location.pathname).toBe('/spiel')
    expect(ladeSpielstand()!.partiephase).toBe('Laufend')
    expect(screen.getByRole('region', { name: 'Deine Hand' })).toBeInTheDocument()
  })

  it('O2 K2 Gegenprobe: eine laufende Partie bietet weiter „Weiterspielen“ und die Rückfrage', () => {
    speichereSpielstand(erzeugeSzenario('wertung-joker'))
    oeffneLobby()
    expect(screen.getByRole('button', { name: 'Weiterspielen' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ergebnis ansehen' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
