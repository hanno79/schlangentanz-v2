import { describe, expect, it } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import App from './App'

function oeffne(adresse: string) {
  window.history.pushState({}, '', adresse)
  return render(<App />)
}

describe('O2: Seiten des App-Rahmens', () => {
  it('O2: / zeigt die Lobby', () => {
    oeffne('/')
    expect(screen.getByTestId('lobby')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Schlangentanz')
  })

  it('O2: /regeln zeigt den Platzhalter mit Verweis auf die Regeln der Website', () => {
    oeffne('/regeln')
    expect(screen.getByTestId('regeln')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /schlangentanz\.ch/i })).toHaveAttribute(
      'href',
      'https://schlangentanz.ch/rules',
    )
  })

  it('O2: /spiel ohne Spielstand sagt, dass keine Partie läuft, und führt zur Lobby', () => {
    oeffne('/spiel')
    expect(screen.getByTestId('spiel')).toHaveTextContent('Es läuft keine Partie')
    fireEvent.click(screen.getByRole('link', { name: 'Zurück zur Lobby' }))
    expect(window.location.pathname).toBe('/')
    expect(screen.getByTestId('lobby')).toBeInTheDocument()
  })

  it('O2: eine unbekannte Adresse sagt das und führt zur Lobby', () => {
    oeffne('/gibt-es-nicht')
    expect(screen.getByTestId('unbekannte-seite')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Zurück zur Lobby' })).toHaveAttribute('href', '/')
  })

  it('O2: ein Schrägstrich am Ende ist dieselbe Seite', () => {
    oeffne('/regeln/')
    expect(screen.getByTestId('regeln')).toBeInTheDocument()
  })

  it('O2: der Seitentitel nennt das Spiel und die Seite', () => {
    oeffne('/regeln')
    expect(document.title).toContain('Schlangentanz')
    expect(document.title).toContain('Regeln')
  })

  it('P0.4: /dev lädt im Testlauf (Dev-Modus) den Entwicklertisch nach', async () => {
    oeffne('/dev?seed=1&spieler=2')
    expect(await screen.findByTestId('entwicklertisch')).toBeInTheDocument()
  })
})

describe('O2 K3: Vor und Zurück im Browser', () => {
  it('O2 K3: Zurück führt von der Partie in die Lobby, Vor wieder zur Partie', async () => {
    oeffne('/')
    fireEvent.click(screen.getByRole('button', { name: 'Neue Partie' }))
    expect(window.location.pathname).toBe('/spiel')
    expect(screen.getByTestId('spiel')).toBeInTheDocument()

    act(() => window.history.back())
    expect(await screen.findByTestId('lobby')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('button', { name: 'Weiterspielen' })).toBeInTheDocument()

    act(() => window.history.forward())
    expect(await screen.findByTestId('spiel')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/spiel')
  })

  it('O2 K3: der Verweis auf die Regeln legt einen Eintrag in den Verlauf, Zurück kehrt in die Lobby', async () => {
    oeffne('/')
    fireEvent.click(screen.getByRole('link', { name: 'Regeln' }))
    expect(window.location.pathname).toBe('/regeln')
    expect(screen.getByTestId('regeln')).toBeInTheDocument()

    act(() => window.history.back())
    expect(await screen.findByTestId('lobby')).toBeInTheDocument()
  })
})
