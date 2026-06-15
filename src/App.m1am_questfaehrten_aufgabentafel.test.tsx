/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1am zeigt Quest-Fährten direkt auf der Waldtanz-Aufgabentafel statt nur offene Aufgaben als Textkarten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function aufgabe(name: string) {
  const treffer = aufgabenPool.find((eintrag) => eintrag.name === name)
  if (!treffer) throw new Error(`Testsetup erwartet Aufgabe ${name}.`)
  return treffer
}

function questfaehrtenZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.offeneAufgaben = [aufgabe('Farbenpracht'), aufgabe('Farbkombination'), aufgabe('Farbwechsler')]
  zustand.spieler[0].schlangen = [
    schlange([
      farbkarte('blau-paar-1-m1am', 'Blau', 2),
      farbkarte('blau-paar-2-m1am', 'Blau', 3),
      farbkarte('rot-kette-m1am', 'Rot', 4),
      farbkarte('gruen-kette-m1am', 'Grün', 5),
      farbkarte('violett-kette-m1am', 'Violett', 6),
    ], 'questpfad-m1am'),
    schlange([
      farbkarte('gelb-paar-1-m1am', 'Gelb', 2),
      farbkarte('gelb-paar-2-m1am', 'Gelb', 3),
    ], 'schatzpfad-m1am'),
  ]
  return zustand
}

function questkarte(aufgabentafel: HTMLElement, name: string) {
  const titel = within(aufgabentafel).getByText(name)
  const karte = titel.closest('li')
  if (!karte) throw new Error(`Questkarte ${name} fehlt.`)
  return karte
}

describe('M1am Waldtanz-Questfährten', () => {
  it('zeigt spielnahe Fortschrittsfährten auf offenen Questkarten', () => {
    render(<App initialZustand={questfaehrtenZustand()} />)

    const aufgabentafel = screen.getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const farbenpracht = questkarte(aufgabentafel, 'Farbenpracht')
    const farbkombination = questkarte(aufgabentafel, 'Farbkombination')
    const farbwechsler = questkarte(aufgabentafel, 'Farbwechsler')

    expect(within(farbenpracht).getByText('Quest-Fährte')).toHaveClass('waldtanz-questkarte__faehrte-label')
    expect(within(farbenpracht).getByText('Farbenpaare: 2/6')).toHaveClass('waldtanz-questkarte__faehrte-hauptwert')
    expect(within(farbenpracht).getByText('Blau ×2')).toHaveClass('waldtanz-questkarte__faehrte-chip')
    expect(within(farbenpracht).getByText('Gelb ×2')).toHaveClass('waldtanz-questkarte__faehrte-chip')

    expect(within(farbkombination).getByText('Farbkombination: Blau ×2/5')).toHaveClass('waldtanz-questkarte__faehrte-hauptwert')
    expect(within(farbkombination).getByText('noch 3 Karten')).toHaveClass('waldtanz-questkarte__faehrte-chip')

    expect(within(farbwechsler).getByText('Farbwechsel-Kette: 4/4')).toHaveClass('waldtanz-questkarte__faehrte-hauptwert')
    expect(within(farbwechsler).getByText('bereit')).toHaveClass('waldtanz-questkarte__faehrte-chip')
  })

  it('legt die Quest-Fährte als chunky Stitch-Plakette auf die Questkarte', () => {
    expect(cssBlock('waldtanz-questkarte__faehrte')).toMatch(/border:\s*2px dashed var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-questkarte__faehrte')).toMatch(/border-radius:\s*1\.25rem/)
    expect(cssBlock('waldtanz-questkarte__faehrte')).toMatch(/background:\s*rgba\(236, 255, 227, 0\.72\)/)
    expect(cssBlock('waldtanz-questkarte__faehrte-chip')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('waldtanz-questkarte__faehrte-hauptwert')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
  })
})
