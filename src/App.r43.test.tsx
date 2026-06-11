/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R43 UI-Tests für sichtbare Details des aktiven Spielers.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { beendeAufgabenpruefung, beendeAusspielphase, beendeZug, erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R43 UI-Details des aktiven Spielers', () => {
  it('zeigt den aktiven Spieler mit spielerfreundlichem Profil und aktualisiert ihn nach Zugwechsel', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const nachAusspielen = beendeAusspielphase({
      ...zustand,
      zugpflichten: { ...zustand.zugpflichten, gespielteKarten: 1, gespielteFarbkarten: 1 },
    })
    const erwarteterFolgezustand = beendeZug(
      beendeAufgabenpruefung(nachAusspielen, { aufgabenGeprueft: true }),
      { pflichtenErfuellt: true },
    )

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(within(bereich).getByText('Spielerprofil: Spieler 1 — Du bist am Zug.')).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    const aktiverSpieler = erwarteterFolgezustand.spieler[erwarteterFolgezustand.aktiverSpielerIndex]!
    expect(
      within(bereich).getByText(`Spielerprofil: ${aktiverSpieler.name} — KI ist am Zug.`),
    ).toBeInTheDocument()
  })
})
