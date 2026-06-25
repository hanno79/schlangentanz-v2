/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dk RED-Tests fuer das sichtbare Waldtanz-Spielphasen-Banner
 *              auf dem Arenastein. Der Spieler soll jederzeit sehen, in welcher
 *              Phase seines Zuges er sich befindet — nicht nur ueber den kleinen
 *              aktiven Tanz-Schritt-Pill, sondern ueber eine sichtbare
 *              Beschilderung aller 4 Spielphasen (Nachziehphase, Ausspielphase,
 *              Aufgabenpruefung, Zugabschluss) als Stitch-Pillen-Reihe am
 *              Brettrand.
 *
 * Ziel:
 *  - Auf /game existiert genau ein .waldtanz-phasen-banner-Container im Arenakopf-Bereich
 *  - Er enthaelt genau 4 Phasen-Pillen (.waldtanz-phasen-banner__phase)
 *  - Genau eine Pille traegt die .--aktiv-Klasse passend zur aktuellen Phase
 *  - Die uebrigen Pillen tragen .--wartend oder .--abgeschlossen je nach Position
 *  - Die Phasen-Beschriftungen sind sichtbar im DOM (Nachziehphase / Ausspielphase / Aufgabenpruefung / Zugabschluss)
 *  - App.css deklariert den sichtbaren Brettrand-Banner-Stil mit Stitch-Optik (3px border, hard-shadow, pill-radius)
 *  - Die Banner-Komponente wird aus App.tsx (oder einer Sub-Komponente) auf /game gerendert und ist auf / ausgeblendet
 *  - package.json smoke:production enthaelt das M1dk-Skript in der Kette
 *  - Das M1dk-Smoke-Skript enthaelt pruefeM1dkPhasenBanner + Slice-Klassen + Schwellen
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readSrc(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8')
}

describe('M1dk Waldtanz-Phasen-Banner (RED)', () => {
  it('M1dk:1 App.css deklariert eine sichtbare Phasen-Banner-Klasse mit Stitch-Pille-Optik', () => {
    const css = readSrc('src/App.css')
    // Basis-Banner-Regel muss existieren.
    const bannerMatch = css.match(/\.waldtanz-phasen-banner\s*\{([^}]*)\}/)
    expect(bannerMatch, 'Basis-Regel .waldtanz-phasen-banner muss existieren').not.toBeNull()
    const block = bannerMatch![1]
    // Sichtbares Layout: muss Grid/Flex sein.
    expect(block).toMatch(/display:\s*(grid|flex)/)
    // Mindestens eine Mindest-Hoehe, damit das Banner als sichtbare Brettrand-Reihe wirkt.
    expect(block).toMatch(/min-height:\s*\d+/)
  })

  it('M1dk:2 Phasen-Pille-Basis-Regel traegt Stitch-Optik (3px border, pill-radius, hard-shadow)', () => {
    const css = readSrc('src/App.css')
    const phaseMatch = css.match(/\.waldtanz-phasen-banner__phase\s*\{([^}]*)\}/)
    expect(phaseMatch, 'Basis-Regel .waldtanz-phasen-banner__phase muss existieren').not.toBeNull()
    const block = phaseMatch![1]
    // Pillen-Radius (999px) oder aehnlich gross.
    expect(block).toMatch(/border-radius:\s*999px/)
    // 3px Stitch-Border.
    expect(block).toMatch(/border:\s*3px solid/)
    // Hard-Shadow als Box-Shadow mit nicht-Null-Versatz (z.B. 0 4px 0 ...).
    expect(block).toMatch(/box-shadow:[^;]*\d+px\s+0/)
  })

  it('M1dk:3 Phasen-Pille --aktiv Variante hat sichtbare Hervorhebung (lime-glow oder scale)', () => {
    const css = readSrc('src/App.css')
    const aktivMatch = css.match(/\.waldtanz-phasen-banner__phase--aktiv\s*\{([^}]*)\}/)
    expect(aktivMatch, 'Variante --aktiv muss existieren').not.toBeNull()
    const block = aktivMatch![1]
    // Animation oder Skalierung oder Glow.
    const hatAnimation = /animation:\s*\w+/.test(block)
    const hatTransform = /transform:\s*scale/.test(block)
    const hatGlow = /box-shadow:[^;]*(?:glow|rgba\(164,\s*222,\s*2)|primary-fixed-dim/.test(block)
    expect(hatAnimation || hatTransform || hatGlow).toBe(true)
  })

  it('M1dk:4 Phasen-Pille --abgeschlossen Variante existiert und nutzt lime-Background', () => {
    const css = readSrc('src/App.css')
    const doneMatch = css.match(/\.waldtanz-phasen-banner__phase--abgeschlossen\s*\{([^}]*)\}/)
    expect(doneMatch, 'Variante --abgeschlossen muss existieren').not.toBeNull()
    const block = doneMatch![1]
    // Hintergrund sollte auf lime/primary-container zeigen, nicht default-surface.
    expect(block).toMatch(/background:[^;]*var\(--st-color-primary(?:-container)?\)|background-color:\s*var\(--st-color-primary(?:-container)?\)/)
  })

  it('M1dk:5 src/components enthaelt eine Komponente, die das Phasen-Banner rendert (oder App.tsx integriert es inline)', () => {
    const componentsDir = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8')
    // Mindestens eine Render-Stelle mit waldtanz-phasen-banner-Klasse in App.tsx
    // ODER ein eigener Component-Import (WaldtanzPhasenBanner).
    const inlineRender = /waldtanz-phasen-banner/.test(componentsDir)
    const componentImport = /from ['"]\.\/components\/WaldtanzPhasenBanner['"]/.test(componentsDir)
    expect(inlineRender || componentImport).toBe(true)
  })

  it('M1dk:6 App.tsx rendert das Phasen-Banner nur auf /game (nicht auf /), und uebergibt die aktuelle Phase', () => {
    const app = readSrc('src/App.tsx')
    // Phasen-Banner-Render wird durch istGameRoute gegated.
    // Wir erwarten: (a) die Komponente ist importiert,
    // (b) der Aufruf erfolgt in einem istGameRoute-Bereich,
    // (c) die Phase wird aus zustand.zugphase uebergeben.
    expect(app).toMatch(/import\s+WaldtanzPhasenBanner\s+from\s+['"]\.\/components\/WaldtanzPhasenBanner['"]/)
    expect(app).toMatch(/\{istGameRoute\s*&&[\s\S]*?<WaldtanzPhasenBanner\b[\s\S]*?\}/)
    // zustand.zugphase wird an das Banner weitergegeben.
    expect(app).toMatch(/zustand\.zugphase/)
    expect(app).toMatch(/<WaldtanzPhasenBanner[^>]*zugphase=\{zustand\.zugphase\}/)
  })

  it('M1dk:7 package.json smoke:production enthaelt das M1dk-Phasen-Banner-Skript in der Kette', () => {
    const pkg = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
    expect(pkg).toMatch(/node scripts\/m1dk_waldtanz_phasen_banner_smoke\.mjs/)
  })

  it('M1dk:8 das M1dk-Phasen-Banner-Smoke-Skript enthaelt die Vertragsaussagen und die Slice-Klassen', () => {
    const script = readFileSync(resolve(process.cwd(), 'scripts/m1dk_waldtanz_phasen_banner_smoke.mjs'), 'utf8')
    expect(script).toContain('pruefeM1dkPhasenBanner')
    expect(script).toContain('M1dk Selbsttest bestanden')
    // Slice-Klassen, die der Smoke auf dem Live-URL inspiziert.
    expect(script).toContain('waldtanz-phasen-banner')
    expect(script).toContain('waldtanz-phasen-banner__phase')
    expect(script).toContain('waldtanz-phasen-banner__phase--aktiv')
  })

  it('M1dk:9 --st-color-on-primary Token ist im :root definiert (Kimi-Kontrast-Regression-Schutz)', () => {
    // Kimi-K2.7-Review-Blocker: Token fehlte, Schrift fiel still auf dunkelgruen zurueck,
    // aktive/abgeschlossene Pillen hatten schlechten Kontrast.
    const css = readSrc('src/App.css')
    const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/)
    expect(rootMatch, ':root-Block muss existieren').not.toBeNull()
    expect(rootMatch![1]).toMatch(/--st-color-on-primary\s*:\s*#[0-9a-fA-F]+/)
  })
})