/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1o macht erfolgreiche Brett-Aktionen als Pop-/Sternenfeedback direkt im Waldtanz-Spieltisch sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleSpielbereiche, erstelleDataTransfer, erstelleSpieltischOhneEigeneSchlangen, labelFuer } from './testUtils'
import { findeKartennameImText } from './kartenTexte'

const appCss = readFileSync('src/App.css', 'utf8')

describe('M1o Waldtanz-Kartenpop', () => {
  it('zeigt nach einem erfolgreichen Drop ein board-nahes Pop-Feedback mit Sternen statt nur Debugtext', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich, spieltisch } = ermittleSpielbereiche()
    expect(within(spieltisch).queryByRole('status', { name: 'Waldtanz-Kartenpop' })).toBeNull()

    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(legaleStartaktion.handkartenId) })
    const startzone = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    const dataTransfer = erstelleDataTransfer()

    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.drop(startzone, { dataTransfer })

    const kartenpop = within(spieltisch).getByRole('status', { name: 'Waldtanz-Kartenpop' })
    expect(within(kartenpop).getByText('Pop!')).toBeVisible()
    expect(within(kartenpop).getByText('Karte geschnappt')).toBeVisible()
    expect(within(kartenpop).getByText(findeKartennameImText(labelFuer(zustand, legaleStartaktion))!)).toHaveClass('waldtanz-kartenpop__karte')
    expect(within(kartenpop).getByText(labelFuer(zustand, legaleStartaktion))).toBeVisible()
    expect(within(kartenpop).getAllByText('✦')).toHaveLength(3)
    expect(screen.getByText(`Zuletzt ausgeführt: ${labelFuer(zustand, legaleStartaktion)}`)).toBeVisible()
  })

  it('legt die Pop-/Sternenanimation im Google-Stitch-Stil inklusive Reduced-Motion-Fallback ab', () => {
    expect(appCss).toMatch(/\.waldtanz-kartenpop\s*\{/)
    expect(appCss).toMatch(/\.waldtanz-kartenpop__stern/)
    expect(appCss).toMatch(/@keyframes\s+waldtanz-kartenpop-springt/)
    expect(appCss).toMatch(/@keyframes\s+waldtanz-stern-funkelt/)
    expect(appCss).toMatch(/\.waldtanz-kartenpop[\s\S]*border:\s*3px solid var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-kartenpop[\s\S]*box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*waldtanz-kartenpop[\s\S]*animation:\s*none/)
    expect(appCss).not.toContain('--st-font-heading')
  })
})
