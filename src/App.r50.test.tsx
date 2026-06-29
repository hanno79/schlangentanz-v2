/*
Author: rahn
Datum: 01.06.2026
Version: 1.1
Beschreibung: R50 UI-Test für die sichtbare geheime Aufgabe des aktiven Spielers.
Änderung v1.1 [29.06.2026]: R181 — "ohne geheime Aufgabe"-Pfad entfernt (Spec: jeder
              Spieler hat genau eine geheime Aufgabenkarte, non-nullable). Test
              ersetzt durch Verifikation, dass der UI-Hook ohne Null-Check
              funktioniert und die geheime Aufgabe sichtbar gerendert wird.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R50 Geheime Aufgabe des aktiven Spielers', () => {
  it('zeigt Name, Punkte und Bedingung der geheimen Aufgabe des aktiven Spielers an', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const geheimeAufgabe = zustand.spieler[zustand.aktiverSpielerIndex].geheimeAufgabe

    expect(geheimeAufgabe).not.toBeNull()

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    expect(within(aktiverSpielerBereich).getByText(/Geheime Aufgabe:/)).toHaveTextContent(
      `${geheimeAufgabe.name} (${geheimeAufgabe.punkte} Punkte): ${geheimeAufgabe.bedingung}`
    )
  })

  it('R181: geheime Aufgabe ist non-nullable für alle Spieler', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
    for (const spieler of zustand.spieler) {
      // TypeScript-Compile-Garantie: kein `?.` mehr nötig.
      expect(spieler.geheimeAufgabe.typ).toBe('Aufgabenkarte')
      expect(spieler.geheimeAufgabe.id.length).toBeGreaterThan(0)
    }

    render(<App initialZustand={zustand} />)
    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    expect(within(aktiverSpielerBereich).getByText(/Geheime Aufgabe:/)).toBeInTheDocument()
  })
})
