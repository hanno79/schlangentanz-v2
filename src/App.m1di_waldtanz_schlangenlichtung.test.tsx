/*
Author: rahn
Datum: 25.06.2026
Version: 1.0
Beschreibung: M1di RED-Tests fuer die Konsolidierung der Schlangenlichtung zu einer
              EINEN primary board surface. Aktuell sind im Arenastein 5+ vertikal
              gestapelte Mini-Panels mit eigenen Headern/Borders. Ziel: eine
              primary Stein-Flaeche mit Sub-Overlays.

              GREEN-Phase-Stand 25.06.2026: alle Tests gruen, weil die neue
              Komponente + CSS existieren. Test dient jetzt als Regressions-Schutz
              gegen Rueckfall in fragmentierte Layout-Strukturen.
*/
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readSrc(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8')
}

describe('M1di Waldtanz-Schlangenlichtung als Spielbrett-Raster (RED)', () => {
  it('M1di:1 src/components/WaldtanzSchlangenlichtung.tsx existiert mit Pflicht-Export', () => {
    const src = readSrc('src/components/WaldtanzSchlangenlichtung.tsx')
    expect(src).toMatch(/export\s+default\s+function\s+WaldtanzSchlangenlichtung/)
    expect(src).toMatch(/zustand:\s*Spielzustand/)
    expect(src).toMatch(/aktiverSpieler:\s*Spieler/)
  })

  it('M1di:2 WaldtanzSchlangenlichtung wird in src/App.tsx innerhalb der Arenastein-Sektion eingebunden', () => {
    const app = readSrc('src/App.tsx')
    // Erwartung: nur EIN Import + EIN Aufruf der neuen Komponente innerhalb Arenastein-Sektion.
    expect(app).toMatch(/import\s+WaldtanzSchlangenlichtung\s+from\s+['"]\.\/components\/WaldtanzSchlangenlichtung['"]/)
    expect(app).toMatch(/<WaldtanzSchlangenlichtung[\s>]/)
  })

  it('M1di:3 src/App.tsx rendert die 5 Sub-Overlays NICHT mehr direkt im Arenastein (sie sind in WaldtanzSchlangenlichtung gewandert)', () => {
    const app = readSrc('src/App.tsx')
    // Diese JSX-Elemente duerfen NICHT mehr direkt unter waldtanz-arenastein__spielfeld/--schlangenlichtung
    // auftauchen — sie wurden in die neue Container-Komponente verlagert.
    const arenasteinMatch = app.match(/waldtanz-arenastein[\s\S]+?<\/section>/)
    expect(arenasteinMatch).not.toBeNull()
    const arenasteinBlock = arenasteinMatch![0]
    // Direkte Render-Aufrufe (nicht Import-Statements) dieser Komponenten-Tags
    // innerhalb der Arenastein-Sektion muessen verschwunden sein.
    expect(arenasteinBlock).not.toMatch(/<WaldtanzQuestband\s/)
    expect(arenasteinBlock).not.toMatch(/<WaldtanzAktiverTanzSchritt\s/)
    expect(arenasteinBlock).not.toMatch(/<WaldtanzBrettschrittStempel\s/)
    expect(arenasteinBlock).not.toMatch(/<WaldtanzTischkarte\s/)
    // Magiekreise und Schlangenbereich duerfen nur ueber die neue Komponente laufen.
    expect(arenasteinBlock).not.toMatch(/<WaldtanzMagiekreise\s/)
    expect(arenasteinBlock).not.toMatch(/<Schlangenbereich\s/)
  })

  it('M1di:4 Die neue Komponente enthaelt die primary Stein-Flaeche als Container', () => {
    const src = readSrc('src/components/WaldtanzSchlangenlichtung.tsx')
    expect(src).toMatch(/className=(["'`])waldtanz-schlangenlichtung/)
    expect(src).toMatch(/className=(["'`])waldtanz-schlangenlichtung__spielflaeche/)
    expect(src).toMatch(/className=(["'`])waldtanz-schlangenlichtung__schlangen/)
    expect(src).toMatch(/className=(["'`])waldtanz-schlangenlichtung__kopf/)
  })

  it('M1di:5 Die neue Komponente rendert Schlangenbereich + Tischkarte + Magiekreise + Questband + Aktiver Tanz Schritt + Brettschritt-Stempel als Kinder', () => {
    const src = readSrc('src/components/WaldtanzSchlangenlichtung.tsx')
    expect(src).toMatch(/<Schlangenbereich[\s>]/)
    expect(src).toMatch(/<WaldtanzTischkarte[\s>]/)
    expect(src).toMatch(/<WaldtanzMagiekreise[\s>]/)
    expect(src).toMatch(/<WaldtanzQuestband[\s>]/)
    expect(src).toMatch(/<WaldtanzAktiverTanzSchritt[\s>]/)
    expect(src).toMatch(/<WaldtanzBrettschrittStempel[\s>]/)
  })

  it('M1di:6 CSS hat neue Klassen fuer die primary Stein-Flaeche', () => {
    const css = readSrc('src/App.css')
    expect(css).toMatch(/\.waldtanz-schlangenlichtung\s*\{/)
    expect(css).toMatch(/\.waldtanz-schlangenlichtung__kopf\s*\{/)
    expect(css).toMatch(/\.waldtanz-schlangenlichtung__spielflaeche\s*\{/)
    expect(css).toMatch(/\.waldtanz-schlangenlichtung__schlangen\s*\{/)
    expect(css).toMatch(/\.waldtanz-schlangenlichtung__overlays\s*\{/)
  })

  it('M1di:7 Primary Stein-Flaeche hat eine signifikante min-height (mind. 16rem) und dark-forest border + hard-shadow', () => {
    const css = readSrc('src/App.css')
    // Source-Regex fuer die Spielflaeche-Regel
    const match = css.match(/\.waldtanz-schlangenlichtung__spielflaeche\s*\{([^}]*)\}/s)
    expect(match).not.toBeNull()
    const body = match![1]
    // AENDERUNG 25.06.2026: clamp wurde von (12rem, 28vh, 18rem) auf
    // (14rem, 32vh, 20rem) angehoben, damit die Spielflaeche nach dem
    // Arenastein-Cap auf clamp(28rem,56vh,34rem) noch >= 36% Viewport
    // erreichen kann.
    expect(body).toMatch(/min-height:\s*clamp\([^)]*14rem/)
    expect(body).toMatch(/border:\s*3px\s+solid/)
    expect(body).toMatch(/box-shadow:\s*0\s+\d+px\s+0\s+/)
  })

  it('M1di:8 Sub-Overlays (Tischkarte, Magiekreise, Schlangenbereich) sind in der Stein-Flaeche als grid-areas verankert (Questband/Tanz-Schritt/Stempel in der Overlays-Reihe)', () => {
    const css = readSrc('src/App.css')
    const overlaysMatch = css.match(/\.waldtanz-schlangenlichtung__spielflaeche\s*\{([\s\S]*?)\n\s*\}/)
    expect(overlaysMatch).not.toBeNull()
    const body = overlaysMatch![1]
    expect(body).toMatch(/position:\s*relative/) // Container-Kontext
    // Spielflaeche ist ein grid mit den zwei Reihen (overlays + schlangen)
    expect(body).toMatch(/display:\s*grid/)
    // Overlays-Container hat grid-template-columns + grid-template-rows
    const overlaysContainerBody = css.match(/\.waldtanz-schlangenlichtung__overlays\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(overlaysContainerBody).toMatch(/display:\s*grid/)
    // Schlangen-Container hat die 3 grid-areas tischkarte / schlangen / magiekreise
    const schlangenContainerBody = css.match(/\.waldtanz-schlangenlichtung__schlangen\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(schlangenContainerBody).toMatch(/grid-template-areas/)
    expect(schlangenContainerBody).toMatch(/tischkarte/)
    expect(schlangenContainerBody).toMatch(/schlangen/)
    expect(schlangenContainerBody).toMatch(/magiekreise/)
  })

  it('M1di:9 WaldtanzSchlangenlichtung.tsx ist unter 250 LoC', () => {
    const src = readSrc('src/components/WaldtanzSchlangenlichtung.tsx')
    const lines = src.split('\n').length
    expect(lines).toBeLessThanOrEqual(250)
  })

  it('M1di:10 src/App.m1di_waldtanz_schlangenlichtung.test.tsx ist unter 500 LoC', () => {
    const src = readSrc('src/App.m1di_waldtanz_schlangenlichtung.test.tsx')
    const lines = src.split('\n').length
    expect(lines).toBeLessThanOrEqual(500)
  })

  it('M1di:11 Smoke-Skript scripts/m1di_waldtanz_schlangenlichtung_smoke.mjs existiert', () => {
    expect(() => readSrc('scripts/m1di_waldtanz_schlangenlichtung_smoke.mjs')).not.toThrow()
  })

  it('M1di:12 package.json smoke:production-Kette enthaelt das neue M1di-Smoke-Skript', () => {
    const pkg = readSrc('package.json')
    expect(pkg).toMatch(/scripts\/m1di_waldtanz_schlangenlichtung_smoke\.mjs/)
  })
})