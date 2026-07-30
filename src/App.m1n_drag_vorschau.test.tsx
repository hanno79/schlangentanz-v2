/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1n macht Dragstart zur sichtbaren Waldtanz-Kartenvorschau mit leuchtenden Brettzielen.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleSpielbereiche, erstelleDataTransfer, erstelleSpieltischOhneEigeneSchlangen, labelFuer } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1n Waldtanz-Drag-Vorschau', () => {
  it('hebt eine gezogene Handkarte an und lässt passende Brettziele schon vor dem Drop leuchten', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(legaleStartaktion.handkartenId) })
    const startzone = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    expect(startzone).not.toHaveClass('schlangen-startzone--zielbereit')

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })

    expect(handkartenButton).toHaveAttribute('aria-pressed', 'true')
    expect(handkartenButton.closest('.handkarte')).toHaveClass('handkarte--ausgewaehlt')
    expect(startzone).toHaveClass('schlangen-startzone--zielbereit')
    expect(within(schlangenbereich).getByText(`Ausgewählt: ${legaleStartaktion.handkartenId}`)).toBeVisible()
    expect(within(schlangenbereich).getByText('1 Brettziel bereit')).toBeVisible()
    expect(within(schlangenbereich).getByText('Neue Schlange')).toHaveClass('schlangen-zielkompass__chip')

    fireEvent.drop(startzone, { dataTransfer })

    expect(screen.getByText(`Zuletzt ausgeführt: ${labelFuer(zustand, legaleStartaktion)}`)).toBeVisible()
  })

  it('räumt die reine Drag-Vorschau nach einem abgebrochenen Zug wieder zurück', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(legaleStartaktion.handkartenId) })
    const startzone = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    const dataTransfer = erstelleDataTransfer()

    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(handkartenButton).toHaveAttribute('aria-pressed', 'false')
    expect(startzone).not.toHaveClass('schlangen-startzone--zielbereit')
    expect(within(schlangenbereich).getByText('Wähle oder ziehe eine Handkarte, dann leuchten die passenden Brettziele auf.')).toBeVisible()
  })

  it('legt die Stitch-Drag-Optik mit Wackelkarte und pulsierenden Magic-Circle-Zielen ab', () => {
    expect(appCss).toMatch(/@keyframes\s+handkarte-wackelt/)
    expect(appCss).toMatch(/@keyframes\s+zielkreis-pulsiert/)
    expect(cssBlock('handkarte--ausgewaehlt \\.handkarte__button--karte')).toMatch(/animation:\s*handkarte-wackelt/)
    expect(cssBlock('schlangen-startzone--zielbereit')).toMatch(/animation:\s*zielkreis-pulsiert/)
    expect(cssBlock('schlangen-startzone--zielbereit')).toMatch(/0 0 0 6px rgba\(254, 203, 0, 0\.42\)/)
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*handkarte-wackelt[\s\S]*animation:\s*none/)
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*schlangen-startzone--zielbereit[\s\S]*animation:\s*none/)
  })
})
