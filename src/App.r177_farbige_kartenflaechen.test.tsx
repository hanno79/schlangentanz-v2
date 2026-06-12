/**
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R177 beweist farbige Kartenflächen für Hand und Schlangenreihe statt generischer Klickflächen.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type Farbe, type Spielzustand } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const farben: Farbe[] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün']
const farbKlassen: Record<Farbe, string> = {
  Blau: 'blau',
  Rot: 'rot',
  Gelb: 'gelb',
  Violett: 'violett',
  Braun: 'braun',
  Grün: 'gruen',
}
const appCss = readFileSync('src/App.css', 'utf8')
const kartenfarbeWert = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{[^}]*--kartenfarbe:\\s*([^;]+);`, 's'))?.[1]?.trim() ?? ''

function zustandMitAllenFarbkarten(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = farben.map((farbe, index) =>
    farbkarte(`hand-${farbKlassen[farbe]}-${index + 1}`, farbe, index < 3 ? 1 : index < 5 ? 2 : 3),
  )
  zustand.spieler[0].schlangen = [
    schlange(
      farben.map((farbe, index) => farbkarte(`schlange-${farbKlassen[farbe]}-${index + 1}`, farbe, index < 3 ? 1 : index < 5 ? 2 : 3)),
      'farbige-testschlange',
    ),
  ]
  return zustand
}

describe('R177 farbige Kartenflächen', () => {
  it('markiert jede Farbkarte in Hand und Schlange mit einer farbspezifischen Kartenklasse', () => {
    render(<App initialZustand={zustandMitAllenFarbkarten()} />)

    const handBereich = within(screen.getByRole('region', { name: 'Aktiver Spieler' })).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const kartenreihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe farbige-testschlange' })

    for (const farbe of farben) {
      const klasse = farbKlassen[farbe]
      const handkarte = within(handBereich).getByRole('button', { name: new RegExp(`hand-${klasse}-\\d+.*Farbkarte ${farbe}`, 'i') })
      expect(handkarte.closest('li')).toHaveClass(`handkarte--farbe-${klasse}`)

      const schlangenkarte = within(kartenreihe).getByRole('listitem', { name: new RegExp(`Farbkarte schlange-${klasse}-\\d+: ${farbe}`, 'i') })
      expect(schlangenkarte).toHaveClass(`schlangekarte__karte--farbe-${klasse}`)
    }
  })

  it('definiert unterschiedliche CSS-Flächen für alle sechs Kartenfarben', () => {
    const handFarben = Object.values(farbKlassen).map((klasse) => kartenfarbeWert(`handkarte--farbe-${klasse}`))
    const schlangenFarben = Object.values(farbKlassen).map((klasse) => kartenfarbeWert(`schlangekarte__karte--farbe-${klasse}`))

    expect(handFarben).not.toContain('')
    expect(schlangenFarben).not.toContain('')
    expect(new Set(handFarben).size).toBe(farben.length)
    expect(new Set(schlangenFarben).size).toBe(farben.length)
    expect(schlangenFarben).toEqual(handFarben)
  })
})
