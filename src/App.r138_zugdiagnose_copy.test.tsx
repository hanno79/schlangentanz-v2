/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R138 UI-Test für spielerfreundliche Zugdiagnose-Copy ohne rohe interne Zugphasenwerte.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

type ZugphasenFall = {
  phase: Spielzustand['zugphase']
  label: string
}

const ZUGPHASEN_FAELLE: ZugphasenFall[] = [
  { phase: 'Nachziehphase', label: 'Karte ziehen' },
  { phase: 'Ausspielphase', label: 'Karten ausspielen' },
  { phase: 'Aufgabenpruefung', label: 'Aufgaben prüfen' },
  { phase: 'Zugabschluss', label: 'Zug abschließen' },
  { phase: 'Spielende', label: 'Spiel beendet' },
]

function zustandMitZugphase(phase: Spielzustand['zugphase']): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  return {
    ...zustand,
    spielphase: phase === 'Spielende' ? 'Beendet' : zustand.spielphase,
    zugphase: phase,
  }
}

describe('R138 spielerfreundliche Zugdiagnose-Copy', () => {
  it.each(ZUGPHASEN_FAELLE)('zeigt %s ohne rohen Zugphasenwert', ({ phase, label }) => {
    render(<App initialZustand={zustandMitZugphase(phase)} />)

    const spielphaseDaten = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Spielphase' })
    const text = spielphaseDaten.textContent ?? ''

    expect(text).toContain(`Spielschritt im Zug: ${label}`)
    expect(text).not.toContain(`Spielschritt im Zug: ${phase}`)
  })
})
