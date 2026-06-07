/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R109 UI-Regressionstest — Schlangenbereich nutzt DOM-sichere aria-describedby-IDREFs unabhängig von fachlichen Spieler- und Schlangen-IDs.
# ÄNDERUNG 07.06.2026: Regression gegen aria-describedby-Token-Splitting bei Leerzeichen-IDs ergänzt.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpieltischMitEineSchlange } from './testUtils'

function zustandMitLeerzeichenIdsImSchlangenbereich(): Spielzustand {
  const { zustand } = erstelleSpieltischMitEineSchlange('schlange r109 mit leerzeichen')

  return {
    ...zustand,
    spieler: zustand.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            id: 'spieler r109 mit leerzeichen',
            name: 'Spieler R109 mit Leerzeichen',
          }
        : spieler,
    ),
  }
}

function erwarteEinDomSicheresBeschreibungsziel(element: HTMLElement, erwarteterText: string) {
  const beschreibungsIds = element.getAttribute('aria-describedby')?.split(/\s+/) ?? []

  expect(beschreibungsIds).toHaveLength(1)
  const beschreibung = document.getElementById(beschreibungsIds[0])
  expect(beschreibung).not.toBeNull()
  expect(element).toHaveAccessibleDescription(expect.stringContaining(erwarteterText))
}

describe('R109 Schlangenbereich DOM-sichere IDREFs', () => {
  it('verknüpft Startzone und eigene Schlange auch bei Leerzeichen-IDs mit je einem echten Beschreibungselement', () => {
    render(<App initialZustand={zustandMitLeerzeichenIdsImSchlangenbereich()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })
    const eigeneSchlange = within(eigeneGruppe).getByRole('button', {
      name: 'Schlange schlange r109 mit leerzeichen',
    })

    erwarteEinDomSicheresBeschreibungsziel(
      startzone,
      'Ziehe eine Farbkarte hierher oder klicke die passende Start-Schaltfläche.',
    )
    erwarteEinDomSicheresBeschreibungsziel(
      eigeneSchlange,
      'Klicke auf eine Anlege-Schaltfläche oder lege die ausgewählte Karte direkt auf die Schlange.',
    )
  })
})
