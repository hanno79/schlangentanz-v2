/**
 * Author: rahn
 * Datum: 21.06.2026
 * Version: 1.0
 * Beschreibung: M1ct macht die Handkarten als groessere, verspielte Stitch-Spielkarten sichtbar: groesseres Symbol,
 * groesserer Kartenname, farbiges Werteplakett, Stitch-Spielen-Hinweis beim Hover und klare Hervorhebung
 * der Auswahl. Engine, Legal-Aktionen, Auswahl, Drag&Drop und bestehende Nachbarschaftsverträge bleiben unveraendert.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.2))
}

describe('M1ct Waldtanz-Spielkarten-Stil', () => {
  it('rendert jede Handkarte mit grossem Symbol, fettem Kartenname und farbigem Werteplakett im Stitch-Brettspiel-Stil', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    expect(karten.length).toBeGreaterThanOrEqual(3)

    const erste = karten[0]
    const symbol = erste.querySelector('.handkarte__symbol')
    const titel = erste.querySelector('.handkarte__titel')
    const wertechip = erste.querySelector('.handkarte__wertechip')
    const art = erste.querySelector('.handkarte__art')
    expect(symbol).toBeTruthy()
    expect(titel).toBeTruthy()
    expect(wertechip).toBeTruthy()
    expect(art).toBeTruthy()

    expect(symbol?.textContent?.trim().length ?? 0).toBeGreaterThan(0)
    expect(titel?.textContent?.trim().length ?? 0).toBeGreaterThan(0)
    expect(wertechip?.textContent?.trim().length ?? 0).toBeGreaterThan(0)

    const symbolRule = cssBlock('.handkarte__symbol')
    const titelRule = cssBlock('.handkarte__titel')
    const wertechipRule = cssBlock('.handkarte__wertechip')
    expect(symbolRule).toMatch(/font-size:\s*2\.4rem/)
    expect(titelRule).toMatch(/font-size:\s*clamp\(/)
    expect(titelRule).toMatch(/font-weight:\s*900/)
    expect(wertechipRule).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(wertechipRule).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
  })

  it('zeigt einen sichtbaren Stitch-Spielen-Hinweis im Karteninneren fuer spielbare Handkarten', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const spielbareKarten = within(handkartenRegion).getAllByRole('button', { name: /Spielbar jetzt/ })
    expect(spielbareKarten.length).toBeGreaterThanOrEqual(1)

    const erste = spielbareKarten[0]
    const spielhinweis = erste.querySelector('.handkarte__spielhinweis') as HTMLElement | null
    expect(spielhinweis).toBeTruthy()
    expect(spielhinweis?.textContent ?? '').toMatch(/Spielen/)

    const spielhinweisRule = cssBlock('.handkarte__spielhinweis')
    expect(spielhinweisRule).toMatch(/opacity:\s*0/)
    expect(appCss).toMatch(/\.handkarte__button--karte:hover[\s\S]{0,80}\.handkarte__spielhinweis[\s\S]{0,80}opacity:\s*1/)
  })

  it('rendert die Stitch-Auswahl-Lift-Animation mit Transform und Box-Shadow fuer die gewaehlte Handkarte', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    fireEvent.click(karten[0])

    const ausgewaehlte = karten[0].closest('li') as HTMLElement
    expect(ausgewaehlte.className).toContain('handkarte--ausgewaehlt')

    const ausgewaehltRule = cssBlock('.handkarte--ausgewaehlt .handkarte__button--karte')
    expect(ausgewaehltRule).toMatch(/box-shadow:/)
    expect(ausgewaehltRule).toMatch(/transform:\s*translateY/)
    expect(ausgewaehltRule).toMatch(/scale\(/)
  })

  it('gewinnt die spaetere Stitch-Titel-Regel mit hoeherer Spezifitaet gegen das generische .handkarte strong', () => {
    // RED-Schutz: ohne spaetere .handkarte .handkarte__titel-Regel wuerde .handkarte strong (0,1,1) gewinnen
    const generischeStrongPos = appCss.indexOf('.handkarte strong')
    expect(generischeStrongPos).toBeGreaterThan(0)
    const generischeStrongBody = appCss.substring(generischeStrongPos, generischeStrongPos + 200)
    expect(generischeStrongBody).toMatch(/font-size:\s*0\.95rem/)

    const spezifischeTitelRegel = cssBlock('.handkarte .handkarte__titel')
    expect(spezifischeTitelRegel).toMatch(/font-size:\s*clamp\(/)
    expect(spezifischeTitelRegel).toMatch(/font-weight:\s*900/)

    const spezifischeTitelPosition = appCss.indexOf('.handkarte .handkarte__titel {')
    expect(spezifischeTitelPosition).toBeGreaterThan(0)
    expect(spezifischeTitelPosition).toBeGreaterThan(generischeStrongPos)
  })

  it('haelt die route-sicheren CSS-Klassen fuer groesseres Symbol, sichtbaren Spielen-Hinweis und farbiges Werteplakett im Brettspiel-Stil fest', () => {
    const symbolRule = cssBlock('.handkarte__symbol')
    const titelRule = cssBlock('.handkarte__titel')
    const wertechipRule = cssBlock('.handkarte__wertechip')
    const spielhinweisRule = cssBlock('.handkarte__spielhinweis')

    expect(symbolRule).toMatch(/font-size:\s*2\.4rem/)
    expect(titelRule).toMatch(/font-size:\s*clamp\(/)
    expect(wertechipRule).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(spielhinweisRule).toMatch(/opacity:\s*0/)
    expect(appCss).toMatch(/\.handkarte__button--karte:hover[\s\S]{0,80}\.handkarte__spielhinweis[\s\S]{0,80}opacity:\s*1/)

    expect(packageJson).toMatch(/m1ct_spielkarten_stil_smoke\.mjs/)
  })
})
