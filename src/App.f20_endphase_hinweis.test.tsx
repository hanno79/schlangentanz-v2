/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F20 UI-Test für den sichtbaren Endphase-Hinweis im Aktionsbereich.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandImEndspurt(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)

  return {
    ...zustand,
    spielphase: 'Endspurt',
    zugphase: 'Nachziehphase',
    endrunde: {
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [0],
    },
  }
}

describe('F20 Nachziehstapel-Endphase', () => {
  it('zeigt im Aktionsbereich eine sichtbare Endphase mit der No-Draw-Regel', () => {
    render(<App initialZustand={zustandImEndspurt()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Legale Aktionen' })
    const endphaseBereich = within(aktionenBereich).getByRole('region', { name: 'Endphase' })

    expect(within(endphaseBereich).getByText('Endphase')).toBeInTheDocument()
    expect(within(endphaseBereich).getByText(/Der letzte Zieher hat den Nachziehstapel geleert\./i)).toBeInTheDocument()
    expect(
      within(endphaseBereich).getByText(/genau noch einen Zug ohne Nachziehen\./i),
    ).toBeInTheDocument()
  })

  it('zeigt den Endphase-Hinweis im Normalspiel nicht an', () => {
    render(<App initialZustand={erstelleSpielzustand(2, () => 0.999999)} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Legale Aktionen' })

    expect(within(aktionenBereich).queryByRole('region', { name: 'Endphase' })).toBeNull()
  })
})
