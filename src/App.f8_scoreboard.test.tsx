/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F8 UI-Test für den Wertungsbereich als lesbares Scoreboard.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, berechneSpielzustandGesamtwertung, erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

function zustandMitScoreboardWerten(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const gruppenKartenIds = ['blau-01', 'blau-03', 'blau-05']
  const gruppenKarten = zustand.spieler[0].hand.filter(karte => gruppenKartenIds.includes(karte.id))
  const farbAufgabe = aufgabenPool.find(aufgabe => aufgabe.name === 'Farbenpracht')

  if (gruppenKarten.length !== 3) throw new Error('Testsetup erwartet drei blaue Karten für Spieler 1.')
  if (!farbAufgabe) throw new Error('Testsetup erwartet die Aufgabe Farbenpracht.')

  return {
    ...zustand,
    spieler: zustand.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: spieler.hand.filter(karte => !gruppenKartenIds.includes(karte.id)),
            schlangen: [{ id: 'schlange-spieler-1-1', karten: gruppenKarten, zustand: 'aktiv' }],
            erfuellteAufgaben: [farbAufgabe],
          }
        : spieler,
    ),
  }
}

describe('F8 Scoreboard', () => {
  it('zeigt die Wertung zusätzlich als Scoreboard mit Gesamt-, Farbgruppen- und Aufgabenpunkten pro Spieler', () => {
    const zustand = zustandMitScoreboardWerten()
    const erwarteteWertung = berechneSpielzustandGesamtwertung(zustand)

    render(<App initialZustand={zustand} />)

    const wertungBereich = screen.getByRole('region', { name: 'Wertung' })
    const scoreboard = within(wertungBereich).getByRole('region', { name: 'Scoreboard' })
    const eintraege = within(scoreboard).getAllByRole('listitem')

    expect(within(scoreboard).getByRole('heading', { name: 'Scoreboard' })).toBeInTheDocument()
    expect(eintraege).toHaveLength(erwarteteWertung.spielerwertungen.length)

    erwarteteWertung.spielerwertungen.forEach((eintrag, index) => {
      const spieler = zustand.spieler.find(s => s.id === eintrag.spielerId)
      if (!spieler) throw new Error(`Testsetup erwartet Spieler ${eintrag.spielerId}.`)

      expect(eintraege[index]).toHaveClass('scoreboard-karte')
      expect(eintraege[index]).toHaveTextContent(spieler.name)
      expect(eintraege[index]).not.toHaveTextContent(new RegExp(`\\b${spieler.id}\\b`))
      expect(eintraege[index]).toHaveTextContent(`Gesamt: ${eintrag.gesamtPunkte} Punkte`)
      expect(eintraege[index]).toHaveTextContent(`Farbgruppen: ${eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte`)
      expect(eintraege[index]).toHaveTextContent(`Aufgaben: ${eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte`)
    })

    expect(within(wertungBereich).getByText(/Punktestand von Spieler 1:/)).toBeInTheDocument()
    expect(within(wertungBereich).getByText(/Punktequellen von Spieler 1:/)).toBeInTheDocument()
  })
})
