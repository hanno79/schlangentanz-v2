/*
Author: rahn
Datum: 04.06.2026
Version: 1.1
Beschreibung: F19 UI-Test für die sichtbare Hervorhebung des Sprungziels im Aktionsbereich.
Änderung v1.1: R113 – Prüfung auf statische ID durch Link-Ziel == tatsächliche Region-ID ersetzt.
*/
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { farbkarte, sonderkarte } from './engine/__tests__/testHelpers'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function zustandMitPhasenaktionUndWeitererLegalerAktion() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const aktiverSpieler = zustand.spieler[0]

  aktiverSpieler.hand = [sonderkarte('f19-farbenschutz', 'Farbenschutz')]
  aktiverSpieler.schlangen = [{
    id: 'schlange-spieler-1-1',
    zustand: 'aktiv',
    karten: [farbkarte('f19-rot-karte', 'Rot')],
  }]
  zustand.zugpflichten.gespielteKarten = 1
  zustand.zugpflichten.gespielteFarbkarten = 1
  zustand.zugpflichten.gespielteSonderkarten = 0

  return zustand
}

function erwarteSichtbareSprungzielHervorhebung(
  zielRegionName: 'Empfohlene Aktion' | 'Phasenaktion',
  linkName: 'Zur empfohlenen Aktion im Aktionsbereich' | 'Zur Phasenaktion im Aktionsbereich',
) {
  const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
  const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })
  const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
  const zielRegion = within(aktionenBereich).getByRole('region', { name: zielRegionName })
  const sprunglink = within(spielerfuehrung).getByRole('link', { name: linkName })

  expect(sprunglink).toHaveAttribute('href', `#${zielRegion.id}`)
  expect(zielRegion).not.toHaveClass('aktionen-gruppe--sprungziel')

  fireEvent.click(sprunglink)

  expect(zielRegion).toHaveClass('aktionen-gruppe--sprungziel')
}

describe('F19 Sprungziel im Aktionsbereich sichtbar hervorheben', () => {
  it('hebt die empfohlene Aktion nach Klick auf den Sprunglink sichtbar hervor', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    erwarteSichtbareSprungzielHervorhebung('Empfohlene Aktion', 'Zur empfohlenen Aktion im Aktionsbereich')
  })

  it('entfernt die alte Hervorhebung beim Wechsel von empfohlener Aktion zu Phasenaktion', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })
    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionenBereich).getByRole('region', { name: 'Empfohlene Aktion' })
    const phasenaktion = within(aktionenBereich).getByRole('region', { name: 'Phasenaktion' })

    fireEvent.click(within(spielerfuehrung).getByRole('link', { name: 'Zur empfohlenen Aktion im Aktionsbereich' }))
    expect(empfohleneAktion).toHaveClass('aktionen-gruppe--sprungziel')
    expect(phasenaktion).not.toHaveClass('aktionen-gruppe--sprungziel')

    fireEvent.click(within(empfohleneAktion).getByRole('button', { name: /Neue Schlange starten mit Wasserwirbel/i }))
    fireEvent.click(within(spielerfuehrung).getByRole('link', { name: 'Zur Phasenaktion im Aktionsbereich' }))

    expect(empfohleneAktion).not.toHaveClass('aktionen-gruppe--sprungziel')
    expect(phasenaktion).toHaveClass('aktionen-gruppe--sprungziel')
  })

  it('hebt im Phasenaktionsfall die Phasenaktion statt der empfohlenen Aktion hervor', () => {
    render(<App initialZustand={zustandMitPhasenaktionUndWeitererLegalerAktion()} />)

    erwarteSichtbareSprungzielHervorhebung('Phasenaktion', 'Zur Phasenaktion im Aktionsbereich')
  })
})
