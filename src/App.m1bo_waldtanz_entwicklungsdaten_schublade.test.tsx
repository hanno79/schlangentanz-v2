/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.1 (M1dk-Update: Debug-Schubladen auf /game durch Phasen-Banner ersetzt)
 * Beschreibung: M1bo demotet Entwicklungsdaten auf /game zur kompakten Schublade, damit das Spielbrett dominiert.
 *              M1dk: Auf /game sind die Debug-Schubladen weg — das Brettrand-Phasen-Banner uebernimmt
 *              die Phasen-Beschilderung sichtbar am Arenakopf.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function detailsZu(bereich: HTMLElement, titel: string): HTMLDetailsElement {
  const summaryText = within(bereich).getByText(titel, { selector: 'summary span' })
  const details = summaryText.closest('details')
  expect(details).toBeInstanceOf(HTMLDetailsElement)
  return details as HTMLDetailsElement
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bo Waldtanz-Entwicklungsdaten-Schublade', () => {
  it('laesst die körperlichen Spielflächen auf /game sichtbar und ersetzt die Aktiver-Spieler-Debug-Schublade durch das Brettrand-Phasen-Banner', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    // M1cs: Auf /game sind Spielerübersicht und Material und Aufgaben ganz ausgeblendet,
    // der Brettfokus liegt auf Spieltisch, Spielstatus, Aktiver Spieler und der kompakten Wertung-Rangtafel.
    // M1dk: Die alte 'Aktiver Spieler'-Debug-Schublade (Spielerfuehrung-Wegweiser-Details) ist auf /game weg —
    // das Brettrand-Phasen-Banner uebernimmt die Phasen-Beschilderung am Arenakopf.
    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const wertung = screen.getByRole('region', { name: 'Wertung' })
    expect(() => screen.getByRole('region', { name: 'Spielerübersicht' })).toThrow()
    expect(() => screen.getByRole('region', { name: 'Material und Aufgaben' })).toThrow()

    const spielphaseDetails = detailsZu(spielstatus, 'Spielphase')
    expect(spielphaseDetails).not.toHaveAttribute('open')

    // Phasen-Banner sichtbar in der Aktiver-Spieler-Region (M1dk).
    expect(within(aktiverSpieler).getByRole('navigation', { name: 'Waldtanz-Spielphasen' })).toBeVisible()
    // Die alte WaldtanzAktiverSpielerDebug-Detail-Schublade ist auf /game weg (M1dk).
    expect(within(aktiverSpieler).queryByText('Nächster Pflichtschritt:')).toBeNull()
    expect(within(aktiverSpieler).queryByText('Geheime Aufgabe:')).toBeNull()

    expect(within(spielstatus).getByRole('group', { name: 'Waldtanz-Sonnenstand' })).toBeVisible()
    expect(within(aktiverSpieler).getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })).toBeVisible()
    expect(within(aktiverSpieler).getByRole('region', { name: 'Schlangenbereich' })).toBeVisible()
    expect(within(wertung).getByRole('region', { name: 'Waldtanz-Rangtafel' })).toBeVisible()
  })

  it('lässt die klassische offene Entwicklungsdaten-Ansicht außerhalb von /game unverändert', () => {
    render(<App initialZustand={startZustand()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })

    expect(detailsZu(spielstatus, 'Spielphase')).toHaveAttribute('open')
    expect(detailsZu(aktiverSpieler, 'Aktiver Spieler')).toHaveAttribute('open')
    expect(detailsZu(aktiverSpieler, 'Aktiver Spieler').closest('.debug-gruppe-entwicklungsdaten')).not.toHaveClass('debug-gruppe-entwicklungsdaten--spielschublade')
  })

  it('legt den Google-Stitch-CSS-Vertrag fuer kompakte Debug-Schubladen ab', () => {
    expect(cssBlock('.debug-gruppe-entwicklungsdaten--spielschublade')).toMatch(/border:\s*2px solid rgba\(6, 57, 7, 0\.38\)/)
    expect(cssBlock('.debug-gruppe-entwicklungsdaten--spielschublade')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('.debug-gruppe-entwicklungsdaten--spielschublade')).toMatch(/background:\s*rgba\(236, 255, 227, 0\.54\)/)
    expect(cssBlock('.spielbereich--game-route [class~="debug-gruppe-entwicklungsdaten--spielschublade"]')).toMatch(/margin-top:\s*0\.35rem/)
    expect(cssBlock('.debug-gruppe-entwicklungsdaten--spielschublade [class~="debug-gruppe"] > summary')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
  })
})
