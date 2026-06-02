/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R65 UI-Test für verdoppelte offene Aufgaben im Endspurt.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

function zustandImEndspurtMitOffenenAufgaben(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)

  return {
    ...zustand,
    nachziehstapel: [],
    spielphase: 'Endspurt',
    zugphase: 'Zugabschluss',
    endrunde: {
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [0],
    },
  }
}

describe('R65 Endspurt verdoppelt offene Aufgaben in der UI', () => {
  it('zeigt offene Aufgaben im Endspurt mit ×2-Anzeige und verdoppelten Punkten an', () => {
    const zustand = zustandImEndspurtMitOffenenAufgaben()

    render(<App initialZustand={zustand} />)

    const materialBereich = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const geheimeAufgabe = zustand.spieler[zustand.aktiverSpielerIndex].geheimeAufgabe

    expect(geheimeAufgabe).not.toBeNull()

    zustand.offeneAufgaben.forEach(aufgabe => {
      const erwarteteAnzeige = `${aufgabe.name} (${aufgabe.punkte} Punkte ×2 = ${aufgabe.punkte * 2} Punkte)`
      const erwarteteDetails = `${erwarteteAnzeige}: ${aufgabe.bedingung}`

      expect(within(materialBereich).getByText(/Offene Aufgaben:/)).toHaveTextContent(erwarteteAnzeige)
      expect(within(materialBereich).getByText(/Offene Aufgaben-Details:/)).toHaveTextContent(erwarteteDetails)
    })

    expect(within(aktiverSpielerBereich).getByText(/Geheime Aufgabe:/)).toHaveTextContent(
      `${geheimeAufgabe?.name} (${geheimeAufgabe?.punkte} Punkte): ${geheimeAufgabe?.bedingung}`,
    )
  })

  it('zeigt außerhalb des Endspurts offene Aufgaben ohne ×2-Anzeige an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

    expect(zustand.spielphase).toBe('Normal')
    render(<App initialZustand={zustand} />)

    const materialBereich = screen.getByRole('region', { name: 'Material und Aufgaben' })

    zustand.offeneAufgaben.forEach(aufgabe => {
      const erwarteteAnzeige = `${aufgabe.name} (${aufgabe.punkte} Punkte)`
      const erwarteteDetails = `${aufgabe.name} (${aufgabe.punkte} Punkte): ${aufgabe.bedingung}`

      expect(within(materialBereich).getByText(/Offene Aufgaben:/)).toHaveTextContent(erwarteteAnzeige)
      expect(within(materialBereich).getByText(/Offene Aufgaben-Details:/)).toHaveTextContent(erwarteteDetails)
    })
    expect(within(materialBereich).queryByText(/×2/)).toBeNull()
  })
})
