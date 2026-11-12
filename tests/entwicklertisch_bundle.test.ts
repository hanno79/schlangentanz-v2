// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const WURZEL = resolve(__dirname, '..')
const VITE = resolve(WURZEL, 'node_modules/vite/bin/vite.js')

/** Zusätzliches Textmerkmal: Chunkname, CSS-Klasse und Text des Tischs. */
const MERKMAL = /entwicklertisch/i

/** Ein Eintrag im Vite-Manifest, soweit hier gebraucht. */
interface ManifestEintrag {
  file: string
  isEntry?: boolean
  isDynamicEntry?: boolean
  dynamicImports?: string[]
}

interface Build {
  /** Welche Quellmodule als eigener Chunk im Build stehen (Schlüssel des Manifests). */
  manifest: Record<string, ManifestEintrag>
  dateien: { datei: string; inhalt: string }[]
}

/**
 * Baut die App wie `vite build --mode <modus>` in ein Wegwerfverzeichnis.
 *
 * Als eigener Prozess und mit bereinigter Umgebung: Im Testlauf steht
 * `NODE_ENV=test`, und damit baute Vite einen Dev-Build, in dem der Tisch
 * absichtlich enthalten ist. Gemessen werden soll der Build, den Vercel erzeugt.
 *
 * Geprüft wird am Modulgraphen (Manifest) und zusätzlich am Text: Das Manifest
 * fällt nicht auf eine Umbenennung herein, die Textsuche findet auch Code, der
 * in einen anderen Chunk eingebaut wurde.
 */
function baue(modus: 'production' | 'testhooks'): Build {
  const ziel = mkdtempSync(join(tmpdir(), 'schlangentanz-bundle-'))
  const umgebung = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !/^(NODE_ENV|VITEST.*|VITE_.*)$/.test(name)),
  )
  try {
    execFileSync(
      process.execPath,
      [VITE, 'build', '--mode', modus, '--outDir', ziel, '--emptyOutDir', '--manifest', '--logLevel', 'error'],
      { cwd: WURZEL, env: umgebung, stdio: 'pipe' },
    )
    const manifest = JSON.parse(readFileSync(join(ziel, '.vite', 'manifest.json'), 'utf8')) as Build['manifest']
    const dateien = readdirSync(ziel, { recursive: true, encoding: 'utf8' })
      .map((datei) => join(ziel, datei))
      .filter((pfad) => /\.(js|css|html)$/.test(pfad))
      .map((pfad) => ({ datei: pfad.slice(ziel.length + 1), inhalt: readFileSync(pfad, 'utf8') }))
    return { manifest, dateien }
  } finally {
    rmSync(ziel, { recursive: true, force: true })
  }
}

const TISCH = 'src/entwicklung/Entwicklertisch.tsx'

describe('P0.4 K3: der Entwicklertisch steht nicht im Produktionsbundle', () => {
  it('P0.4 K3: kein Modul aus src/entwicklung und kein Text des Tischs im Produktionsbuild', () => {
    const { manifest, dateien } = baue('production')
    expect(Object.keys(manifest).length, 'Produktionsbuild ohne Manifest').toBeGreaterThan(0)
    expect(Object.keys(manifest).filter((modul) => modul.startsWith('src/entwicklung/'))).toEqual([])
    expect(Object.values(manifest).flatMap((eintrag) => eintrag.dynamicImports ?? [])).not.toContain(TISCH)
    const fundstellen = dateien.filter(({ datei, inhalt }) => MERKMAL.test(datei) || MERKMAL.test(inhalt))
    expect(fundstellen.map(({ datei }) => datei), 'Entwicklertisch im Produktionsbundle gefunden in').toEqual([])
  }, 120_000)

  it('P0.4 K3 Gegenprobe: der Testhook-Build lädt ihn als eigenen Chunk nach', () => {
    const { manifest } = baue('testhooks')
    expect(manifest[TISCH]?.isDynamicEntry, `${TISCH} ist kein nachgeladener Chunk`).toBe(true)
    const einstieg = Object.values(manifest).find((eintrag) => eintrag.isEntry === true)
    expect(einstieg?.dynamicImports, 'Der Einstieg lädt den Tisch nicht nach').toContain(TISCH)
  }, 120_000)
})
