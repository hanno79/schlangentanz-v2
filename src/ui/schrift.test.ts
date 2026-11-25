// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/*
O11 (Feinschliff): Beide Schriften liegen als WOFF2 unter `public/schrift/`,
die komprimierte Webfassung. Lilita One lag bis O11 als TTF dort und war damit
gut ein Drittel grösser als nötig. Neben den Schriften liegen nur ihre Lizenzen.
*/

const ORDNER = join(resolve(__dirname, '../..'), 'public', 'schrift')
const dateien = readdirSync(ORDNER)

describe('O11: Schriften als WOFF2', () => {
  it('O11: jede Schriftdatei ist WOFF2; daneben liegen nur die Lizenzen', () => {
    const fremd = dateien.filter((datei) => !datei.endsWith('.woff2') && !/^OFL-.+\.txt$/.test(datei))
    expect(fremd, 'Dateien unter public/schrift, die weder WOFF2 noch Lizenz sind').toEqual([])
  })

  it('O11: Lilita One liegt als WOFF2 vor und ist höchstens 20 KB gross', () => {
    const lilita = dateien.filter((datei) => datei.startsWith('LilitaOne'))
    expect(lilita, 'Lilita One unter public/schrift').toEqual(['LilitaOne-Regular.woff2'])
    const groesse = statSync(join(ORDNER, 'LilitaOne-Regular.woff2')).size
    expect(groesse, `LilitaOne-Regular.woff2: ${groesse} Bytes`).toBeLessThanOrEqual(20_000)
  })
})
