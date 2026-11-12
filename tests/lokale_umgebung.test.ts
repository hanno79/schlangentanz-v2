// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import viteKonfiguration from '../vite.config'

type Paketbeschreibung = {
  scripts: Record<string, string>
  engines?: { node?: string }
}

const paket = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8'),
) as Paketbeschreibung

/** Ruft die Vite-Konfiguration so auf, wie `vite build --mode <modus>` es tut. */
function konfigurationFuer(modus: string) {
  if (typeof viteKonfiguration !== 'function') {
    throw new Error(
      'konfigurationFuer: vite.config.ts muss eine Funktion exportieren, die den Modus erhält; ' +
        `erhalten: ${typeof viteKonfiguration}`,
    )
  }
  return viteKonfiguration({ command: 'build', mode: modus, isSsrBuild: false, isPreview: false })
}

describe('P0.2: lokale Umgebung', () => {
  it('P0.2: kein npm-Skript setzt eine Variable in POSIX-Schreibweise (läuft unter Windows nicht)', () => {
    const posixZuweisung = /(^|&&|;)\s*[A-Za-z_][A-Za-z0-9_]*=/
    const betroffen = Object.entries(paket.scripts).filter(([, befehl]) => posixZuweisung.test(befehl))

    expect(betroffen, 'package.json: erwartet keine Skripte mit VAR=-Präfix, erhalten').toEqual([])
  })

  it('P0.2: build:testhooks baut im Modus testhooks nach dist-testhooks', () => {
    const befehl = paket.scripts['build:testhooks']

    expect(befehl, 'build:testhooks: erwartet "--mode testhooks"').toContain('--mode testhooks')
    expect(befehl, 'build:testhooks: Ausgabe muss weiter nach dist-testhooks gehen').toContain(
      '--outDir dist-testhooks',
    )
  })

  it('P0.2: der Modus testhooks schaltet VITE_TEST_HOOKS ein, jeder andere Modus nicht', () => {
    expect(
      konfigurationFuer('testhooks').define?.['import.meta.env.VITE_TEST_HOOKS'],
      'vite.config.ts im Modus testhooks: erwartet VITE_TEST_HOOKS = "1"',
    ).toBe(JSON.stringify('1'))

    for (const modus of ['production', 'development', 'test']) {
      expect(
        konfigurationFuer(modus).define?.['import.meta.env.VITE_TEST_HOOKS'],
        `vite.config.ts im Modus ${modus}: VITE_TEST_HOOKS darf nicht gesetzt werden`,
      ).toBeUndefined()
    }
  })

  it('P0.2: package.json verlangt mindestens Node 22.13 (Untergrenze von eslint 10 und jsdom 29)', () => {
    expect(paket.engines?.node, 'package.json: engines.node fehlt oder nennt eine andere Untergrenze').toMatch(
      /^>=\s*22\.13/,
    )
  })
})
