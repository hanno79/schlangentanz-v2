/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M2h macht ausstehende Farbenschutz-Reaktionen als board-nahes Waldtanz-Schild spielbar statt nur als Buttonliste.
 */
/// <reference types="node" />

import { fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function schlangenblockadeReaktionZustand({ mitFarbenschutz = true } = {}) {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.zugpflichten.gespielteKarten = 1
  zustand.spieler[0].hand = [sonderkarte('angriff-m2h', 'Schlangenblockade')]
  zustand.spieler[0].schlangen = [schlange([farbkarte('angreifer-gruen-m2h', 'Grün')], 'angreifer-pfad-m2h')]
  zustand.spieler[1].hand = mitFarbenschutz ? [sonderkarte('farbenschutz-m2h', 'Farbenschutz')] : []
  zustand.spieler[1].schlangen = [schlange([farbkarte('ziel-blau-m2h', 'Blau')], 'ziel-pfad-m2h')]
  zustand.pendingReaktion = {
    typ: 'SchlangenblockadeAbwehr',
    angreifenderSpielerIndex: 0,
    zielSpielerIndex: 1,
    zielSchlangenId: 'ziel-pfad-m2h',
    blockadeKartenId: 'blockade-m2h',
  }
  return zustand
}

describe('M2h Waldtanz-Reaktionsschild', () => {
  it('zeigt Farbenschutz-Abwehr und Durchlassen direkt im Zugkompass und löst die Abwehr über die Engine aus', () => {
    render(<App initialZustand={schlangenblockadeReaktionZustand()} />)

    const { spieltisch } = ermittleSpielbereiche()
    const kompass = within(spieltisch).getByRole('region', { name: 'Zugkompass' })
    const schild = within(kompass).getByRole('region', { name: 'Waldtanz-Reaktionsschild' })

    expect(schild).toHaveClass('zugkompass__reaktionsschild')
    expect(within(schild).getByText('Farbenschutz bereit')).toBeVisible()
    expect(within(schild).getByText('Spieler 2 verteidigt ziel-pfad-m2h gegen Schlangenblockade.')).toBeVisible()
    expect(within(schild).getByText('Farbenschutzkarte: farbenschutz-m2h')).toBeVisible()
    expect(within(schild).getByRole('button', {
      name: 'Farbenschutz-Schild einsetzen: Schlangenblockade mit Farbenschutzkarte farbenschutz-m2h abwehren',
    })).toHaveClass('reaktionsschild__button--abwehr')
    expect(within(schild).getByRole('button', {
      name: 'Treffer zulassen: Schlangenblockade durchlassen',
    })).toHaveClass('reaktionsschild__button--durchlassen')
    expect(screen.getByRole('region', { name: 'Aktionen' })).toHaveTextContent('Reaktionsaktion auswählen:')

    fireEvent.click(within(schild).getByRole('button', {
      name: 'Farbenschutz-Schild einsetzen: Schlangenblockade mit Farbenschutzkarte farbenschutz-m2h abwehren',
    }))

    expect(screen.queryByRole('region', { name: 'Waldtanz-Reaktionsschild' })).toBeNull()
    expect(screen.getByText('Zuletzt ausgeführt: Schlangenblockade mit Farbenschutzkarte farbenschutz-m2h abwehren')).toBeVisible()
    expect(screen.getByText('Karten auf dem Ablagestapel: farbenschutz-m2h')).toBeVisible()
  })

  it('nennt das Reaktionsschild nicht Farbenschutz-bereit, wenn nur Durchlassen legal ist', () => {
    render(<App initialZustand={schlangenblockadeReaktionZustand({ mitFarbenschutz: false })} />)

    const { spieltisch } = ermittleSpielbereiche()
    const schild = within(within(spieltisch).getByRole('region', { name: 'Zugkompass' })).getByRole('region', { name: 'Waldtanz-Reaktionsschild' })

    expect(within(schild).queryByText('Farbenschutz bereit')).toBeNull()
    expect(within(schild).queryByText(/Farbenschutzkarte:/)).toBeNull()
    expect(within(schild).getByText('Reaktion entscheiden')).toBeVisible()
    expect(within(schild).getByText('Kein Farbenschutz auf der Hand. Du kannst den Treffer nur zulassen.')).toBeVisible()
    expect(within(schild).queryByRole('button', { name: /Farbenschutz-Schild einsetzen/ })).toBeNull()
    expect(within(schild).getByRole('button', { name: 'Treffer zulassen: Schlangenblockade durchlassen' })).toBeVisible()
  })

  it('legt den Stitch-Waldtanz-Schildstil mit 3px-Rand, Hard Shadow und getrennten Abwehr-/Durchlassen-Buttons ab', () => {
    expect(cssBlock('zugkompass__reaktionsschild')).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong)')
    expect(cssBlock('zugkompass__reaktionsschild')).toContain('box-shadow: 0 4px 0 var(--st-color-border-strong)')
    expect(cssBlock('reaktionsschild__button--abwehr')).toContain('background: var(--st-color-primary-container)')
    expect(cssBlock('reaktionsschild__button--durchlassen')).toContain('background: var(--st-color-tertiary-container, #ffbcaa)')
    expect(appCss).toMatch(/\.schlangengrube-grubenfalle__button\s*\{[^}]*scroll-margin-bottom:\s*18rem;/s)
  })
})
