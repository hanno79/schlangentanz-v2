/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cf verdichtet die untere Zugleiste auf /game zur kompakten Unterholzleiste statt zu angeschnittenen Großpanels.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { sonderkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1cf_unterholzleiste_smoke.mjs', 'utf8')

const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1cf Waldtanz-Unterholzleiste', () => {
  function verdopplerRouteZustand() {
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('verdoppler-m1cf', 'Verdoppler')]
    zustand.spieler[1].hand = []
    zustand.spieler[2].hand = []
    zustand.zugpflichten.gespielteKarten = 0
    zustand.zugpflichten.gespielteSonderkarten = 0
    return zustand
  }

  it('fasst Zugpfad, Spielhilfe und Zugkompass auf /game in einer kompakten Unterholzleiste unter dem Brett zusammen', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const unterholz = within(zugleiste).getByRole('group', { name: 'Waldtanz-Unterholzleiste' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(unterholz).toHaveTextContent('Unterholzleiste')
    expect(unterholz).toHaveTextContent('Eine spielbare Aktion auswählen.')
    expect(within(zugleiste).getByRole('region', { name: 'Zugpfad' })).toBeVisible()
    expect(within(zugleiste).getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })).toBeVisible()
    expect(within(zugleiste).getByRole('region', { name: 'Zugkompass' })).toBeVisible()
    expect(within(zugleiste).getByRole('link', { name: 'Zur empfohlenen Aktion im Aktionsbereich' })).toBeVisible()
    expect(zugleiste.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('haelt auch den Verdoppler-Bonuszauber als siebtes Brettobjekt in der Unterholzleiste statt ihn in eine zweite Zeile zu schieben', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={verdopplerRouteZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    fireEvent.click(within(handkarten).getByRole('button', { name: /verdoppler-m1cf Sonderkarte Verdoppler/i }))

    const bonuszauber = within(zugleiste).getByRole('region', { name: 'Waldtanz-Bonuszauber' })
    expect(within(bonuszauber).getByRole('button', { name: 'Verdoppler-Bonuszauber mit Karte verdoppler-m1cf aktivieren' })).toBeVisible()
    expect(Array.from(zugleiste.children).map((kind) => (kind as HTMLElement).className)).toEqual(expect.arrayContaining([
      'waldtanz-unterholzleiste',
      'zugpfad zugpfad--waldsteine',
      'waldtanz-spielhilfe',
      'ki-zug-buehne ki-zug-buehne--brettnah',
      'zugkompass',
      'partiefortschritt',
      'waldtanz-bonuszauber',
    ]))
  })

  it('legt den route-sicheren CSS- und Smoke-Vertrag gegen Handbank-Überlappung ab', () => {
    const zugleiste = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')
    const kinder = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"] > *')
    const interaktiveKinder = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"] > :has(button)')
    const unterholz = cssBlock('.spielbereich--game-route [class~="waldtanz-unterholzleiste"]')

    expect(zugleiste).toMatch(/grid-template-columns:\s*minmax\(6rem,\s*0\.65fr\)\s+repeat\(6,\s*minmax\(5\.1rem,\s*1fr\)\)/)
    expect(zugleiste).toMatch(/max-height:\s*clamp\(5\.4rem,\s*12vh,\s*6\.6rem\)/)
    expect(zugleiste).toMatch(/margin-top:\s*clamp\(0\.25rem,\s*0\.8vh,\s*0\.55rem\)/)
    expect(zugleiste).toMatch(/overflow:\s*visible/)
    expect(kinder).toMatch(/max-height:\s*clamp\(4\.8rem,\s*10vh,\s*5\.8rem\)/)
    expect(kinder).toMatch(/overflow:\s*hidden/)
    expect(interaktiveKinder).toMatch(/max-height:\s*none/)
    expect(interaktiveKinder).toMatch(/overflow:\s*visible/)
    expect(unterholz).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"] > [class~="waldtanz-bonuszauber"]')).toMatch(/overflow:\s*hidden/)
    expect(packageJson).toContain('node scripts/m1cf_unterholzleiste_smoke.mjs')
    expect(smokeScript).toContain('M1cf Unterholzleiste')
    expect(smokeScript).toContain('daten.zugleiste.y <= handDaten.hand.bottom')
    expect(smokeScript).toContain("'.waldtanz-bonuszauber'")
    expect(smokeScript).toContain('bonusButtonHit')
  })
})
