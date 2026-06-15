/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1y zeigt direkt auf den Handkarten, welche Karten jetzt am Waldtanz-Brett spielbar sind.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { SpielAktion, Spielzustand } from './engine'
import { ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import { erstelleSpieltischMitEineSchlange, erstelleSpieltischOhneEigeneSchlangen, ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

function istBrettAktion(aktion: SpielAktion): aktion is Extract<SpielAktion, { handkartenId: string }> {
  return 'handkartenId' in aktion && aktion.typ !== 'PflichtAbwurf'
}

function uniqueSpielbareHandkarten(zustand: Spielzustand): number {
  return new Set(ermittleLegaleAktionen(zustand).filter(istBrettAktion).map((aktion) => aktion.handkartenId)).size
}

function zustandNurMitPflichtAbwurf(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const farbenschutz = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz')
  if (!farbenschutz) throw new Error('Testsetup erwartet Farbenschutz im Nachziehstapel.')

  return { ...zustand, nachziehstapel: zustand.nachziehstapel.filter((karte) => karte.id !== farbenschutz.id), spieler: zustand.spieler.with(0, { ...zustand.spieler[0], hand: [farbenschutz], schlangen: [] }) }
}

describe('M1y Handkarten-Spielbarkeit am Waldtanz-Brett', () => {
  it('markiert spielbare Handkarten direkt im Kartenfächer und aktualisiert den Status nach einem Zug', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const { handBereich } = ermittleSpielbereiche()
    const spielbareKarte = within(handBereich).getByRole('button', { name: new RegExp(`${legaleStartaktion.handkartenId}.*Spielbar jetzt.*Brettziel`, 'i') })
    const spielbareKartenflaeche = spielbareKarte.closest('li')

    expect(spielbareKartenflaeche).toHaveClass('handkarte--spielbar')
    expect(within(spielbareKartenflaeche as HTMLElement).getByText('Spielbar jetzt')).toBeInTheDocument()
    expect(within(spielbareKartenflaeche as HTMLElement).getByText(/Brettziel/)).toBeInTheDocument()

    expect(within(handBereich).getByText(`${uniqueSpielbareHandkarten(zustand)} Karten sofort spielbar`)).toBeInTheDocument()

    fireEvent.click(spielbareKarte)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Startkreis mit Karte ${legaleStartaktion.handkartenId}`, 'i') }))

    const verbliebeneKarte = within(handBereich).getAllByRole('listitem')[0]
    expect(within(verbliebeneKarte).getByText('Wartet auf nächsten Schritt')).toBeInTheDocument()
  })

  it('zählt doppelte Brettziele nur als eine spielbare Karte', () => {
    const { zustand } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)

    const { handBereich } = ermittleSpielbereiche()

    expect(within(handBereich).getByText(`${uniqueSpielbareHandkarten(zustand)} Karten sofort spielbar`)).toBeInTheDocument()
  })

  it('trennt Pflicht-Abwurf von boardnah spielbaren Karten', () => {
    const zustand = zustandNurMitPflichtAbwurf()
    const [abwurfAktion] = ermittleLegaleAktionen(zustand)
    if (!abwurfAktion || abwurfAktion.typ !== 'PflichtAbwurf') throw new Error('Testsetup erwartet Pflicht-Abwurf.')

    render(<App initialZustand={zustand} />)
    const { handBereich } = ermittleSpielbereiche()
    const abwurfKarte = within(handBereich).getByRole('button', { name: new RegExp(`${abwurfAktion.handkartenId}.*Muss abgeworfen werden.*Abwurfpflicht`, 'i') })
    const abwurfFlaeche = abwurfKarte.closest('li')

    expect(within(handBereich).getByText('0 Karten sofort spielbar')).toBeInTheDocument()
    expect(abwurfFlaeche).toHaveClass('handkarte--pflichtabwurf')
    expect(abwurfFlaeche).not.toHaveClass('handkarte--spielbar')
    expect(within(abwurfFlaeche as HTMLElement).queryByText(/Brettziel/)).toBeNull()
  })

  it('liefert den Stitch-CSS-Vertrag für spielbare und wartende Handkarten', () => {
    expect(cssBlock('.handkarte--spielbar .handkarte__button--karte')).toMatch(/box-shadow:\s*0 8px 0/)
    expect(appCss).toMatch(/\.handkarte__farbe,[\s\S]*?\.handkarte__spielstatus,[\s\S]*?border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.handkarte__spielziele\s*\{[^}]*background:\s*var\(--st-color-secondary-container\)/s)
    expect(cssBlock('.handkarte--wartet .handkarte__button--karte')).toMatch(/opacity:\s*0\.72/)
  })
})
