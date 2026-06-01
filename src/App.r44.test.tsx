/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R44 UI-Tests für sichtbare Position des aktiven Spielers in der Zugreihenfolge.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { beendeAufgabenpruefung, beendeAusspielphase, beendeZug, erstelleSpielzustand, starteAusspielphase } from './engine'

describe('R44 UI-Spielerposition am Zug', () => {
  it('zeigt die aktive Spielerposition und aktualisiert sie nach einem Engine-Zugwechsel', () => {
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

    expect(within(bereich).getByText(`Spieler am Zug: ${zustand.aktiverSpielerIndex + 1}/${zustand.spieler.length}`)).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    expect(
      within(bereich).getByText(
        `Spieler am Zug: ${erwarteterFolgezustand.aktiverSpielerIndex + 1}/${erwarteterFolgezustand.spieler.length}`,
      ),
    ).toBeInTheDocument()
  })
})
