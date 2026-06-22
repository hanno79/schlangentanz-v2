/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M5d beweist einen board-nahen Zugkompass, der Phasenwechsel als Spielablauf statt als verstreute Buttonliste führt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function vierSpielerZustand() {
  return starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
}

function pendingReaktionZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.aktiverSpielerIndex = 1
  zustand.zugpflichten.gespielteKarten = 1
  zustand.spieler[0].hand = [sonderkarte('farbenschutz-m5d', 'Farbenschutz')]
  zustand.spieler[0].schlangen = [schlange([farbkarte('rot-m5d', 'Rot')], 'schlange-spieler-1-1')]
  zustand.pendingReaktion = {
    typ: 'SchlangenblockadeAbwehr',
    angreifenderSpielerIndex: 1,
    zielSpielerIndex: 0,
    zielSchlangenId: 'schlange-spieler-1-1',
    blockadeKartenId: 'blockade-m5d',
  }
  return zustand
}

function pendingReaktionBeimMenschenZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.zugpflichten.gespielteKarten = 1
  zustand.spieler[1].hand = [sonderkarte('farbenschutz-m5d-ki', 'Farbenschutz')]
  zustand.spieler[1].schlangen = [schlange([farbkarte('blau-m5d', 'Blau')], 'schlange-spieler-2-1')]
  zustand.pendingReaktion = {
    typ: 'SchlangenblockadeAbwehr',
    angreifenderSpielerIndex: 0,
    zielSpielerIndex: 1,
    zielSchlangenId: 'schlange-spieler-2-1',
    blockadeKartenId: 'blockade-m5d-mensch',
  }
  return zustand
}

function zugkompass() {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
  return within(spieltisch).getByRole('region', { name: 'Zugkompass' })
}

describe('M5d Zugkompass', () => {
  it('führt den Phasenfluss board-nah vom eigenen Zug bis zurück nach den Gegnerzügen', () => {
    render(<App initialZustand={vierSpielerZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const pfad = within(spieltisch).getByRole('region', { name: 'Zugpfad' })
    const kompass = zugkompass()
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const aktionen = screen.getByRole('region', { name: 'Aktionen' })

    expect(kompass).toHaveClass('zugkompass')
    expect(within(kompass).getByRole('heading', { name: 'Zugkompass' })).toBeInTheDocument()
    expect(within(kompass).getByText('Du bist dran')).toBeInTheDocument()
    expect(within(kompass).getByText('Karten ausspielen')).toBeInTheDocument()
    expect(within(kompass).getByText(/Wähle eine Handkarte und spiele sie direkt im Schlangenbereich/i)).toBeInTheDocument()
    expect(within(kompass).queryByRole('button', { name: /Weiter/ })).toBeNull()
    // M1d0 22.06.2026: Visuelle Reihenfolge = DOM-Reihenfolge. Pfad und Kompass
    // sitzen beide in der Zugseitenleiste (unter Arenastein). Schlangenbereich
    // sitzt im Arenastein (ueber Zugseitenleiste) und kommt daher im DOM ZUERST.
    expect(schlangenbereich.compareDocumentPosition(pfad) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(schlangenbereich.compareDocumentPosition(kompass) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    // Pfad und Kompass: in Zugseitenleiste, Pfad kommt visuell vor Kompass.
    expect(pfad.compareDocumentPosition(kompass) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(within(aktionen).getByRole('button', { name: /Neue Schlange starten mit Karte blau-01/i })).toBeVisible()

    fireEvent.click(within(aktionen).getByRole('button', { name: /Neue Schlange starten mit Karte blau-01/i }))
    fireEvent.click(within(zugkompass()).getByRole('button', { name: 'Weiter zur Aufgabenprüfung' }))
    expect(within(zugkompass()).getByText('Aufgaben prüfen')).toBeInTheDocument()

    fireEvent.click(within(zugkompass()).getByRole('button', { name: 'Weiter zum Zugabschluss' }))
    expect(within(zugkompass()).getByText('Zug abschließen')).toBeInTheDocument()

    fireEvent.click(within(zugkompass()).getByRole('button', { name: 'Zug an nächsten Spieler geben' }))
    expect(within(zugkompass()).getByText('KI ist am Zug')).toBeInTheDocument()
    expect(within(zugkompass()).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).toBeVisible()

    fireEvent.click(within(zugkompass()).getByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' }))
    expect(within(zugkompass()).getByText('Du bist dran')).toBeInTheDocument()
    expect(within(zugkompass()).getByText('Gegnerzug abgeschlossen. Du bist wieder dran.')).toBeInTheDocument()

    expect(cssBlock('zugkompass')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('zugkompass')).toMatch(/border-radius:\s*2rem/)
    expect(cssBlock('zugkompass')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.zugkompass__aktionen[\s\S]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(10rem,\s*1fr\)\)/)
  })

  it('blockiert normale Phasenweiterführung solange eine Reaktion aussteht', () => {
    render(<App initialZustand={pendingReaktionZustand()} />)

    const kompass = zugkompass()
    expect(within(kompass).getByText('Reaktion steht aus')).toBeInTheDocument()
    expect(within(kompass).getByText(/Wähle zuerst eine Reaktionsaktion/i)).toBeInTheDocument()
    expect(within(kompass).queryByRole('button', { name: 'Weiter zur Aufgabenprüfung' })).toBeNull()
    expect(within(kompass).queryByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).toBeNull()

    const aktionen = screen.getByRole('region', { name: 'Aktionen' })
    expect(within(aktionen).getByText('Reaktionsaktion auswählen:')).toBeInTheDocument()
    expect(within(aktionen).queryByRole('button', { name: 'Ausspielphase beenden' })).toBeNull()
    expect(within(aktionen).queryByRole('button', { name: 'Gegnerzüge bis zu deinem Zug abspielen' })).toBeNull()
  })

  it('verweist die Spielerführung bei ausstehender Reaktion nicht auf die Phasenaktion', () => {
    render(<App initialZustand={pendingReaktionBeimMenschenZustand()} />)

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spielerfuehrung = within(aktiverSpieler).getByRole('region', { name: 'Spielerführung' })
    expect(within(spielerfuehrung).getByText('Reaktionsaktion auswählen.')).toBeInTheDocument()
    expect(within(spielerfuehrung).queryByRole('link', { name: 'Zur Phasenaktion im Aktionsbereich' })).toBeNull()
    expect(within(spielerfuehrung).getByText('Im Aktionsbereich gibt es aktuell kein Springziel.')).toBeInTheDocument()
  })
})
