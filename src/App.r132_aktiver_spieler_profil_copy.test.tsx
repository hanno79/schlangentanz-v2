/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R132 UI-Test für spielerfreundliche Aktiver-Spieler-Entwicklungsdaten ohne rohe Spieler-IDs.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { beendeAufgabenpruefung, beendeAusspielphase, beendeZug, erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function erwarteterZustandNachZugwechsel() {
  const start = deterministischerZustand()
  const nachAusspielen = beendeAusspielphase({
    ...start,
    zugpflichten: { ...start.zugpflichten, gespielteKarten: 1, gespielteFarbkarten: 1 },
  })
  return beendeZug(beendeAufgabenpruefung(nachAusspielen, { aufgabenGeprueft: true }), { pflichtenErfuellt: true })
}

describe('R132 spielerfreundliche Aktiver-Spieler-Entwicklungsdaten', () => {
  it('benennt den aktiven Spieler mit Namen und Zughinweis statt roher ID oder Steuerungswert', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpieler = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Aktiver Spieler' })
    const text = aktiverSpieler.textContent ?? ''

    expect(within(aktiverSpieler).getByText('Aktiver Spieler: Spieler 1')).toBeVisible()
    expect(within(aktiverSpieler).getByText('Spielerprofil: Spieler 1 — Du bist am Zug.')).toBeVisible()
    expect(text).not.toMatch(/\bspieler-\d+\b/)
    expect(text).not.toMatch(/\((Mensch|KI)\)/)
    expect(text).not.toMatch(/Spielerprofil:\s*spieler-/)
  })

  it('bleibt nach Zugwechsel im Aktiver-Spieler-Bereich bei Name und KI-Zughinweis', () => {
    const erwarteterFolgezustand = erwarteterZustandNachZugwechsel()
    const erwarteterAktiverSpieler = erwarteterFolgezustand.spieler[erwarteterFolgezustand.aktiverSpielerIndex]!
    render(<App initialZustand={deterministischerZustand()} />)

    const bereich = screen.getByRole('region', { name: /legale aktionen/i })
    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /ausspielphase beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /aufgabenprüfung beenden/i }))
    fireEvent.click(within(bereich).getByRole('button', { name: /zug beenden/i }))

    const aktiverSpieler = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Aktiver Spieler' })
    const text = aktiverSpieler.textContent ?? ''

    expect(within(aktiverSpieler).getByText(`Aktiver Spieler: ${erwarteterAktiverSpieler.name}`)).toBeVisible()
    expect(within(aktiverSpieler).getByText(`Spielerprofil: ${erwarteterAktiverSpieler.name} — KI ist am Zug.`)).toBeVisible()
    expect(text).not.toMatch(/\bspieler-\d+\b/)
    expect(text).not.toMatch(/\((Mensch|KI)\)/)
    expect(text).not.toMatch(/Spielerprofil:\s*spieler-/)
  })
})
