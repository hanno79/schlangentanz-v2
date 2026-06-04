/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F18 UI-Test für die direkte Verbindung zwischen Spielerführung und empfohlener Aktion im Aktionsbereich.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { EMPFOHLENE_AKTION_ID, PHASENAKTION_ID } from './components/AktionenPanel'
import { farbkarte, sonderkarte } from './engine/__tests__/testHelpers'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function zustandMitPhasenaktionUndWeitererLegalerAktion() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const aktiverSpieler = zustand.spieler[0]

  aktiverSpieler.hand = [sonderkarte('f18-farbenschutz', 'Farbenschutz')]
  aktiverSpieler.schlangen = [{
    id: 'schlange-spieler-1-1',
    zustand: 'aktiv',
    karten: [farbkarte('f18-rot-karte', 'Rot')],
  }]
  zustand.zugpflichten.gespielteKarten = 1
  zustand.zugpflichten.gespielteFarbkarten = 1
  zustand.zugpflichten.gespielteSonderkarten = 0

  return zustand
}

function erwarteVerbindungZurAktion(
  zielRegionName: 'Empfohlene Aktion' | 'Phasenaktion',
  zielId: string,
  sprungzielText: 'empfohlenen Aktion' | 'Phasenaktion',
  zielButtonName?: RegExp,
) {
  const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
  const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })
  const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
  const zielRegion = within(aktionenBereich).getByRole('region', { name: zielRegionName })
  const sprunglink = within(spielerfuehrung).getByRole('link', {
    name: `Zur ${sprungzielText} im Aktionsbereich`,
  })

  expect(sprunglink).toHaveAttribute('href', `#${zielId}`)
  expect(sprunglink).toHaveClass('spielerfuehrung__aktionslink')
  expect(zielRegion).toHaveAttribute('id', zielId)
  if (zielButtonName) {
    expect(within(zielRegion).getByRole('button', { name: zielButtonName })).toBeInTheDocument()
  }
  expect(within(spielerfuehrung).getByText('Mini-Checkliste für deinen Zug')).toBeInTheDocument()
}

describe('F18 Spielerführung und Aktionsbereich verbinden', () => {
  it('verlinkt die Spielerführung sichtbar zur empfohlenen Aktion im Aktionsbereich', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    erwarteVerbindungZurAktion('Empfohlene Aktion', EMPFOHLENE_AKTION_ID, 'empfohlenen Aktion', /Neue Schlange starten mit Karte blau-01/i)
  })

  it('priorisiert im gemischten Zustand die sichtbare Phasenaktion als Sprungziel', () => {
    render(<App initialZustand={zustandMitPhasenaktionUndWeitererLegalerAktion()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktionenBereich).getByRole('button', { name: /Farbenschutz mit Karte f18-farbenschutz/i })).toBeInTheDocument()
    erwarteVerbindungZurAktion('Phasenaktion', PHASENAKTION_ID, 'Phasenaktion', /Ausspielphase beenden/i)
  })
})
