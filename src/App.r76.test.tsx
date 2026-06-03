/*
Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: R76 UI-Test für den Verdoppler-Bonus im Zugzähler und die anschließende Folgeaktion.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

function zustandMitVerdopplerUndFolgekarte() {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  const verdoppler = zustand.nachziehstapel.find(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Verdoppler',
  )
  const folgekarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Farbkarte')

  if (!verdoppler) throw new Error('Testsetup erwartet Verdoppler.')
  if (!folgekarte) throw new Error('Testsetup erwartet eine Farbkarte.')

  zustand.spieler[0].hand = [verdoppler, folgekarte]
  zustand.zugphase = 'Ausspielphase'

  return { zustand, verdoppler, folgekarte }
}

describe('R76 Verdoppler UI', () => {
  it('zeigt nach Verdoppler den Bonus-Zugzähler 1/3 und erlaubt eine zweite Aktion', () => {
    const { zustand, verdoppler, folgekarte } = zustandMitVerdopplerUndFolgekarte()

    render(<App initialZustand={zustand} />)

    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })
    const verdopplerName = `Verdoppler mit Karte ${verdoppler.id} spielen`
    const folgekartenName = `Neue Schlange starten mit Karte ${folgekarte.id}`

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: verdopplerName }))
    fireEvent.click(within(aktionsBereich).getByRole('button', { name: 'Verdoppler durchlassen' }))

    expect(within(aktionsBereich).getByText('Gespielte Karten: 1/3')).toBeInTheDocument()
    expect(
      within(aktionsBereich).getByText('Pro Zug höchstens 2 Farbkarten und höchstens 2 Sonderkarten.'),
    ).toBeInTheDocument()
    expect(within(aktionsBereich).getByRole('button', { name: folgekartenName })).toBeInTheDocument()

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: folgekartenName }))

    expect(within(aktionsBereich).getByText('Gespielte Karten: 2/3')).toBeInTheDocument()
  })
})
