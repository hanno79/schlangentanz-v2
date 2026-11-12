// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const WURZEL = resolve(__dirname, '..')
const VITE = resolve(WURZEL, 'node_modules/vite/bin/vite.js')

/** Merkmal des Entwicklertischs: Name des Chunks und Text auf der Seite. */
const MERKMAL = /entwicklertisch/i

/**
 * Baut die App wie `vite build --mode <modus>` in ein Wegwerfverzeichnis und gibt
 * jede erzeugte Datei mit Inhalt zurück.
 *
 * Als eigener Prozess und mit bereinigter Umgebung: Im Testlauf steht
 * `NODE_ENV=test`, und damit baute Vite einen Dev-Build, in dem der Tisch
 * absichtlich enthalten ist. Gemessen werden soll der Build, den Vercel erzeugt.
 */
function baue(modus: 'production' | 'testhooks'): { datei: string; inhalt: string }[] {
  const ziel = mkdtempSync(join(tmpdir(), 'schlangentanz-bundle-'))
  const umgebung = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !/^(NODE_ENV|VITEST.*|VITE_.*)$/.test(name)),
  )
  try {
    execFileSync(process.execPath, [VITE, 'build', '--mode', modus, '--outDir', ziel, '--emptyOutDir', '--logLevel', 'error'], {
      cwd: WURZEL,
      env: umgebung,
      stdio: 'pipe',
    })
    return readdirSync(ziel, { recursive: true, encoding: 'utf8' })
      .map((datei) => join(ziel, datei))
      .filter((pfad) => /\.(js|css|html)$/.test(pfad))
      .map((pfad) => ({ datei: pfad.slice(ziel.length + 1), inhalt: readFileSync(pfad, 'utf8') }))
  } finally {
    rmSync(ziel, { recursive: true, force: true })
  }
}

function fundstellen(dateien: { datei: string; inhalt: string }[]): string[] {
  return dateien.filter(({ datei, inhalt }) => MERKMAL.test(datei) || MERKMAL.test(inhalt)).map(({ datei }) => datei)
}

describe('P0.4 K3: der Entwicklertisch steht nicht im Produktionsbundle', () => {
  it('P0.4 K3: kein Chunk und keine Datei des Produktionsbuilds enthält den Entwicklertisch', () => {
    const dateien = baue('production')
    expect(dateien.length, 'Produktionsbuild ohne Ausgabe').toBeGreaterThan(0)
    expect(fundstellen(dateien), 'Entwicklertisch im Produktionsbundle gefunden in').toEqual([])
  }, 120_000)

  it('P0.4 K3 Gegenprobe: der Testhook-Build enthält ihn als eigenen, nachgeladenen Chunk', () => {
    const dateien = baue('testhooks')
    const chunks = dateien.filter(({ datei }) => /entwicklertisch/i.test(datei) && datei.endsWith('.js'))
    expect(chunks.length, 'Testhook-Build ohne eigenen Entwicklertisch-Chunk').toBe(1)
    const chunkName = chunks[0].datei.split(/[\\/]/).pop()!
    const einstieg = dateien.find(({ datei }) => /index-[^\\/]*\.js$/.test(datei))
    expect(einstieg, 'Einstiegs-Chunk fehlt').toBeDefined()
    expect(einstieg!.inhalt, 'Der Einstieg lädt den Tisch nicht nach').toContain(chunkName)
  }, 120_000)
})
