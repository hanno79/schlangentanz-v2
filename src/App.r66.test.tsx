/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R66 UI-Test für die sichtbare Wertungsaufteilung nach Farbgruppen und Aufgaben.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, berechneSpielzustandGesamtwertung, erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

function zustandMitWertungsdetails(): Spielzustand {
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

describe('R66 Wertungsdetails in der UI', () => {
  it('zeigt pro Spieler Farbgruppen- und Aufgabenpunkte separat an', () => {
    const zustand = zustandMitWertungsdetails()
    const erwarteteWertung = berechneSpielzustandGesamtwertung(zustand)

    render(<App initialZustand={zustand} />)

    const wertungBereich = screen.getByRole('region', { name: 'Wertung' })

    erwarteteWertung.spielerwertungen.forEach(eintrag => {
      expect(within(wertungBereich).getByText(`Punktestand von ${eintrag.spielerId}: ${eintrag.gesamtPunkte} Punkte`)).toBeInTheDocument()
      expect(
        within(wertungBereich).getByText(
          `Punktequellen von ${eintrag.spielerId}: Farbgruppen ${eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte, Aufgaben ${eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte`,
        ),
      ).toBeInTheDocument()
    })
  })
})
