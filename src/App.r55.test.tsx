/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R55 UI-Test für den aktuellen Punktestand des aktiven Spielers.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import {
  anwendeAktion,
  berechneSpielzustandGesamtwertung,
  ermittleLegaleAktionen,
  erstelleSpielzustand,
  starteAusspielphase,
} from './engine'
import type { Spielzustand } from './engine'

function deterministischerZustand(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R55 UI-Punktestand des aktiven Spielers', () => {
  it('zeigt den aktuellen Punktestand des aktiven Spielers und aktualisiert ihn nach einer Aktion', () => {
    const startZustand = deterministischerZustand()
    const ersteLegaleAktion = ermittleLegaleAktionen(startZustand)[0]
    if (!ersteLegaleAktion) throw new Error('Erwartete mindestens eine legale Startaktion im UI.')

    const startWertung = berechneSpielzustandGesamtwertung(startZustand).spielerwertungen.find(
      eintrag => eintrag.spielerId === startZustand.spieler[startZustand.aktiverSpielerIndex].id,
    )
    if (!startWertung) throw new Error('Erwartete eine Wertung für den aktiven Startspieler.')

    render(<App initialZustand={startZustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(
      within(aktiverSpielerBereich).getByText(
        new RegExp(`Aktueller Punktestand:\\s+${startWertung.gesamtPunkte} Punkte`),
      ),
    ).toBeInTheDocument()

    const ersteAktionSchaltflaeche = within(aktionsBereich).getAllByRole('button').find(button =>
      button.textContent?.includes('Neue Schlange starten mit'),
    )
    if (!ersteAktionSchaltflaeche) throw new Error('Erwartete mindestens eine legale Startaktion im UI.')

    fireEvent.click(ersteAktionSchaltflaeche)

    const nachZustand = anwendeAktion(startZustand, ersteLegaleAktion)
    const nachAktiverSpieler = nachZustand.spieler[nachZustand.aktiverSpielerIndex]
    const nachWertung = berechneSpielzustandGesamtwertung(nachZustand).spielerwertungen.find(
      eintrag => eintrag.spielerId === nachAktiverSpieler.id,
    )
    if (!nachWertung) throw new Error('Erwartete eine Wertung für den aktiven Folgespieler.')

    expect(
      within(aktiverSpielerBereich).getByText(
        new RegExp(`Aktueller Punktestand:\\s+${nachWertung.gesamtPunkte} Punkte`),
      ),
    ).toBeInTheDocument()
  })
})
