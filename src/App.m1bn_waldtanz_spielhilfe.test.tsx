/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bn zieht Zugtafel und Wegweiser als kompakte Spielhilfe in die board-nahe Zugleiste.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bn Waldtanz-Spielhilfe in der Zugleiste', () => {
  it('zieht Zugtafel und Wegweiser auf /game in die board-nahe Zugleiste statt unter den Aktionsfallback', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const zugleiste = within(spieltisch).getByLabelText('Zugleiste')
    const spielhilfe = within(zugleiste).getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })
    const zugtafel = within(spielhilfe).getByRole('region', { name: 'Waldtanz-Zugtafel' })
    const wegweiser = within(spielhilfe).getByRole('region', { name: 'Spielerführung' })
    const aktionen = screen.getByRole('region', { name: 'Aktionen' })

    expect(spielhilfe).toHaveClass('waldtanz-spielhilfe')
    expect(within(wegweiser).getByText('Waldtanz-Wegweiser')).toBeVisible()
    expect(within(wegweiser).getByText('Eine spielbare Aktion auswählen.')).toBeVisible()
    expect(within(wegweiser).getByRole('link', { name: 'Zur empfohlenen Aktion im Aktionsbereich' })).toBeVisible()
    expect(zugtafel.compareDocumentPosition(wegweiser) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(spielhilfe.compareDocumentPosition(aktionen) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    const empfohlen = within(aktionen).getByRole('region', { name: 'Empfohlene Aktion' })
    fireEvent.click(within(empfohlen).getByRole('button', { name: /Neue Schlange starten/ }))
    expect(within(zugtafel).getByText(/Letzte Aktion:/)).toBeVisible()
    expect(within(zugtafel).getByText(/Neue Schlange starten/)).toBeVisible()
    expect(within(zugtafel).getByText('1 Schlange')).toBeVisible()
  })

  it('zeigt die board-nahe Zugtafel auf /game auch waehrend eines KI-Zugs', () => {
    window.history.pushState({}, '', '/game')
    const zustand = startZustand()
    zustand.aktiverSpielerIndex = 1
    render(<App initialZustand={zustand} />)

    const zugleiste = within(screen.getByRole('region', { name: 'Spieltisch' })).getByLabelText('Zugleiste')
    const spielhilfe = within(zugleiste).getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })

    expect(within(spielhilfe).getByRole('region', { name: 'Waldtanz-Zugtafel' })).toBeVisible()
    expect(within(spielhilfe).queryByRole('region', { name: 'Spielerführung' })).toBeNull()
  })

  it('laesst die klassische Aktiver-Spieler-Reihenfolge ausserhalb von /game unverändert', () => {
    render(<App initialZustand={startZustand()} />)

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const zugtafel = within(aktiverSpieler).getByRole('region', { name: 'Waldtanz-Zugtafel' })
    const wegweiser = within(aktiverSpieler).getByRole('region', { name: 'Spielerführung' })
    const zugleiste = within(aktiverSpieler).getByLabelText('Zugleiste')

    expect(within(zugleiste).queryByRole('complementary', { name: 'Waldtanz-Spielhilfe' })).toBeNull()
    expect(zugtafel.closest('.waldtanz-spielhilfe')).toBeNull()
    expect(wegweiser.closest('.waldtanz-spielhilfe')).toBeNull()
  })

  it('legt den kompakten Google-Stitch-CSS-Vertrag fuer die board-nahe Spielhilfe ab', () => {
    expect(cssBlock('.waldtanz-spielhilfe')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.waldtanz-spielhilfe')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('.waldtanz-spielhilfe')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-spielhilfe"]')).toMatch(/max-height:\s*clamp\(4\.8rem,\s*10vh,\s*5\.8rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-spielhilfe"]')).toMatch(/overflow:\s*hidden/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-spielhilfe"] [class~="spielerfuehrung__checkliste"]')).toMatch(/display:\s*none/)
    expect(appCss).not.toMatch(/\[class~="waldtanz-spielhilfe"\][^{]+waldtanz-zugtafel__(pflicht|chips|aktion|quest)[^{]+\{\s*display:\s*none/s)
  })
})
