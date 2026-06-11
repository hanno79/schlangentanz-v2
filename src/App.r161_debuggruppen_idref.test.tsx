/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R161 UI-Test für Debuggruppen mit sichtbaren lokalen aria-labelledby-Zielen statt separatem aria-label.
*/

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R161 Debuggruppen aria-labelledby', () => {
  it('labelt jede Debuggruppe über sichtbare lokale Badge- und Summary-Texte ohne separates aria-label', () => {
    const { container } = render(
      <>
        <App initialZustand={deterministischerZustand()} />
        <App initialZustand={deterministischerZustand()} />
      </>,
    )

    const debugGruppen = Array.from(container.querySelectorAll<HTMLElement>('.debug-gruppe-entwicklungsdaten'))

    expect(debugGruppen.length).toBeGreaterThanOrEqual(8)

    for (const debugGruppe of debugGruppen) {
      const labelIds = debugGruppe.getAttribute('aria-labelledby')?.trim().split(/\s+/) ?? []

      expect(debugGruppe).not.toHaveAttribute('aria-label')
      expect(labelIds).toHaveLength(2)

      const labelZiele = labelIds.map((labelId) => Array.from(container.querySelectorAll<HTMLElement>(`#${CSS.escape(labelId)}`)))

      for (const zielTreffer of labelZiele) {
        expect(zielTreffer).toHaveLength(1)
        expect(debugGruppe).toContainElement(zielTreffer[0])
      }

      expect(labelZiele[0][0]).toHaveClass('debug-gruppe__badge')
      expect(labelZiele[0][0]).toHaveTextContent('Entwicklungsdaten')
      expect(labelZiele[0][0]).toHaveAttribute('aria-label', 'Entwicklungsdaten:')
      expect(labelZiele[1][0].tagName).toBe('SUMMARY')
      expect(labelZiele[1][0]).toHaveTextContent(/\S/)
      expect(debugGruppe).toHaveAccessibleName(`Entwicklungsdaten: ${labelZiele[1][0].textContent}`)
    }
  })
})
