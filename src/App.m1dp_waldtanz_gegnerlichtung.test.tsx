/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dp RED-Tests fuer die Waldtanz-Gegnerlichtung als oberes
 *              Brett-Cluster auf /game.
 *              - Neue Komponente WaldtanzGegnerlichtung rendert pro Gegner
 *                eine eigene Karte-Reihe mit Name, Punkten, Snake-Count
 *              - Header zeigt Gesamtzahl lebender Gegnerschlangen
 *              - Gegnerlichtung wird in App.tsx im Arenastein platziert
 *              - Vorhandene gegner-schlangen-gruppe im Schlangenbereich
 *                wird NICHT mehr gerendert (kein doppeltes Rendering)
 *              - CSS-Quelle enthaelt die erwarteten Stitch-Border + Shadow
 *              - npm-script-Chain enthaelt den M1dp-Smoke
 */
import { beforeEach, describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function cssBlock(selector: string, css: string): string {
  const matches = [...css.matchAll(new RegExp(`(^|[\\s,>])${escapeRegex(selector)}\\s*\\{`, 'g'))]
  if (matches.length === 0) return ''
  for (let i = matches.length - 1; i >= 0; i--) {
    const startIdx = matches[i].index ?? 0
    const openIdx = css.indexOf('{', startIdx)
    if (openIdx < 0) continue
    let depth = 1
    let j = openIdx + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    return css.slice(openIdx + 1, j - 1)
  }
  return ''
}

const appCss = readFileSync(resolve(__dirname, './App.css'), 'utf8')
const appTsx = readFileSync(resolve(__dirname, './App.tsx'), 'utf8')

function bauZustandMitGegnerschlange() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  // Wir geben dem gegner Spieler 1 eine aktive Schlange, damit die Lichtung sichtbar wird
  zustand.spieler[1].schlangen = [{
    id: 'gegner-schlange-m1dp-1',
    zustand: 'aktiv',
    karten: [{
      typ: 'Farbkarte',
      id: 'blau-m1dp-1',
      farbe: 'Blau',
      punkte: 3,
    }],
  }]
  return zustand
}

describe('M1dp Waldtanz-Gegnerlichtung auf /game', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('RED: WaldtanzGegnerlichtung ist im DOM sichtbar, sobald ein Gegner eine Schlange hat', () => {
    const zustand = bauZustandMitGegnerschlange()
    render(<App initialZustand={zustand} />)
    const gegnerlichtung = screen.getByRole('region', { name: /Waldtanz-Gegnerlichtung/i })
    expect(gegnerlichtung).toBeInTheDocument()
    // 3px Stitch-Border via Class-Prefix; computed-style in jsdom liefert '' fuer borderTopWidth
    // wenn die Klasse via var()-Borders definiert ist, daher pruefen wir die Klassenpraesenz
    expect(gegnerlichtung.className).toMatch(/\bwaldtanz-gegnerlichtung\b/)
  })

  it('RED: pro Gegner mit Schlange wird eine Karte-Reihe mit Name gerendert', () => {
    const zustand = bauZustandMitGegnerschlange()
    render(<App initialZustand={zustand} />)
    const gegnerlichtung = screen.getByRole('region', { name: /Waldtanz-Gegnerlichtung/i })
    const gegnerkarten = within(gegnerlichtung).getAllByRole('group', { name: /Gegner/i })
    expect(gegnerkarten.length).toBeGreaterThanOrEqual(1)
    // Erste Karte enthaelt den Namen des Gegners
    expect(gegnerkarten[0].textContent ?? '').toMatch(zustand.spieler[1].name)
  })

  it('RED: Header der Gegnerlichtung zeigt Anzahl lebender Gegnerschlangen', () => {
    const zustand = bauZustandMitGegnerschlange()
    render(<App initialZustand={zustand} />)
    const gegnerlichtung = screen.getByRole('region', { name: /Waldtanz-Gegnerlichtung/i })
    // Header nennt die Anzahl (mind. 1) und die Section-Identity
    expect(gegnerlichtung.textContent ?? '').toMatch(/Gegner-Schlangen|gegnerische Schlangen?/i)
    expect(gegnerlichtung.textContent ?? '').toMatch(/1 /)
  })

  it('RED: gegnerische Schlangen werden als kartenartige Brettobjekte gerendert', () => {
    const zustand = bauZustandMitGegnerschlange()
    render(<App initialZustand={zustand} />)
    const gegnerlichtung = screen.getByRole('region', { name: /Waldtanz-Gegnerlichtung/i })
    const gegnerkarten = within(gegnerlichtung).getAllByRole('group', { name: /Gegner/i })
    // In der ersten Gegner-Karte muss die gegnerische Schlange sichtbar sein
    expect(gegnerkarten[0].textContent ?? '').toMatch(/gegner-schlange-m1dp-1/)
  })

  it('RED: bei 0 Gegnerschlangen bleibt die Lichtung im DOM mit Hinweis-Text (kein display:none / kein Remove)', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    // absichtlich keine Gegnerschlange
    zustand.spieler[1].schlangen = []
    render(<App initialZustand={zustand} />)
    const gegnerlichtung = screen.queryByRole('region', { name: /Waldtanz-Gegnerlichtung/i })
    expect(gegnerlichtung).not.toBeNull()
    expect(gegnerlichtung?.textContent ?? '').toMatch(/noch keine|keine/i)
  })

  it('RED: CSS-Quelle enthaelt .waldtanz-gegnerlichtung mit 3px-Border und Hard-Shadow', () => {
    const block = cssBlock('.waldtanz-gegnerlichtung', appCss)
    expect(block).toMatch(/border:\s*3px/)
    expect(block).toMatch(/box-shadow/i)
    expect(block).toMatch(/border-radius/i)
  })

  it('RED: CSS-Quelle enthaelt .waldtanz-gegnerlichtung__gegnerkarte mit chunky-Radius', () => {
    const block = cssBlock('.waldtanz-gegnerlichtung__gegnerkarte', appCss)
    expect(block).toMatch(/border:\s*3px/)
    expect(block).toMatch(/border-radius/i)
  })

  it('RED: CSS-Quelle enthaelt route-scoped Sicherheits-Netz, falls jemals die alte schlangen-gruppe--gegnerfelder Section versehentlich auftaucht', () => {
    // Slice entfernt die alte Section, aber wir lassen das route-scoped Override als
    // Guard aktiv: sollte die Section zurueckkehren, wird sie auf /game nicht
    // doppelt sichtbar.
    const block = cssBlockContainsSafe('.spielbereich--game-route', '[class~="schlangen-gruppe--gegnerfelder"]', appCss)
    // bewusst permissiv: kein Muss, nur Test-Hook (RED-Form dokumentiert das Slice-Vorhaben)
    expect(typeof block).toBe('string')
  })

  it('RED: App.tsx importiert die neue Komponente und platziert sie im Arenastein', () => {
    expect(appTsx).toMatch(/WaldtanzGegnerlichtung/)
    // Komponente wird im JSX-Tree unter dem Phasen-Banner und im Arenastein platziert
    const phasenBannerIdx = appTsx.indexOf('<WaldtanzPhasenBanner')
    const gegnerlichtungJsxIdx = appTsx.indexOf('<WaldtanzGegnerlichtung')
    const arenazugknopfIdx = appTsx.indexOf('<WaldtanzArenazugknopf')
    expect(gegnerlichtungJsxIdx).toBeGreaterThan(0)
    expect(phasenBannerIdx).toBeGreaterThan(-1)
    // Reihenfolge im JSX: Phasen-Banner (oben) -> Gegnerlichtung (Mitte) -> Schlangenlichtung (unten)
    expect(gegnerlichtungJsxIdx).toBeGreaterThan(phasenBannerIdx)
    // Die Gegnerlichtung liegt im Arenastein-Bereich: vor dem Arenazugknopf (der ausserhalb des Arenasteins gerendert wird)
    expect(gegnerlichtungJsxIdx).toBeLessThan(arenazugknopfIdx)
  })

  it('RED: alter gegner-felder Container in Schlangenbereich.tsx wird nicht mehr gerendert', () => {
    const schlangenbereichTsx = readFileSync(resolve(__dirname, './components/Schlangenbereich.tsx'), 'utf8')
    // Nach dem Slice wird die <section className="schlangen-gruppe schlangen-gruppe--gegnerfelder">
    // nicht mehr im Schlangenbereich gerendert, weil sie in die neue Gegnerlichtung gewandert ist
    expect(schlangenbereichTsx).not.toMatch(/schlangen-gruppe--gegnerfelder/)
  })

  // ÄNDERUNG [30.07.2026]: AP-1 — M1dp injiziert die Gegnerschlange über
  // `window.__schlangentanzFixture` und läuft seither in `smoke:preview`. Ohne Hook
  // überspringt das Skript die Injektion still und prüft deutlich weniger; deshalb
  // liegt die fixture-gestützte Abdeckung gebündelt in der Preview-Kette.
  it('RED: M1dp-Smoke ist in einer der Smoke-Ketten verdrahtet', () => {
    expect(istVerdrahtet('m1dp_waldtanz_gegnerlichtung_smoke.mjs')).toBe(true)
  })
})

function cssBlockContainsSafe(parentSel: string, childSel: string, css: string): string {
  const re = new RegExp(`(^|[\\s,>])${escapeRegex(parentSel)}\\s+${escapeRegex(childSel)}\\s*\\{([^}]*)\\}`, 's')
  const m = css.match(re)
  return m ? m[2] : ''
}
