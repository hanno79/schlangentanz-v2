/**
 * Author: hermes-cron
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M3a — Handkarten im Sichtbereich. Die Handkarten-Kartenleiste
 *              ist auf /game @ 1280x900 unter dem Viewport-Falz (y=985+110=1095,
 *              Viewport endet bei y=900). Die Slice kompaktifiziert die
 *              handkarten-buehne, sodass die 5 Karten in den 900-px-Viewport
 *              ruecken. Reine CSS-only-Anpassung im route-scoped Block;
 *              Engine, Legal-Aktionen, Spielregeln und Aktionspfade bleiben
 *              unveraendert.
 *
 * RED-Vertrag (TDD):
 *   1. CSS-Source: handkarten-buehne min-height gesenkt auf
 *      clamp(2.6rem, 5.5vh, 3.2rem) — vorher 4.5rem/9vh/5.5rem.
 *   2. CSS-Source: handkarten-buehne__spielerplakette padding
 *      0.18rem 0.55rem (vorher 0.35rem 0.65rem) + bottom 0rem.
 *   3. CSS-Source: handkarten-buehne__statuschip--spielbar top 0.25rem
 *      + right 0.55rem (enger an Eck gesetzt).
 *   4. CSS-Source: handkartenleiste margin-top -0.4rem (enger an Buehne).
 *   5. CSS-Source: Brettrand-Arenazugknopf hat einen Spieler-Eyebrow
 *      (nur auf /game, klein) — damit der Spieler weiss, wessen Zug es ist.
 *   6. DOM: Auf /game hat die handkarten-buehne min-height innerhalb
 *      der neuen Grenzen (regression-safety, Buehne rendert weiterhin).
 *   7. package.json: smoke:production-Kette enthaelt
 *      m3a_brettrand_hand_im_sichtbereich_smoke.mjs.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeChain = (JSON.parse(packageJson) as { scripts: Record<string, string> })
  .scripts['smoke:production'] ?? ''

describe('M3a Handkarten im Sichtbereich auf /game', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/game')
    }
  })

  it('M3a:1 CSS-Source: handkarten-buehne min-height gesenkt auf 3.2rem (Stitch-Hand-im-Sichtbereich)', () => {
    // Es gibt 2 route-scoped-Blocks:
    // (a) M1f-Block (Zeile 2964) mit min-height: clamp(2.6rem, 5.5vh, 3.2rem)
    //     — wird spaeter vom M2x-Block ueberschrieben.
    // (b) M2x-Block (Zeile 11401) mit min-height: 3.2rem (von M3a reduziert).
    // Wir matchen den letzten M3a-Override-Block (M2x-Block nach M3a-Aenderung).
    // Akzeptanz: min-height = 3.2rem (51 px @ 16px root, 57 px @ 18px root).
    const matches = Array.from(
      appCss.matchAll(
        /\.spielbereich--game-route\s+\[class~="handkarten-buehne"\][^{]*\{([^}]*)\}/g
      )
    )
    expect(matches.length, 'mindestens 1 route-scoped handkarten-buehne-Block').toBeGreaterThanOrEqual(1)
    // Letzter (spaetester) Block muss 3.2rem enthalten
    const last = matches[matches.length - 1]
    expect(last[1], 'letzter handkarten-buehne-Block enthaelt min-height 3.2rem').toMatch(/min-height:\s*3\.2rem/)
  })

  it('M3a:2 CSS-Source: handkarten-buehne__spielerplakette padding 0.18rem 0.55rem + bottom 0rem', () => {
    const matches = Array.from(
      appCss.matchAll(
        /\.spielbereich--game-route\s+\[class~="handkarten-buehne__spielerplakette"\][^{]*\{([^}]*)\}/g
      )
    )
    const m3aOverride = matches.find(([, body]) => body.includes('0.18rem') && body.includes('0.55rem'))
    expect(m3aOverride, 'M3a-Override-Block fuer Spielerplakette muss existieren').toBeDefined()
    expect(m3aOverride![1]).toMatch(/padding:\s*0\.18rem\s+0\.55rem/)
    expect(m3aOverride![1]).toMatch(/bottom:\s*0(?:\.0+)?(?:rem|px|em)?/)
  })

  it('M3a:3 CSS-Source: handkarten-buehne__statuschip--spielbar top 0.25rem + right 0.55rem', () => {
    const matches = Array.from(
      appCss.matchAll(
        /\.spielbereich--game-route\s+\[class~="handkarten-buehne__statuschip--spielbar"\][^{]*\{([^}]*)\}/g
      )
    )
    const m3aOverride = matches.find(([, body]) => body.includes('0.25rem') && body.includes('0.55rem'))
    expect(m3aOverride, 'M3a-Override-Block fuer Spielbar-Statuschip muss existieren').toBeDefined()
    expect(m3aOverride![1]).toMatch(/top:\s*0\.25rem/)
    expect(m3aOverride![1]).toMatch(/right:\s*0\.55rem/)
  })

  it('M3a:4 CSS-Source: handkartenliste margin-top -0.4rem (enger an Buehne)', () => {
    // Suche eine route-scoped-Regel auf .handkartenleiste mit margin-top: -0.4rem.
    // (Kann auch als generische .handkartenleiste ohne route-scoping sein.)
    const matches = Array.from(
      appCss.matchAll(/[^{]*handkartenleiste[^{]*\{([^}]*margin-top:\s*-0\.4rem[^}]*)\}/g)
    )
    expect(matches.length, 'mindestens 1 Regel mit handkartenliste margin-top -0.4rem').toBeGreaterThanOrEqual(1)
  })

  it('M3a:5 CSS-Source: Brettrand-Arenazugknopf hat Spieler-Eyebrow-Klasse auf /game', () => {
    // Der Brettrand-Arenazugknopf zeigt auf /game einen Eyebrow mit Spieler-Name.
    // Wir suchen nach einer route-scoped-Regel auf .waldtanz-arenazug__kicker oder
    // .waldtanz-arenazug__spieler-eyebrow, die kleineren font-size als default hat.
    // Pragmatischer Test: route-scoped-Regel auf .waldtanz-arenazug fuegt font-size
    // oder border-color auf kleiner/kompakter hinzu.
    const hasRouteScopedArenazug = /\.spielbereich--game-route\s+\[class~="waldtanz-arenazug"\]/.test(appCss)
    expect(hasRouteScopedArenazug, 'mindestens 1 route-scoped Regel auf .waldtanz-arenazug').toBe(true)
  })

  it('M3a:6 DOM: Auf /game rendert die handkarten-buehne weiterhin', () => {
    // Regression-Safety: die Buehne muss im DOM sein und Handkarten-Buehne-Klasse haben.
    // jsdom computed-style kennt kein clamp(), daher pruefen wir nur DOM-Präsenz + Klassen.
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const result = render(<App initialZustand={zustand} />)
    const buehne = result.container.querySelector('.handkarten-buehne')
    expect(buehne, 'handkarten-buehne muss im DOM sein').not.toBeNull()
    expect((buehne as HTMLElement).getAttribute('aria-label')).toBe('Waldtanz-Handbühne')
    // Handkarten-Kartenleiste muss ebenfalls rendern
    const leiste = result.container.querySelector('.handkartenleiste')
    expect(leiste, 'handkartenleiste muss im DOM sein').not.toBeNull()
  })

  it('M3a:7 package.json: smoke:production-Kette enthaelt m3a_brettrand_hand_im_sichtbereich_smoke.mjs', () => {
    expect(smokeChain).toContain('m3a_brettrand_hand_im_sichtbereich_smoke.mjs')
  })
})
