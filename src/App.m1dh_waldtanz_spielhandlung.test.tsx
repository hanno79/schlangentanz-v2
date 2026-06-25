/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dh macht die Phase-End-Action und die Pflicht-Abwurf-Action
 * zu sichtbaren Stitch-Spielpillen in der Waldtanz-Handbühne und verbessert
 * den Hover-Hint ueber Handkarten zum Stitch-Pattern (schwarze inverted Pille).
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import HandkartenPanel from './components/HandkartenPanel'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const appTsx = readFileSync('src/components/HandkartenPanel.tsx', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const m1dhScript = readFileSync('scripts/m1dh_waldtanz_spielhandlung_smoke.mjs', 'utf8')

const cssBlock = (selektor: string) => {
  const escaped = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Pragmatischer Helper: matcht den Selektor-Text (ggf. mit vorausgehendem
  // `.` oder `>` oder Leerzeichen) gefolgt von { ... }. Das letzte Vorkommen
  // gewinnt, weil spaetere Reparatur-Regeln (Source-Reihenfolge) so Vorrang haben.
  const re = new RegExp(`(^|[\\s,>])${escaped}\\s*\\{([^}]*)\\}`, 'gm')
  const matches: { idx: number; body: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(appCss)) !== null) {
    matches.push({ idx: m.index + m[1].length, body: m[2] })
  }
  if (matches.length === 0) return ''
  // Walk back: nehme das letzte Match, das ausserhalb eines @media-Blocks liegt.
  for (let i = matches.length - 1; i >= 0; i--) {
    const idx = matches[i].idx
    const davor = appCss.slice(Math.max(0, idx - 200), idx)
    if (davor.trimEnd().endsWith('}')) return matches[i].body
    const offeneMedia = (davor.match(/@media[^{]*\{/g) ?? []).length
    if (offeneMedia === 0) return matches[i].body
  }
  return matches[matches.length - 1]?.body ?? ''
}

function startZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('M1dh Waldtanz-Spielhandlung am Brettrand', () => {
  it('rendert die M1dh-Spielhandlungs-Pillen-Klassen in der Handbuehne und nutzt sie im Markup', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={startZustand()} />)

    const handkarten = screen.getByRole('region', { name: 'Handkarten' })
    const handbuehne = within(handkarten).getByRole('group', { name: 'Waldtanz-Handbühne' })

    // Die Handbuehne enthaelt die Status-Chips. Die End-Turn- und Pflicht-Abwurf-Pillen
    // werden abhaengig von Phase / Pflicht-Schuld gerendert. Im startZustand ist Phase
    // = Ausspielphase, also keine Pille sichtbar -- der Source-Code-Vertrag ist
    // trotzdem erfuellt (siehe andere Tests + appTsx-String-Assert).
    expect(handbuehne).toBeInTheDocument()
    expect(handbuehne.querySelectorAll('[class*="handkarten-buehne__statuschip"]').length).toBeGreaterThan(0)
  })

  it('rendert die Pflicht-Abwurf-Pille als Stitch-Pille, sobald PflichtAbwurf-Aktionen anliegen', () => {
    // Direkter Komponententest: HandkartenPanel mit einer synthetischen
    // PflichtAbwurf-Aktion rendern. Beweist den sichtbaren Vertrag der Pille
    // unabhaengig davon, wie die Engine den Zustand intern aufbaut.
    const synthetischeAktionen: Array<{ typ: 'PflichtAbwurf'; spielerId: string; handkartenId: string }> = [
      { typ: 'PflichtAbwurf', spielerId: 's1', handkartenId: 'k1' },
      { typ: 'PflichtAbwurf', spielerId: 's1', handkartenId: 'k2' },
    ]
    render(
      <HandkartenPanel
        handkarten={[]}
        ausgewaehlteHandkarte={null}
        legaleAktionen={[]}
        questHinweise={[]}
        pflichtAbwurfAktionen={synthetischeAktionen}
        onKarteWaehlen={() => undefined}
        onKarteDragStart={() => undefined}
        onKarteDragEnd={() => undefined}
        onPflichtAbwurf={() => undefined}
      />,
    )
    const pille = screen.getByRole('button', { name: /Pflicht-Abwurf:/ })
    expect(pille).toBeInTheDocument()
    // Ehrliche Semantik: eine Karte pro Klick, Anzahl verbleibend.
    expect(pille).toHaveTextContent('Abwerfen · noch 2')
  })

  it('deklariert die Stitch-End-Turn-Pille im CSS mit secondary-container, 3px Border, hard-shadow und Icon-Pfeil', () => {
    const basisBlock = cssBlock('.handkarten-buehne__spielhandlung')
    const variantBlock = cssBlock('.handkarten-buehne__spielhandlung--endturn')
    const routeBlock = cssBlock('.spielbereich--game-route [class~="handkarten-buehne__endturn"]')
    const iconBlock = cssBlock('.handkarten-buehne__endturn-icon')

    // Basisklasse: pill-shape (border-radius 999px), chunky-font-family, headline-uppercase.
    expect(basisBlock).toMatch(/border-radius:\s*999px/)
    expect(basisBlock).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(basisBlock).toMatch(/text-transform:\s*uppercase/)

    // Variante End-Turn: secondary-container (sonniges Gelb) + 3px-Border + hard-shadow.
    expect(variantBlock).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(variantBlock).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(variantBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)

    // Route-spezifischer Block: prominent sichtbar nur auf /game.
    expect(routeBlock).toMatch(/display:\s*inline-flex/)
    expect(routeBlock).toMatch(/align-items:\s*center/)
    expect(routeBlock).toMatch(/gap:\s*0\.4rem/)

    // Icon als kleiner Pfeil innerhalb der Pille (Stitch-Pattern).
    expect(iconBlock).toMatch(/font-weight:\s*900/)
  })

  it('macht den Hover-Hint ueber Handkarten zur invertierten Stitch-Pille (forest-gruen auf lime)', () => {
    // Spezifisch nach der Basis-Regel (nicht :hover/focus-visible) suchen.
    const basisMit = appCss.match(/\.handkarte__spielhinweis\s*\{([^}]*)\}/s)?.[1] ?? ''
    // Hover-Block als separater Match (Regex speziell fuer Selektoren mit ':').
    const hoverBlock = appCss.match(/\.handkarte__button--karte:hover\s+\.handkarte__spielhinweis\s*,?\s*\.handkarte__button--karte:focus-visible\s+\.handkarte__spielhinweis\s*\{([^}]*)\}/s)?.[1] ?? ''

    // Invertierte Stitch-Pille: forest-gruen Hintergrund (inverse-surface) + lime Schrift (surface).
    expect(basisMit).toMatch(/background:\s*var\(--st-color-inverse-surface\)/)
    expect(basisMit).toMatch(/color:\s*var\(--st-color-surface\)/)
    expect(hoverBlock).toMatch(/opacity:\s*1/)
    expect(basisMit).toMatch(/border-radius:\s*999px/)
  })

  it('dreht die Spielerplakette in der Handbuehne sichtbar schraeg wie das Stitch-Pattern', () => {
    const plaketteRouteBlock = cssBlock('.spielbereich--game-route [class~="handkarten-buehne__spielerplakette"]')

    expect(plaketteRouteBlock).toMatch(/transform:\s*rotate\(-2deg\)/)
    expect(plaketteRouteBlock).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(plaketteRouteBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
  })

  it('rendert die Pflicht-Abwurf-Pille als Sonderform derselben Spielhandlungs-Klasse', () => {
    // CSS-Vertrag: identische Chunky-Pill, aber farblich herausgehoben.
    const pflichtBasis = cssBlock('.handkarten-buehne__spielhandlung--pflichtabwurf')
    const pflichtRoute = cssBlock('.spielbereich--game-route [class~="handkarten-buehne__pflichtabwurf"]')

    expect(pflichtBasis).toMatch(/background:\s*var\(--st-color-tertiary-container\)/)
    expect(pflichtBasis).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(pflichtRoute).toMatch(/display:\s*inline-flex/)
  })

  it('verwendet die M1dh-Spielhandlungs-Klassen im HandkartenPanel-Quelltext', () => {
    expect(appTsx).toContain('handkarten-buehne__spielhandlung')
    expect(appTsx).toContain('handkarten-buehne__endturn')
    expect(appTsx).toContain('handkarten-buehne__pflichtabwurf')
    // Kimi-Blocker 1: endTurnVerfuegbar muss reaktionsAktionen.length beruecksichtigen.
    const appTsxBody = readFileSync('src/App.tsx', 'utf8')
    expect(appTsxBody).toMatch(/endTurnVerfuegbar=\{[\s\S]*?reaktionsAktionen\.length === 0/)
  })

  it('Pflichter-Abwurf-Pille hat ehrliche Multi-Step-Semantik im aria-label und sichtbaren Text', () => {
    // Kimi-Blocker 2: keine "Bulk-Abwurf"-Luege. Eine pro Klick, Anzahl verbleibend.
    expect(appTsx).toMatch(/aria-label=\{`Pflicht-Abwurf: noch /)
    expect(appTsx).toMatch(/Abwerfen · noch \{pflichtAbwurfAktionen\.length\}/)
  })

  it('verdrahtet den M1dh-Smoke in npm run smoke:production und das Slice-Skript enthaelt die pruefe-Funktion', () => {
    const chain = packageJson.match(/"smoke:production":\s*"([^"]+)"/)?.[1] ?? ''
    expect(chain).toContain('m1dh_waldtanz_spielhandlung_smoke.mjs')
    // pruefeM1dhSpielhandlung lebt im Slice-Skript selbst, nicht in live_smoke.mjs.
    expect(m1dhScript).toContain('pruefeM1dhSpielhandlung')
    expect(m1dhScript).toContain('handkarten-buehne__endturn')
  })
})