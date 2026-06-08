/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R67 UI-Test für die aggregierte Materialstapel-Anzeige.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R67 Materialstapel-Summe in der UI', () => {
  it('zeigt im Bereich Material und Aufgaben die Gesamtzahl aus Nachzieh- und Ablagestapel an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const erwarteteGesamtzahl = zustand.nachziehstapel.length + zustand.ablagestapel.length

    render(<App initialZustand={zustand} />)

    const materialBereich = screen.getByRole('region', { name: 'Material und Aufgaben' })

    expect(
      within(materialBereich).getByText(`Spielmaterial insgesamt: ${erwarteteGesamtzahl} Karten`),
    ).toBeInTheDocument()
  })
})
