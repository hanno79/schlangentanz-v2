/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1k macht offene Aufgaben als board-nahe Waldtanz-Aufgabentafel sichtbar statt nur als Seitenleisten-/Debugtext.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { aufgabenPool, erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function zustandMitAufgabentafel(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const offeneAufgaben = [aufgabenPool[0], aufgabenPool[5], aufgabenPool[10]]
  const offeneIds = new Set(offeneAufgaben.map(aufgabe => aufgabe.id))
  zustand.offeneAufgaben = offeneAufgaben
  zustand.aufgabenStapel = aufgabenPool.filter(aufgabe => !offeneIds.has(aufgabe.id))
  return zustand
}

describe('M1k Waldtanz-Aufgabentafel', () => {
  it('zeigt offene Questkarten board-nah zwischen Zugspur und Schlangenbereich', () => {
    render(<App initialZustand={zustandMitAufgabentafel()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const zugspur = within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugspur' })
    const aufgabentafel = within(spieltisch).getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })

    expect(aufgabentafel).toHaveClass('waldtanz-aufgabentafel')
    expect(within(aufgabentafel).getByRole('heading', { name: 'Waldtanz-Aufgabentafel' })).toBeInTheDocument()
    expect(within(aufgabentafel).getByText('3 offene Aufgaben')).toHaveClass('waldtanz-aufgabentafel__zaehler')
    expect(within(aufgabentafel).getByText('Aufgabenstapel: 11 Karten')).toBeVisible()

    const questkarten = within(aufgabentafel).getAllByRole('listitem')
    expect(questkarten).toHaveLength(3)
    expect(questkarten[0]).toHaveClass('waldtanz-questkarte')
    expect(within(questkarten[0]).getByText('Farbenpracht')).toBeVisible()
    expect(within(questkarten[0]).getByText('8 Punkte')).toHaveClass('waldtanz-questkarte__punkte')
    expect(within(questkarten[1]).getByText('Fusionsexperte')).toBeVisible()
    expect(within(questkarten[2]).getByText('Schlangentanz')).toBeVisible()
    expect(within(aufgabentafel).getByText('Baue deine Schlangen gezielt auf diese Questkarten hin.')).toBeVisible()

    expect(zugspur.compareDocumentPosition(aufgabentafel) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(aufgabentafel.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(within(material).getByRole('region', { name: 'Aufgabenkarten' })).toBeInTheDocument()

    expect(cssBlock('waldtanz-aufgabentafel')).toMatch(/grid-column:\s*1\s*\/\s*-1/)
    expect(cssBlock('waldtanz-aufgabentafel')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-aufgabentafel')).toMatch(/border-radius:\s*2rem/)
    expect(cssBlock('waldtanz-aufgabentafel')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-aufgabentafel__liste[\s\S]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(13rem,\s*100%\),\s*1fr\)\)/)
    expect(appCss).toMatch(/\.waldtanz-questkarte[\s\S]*transform:\s*rotate\(var\(--quest-rotation,\s*0deg\)\)/)
    expect(appCss).not.toMatch(/var\(--st-color-(surface-container-lowest|surface-container-high|primary-fixed)\)/)
  })
})
