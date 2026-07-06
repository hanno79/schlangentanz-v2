/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1w macht das Stitch-Seitenmenü zum live gespeisten Waldtanz-Spielrahmen statt statischer Deko.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { berechneSpielzustandGesamtwertung, erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function spielrahmenHudZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
  zustand.spieler[0].schlangen = [
    schlange([
      farbkarte('gruen-m1w-1', 'Grün', 3),
      farbkarte('gruen-m1w-2', 'Grün', 4),
    ], 'schlange-m1w-du'),
  ]
  zustand.nachziehstapel = zustand.nachziehstapel.slice(0, 12)
  return zustand
}

describe('M1w Waldtanz-Spielrahmen-HUD', () => {
  it('speist das Stitch-Seitenmenü mit echten Partie-Werten und dem nächsten Schritt', () => {
    const zustand = spielrahmenHudZustand()
    const punkte = berechneSpielzustandGesamtwertung(zustand).spielerwertungen[0].gesamtPunkte
    render(<App initialZustand={zustand} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const menue = within(spielbereich).getByRole('complementary', { name: 'Waldtanz-Spielrahmen' })
    const kompass = within(menue).getByRole('region', { name: 'Waldtanz-Kompass' })

    const profil = within(menue).getByRole('region', { name: 'Spielprofil' })
    expect(within(menue).getByText('Spielprofil')).toBeVisible()
    expect(within(menue).getByText(`${zustand.spieler[0].name} · ${punkte} Punkte`)).toBeVisible()
    expect(within(kompass).getByText('Phase: Ausspielphase')).toHaveClass('waldtanz-seitenmenue__statkarte')
    expect(within(kompass).getByText(`Handkarten: ${zustand.spieler[0].hand.length}`)).toHaveClass('waldtanz-seitenmenue__statkarte')
    expect(within(kompass).getByText('Eigene Schlangen: 1')).toHaveClass('waldtanz-seitenmenue__statkarte')
    expect(within(kompass).getByText('Nachziehstapel: 12')).toHaveClass('waldtanz-seitenmenue__statkarte')
    expect(within(kompass).getByText(`Offene Quests: ${zustand.offeneAufgaben.length}`)).toHaveClass('waldtanz-seitenmenue__statkarte')
    expect(within(kompass).getByText('Nächster Schritt: Eine spielbare Aktion auswählen.')).toBeVisible()
    // M7a fügt einen zusätzlichen Stats-Hero mit eigenem "Forest Spirit"-Tag hinzu;
    // hier bleibt gezielt der Tag innerhalb der Spielprofil-Sektion geprüft.
    expect(within(profil).getByText('Forest Spirit')).toBeVisible()
    expect(within(menue).queryByRole('link')).not.toBeInTheDocument()
    expect(within(menue).queryByRole('button')).not.toBeInTheDocument()
  })

  it('zeichnet den Kompass als greifbare Stitch-HUD-Kachel mit 3px-Rand und Blockschatten', () => {
    expect(cssBlock('waldtanz-seitenmenue__kompass')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-seitenmenue__kompass')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('waldtanz-seitenmenue__kompass')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-seitenmenue__statkarte')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
  })
})
