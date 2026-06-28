/**
 * Author: hermes-cron
 * Datum: 28.06.2026
 * Version: 1.0
 * Beschreibung: M5a beweist die Stitch-Waldlichtung-Forest-Hero-Transformation
 * der <SiegerParty>: Sunset-Forest-Backdrop, groesseres Gewinner-Portrait mit
 * Leaderboard-Badge, Holzplakette-Scorekarte mit Stitch-Tilt und Stat-Pills,
 * Nochmal-spielen-Knopf als Stitch-Hero mit Hover-Lift und Active-Press.
 * Bestehende M4b/M4c-Verträge (Konfetti, Ballons, Korona, Pokal, Headline,
 * Neustart-Button, "Sieg fuer X", "Gewinner: X") bleiben unangetastet.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

// cssBlock: liest die letzte Top-Level-Regel (ausserhalb @media) fuer einen
// flachen Class-Selektor. depth-tracked { } damit zusammengesetzte Regeln
// (z.B. ".a, .b { ... }" mit inneren Pseudo-Klassen) sauber abgeschlossen
// werden. @media-Inner-Regeln werden uebersprungen, indem wir nur Matches
// akzeptieren, deren Klammer-Ebene 0 ist (also direkt im Top-Level CSS).
const cssBlock = (selektor: string): string => {
  const escaped = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Suche nach ".<sel> {" mit optionalem Prefix (Start, Whitespace, Komma, >, Punkt)
  const regex = new RegExp(`(^|[\\s,>.])${escaped}\\s*\\{`, 'g')
  const matches = Array.from(appCss.matchAll(regex))
  if (matches.length === 0) return ''
  // Iteriere rueckwaerts: nimm den letzten Match, bei dem der Klammer-Scope
  // auf Top-Level-Ebene liegt (depth = 0 vor der Match-Brace).
  for (let i = matches.length - 1; i >= 0; i--) {
    const matchIndex = matches[i].index!
    const preceding = appCss.slice(0, matchIndex)
    // Berechne die aktuelle Klammertiefe VOR diesem Match.
    let depth = 0
    for (let j = 0; j < preceding.length; j++) {
      const ch = preceding[j]
      if (ch === '{') depth++
      else if (ch === '}') depth--
    }
    // Wir wollen nur Top-Level-Regeln (depth = 0 vor dem Match).
    if (depth !== 0) continue
    const braceStart = matchIndex + matches[i][0].length - 1
    let innerDepth = 1
    let end = braceStart + 1
    while (innerDepth > 0 && end < appCss.length) {
      if (appCss[end] === '{') innerDepth++
      else if (appCss[end] === '}') innerDepth--
      end++
    }
    return appCss.slice(braceStart + 1, end - 1)
  }
  return ''
}

function spielendeZustand(spielerAnzahl = 2): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(spielerAnzahl, () => 0.999999))
  const gruppenIds = ['blau-01', 'blau-03', 'blau-05']
  const gruppenKarten = zustand.spieler[0].hand.filter(karte => gruppenIds.includes(karte.id))
  if (gruppenKarten.length !== 3) {
    throw new Error('Testsetup erwartet drei blaue Karten auf Spieler-1-Hand.')
  }
  return {
    ...zustand,
    spielphase: 'Beendet',
    zugphase: 'Spielende',
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: zustand.spieler[0].hand.filter(karte => !gruppenIds.includes(karte.id)),
      schlangen: [{ id: 'schlange-m5a', karten: gruppenKarten, zustand: 'aktiv' }],
    }),
  }
}

describe('M5a Sieger-Party als Stitch-Waldlichtung-Forest-Hero', () => {
  it('RED-1: Sunset-Forest-Backdrop mischt tertiary-secondary-surface-dim in einem linear-gradient', () => {
    const body = cssBlock('sieger-party')
    expect(body).toMatch(/linear-gradient\(/)
    expect(body).toMatch(/var\(--st-color-tertiary-container\)/)
    expect(body).toMatch(/var\(--st-color-secondary-container\)/)
    expect(body).toMatch(/var\(--st-color-surface-dim\)/)
  })

  it('RED-2: Hero-Headline "Schlangentanz!" sitzt in der Sieger-Party-Kopf-Sektion', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    const kopf = within(party).getByRole('heading', { level: 2, name: 'Schlangentanz!' })
    expect(kopf.closest('.sieger-party__kopf')).not.toBeNull()
  })

  it('RED-3: Hero-Headline traegt die party-wiggle-Animation (Stitch-Hero-Vertrag)', () => {
    const body = cssBlock('sieger-party__kopf h2')
    expect(body).toMatch(/animation:\s*party-wiggle/)
    expect(body).toMatch(/-webkit-text-stroke:\s*3px\s+var\(--st-color-border-strong\)/)
  })

  it('RED-4: Gewinner-Portrait skaliert sichtbar groesser (clamp 13-20rem statt 8-13rem)', () => {
    const body = cssBlock('sieger-party__portrait')
    expect(body).toMatch(/width:\s*clamp\(13rem,\s*28vw,\s*20rem\)/)
  })

  it('RED-5: Leaderboard-Badge als Stitch-Hero-Pille mit coral-Teritärcontainer und Wiggle', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    const portrait = within(party).getByRole('region', { name: 'Gewinner-Portrait' })
    const badge = portrait.querySelector('.sieger-party__leaderboard-badge')
    expect(badge).not.toBeNull()
    const body = cssBlock('sieger-party__leaderboard-badge')
    expect(body).toMatch(/var\(--st-color-tertiary-container\)/)
    expect(body).toMatch(/border-radius:\s*999px/)
    expect(body).toMatch(/animation:\s*party-wiggle/)
    expect(body).toMatch(/rotate\(12deg\)/)
  })

  it('RED-6: Scorekarte als gelbe Holzplakette mit 8px-Hard-Shadow und -2deg-Tilt', () => {
    const body = cssBlock('sieger-party__scorekarte')
    expect(body).toMatch(/var\(--st-color-secondary-container\)/)
    expect(body).toMatch(/box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/)
    expect(body).toMatch(/rotate\(-2deg\)/)
  })

  it('RED-7: Stat-Pillen (Laenge/Bewegungen/Farbgruppen/Aufgaben) sind Stitch-Pillen mit primary-container Wert-Pille', () => {
    const body = cssBlock('sieger-party__stats div')
    expect(body).toMatch(/border-radius:\s*999px/)
    expect(body).toMatch(/box-shadow:\s*3px 3px 0 var\(--st-color-border-strong\)/)
    const wert = cssBlock('sieger-party__scorewert')
    expect(wert).toMatch(/var\(--st-color-primary-container\)/)
    expect(wert).toMatch(/font-family:\s*var\(--st-font-headline\)/)
  })

  it('RED-8: Nochmal-spielen-Knopf als Stitch-Hero mit lime-Primary-Container, 8px-Hard-Shadow und Active-Press', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    const button = within(party).getByRole('button', { name: 'Noch einmal spielen' })
    expect(button).toHaveClass('sieger-party__neustart')

    const body = cssBlock('sieger-party__neustart')
    expect(body).toMatch(/var\(--st-color-primary-container\)/)
    expect(body).toMatch(/box-shadow:\s*0 8px 0 var\(--st-color-border-strong\)/)
    expect(body).toMatch(/border-radius:\s*999px/)

    const allHoverMatches = Array.from(appCss.matchAll(/\.sieger-party__neustart:hover\s*\{([^}]*)\}/gs))
    const hoverBody = allHoverMatches.length > 0 ? allHoverMatches[allHoverMatches.length - 1][1] : ''
    expect(hoverBody).toMatch(/scale\(/)

    const allActiveMatches = Array.from(appCss.matchAll(/\.sieger-party__neustart:active\s*\{([^}]*)\}/gs))
    const activeBody = allActiveMatches.length > 0 ? allActiveMatches[allActiveMatches.length - 1][1] : ''
    expect(activeBody).toMatch(/translateY\(/)
    expect(activeBody).toMatch(/box-shadow:\s*0 0 0/)
  })

  it('RED-9: Reduced-motion Override schaltet Headline-Wiggle und Konfetti/Balloon-Animationen ab', () => {
    // Suche den @media (prefers-reduced-motion: reduce) Block, der party-Klassen abdeckt
    const block = appCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.sieger-party[\s\S]*?\}/)
    expect(block).not.toBeNull()
    expect(block![0]).toMatch(/animation:\s*none/)
  })

  it('RED-10: Bestehende M4b/M4c-Verträge bleiben erfuellt (Konfetti >= 8, Ballons >= 4, Korona, Pokal, Headline, Neustart-Button)', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    // M4c-Vertrag: Konfetti >= 8, Ballons >= 4, Korona + Pokal vorhanden
    const konfettiContainer = within(party).getByText('', { selector: '.sieger-party__konfetti' })
    expect(konfettiContainer.querySelectorAll('span').length).toBeGreaterThanOrEqual(8)
    const ballonContainer = within(party).getByText('', { selector: '.sieger-party__ballons' })
    expect(ballonContainer.querySelectorAll('span').length).toBeGreaterThanOrEqual(4)
    expect(party.querySelector('.sieger-party__korona')).not.toBeNull()
    expect(party.querySelector('.sieger-party__pokal')).not.toBeNull()
    // M4b-Vertrag: Headline + Neustart-Button + Wertung-Texte
    expect(within(party).getByRole('heading', { name: 'Schlangentanz!' })).toBeVisible()
    expect(within(party).getByRole('button', { name: 'Noch einmal spielen' })).toBeVisible()
    expect(within(party).getByText('Sieg für Spieler 1')).toBeVisible()
    expect(within(party).getByText('Gewinner: Spieler 1')).toBeVisible()
  })
})
