/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1aa zeigt in der ausgewählten Handkarten-Vorschau konkrete Brettziel-Arten statt nur allgemeinen Ziehhinweis.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleLegaleAktionen } from './engine'
import { ermittleSpielbereiche, erstelleSpieltischMitEineSchlange } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1aa Waldtanz-Zielkarte-Vorschau', () => {
  it('fasst die Brettziel-Arten der ausgewählten Handkarte direkt in der Karten-Vorschau zusammen', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('zielkarte-vorschau-pfad')
    const zielAktionen = ermittleLegaleAktionen(zustand).filter(
      (aktion) => 'handkartenId' in aktion && aktion.handkartenId === anlegekarteId && aktion.typ !== 'PflichtAbwurf',
    )

    render(<App initialZustand={zustand} />)

    const { handBereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) }))

    const vorschau = within(handBereich).getByRole('region', { name: `Ausgewählte Handkarte: ${anlegekarteId}` })
    const zielkarte = within(vorschau).getByRole('note', { name: 'Brettziele der ausgewählten Karte' })

    expect(zielkarte).toHaveClass('handkarten-preview__zielkarte')
    expect(within(zielkarte).getByText('Brettzielkarte')).toBeVisible()
    expect(within(zielkarte).getByText(`${zielAktionen.length} Brettziele bereit`)).toBeVisible()
    expect(within(zielkarte).getByText('Startkreis')).toBeVisible()
    expect(within(zielkarte).getByText('Schlangenende')).toBeVisible()
    expect(within(zielkarte).getByText('Folge den leuchtenden Zielen im Spielbrett.')).toBeVisible()
  })

  it('liefert den Google-Stitch-CSS-Vertrag für die Zielkarte in der Handvorschau', () => {
    expect(cssBlock('handkarten-preview__zielkarte')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('handkarten-preview__zielkarte')).toMatch(/border-radius:\s*1\.5rem/)
    expect(cssBlock('handkarten-preview__zielkarte')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('handkarten-preview__zielchip')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('handkarten-preview__zielchip')).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
  })
})
