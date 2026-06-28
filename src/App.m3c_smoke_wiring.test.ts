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
    // M3c MUSS am Ende der Kette stehen (junge Slices ans Ende append).
    expect(smokeChain.trim().endsWith('m3c_sonniges_nest_player_cards_smoke.mjs')).toBe(true)
  })
})