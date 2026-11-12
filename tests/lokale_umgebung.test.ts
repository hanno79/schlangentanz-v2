import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import viteKonfiguration from '../vite.config'

const wurzel = resolve(__dirname, '..')

type Paketbeschreibung = {
  scripts: Record<string, string>
  engines?: { node?: string }
}

function lesePaket(): Paketbeschreibung {
  return JSON.parse(readFileSync(resolve(wurzel, 'package.json'), 'utf8')) as Paketbeschreibung
}

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
  it('P0.2: build:testhooks setzt keine Variable in POSIX-Schreibweise und baut im Modus testhooks', () => {
    const befehl = lesePaket().scripts['build:testhooks']

    expect(befehl, 'package.json: Skript build:testhooks fehlt').toBeTypeOf('string')
    expect(
      /(^|&&|;)\s*[A-Za-z_][A-Za-z0-9_]*=/.test(befehl),
      `build:testhooks: erwartet kein VAR=-Präfix (läuft unter Windows nicht), erhalten "${befehl}"`,
    ).toBe(false)
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

  it('P0.2: package.json nennt die unterstützte Node-Version', () => {
    const node = lesePaket().engines?.node

    expect(node, 'package.json: engines.node fehlt').toBeTypeOf('string')
    expect(node?.trim(), 'package.json: engines.node ist leer').not.toBe('')
  })
})
