import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('M3c Smoke-Wiring', () => {
  it('M3c-W1: Smoke-Script existiert in scripts/', () => {
    expect(existsSync('scripts/m3c_sonniges_nest_player_cards_smoke.mjs')).toBe(true)
  })

  it('M3c-W2: package.json smoke:production-Kette enthaelt den M3c-Smoke-Pfad', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    const smokeChain = pkg.scripts['smoke:production'] ?? ''
    expect(smokeChain).toContain('m3c_sonniges_nest_player_cards_smoke.mjs')
  })

  it('M3c-W3: Smoke-Script referenziert Avatar-/Grid-Selectors und lobe-Helfer', () => {
    const src = readFileSync('scripts/m3c_sonniges_nest_player_cards_smoke.mjs', 'utf8')
    expect(src).toContain('BASE_URL')
    expect(src).toMatch(/lobby-avatar/)
    expect(src).toMatch(/lobby-spieler-grid|lobby-slot__name/)
    expect(src).toMatch(/messeLobby/)
  })

  it('M3c-W4: Smoke-Script ist nicht versehentlich aus der Kette ausgeschlossen', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    const smokeChain = pkg.scripts['smoke:production'] ?? ''
    // Sicherstellen, dass kein `--exclude`-Flag o.ae. den M3c-Smoke
    // uebergeht — die Kette ist eine reine &&-Verknuepfung.
    expect(smokeChain).not.toMatch(/--exclude.*m3c|grep.*m3c|awk.*m3c/)
    // M3c MUSS nicht mehr am Ende stehen, sobald M7a (Spieler-Hero), M6b
    // (Waldtisch-Holzwimpel) und M9 (Hand-Erstbild) angehaengt wurden.
    // Wir akzeptieren die juengeren Slices am Ende und pruefen M3c nur
    // als "vor M7a + M6b + M9" gereiht.
    const m3cIdx = smokeChain.indexOf('m3c_sonniges_nest_player_cards_smoke.mjs')
    const m7aIdx = smokeChain.indexOf('m7a_waldtanz_spieler_hero_smoke.mjs')
    const m6bIdx = smokeChain.indexOf('m6b_waldtisch_holzwimpel_smoke.mjs')
    const m9Idx = smokeChain.indexOf('m9_hand_erstbild_smoke.mjs')
    if (m7aIdx >= 0) expect(m3cIdx).toBeLessThan(m7aIdx)
    if (m6bIdx >= 0) expect(m3cIdx).toBeLessThan(m6bIdx)
    if (m9Idx >= 0) expect(m3cIdx).toBeLessThan(m9Idx)
  })
})