/* M2e RED-Tests — Schlangenlichtung-Brettwald-Befreiung
 *
 * Route-scoped CSS-Hide der redundanten .info-panel--spielstatus (linke
 * Zugfortschritt-Sidebar mit 1.Karte ziehen/2.Karten ausspielen/3.Aufgaben
 * pruefen/4.Zug abschliessen/5.Spiel beendet) und .waldtanz-hud (untere
 * Drei-Panel-Reihe Wertung/MaterialUndAufgaben/Spieleruebersicht) auf /game.
 * Die Schlangenlichtung wird zur visuellen Buehne; HandkartenPanel + Spielerplakette
 * + Brettrand-End-Turn bleiben prominent.
 *
 * Engine, Legal-Aktionen, React-Tree, Komponenten bleiben unveraendert.
 */
import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

describe('M2e Schlangenlichtung-Brettwald-Befreiung', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('RED-1: versteckt die linke .info-panel--spielstatus-Sidebar auf /game via route-scoped display:none', () => {
    const rule = appCss.match(/\.spielbereich--game-route\s+\[class~="info-panel--spielstatus"\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rule).toMatch(/display:\s*none/)
  })

  it('RED-2: versteckt die .waldtanz-hud-Panels (Wertung/Material/Spieleruebersicht) auf /game', () => {
    const rule = appCss.match(/\.spielbereich--game-route\s+\[class~="waldtanz-hud"\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rule).toMatch(/display:\s*none/)
  })

  it('RED-3: die Hide-Regel greift NUR auf /game, nicht auf der Lobby-Default-Route', () => {
    // Regel-Selector-Form ist .spielbereich--game-route (nicht .spielbereich)
    // Damit bleibt .info-panel--spielstatus auf / (Lobby-Default) sichtbar.
    const rule = appCss.match(/\.spielbereich--game-route\s+\[class~="info-panel--spielstatus"\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rule).toMatch(/display:\s*none/)
    // Sicherstellen: KEIN generischer .info-panel--spielstatus { display: none } ohne Route-Scope
    const generischOhneRoute = appCss.match(/^\s*\.info-panel--spielstatus\s*\{([^}]*display:\s*none[^}]*)\}/m)?.[1] ?? ''
    expect(generischOhneRoute).toBe('')
  })

  it('RED-4: auf / (Lobby) bleibt die .info-panel--spielstatus sichtbar (Route-Scoping verhaelt sich umgekehrt)', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    const statusPanel = document.querySelector('.info-panel--spielstatus')
    // Auf / muss die .info-panel--spielstatus vorhanden sein
    expect(statusPanel).not.toBeNull()
    // (computed-style-trap: jsdom resolved display nicht; daher CSS-Source als Beweis)
    const generisch = appCss.match(/^\s*\.info-panel--spielstatus\s*\{([^}]*)\}/m)?.[1] ?? ''
    // Basis-Regel darf display:none NICHT enthalten
    expect(generisch).not.toMatch(/display:\s*none/)
  })

  it('RED-5: das zentrale .spielbrett--waldtanz bekommt auf /game flex: 1 1 auto (letzte Regel gewinnt im Cascade, da spaetere M2e-Regel = M2e-Override)', () => {
    // Es gibt eine fruehere .spielbereich--game-route [class~="spielbrett--waldtanz"]-Regel (M1d0).
    // Die M2e-Erweiterung (flex: 1 1 auto) sitzt am Ende der Datei als Cascade-Override.
    // Wir nehmen die LETZTE passende Regel (last-match), um den M2e-Override zu verifizieren.
    const matches = Array.from(appCss.matchAll(/\.spielbereich--game-route\s+\[class~="spielbrett--waldtanz"\]\s*\{([^}]*)\}/gs))
    const lastRule = matches.length > 0 ? matches[matches.length - 1][1] : ''
    expect(lastRule).toMatch(/flex:\s*1\s+1\s+auto/)
  })

  it('RED-6: die Schlangenlichtung-Region bleibt auf /game erhalten (Konsolidierung loescht sie nicht versehentlich)', () => {
    render(<App />)
    const lichtung = document.querySelector('[class~="waldtanz-schlangenlichtung"]')
    expect(lichtung).not.toBeNull()
  })
})
