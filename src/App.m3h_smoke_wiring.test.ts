import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const chain: string = pkg.scripts?.['smoke:production'] ?? ''

function steps(): string[] {
  return chain.split('&&').map((s) => s.trim()).filter(Boolean)
}

describe('M3h Smoke-Wiring', () => {
  it('M3h-W1: package.json smoke:production chain enthaelt M3h-Smoke-Script', () => {
    const s = steps()
    expect(s).toContain('node scripts/m3h_stitch_lobby_avatar_smoke.mjs')
  })

  it('M3h-W2: M3h-Smoke-Script existiert und hat M3h-Asserts', () => {
    const src = readFileSync('scripts/m3h_stitch_lobby_avatar_smoke.mjs', 'utf8')
    // Smoke-Script MUSS die M3h-Akzeptanz-Kriterien enthalten.
    expect(src).toMatch(/Host-Badge genau 1x/)
    expect(src).toMatch(/Difficulty.*position:\s*absolute|Difficulty nicht position:absolute|Difficulty-Pillen im Flow/)
    expect(src).toMatch(/Boden-Streifen|Boden/)
    expect(src).toMatch(/'frei'|"frei"/)
    expect(src).toMatch(/\.lobby-slot__host-badge/)
    expect(src).toMatch(/\.lobby-slot__boden/)
  })

  it('M3h-W3: Alle smoke:production Schritte sind node scripts/ Calls (kein grep/awk)', () => {
    const s = steps()
    const nonNode = s.filter((step) => !step.startsWith('node scripts/'))
    expect(nonNode).toEqual([])
  })
})
