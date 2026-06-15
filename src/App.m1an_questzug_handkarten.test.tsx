/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1an verbindet offene Quest-Fährten mit konkreten Handkartenentscheidungen am Waldtanz-Brett.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

function questzugZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.offeneAufgaben = [aufgabe('Farbkombination'), aufgabe('Farbharmonie'), aufgabe('Farbenpracht')]
  zustand.spieler[0].hand = [
    farbkarte('blau-quest-m1an', 'Blau', 5),
    farbkarte('rot-quest-m1an', 'Rot', 4),
    farbkarte('gelb-quest-m1an', 'Gelb', 3),
  ]
  zustand.spieler[0].schlangen = [
    schlange([
      farbkarte('blau-1-m1an', 'Blau', 1),
      farbkarte('blau-2-m1an', 'Blau', 2),
      farbkarte('blau-3-m1an', 'Blau', 3),
      farbkarte('blau-4-m1an', 'Blau', 4),
    ], 'blauer-questpfad-m1an'),
    schlange([
      farbkarte('rot-1-m1an', 'Rot', 1),
      farbkarte('rot-2-m1an', 'Rot', 2),
      farbkarte('gelb-1-m1an', 'Gelb', 1),
    ], 'gruppenpfad-m1an'),
  ]
  return zustand
}

function startkreisQuestZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.offeneAufgaben = [aufgabe('Farbenpracht')]
  zustand.spieler[0].hand = [farbkarte('gelb-start-m1an', 'Gelb', 3)]
  zustand.spieler[0].schlangen = [
    { ...schlange([farbkarte('gelb-blockiert-m1an', 'Gelb', 1)], 'blockierter-gelbpfad-m1an'), zustand: 'blockiert' },
  ]
  return zustand
}

function farbharmonieSchonGezaehltZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.offeneAufgaben = [aufgabe('Farbharmonie')]
  zustand.spieler[0].hand = [farbkarte('blau-kein-neuer-gruppentyp-m1an', 'Blau', 5)]
  zustand.spieler[0].schlangen = [
    schlange([
      farbkarte('blau-alt-1-m1an', 'Blau', 1),
      farbkarte('blau-alt-2-m1an', 'Blau', 2),
      farbkarte('blau-alt-3-m1an', 'Blau', 3),
    ], 'alte-blaue-gruppe-m1an'),
  ]
  return zustand
}

describe('M1an Quest-Zugkarten in der Hand', () => {
  it('markiert Handkarten, die eine offene Quest-Fährte jetzt am Brett voranbringen', () => {
    render(<App initialZustand={questzugZustand()} />)

    const handkarten = screen.getByRole('region', { name: 'Handkarten' })
    const blau = within(handkarten).getByRole('button', { name: /blau-quest-m1an/i })
    const rot = within(handkarten).getByRole('button', { name: /rot-quest-m1an/i })
    const gelb = within(handkarten).getByRole('button', { name: /gelb-quest-m1an/i })

    expect(blau).toHaveTextContent('Quest-Zug')
    expect(blau).toHaveTextContent('Farbkombination +1')
    expect(blau).toHaveAccessibleName(/Questzug Farbkombination/)

    expect(rot).toHaveTextContent('Farbharmonie-Gruppe')
    expect(rot).toHaveAccessibleName(/Questzug .*Farbharmonie/)

    expect(gelb).toHaveTextContent('Farbenpracht-Paar')
    expect(gelb).toHaveAccessibleName(/Questzug Farbenpracht/)
  })

  it('berücksichtigt legale Startkreis-Züge und vermeidet Farbharmonie-Falschpositive', () => {
    render(<App initialZustand={startkreisQuestZustand()} />)
    const startHand = screen.getByRole('region', { name: 'Handkarten' })
    const gelbStart = within(startHand).getByRole('button', { name: /gelb-start-m1an/i })
    expect(gelbStart).toHaveTextContent('Farbenpracht-Paar')
    expect(gelbStart).toHaveAccessibleName(/Questzug Farbenpracht/)

    render(<App initialZustand={farbharmonieSchonGezaehltZustand()} />)
    const handkartenRegionen = screen.getAllByRole('region', { name: 'Handkarten' })
    const blaueGruppe = within(handkartenRegionen[1]).getByRole('button', { name: /blau-kein-neuer-gruppentyp-m1an/i })
    expect(blaueGruppe).not.toHaveTextContent('Quest-Zug')
    expect(blaueGruppe).not.toHaveAccessibleName(/Questzug/)
  })

  it('zeigt nach Kartenauswahl eine Questzielkarte zwischen Handfächer und Brettzielen', () => {
    render(<App initialZustand={questzugZustand()} />)

    const handkarten = screen.getByRole('region', { name: 'Handkarten' })
    fireEvent.click(within(handkarten).getByRole('button', { name: /blau-quest-m1an/i }))

    const questzielkarte = within(handkarten).getByRole('note', { name: 'Questziele der ausgewählten Karte' })
    expect(questzielkarte).toHaveClass('handkarten-preview__questkarte')
    expect(within(questzielkarte).getByText('Questzielkarte')).toBeVisible()
    expect(within(questzielkarte).getByText('Farbkombination +1')).toBeVisible()
    expect(within(questzielkarte).getByText(/Diese Karte bringt offene Quest-Fährten direkt am Spielbrett näher/)).toBeVisible()
  })

  it('nutzt chunky Stitch-Pill-Badges statt weiterer Debuglisten', () => {
    expect(appCss).toMatch(/\.handkarte__questzug\s*\{[\s\S]*border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.handkarte__questzug\s*\{[\s\S]*border-radius:\s*999px/)
    expect(appCss).toMatch(/\.handkarte__questzug\s*\{[\s\S]*background:\s*var\(--st-color-secondary-container\)/)
    expect(cssBlock('handkarten-preview__questkarte')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('handkarten-preview__questkarte')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
  })
})
