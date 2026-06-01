import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Schlangentanz v2 placeholder', () => {
  it('identifies the app as a greenfield rebuild', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /schlangentanz v2 greenfield rebuild/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/neues projekt/i)).toBeInTheDocument()
    expect(screen.getByText(/keinen alten paperclip/i)).toBeInTheDocument()
  })
})

describe('R16 UI-Binding für legale Engine-Aktionen', () => {
  it('zeigt legale Aktionen aus der Engine als UI-Auswahl an', () => {
    render(<App />)

    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/engine-demo: ausspielphase/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/aktiver spieler: spieler-1/i)).toBeInTheDocument()
    expect(within(bereich).getAllByRole('button')).toHaveLength(5)
    expect(
      within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }),
    ).toBeInTheDocument()
    expect(within(bereich).getByText(/quelle: engine\.ermittlelegaleaktionen/i)).toBeInTheDocument()
  })
})

describe('R17 UI-Aktionsausführung über die Engine', () => {
  it('startet per Klick eine neue Schlange und aktualisiert die legalen Aktionen', () => {
    render(<App />)

    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    fireEvent.click(
      within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }),
    )

    expect(within(bereich).getByText(/schlange schlange-spieler-1-1: blau-01/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /neue schlange starten mit karte blau-01/i })).toBeNull()
    expect(within(bereich).getAllByRole('button')).toHaveLength(12)
  })
})
