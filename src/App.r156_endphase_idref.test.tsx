/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R156 UI-Test für die Endphase-Region mit sichtbarem, lokalem aria-labelledby-Ziel.
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

describe('R156 Endphase aria-labelledby', () => {
  it('labelt die Endphase-Region über die sichtbare Überschrift ohne separates aria-label', () => {
    const initialZustand = zustandImEndspurt()
    render(
      <>
        <App initialZustand={initialZustand} />
        <App initialZustand={initialZustand} />
      </>,
    )

    const spielbereiche = screen.getAllByRole('region', { name: 'Spielbereich' })
    const endphasen = spielbereiche.map((spielbereich) => {
      const aktionenBereich = within(spielbereich).getByRole('region', { name: 'Aktionen' })
      return within(aktionenBereich).getByRole('region', { name: 'Endphase' })
    })
    const labelIds = endphasen.map((endphase) => endphase.getAttribute('aria-labelledby'))

    expect(new Set(labelIds).size).toBe(endphasen.length)

    for (const endphase of endphasen) {
      const labelId = endphase.getAttribute('aria-labelledby')

      expect(endphase).toHaveClass('aktionen-gruppe--endphase')
      expect(endphase).not.toHaveAttribute('aria-label')
      expect(labelId).toBeTruthy()
      expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

      const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
      expect(labelZiele).toHaveLength(1)
      expect(endphase).toContainElement(labelZiele[0] as HTMLElement)
      expect(labelZiele[0]).toHaveTextContent('Endphase')
      expect(within(endphase).getByRole('heading', { name: 'Endphase', level: 3 })).toBe(labelZiele[0])
    }
  })
})
