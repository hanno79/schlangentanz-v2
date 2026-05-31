/**
 * Author: rahn
 * Datum: 31.05.2026
 * Version: 1.0
 * Beschreibung: Prüft, dass die Schlangentanz-Spezifikation die übernommenen R1-Setup-Regeln dokumentiert.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SPEC_PATH = join(process.cwd(), 'docs', 'GAME_SPEC.md')

function readSpec(): string {
  return readFileSync(SPEC_PATH, 'utf8')
}

describe('GAME_SPEC R1 Setup-Regeln', () => {
  it('dokumentiert die aus Dart übernommenen Setup-Akzeptanzkriterien', () => {
    const spec = readSpec()

    expect(spec).toContain('Nachziehstapel enthält exakt 111 Karten')
    expect(spec).toContain('78 Farbkarten')
    expect(spec).toContain('33 Sonderkarten')
    expect(spec).toContain('8 offene Aufgabenkarten')
    expect(spec).toContain('7 geheime Aufgabenkarten')
    expect(spec).toContain('5 Startkarten')
    expect(spec).toContain('3 offene Aufgaben')
    expect(spec).toContain('1 geheime Aufgabe')
  })
})
