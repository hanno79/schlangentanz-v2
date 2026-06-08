/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R75 UI-Test für die spielbare Farbenschutz-Sonderkartenaktion.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

function zustandMitFarbenschutz() {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  const farbenschutz = zustand.nachziehstapel.find(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
  )
  if (!farbenschutz) throw new Error('Testsetup erwartet Farbenschutz.')

  zustand.spieler[0].hand = [farbenschutz]
  zustand.zugphase = 'Ausspielphase'
  zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', karten: [], zustand: 'aktiv' }]

  return { zustand, farbenschutz }
}

describe('R75 Farbenschutz UI', () => {
  it('zeigt Farbenschutz als legale Aktion und markiert die Zielschlange nach Klick als geschützt', () => {
    const { zustand, farbenschutz } = zustandMitFarbenschutz()

    render(<App initialZustand={zustand} />)

    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })
    const spieleruebersichtBereich = screen.getByRole('region', { name: 'Spielerübersicht' })
    const aktionsName = `Farbenschutz mit Karte ${farbenschutz.id} auf Schlange schlange-spieler-1-1 spielen`

    expect(within(aktionsBereich).getByRole('button', { name: aktionsName })).toBeInTheDocument()

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: aktionsName }))

    expect(within(aktionsBereich).getByText('Gespielte Karten: 1/2')).toBeInTheDocument()
    expect(within(spieleruebersichtBereich).getByText('Status von Schlange spieler-1/schlange-spieler-1-1: geschuetzt')).toBeInTheDocument()
  })
})
