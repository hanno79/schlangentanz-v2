import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../App'
import { speichereSpielstand } from '../../spielstand'
import { mittelspiel, volltisch } from '../tisch/__tests__/szenarien'

/*
O4: Unter `/spiel` steht der Spieltisch, sobald eine Partie gespeichert ist. Er
zeigt sie nur an; gespielt wird erst mit O3 und O5. Ohne Partie bleibt der
Hinweis aus O2.
*/

function oeffne(adresse: string) {
  window.history.pushState({}, '', adresse)
  return render(<App />)
}

describe('O4: Der Spieltisch unter /spiel', () => {
  it('O4: mit gespeicherter Partie zeigt /spiel den Tisch mit deiner Hand, deinen Schlangen und den Gegnern', () => {
    speichereSpielstand(mittelspiel())
    oeffne('/spiel')
    const tisch = screen.getByTestId('spiel')
    expect(tisch).toContainElement(screen.getByRole('region', { name: 'Deine Hand' }))
    expect(tisch).toContainElement(screen.getByRole('region', { name: 'Deine Schlangen' }))
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.queryByText('Spieltisch im Aufbau')).toBeNull()
  })

  it('O4: der Tisch zeigt die gespeicherte Partie, nicht irgendeine', () => {
    speichereSpielstand(volltisch())
    oeffne('/spiel')
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('KI-Gegner 2 ist dran')
  })

  it('O4: „Zur Lobby“ führt zurück, die Partie bleibt gespeichert', () => {
    speichereSpielstand(mittelspiel())
    oeffne('/spiel')
    fireEvent.click(screen.getByRole('link', { name: 'Zur Lobby' }))
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('button', { name: 'Weiterspielen' })).toBeInTheDocument()
  })

  it('O2/O4: ohne Spielstand sagt /spiel weiter, dass keine Partie läuft', () => {
    oeffne('/spiel')
    expect(screen.getByTestId('spiel')).toHaveTextContent('Es läuft keine Partie')
    expect(screen.queryByRole('region', { name: 'Deine Hand' })).toBeNull()
  })
})
