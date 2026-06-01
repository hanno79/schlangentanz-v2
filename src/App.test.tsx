import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

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
    expect(within(bereich).queryByRole('button', { name: /karte blau-03/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /ausspielphase beenden/i })).toBeInTheDocument()
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

function zustandMitPflichtAbwurf(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const sonderkarte = zustand.nachziehstapel.find(karte => karte.typ === 'Sonderkarte')
  if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte im Nachziehstapel.')

  return {
    ...zustand,
    nachziehstapel: zustand.nachziehstapel.filter(karte => karte.id !== sonderkarte.id),
    spieler: zustand.spieler.with(0, { ...zustand.spieler[0], hand: [sonderkarte], schlangen: [] }),
  }
}

function zustandNachEinerSonderkarteMitWeitererLegalerAktion(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const farbkarte = [...zustand.nachziehstapel, ...zustand.spieler[0].hand].find(k => k.id === 'blau-01')
  if (!farbkarte) throw new Error('Testsetup erwartet blau-01 im Spielzustand.')

  return {
    ...zustand,
    zugpflichten: { gespielteKarten: 1, gespielteFarbkarten: 0, gespielteSonderkarten: 1 },
    spieler: zustand.spieler.with(0, { ...zustand.spieler[0], hand: [farbkarte], schlangen: [] }),
  }
}

describe('R21 UI-Pflicht-Abwurf', () => {
  it('führt Pflicht-Abwurf per Klick aus und zeigt den Ablagestapel', () => {
    render(<App initialZustand={zustandMitPflichtAbwurf()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    fireEvent.click(within(bereich).getByRole('button', { name: /karte sonderkarte-01 abwerfen/i }))

    expect(within(bereich).getByText(/ablagestapel: sonderkarte-01/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/keine weiteren legalen aktionen/i)).toBeInTheDocument()
  })
})

describe('R22 UI-Handkartenanzeige', () => {
  it('zeigt aktive Handkarten und aktualisiert sie nach Pflicht-Abwurf', () => {
    render(<App initialZustand={zustandMitPflichtAbwurf()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/handkarten: sonderkarte-01/i)).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /karte sonderkarte-01 abwerfen/i }))

    expect(within(bereich).getByText(/handkarten: keine/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/ablagestapel: sonderkarte-01/i)).toBeInTheDocument()
  })
})

describe('R23 UI-Zugpflichtenanzeige', () => {
  it('zeigt gespielte Karten im Zug und aktualisiert sie nach einer Engine-Aktion', () => {
    render(<App />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/gespielte karten: 0\/2/i)).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(within(bereich).getByText(/gespielte karten: 1\/2/i)).toBeInTheDocument()
  })
})

describe('R25 UI-Ausspielphase beenden', () => {
  it('beendet nach einer gespielten Karte die Ausspielphase über die Engine', () => {
    render(<App />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/zugphase: ausspielphase/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /ausspielphase beenden/i })).toBeNull()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))

    expect(within(bereich).getByText(/zugphase: aufgabenpruefung/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/schlange schlange-spieler-1-1: blau-01/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/gespielte karten: 1\/2/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /ausspielphase beenden/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i })).toBeInTheDocument()
  })

  it('erlaubt das Beenden nach einer Karte auch wenn weitere legale Aktionen möglich sind', () => {
    render(<App initialZustand={zustandNachEinerSonderkarteMitWeitererLegalerAktion()} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText(/gespielte karten: 1\/2/i)).toBeInTheDocument()
    expect(
      within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }),
    ).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))

    expect(within(bereich).getByText(/zugphase: aufgabenpruefung/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /ausspielphase beenden/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i })).toBeInTheDocument()
  })
})

describe('R26 UI-Aufgabenprüfung beenden', () => {
  it('beendet nach der Ausspielphase die Aufgabenprüfung über die Engine', () => {
    const bereich = starteErsteSchlange()
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))

    expect(within(bereich).getByText(/zugphase: aufgabenpruefung/i)).toBeInTheDocument()
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))

    expect(within(bereich).getByText(/zugphase: zugabschluss/i)).toBeInTheDocument()
    expect(within(bereich).queryByRole('button', { name: /aufgabenprüfung beenden/i })).toBeNull()
    expect(within(bereich).getByRole('button', { name: /zug beenden/i })).toBeInTheDocument()
  })
})

describe('R27 UI-Zug beenden', () => {
  it('beendet im Zugabschluss den Zug über die Engine und aktiviert den nächsten Spieler', () => {
    const bereich = starteErsteSchlange()
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    expect(within(bereich).getByText(/zugphase: nachziehphase/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/aktiver spieler: spieler-2/i)).toBeInTheDocument()
    expect(within(bereich).getByText(/gespielte karten: 0\/2/i)).toBeInTheDocument()
    expect(within(bereich).queryAllByRole('button')).toHaveLength(0)
  })
})
