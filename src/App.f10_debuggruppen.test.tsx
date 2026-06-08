/*
Author: rahn
Datum: 08.06.2026
Version: 2.0
Beschreibung: F10 UI-Test für gruppierte und einklappbare Debug-/State-Anzeigen.
Änderung R118: Summary-Titel ohne "Debug:"-Präfix; getByText mit selector:'summary' für Eindeutigkeit.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function erwarteOffeneDebugGruppe(bereich: HTMLElement, titel: string): HTMLElement {
  const summary = within(bereich).getByText(titel, { selector: 'summary' })
  const details = summary.closest('details')

  expect(summary.tagName).toBe('SUMMARY')
  expect(details).not.toBeNull()
  expect(details).toHaveAttribute('open')
  expect(details).toHaveClass('debug-gruppe')

  return details as HTMLElement
}

function erwarteAusserhalbVonDebuggruppe(element: HTMLElement): void {
  expect(element.closest('details.debug-gruppe')).toBeNull()
}

describe('F10 Debuggruppen', () => {
  it('gruppiert die Debug- und State-Anzeigen als offene, einklappbare Bereiche ohne bestehende Anker zu entfernen', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const statusDebug = erwarteOffeneDebugGruppe(spielstatus, 'Phasenstatus')
    expect(within(statusDebug).getByText(/Engine-Demo:/)).toBeInTheDocument()
    expect(within(statusDebug).getByText(/Zugphase:/)).toBeInTheDocument()
    expect(within(statusDebug).getByText(/Spieler am Zug:/)).toBeInTheDocument()
    erwarteAusserhalbVonDebuggruppe(within(spielstatus).getByRole('region', { name: 'Zugfortschritt' }))

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktiverDebug = erwarteOffeneDebugGruppe(aktiverSpieler, 'Aktiver Spieler')
    expect(within(aktiverDebug).getByText(/Aktiver Spieler-Details:/)).toBeInTheDocument()
    expect(within(aktiverDebug).queryByText(/Handkarten:/)).toBeNull()
    expect(within(aktiverDebug).queryByText(/Handkarten-Details:/)).toBeNull()

    const spieltisch = within(aktiverSpieler).getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    expect(within(handBereich).getByText(/Handkarten als Kartenleiste/)).toBeInTheDocument()
    erwarteAusserhalbVonDebuggruppe(handBereich)

    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    const spielerDebug = erwarteOffeneDebugGruppe(spieleruebersicht, 'Spielerzustände')
    expect(within(spielerDebug).getByText(/Spielerübersicht spieler-1:/)).toBeInTheDocument()
    expect(within(spielerDebug).getByText(/Schlangenübersicht spieler-1:/)).toBeInTheDocument()
    expect(within(spielerDebug).getByText(/Handkarten gesamt:/)).toBeInTheDocument()

    const spieltischBereich = screen.getByRole('region', { name: 'Spieltisch' })
    erwarteAusserhalbVonDebuggruppe(within(spieltischBereich).getByRole('region', { name: 'Schlangenbereich' }))

    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const materialDebug = erwarteOffeneDebugGruppe(material, 'Materialstatus')
    expect(within(materialDebug).getByText(/Ablagestapel:/)).toBeInTheDocument()
    expect(within(materialDebug).getByText(/Nachziehstapel:/)).toBeInTheDocument()
    expect(within(materialDebug).getByText(/Offene Aufgaben-Details:/)).toBeInTheDocument()
    erwarteAusserhalbVonDebuggruppe(within(material).getByRole('region', { name: 'Aufgabenkarten' }))

    const wertung = screen.getByRole('region', { name: 'Wertung' })
    const wertungDebug = erwarteOffeneDebugGruppe(wertung, 'Wertungsdetails')
    expect(within(wertungDebug).getByText(/Wertung spieler-1:/)).toBeInTheDocument()
    expect(within(wertungDebug).getByText(/Wertungsdetails spieler-1:/)).toBeInTheDocument()
    erwarteAusserhalbVonDebuggruppe(within(wertung).getByRole('region', { name: 'Scoreboard' }))
  })
})
