/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R107 prüft den reproduzierbaren Production-Smoke-Skriptpfad.
*/

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const PROJEKTWURZEL = process.cwd()

describe('R107 Production-Smoke-Skript', () => {
  it('stellt einen npm-Skriptpfad für den Production-Smoke bereit', () => {
    const packageJson = JSON.parse(readFileSync(join(PROJEKTWURZEL, 'package.json'), 'utf8')) as { scripts?: Record<string, string> }

    expect(packageJson.scripts?.['smoke:production']).toBe('node scripts/live_smoke.mjs')
  })

  it('hat einen schnellen Selbsttest für die exakte Smoke-Konfiguration', async () => {
    const smokePfad = pathToFileURL(join(PROJEKTWURZEL, 'scripts/live_smoke.mjs')).href
    const smoke = await import(smokePfad) as {
      erstelleSelbsttestAusgabe: () => string
    }

    expect(smoke.erstelleSelbsttestAusgabe()).toBe([
      'Routen: /, /game',
      'Kerntexte: Spielstatus | Aktiver Spieler | Aktionen | Schlangenbereich',
      'R107 Selbsttest bestanden',
    ].join('\n'))
  })

  it('nutzt exakte Browser-Regionen mit sichtbarer-Heading-Fallback, URL-Normalisierung und HTTP-Timeouts', () => {
    const skript = readFileSync(join(PROJEKTWURZEL, 'scripts/live_smoke.mjs'), 'utf8')

    expect(skript).toContain('PFLICHT_ROUTEN')
    expect(skript).toContain('PFLICHT_KERN_TEXTE')
    expect(skript).toContain('new URL(route, BASE_URL).toString()')
    expect(skript).toContain('AbortSignal.timeout')
    expect(skript).toContain('async function kernTextSichtbar')
    expect(skript).toContain("getByRole('region', { name: text, exact: true })")
    expect(skript).toContain("getByRole('heading', { name: text, exact: true })")
    expect(skript).toContain('getByText(text, { exact: true })')
    expect(skript).not.toContain('exact: false')
    expect(skript).not.toContain('BASE_URL + route')
  })
})
