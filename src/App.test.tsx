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

function starteErsteSchlange() {
  render(<App />)
  const bereich = screen.getByRole('region', { name: /legale aktionen/i })
  fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))
  return bereich
}

describe('R17 UI-Aktionsausführung über die Engine', () => {
  it('startet per Klick eine neue Schlange und aktualisiert die legalen Aktionen', () => {
    const bereich = starteErsteSchlange()

    expect(within(bereich).getByText(/schlange schlange-spieler-1-1: blau-01/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /neue schlange starten mit karte blau-01/i })).toBeNull()
    expect(within(bereich).queryAllByRole('button')).toHaveLength(0)
  })
})

describe('R19 UI-Grundregel für Kartenarten pro Zug', () => {
  it('zeigt nach einer gespielten Farbkarte keine zweite Farbkarte als legale Aktion an', () => {
    const bereich = starteErsteSchlange()

    expect(
      within(bereich).queryByRole('button', {
        name: /karte blau-03 an schlange schlange-spieler-1-1 rechts anlegen/i,
      }),
    ).toBeNull()
    expect(within(bereich).getByText(/keine weiteren legalen aktionen/i)).toBeInTheDocument()
  })
})
