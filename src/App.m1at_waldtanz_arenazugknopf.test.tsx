/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1at legt den wichtigsten Phasen-/End-Turn-Knopf als Stitch-artige Brettkante neben die Hand.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase, type Spielkarte, type Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selector: string) => appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function vierSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
}

const roteKarte = (index: number): Spielkarte => ({ typ: 'Farbkarte', id: `rot-m1at-${index}`, farbe: 'Rot', punkte: index })

function zustandMitSammelbarerQuest(): Spielzustand {
  const zustand = vierSpielerZustand()
  const farbkombination = aufgabenPool.find(aufgabe => aufgabe.id === 'aufgabe-03')!
  const farbvielfalt = aufgabenPool.find(aufgabe => aufgabe.id === 'aufgabe-04')!
  zustand.zugphase = 'Aufgabenpruefung'
  zustand.zugpflichten.gespielteKarten = 1
  zustand.offeneAufgaben = [farbkombination, farbvielfalt]
  zustand.spieler[zustand.aktiverSpielerIndex].schlangen = [{ id: 'quest-schlange-m1at', zustand: 'aktiv', karten: [1, 2, 3, 4, 5].map(roteKarte) }]
  return zustand
}

describe('M1at Waldtanz-Arenazugknopf', () => {
  it('setzt die naechste Phasenaktion als grossen End-Turn-Knopf direkt an die Handkante des Bretts', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={vierSpielerZustand()} />)

    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    fireEvent.click(within(aktionen).getByRole('button', { name: /Neue Schlange starten mit Wasserwirbel/i }))

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const hand = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const arenazug = within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugaktion' })
    const hauptknopf = within(arenazug).getByRole('button', { name: 'Weiter zur Aufgabenprüfung' })

    expect(arenazug).toHaveClass('waldtanz-arenazug')
    expect(hand.compareDocumentPosition(arenazug) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(within(arenazug).getByText('End Turn')).toBeInTheDocument()
    expect(within(arenazug).getByText('Dein Brettzug ist bereit.')).toBeInTheDocument()
    expect(hauptknopf).toHaveClass('waldtanz-arenazug__hauptknopf')
    expect(within(hauptknopf).getByText('Weiter zur Aufgabenprüfung')).toBeInTheDocument()
    expect(within(aktionen).queryByRole('button', { name: 'Ausspielphase beenden' })).toBeNull()
    expect(within(spieltisch).getByRole('region', { name: 'Zugkompass' })).not.toHaveTextContent('Weiter zur Aufgabenprüfung')
    expect(screen.getByRole('link', { name: 'Zur Brett-Zugaktion am Spieltisch' })).toHaveAttribute('href', `#${arenazug.id}`)

    fireEvent.click(hauptknopf)
    expect(within(arenazug).getByRole('button', { name: 'Weiter zum Zugabschluss' })).toHaveClass('waldtanz-arenazug__hauptknopf')
  })

  it('laesst beim KI-Zug die Zugbühne statt der Arena-Brettkante vorspulen', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={vierSpielerZustand()} />)

    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    fireEvent.click(within(aktionen).getByRole('button', { name: /Neue Schlange starten mit Wasserwirbel/i }))

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenazug = within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugaktion' })
    fireEvent.click(within(arenazug).getByRole('button', { name: 'Weiter zur Aufgabenprüfung' }))
    fireEvent.click(within(arenazug).getByRole('button', { name: 'Weiter zum Zugabschluss' }))
    fireEvent.click(within(arenazug).getByRole('button', { name: 'Zug an nächsten Spieler geben' }))

    expect(within(arenazug).queryByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).toBeNull()
    expect(within(arenazug).getByText('Gegnerzug läuft über die Zugbühne.')).toBeVisible()
    const gegnerzug = within(spieltisch).getByRole('region', { name: 'Gegnerzug' })
    fireEvent.click(within(gegnerzug).getByRole('button', { name: 'Gegnerzug am Brett abspielen' }))
    expect(within(gegnerzug).getByText('Gegnerzug abgeschlossen. Du bist wieder dran.')).toBeVisible()
    expect(within(aktionen).queryByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).toBeNull()
  })

  it('macht auf /game die Arena-Zugaktion zum einzigen primaeren Aufgabenpruefungs-Fortschritt', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitSammelbarerQuest()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const aufgabentafel = within(spieltisch).getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const arenazug = within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugaktion' })

    expect(within(aufgabentafel).getByText('Bereit zum Einsammeln')).toBeVisible()
    expect(within(aufgabentafel).queryByRole('button', { name: /Questkarte .* einsammeln/ })).toBeNull()
    expect(within(arenazug).getByRole('button', { name: 'Weiter zum Zugabschluss' })).toHaveClass('waldtanz-arenazug__hauptknopf')
  })

  it('schuetzt den Stitch-Brettkanten-Vertrag fuer den prominenten Zugknopf', () => {
    expect(cssBlock('.waldtanz-arenazug')).toMatch(/display:\s*flex/)
    expect(cssBlock('.waldtanz-arenazug')).toMatch(/justify-content:\s*flex-end/)
    expect(cssBlock('.waldtanz-arenazug__hauptknopf')).toMatch(/background:\s*var\(--st-color-tertiary-container\)/)
    expect(cssBlock('.waldtanz-arenazug__hauptknopf')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.waldtanz-arenazug__hauptknopf')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('.waldtanz-arenazug__hauptknopf')).toMatch(/box-shadow:\s*0 6px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('.waldtanz-arenazug__hauptknopf:active')).toMatch(/transform:\s*translateY\(5px\)/)
    // M1d0 22.06.2026: Arenazugknopf ist jetzt Teil der benannten Grid-Areas-
    // Bottom-Row "sp-plakette hand arenazug" mit grid-area: arenazug statt
    // grid-row: 5 + justify-self: end. Die Positionierung ergibt sich aus
    // dem Grid-Flow; die volle Breite/Zentrierung ersetzt das end-Alignment.
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenazug"]')).toMatch(/grid-area:\s*arenazug/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenazug"]')).toMatch(/justify-self:\s*stretch/)
  })
})
