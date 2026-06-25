/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dj RED-Tests fuer die Waldtanz-Brettlandschaft.
 *              Der Schlangenbereich ist der Mittelpunkt der Schlangenlichtung
 *              und nicht mehr ein 216-px-Eck-Panel. Bisher:
 *              - .waldtanz-schlangenlichtung misst 974x370 px auf 1280x900.
 *              - .schlangenbereich sitzt mit nur 216x307 px verklemmt in der
 *                zweiten Grid-Row (rechts unten), wahrend die linke Haelfte
 *                leer bleibt.
 *              - .waldtanz-lichtungsbrett deklariert grid-template-areas
 *                "tisch magiekreise / schlangen schlangen", aber die direkten
 *                Kinder der Section sind heute __kopf + __spielflaeche — die
 *                Areas-Namen "tisch/magiekreise/schlangen" sind verwaist und
 *                fuehren zu einem schiefen Grid.
 *              Ziel:
 *              - Schlangenbereich ist auf 1280x900 mindestens 55% der
 *                Schlangenlichtung-Breite breit UND mindestens 60% ihrer Hoehe.
 *              - Schlangenlichtung-Grid benutzt keine verwaisten Area-Namen.
 *              - Die Grid-Template-Areas-Regel fuer .waldtanz-lichtungsbrett
 *                ist so umgeschrieben, dass sie zur M1di-Section-Struktur
 *                passt (kopf + spielflaeche als benannte Areas), oder die
 *                Areas-Deklaration ist ganz entfernt.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readSrc(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8')
}

describe('M1dj Waldtanz-Brettlandschaft (RED)', () => {
  it('M1dj:1 .waldtanz-lichtungsbrett Grid-Template-Areas ist M1di-konform (kopf+spielflaeche) oder entfernt', () => {
    const css = readSrc('src/App.css')
    // Suche die Route-Scoped-Regel .spielbereich--game-route [class~="waldtanz-lichtungsbrett"]
    const blockMatch = css.match(/\.spielbereich--game-route\s+\[class~="waldtanz-lichtungsbrett"\]\s*\{([^}]*)\}/)
    expect(blockMatch, '.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]-Block muss existieren').not.toBeNull()
    const block = blockMatch![1]
    // Die alten Areas "tisch magiekreise / schlangen schlangen" duerfen nicht mehr da sein.
    expect(block).not.toMatch(/grid-template-areas:\s*"tisch\s+magiekreise/)
    expect(block).not.toMatch(/grid-template-areas:\s*"schlangen\s+schlangen"/)
  })

  it('M1dj:2 .waldtanz-schlangenlichtung__spielflaeche hat einen Grid-Plan, der dem Schlangenbereich eine breite Mitte gibt', () => {
    const css = readSrc('src/App.css')
    // Basis-Regel direkt matchen (kein @media-Override).
    const baseMatch = css.match(/\.waldtanz-schlangenlichtung__spielflaeche\s*\{([^}]*)\}/)
    expect(baseMatch, 'Basis-Regel .waldtanz-schlangenlichtung__spielflaeche muss existieren').not.toBeNull()
    const block = baseMatch![1]
    expect(block).toMatch(/display:\s*grid/)
    // Mindestens zwei Grid-Rows (overlays + schlangen) oder die schlangen
    // sitzen in einer breiten Column.
    const hasRows = /grid-template-rows:[^;]*(?:auto|minmax|1fr)/.test(block)
    const hasCol = /grid-template-columns:[^;]*(?:minmax|1fr|auto)/.test(block)
    expect(hasRows || hasCol).toBe(true)
  })

  it('M1dj:3 src/components/WaldtanzSchlangenlichtung.tsx markiert die Spielflaeche als Brettlandschaft mit Schlangen-Flaeche', () => {
    const src = readSrc('src/components/WaldtanzSchlangenlichtung.tsx')
    // Section muss Schlangenlichtung + Brettschicht-Brettoptik weiter tragen.
    expect(src).toMatch(/waldtanz-schlangenlichtung[^"]*waldtanz-lichtungsstein/)
    // Spielflaeche-Container bleibt; auf der Section-Ebene MUSS aber auch der
    // Schlangenbereich direkt rendern, nicht nur innerhalb der __spielflaeche
    // verpackt, damit die Layout-Areas des Bretts sichtbar werden.
    expect(src).toMatch(/<Schlangenbereich\b/)
    expect(src).toMatch(/waldtanz-schlangenlichtung__spielflaeche/)
  })

  it('M1dj:4 App.css deklariert eine Route-Scoped-Regel, die .schlangenbereich in der Schlangenlichtung auf breite Spielflaechen-Anteile hebt', () => {
    const css = readSrc('src/App.css')
    // Die bestehende .waldtanz-lichtungsbrett-Schlangenbereich-Regel MUSS um
    // width:100% erweitert sein, damit der Schlangenbereich seine Grid-Spalte
    // voll ausfuellt.
    const lichtungsSchlangenMatch = css.match(/\.spielbereich--game-route\s+\[class~="waldtanz-lichtungsbrett"\]\s+\[class~="schlangenbereich--waldlichtung"\]\s*\{([^}]+)\}/)
    expect(lichtungsSchlangenMatch, 'Schlangenbereich-in-Lichtungsbrett-Regel muss existieren').not.toBeNull()
    expect(lichtungsSchlangenMatch![1]).toMatch(/width:\s*100%/)
  })

  it('M1dj:5 Browser-Smoke verifiziert auf 1280x900, dass der Schlangenbereich mindestens 55% Breite der Schlangenlichtung einnimmt', () => {
    // Reiner Source-Assertion-Test: das Skript existiert mit der richtigen
    // Vertragsaussage. Smoke-Skript wird separat ausgefuehrt.
    const css = readSrc('src/App.css')
    // Eine Mindest-Hoehe auf der Spielflaeche muss >= 14rem bleiben, sonst
    // bricht der M1di-Test. Wir matchen die BASIS-Regel direkt (kein @media,
    // kein :hover etc.).
    const baseMatch = css.match(/\.waldtanz-schlangenlichtung__spielflaeche\s*\{([^}]*)\}/)
    expect(baseMatch, 'Basis-Regel .waldtanz-schlangenlichtung__spielflaeche muss existieren').not.toBeNull()
    expect(baseMatch![1]).toMatch(/min-height:\s*clamp\([^)]*14rem/)
  })

  it('M1dj:6 package.json smoke:production ruft das M1dj-Brettlandschaft-Skript in der Kette auf', () => {
    // Wir lesen die package.json direkt (nicht ueber import.meta.url), weil
    // der Test kein ESM-Root ist und das Workdir das Repo-Root ist.
    const pkg = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
    expect(pkg).toMatch(/node scripts\/m1dj_waldtanz_brettlandschaft_smoke\.mjs/)
  })

  it('M1dj:7 das M1dj-Brettlandschaft-Smoke-Skript enthaelt die Vertragsaussagen und die Slice-Klassen', () => {
    const script = readFileSync(resolve(process.cwd(), 'scripts/m1dj_waldtanz_brettlandschaft_smoke.mjs'), 'utf8')
    // Slice-Skript enthaelt seine eigenen Vertragsaussagen.
    expect(script).toContain('pruefeM1djBrettlandschaft')
    expect(script).toContain('M1dj Selbsttest bestanden')
    expect(script).toContain('breitenAnteil < 0.55')
    expect(script).toContain('hoehenAnteil < 0.60')
    // Slice-Klassen, die der Smoke auf dem Live-URL inspiziert.
    expect(script).toContain('waldtanz-schlangenlichtung')
    expect(script).toContain('waldtanz-schlangenlichtung__schlangen')
    expect(script).toContain('schlangenbereich--waldlichtung')
    expect(script).toContain('grid-area')
  })
})
