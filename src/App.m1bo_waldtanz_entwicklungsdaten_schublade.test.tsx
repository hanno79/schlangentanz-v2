/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bo demotet Entwicklungsdaten auf /game zur kompakten Schublade, damit das Spielbrett dominiert.
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
  it('klappt Entwicklungsdaten auf /game ein und lässt die körperlichen Spielflächen sichtbar', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const wertung = screen.getByRole('region', { name: 'Wertung' })

    const debugSchubladen = [
      detailsZu(spielstatus, 'Spielphase'),
      detailsZu(aktiverSpieler, 'Aktiver Spieler'),
      detailsZu(spieleruebersicht, 'Spielerstatus'),
      detailsZu(material, 'Karten und Aufgaben'),
      detailsZu(wertung, 'Punkteübersicht'),
    ]

    for (const details of debugSchubladen) {
      expect(details).not.toHaveAttribute('open')
      expect(details.closest('.debug-gruppe-entwicklungsdaten')).toHaveClass('debug-gruppe-entwicklungsdaten--spielschublade')
      const summary = details.querySelector('summary')
      expect(summary).not.toBeNull()
      expect(within(summary as HTMLElement).getByText(/Spielphase|Aktiver Spieler|Spielerstatus|Karten und Aufgaben|Punkteübersicht/)).toBeVisible()
    }

    expect(within(spielstatus).getByRole('group', { name: 'Waldtanz-Sonnenstand' })).toBeVisible()
    expect(within(aktiverSpieler).getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })).toBeVisible()
    expect(within(aktiverSpieler).getByRole('region', { name: 'Schlangenbereich' })).toBeVisible()
    expect(within(spieleruebersicht).getByRole('group', { name: 'Waldtanz-Spielerbänke' })).toBeVisible()
    expect(within(material).getByRole('region', { name: 'Waldtanz-Materialrucksack' })).toBeVisible()
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
