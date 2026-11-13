// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import ts from 'typescript'
import { GERAETEKLASSEN } from '../scripts/pruefung/geraeteklassen.mjs'
import { pngGroesse } from '../scripts/pruefung/bildschirmfotos.mjs'

const WURZEL = resolve(__dirname, '..')
const lies = (pfad: string) => readFileSync(join(WURZEL, pfad), 'utf8')
/** tsconfig-Dateien enthalten Kommentare; TypeScript liest sie, JSON.parse nicht. */
const liesTsconfig = (pfad: string) => ts.parseConfigFileTextToJson(pfad, lies(pfad)).config
const FOTOSKRIPT = join(WURZEL, 'scripts', 'pruefung', 'bildschirmfotos.mjs')
const VIEWPORT_META = '<meta name="viewport" content="width=device-width, initial-scale=1">'

type Projekt = {
  name?: string
  testMatch?: unknown
  testIgnore?: unknown
  use?: {
    baseURL?: string
    viewport?: { width: number; height: number } | null
    hasTouch?: boolean
    isMobile?: boolean
    launchOptions?: { executablePath?: string }
  }
}

async function ladeKonfiguration(chromiumPfad: string | undefined) {
  vi.resetModules()
  if (chromiumPfad === undefined) delete process.env.PW_CHROMIUM_PFAD
  else process.env.PW_CHROMIUM_PFAD = chromiumPfad
  const modul = await import('../playwright.config')
  return modul.default as { projects: Projekt[]; use?: Projekt['use']; webServer: Array<{ url: string }> }
}

/** Plan 2.3 und 3.4, Entscheidung des Autors vom 13.11.2026 (P0.3c). */
const ERWARTETE_KLASSEN = [
  { name: 'desktop', breite: 1280, hoehe: 900, touch: false },
  { name: 'tablet-quer', breite: 1024, hoehe: 768, touch: true },
  { name: 'tablet-hochkant', breite: 768, hoehe: 1024, touch: true },
  { name: 'handy-hochkant', breite: 390, hoehe: 844, touch: true },
  { name: 'handy-quer', breite: 844, hoehe: 390, touch: true },
]

afterEach(() => {
  delete process.env.PW_CHROMIUM_PFAD
})

describe('P0.3c: Geräteklassen', () => {
  it('P0.3c: es gibt genau fünf: Desktop 1280×900, Tablet quer 1024×768, Tablet hochkant 768×1024, Handy hochkant 390×844 und Handy quer 844×390, alle ausser Desktop mit Touch', () => {
    const ist = GERAETEKLASSEN.map(({ name, viewport, hasTouch }) => ({
      name,
      breite: viewport.width,
      hoehe: viewport.height,
      touch: hasTouch,
    }))

    expect(ist).toEqual(ERWARTETE_KLASSEN)
  })
})

describe('P0.3: playwright.config.ts', () => {
  it('P0.3c: je Geräteklasse, also zehnmal, ein Projekt für den Produktions- und eines für den Testhook-Build', async () => {
    const konfiguration = await ladeKonfiguration(undefined)

    const ist = konfiguration.projects.map(({ name, use }) => ({
      name,
      baseURL: use?.baseURL,
      breite: use?.viewport?.width,
      hoehe: use?.viewport?.height,
      touch: use?.hasTouch ?? false,
    }))

    expect(ist).toHaveLength(10)
    expect(ist).toEqual(
      ERWARTETE_KLASSEN.flatMap(({ name, breite, hoehe, touch }) => [
        { name, baseURL: 'http://localhost:4173', breite, hoehe, touch },
        { name: `${name}-testhooks`, baseURL: 'http://localhost:4174', breite, hoehe, touch },
      ]),
    )
    expect(konfiguration.webServer.map(({ url }) => url)).toEqual(['http://localhost:4173', 'http://localhost:4174'])
  })

  it('P0.3: ohne PW_CHROMIUM_PFAD nutzt Playwright sein eigenes Chromium, mit der Variable genau diesen Pfad', async () => {
    const ohne = await ladeKonfiguration(undefined)
    expect(ohne.use?.launchOptions?.executablePath, 'ohne Variable kein fester Pfad').toBeUndefined()

    const mit = await ladeKonfiguration(process.execPath)
    expect(mit.use?.launchOptions?.executablePath).toBe(process.execPath)
  })

  it('P0.3: ein PW_CHROMIUM_PFAD, unter dem nichts liegt, bricht mit klarer Meldung ab', async () => {
    const pfad = join(tmpdir(), 'gibt-es-nicht', 'chrome.exe')

    await expect(ladeKonfiguration(pfad)).rejects.toThrow(/PW_CHROMIUM_PFAD/)
  })

  it('P0.3: die Konfiguration nennt keinen festen Browserpfad', () => {
    const quelltext = lies('playwright.config.ts')

    // Laufwerksbuchstabe nur direkt nach einem Anführungszeichen, sonst träfe „http://“.
    expect(quelltext).not.toMatch(/['"`][A-Za-z]:[\\/]|\/usr\/|\/opt\/|chrome\.exe|ms-playwright/)
  })
})

describe('P0.3: TypeScript und npm-Skripte', () => {
  it.each(['tsconfig.app.json', 'tsconfig.node.json', 'tsconfig.layout.json'])('P0.3: %s setzt "strict": true', (datei) => {
    const konfiguration = liesTsconfig(datei) as { compilerOptions: { strict?: boolean } }

    expect(konfiguration.compilerOptions.strict, `${datei}: erwartet strict true`).toBe(true)
  })

  it('P0.3: tsconfig.test.json erbt strict von tsconfig.node.json und schaltet es nicht ab', () => {
    const konfiguration = liesTsconfig('tsconfig.test.json') as {
      extends: string
      compilerOptions: { strict?: boolean }
    }

    expect(konfiguration.extends).toBe('./tsconfig.node.json')
    expect(konfiguration.compilerOptions.strict).not.toBe(false)
  })

  it('P0.3: npm run check:regeln ruft scripts/check_regeln.mjs auf', () => {
    const paket = JSON.parse(lies('package.json')) as { scripts: Record<string, string> }

    expect(paket.scripts['check:regeln']).toBe('node scripts/check_regeln.mjs')
  })
})

describe('P0.3: scripts/pruefung/bildschirmfotos.mjs', () => {
  it('P0.3: pngGroesse liest Breite und Höhe aus dem PNG-Kopf und lehnt anderes ab', () => {
    const kopf = Buffer.alloc(24)
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(kopf, 0)
    kopf.writeUInt32BE(390, 16)
    kopf.writeUInt32BE(844, 20)

    expect(pngGroesse(kopf)).toEqual({ breite: 390, hoehe: 844 })
    expect(() => pngGroesse(Buffer.from('kein Bild'))).toThrow(/PNG/)
  })

  it('P0.3: ohne Adresse bricht das Skript mit Exit 2 und einer Anleitung ab', () => {
    const lauf = spawnSync(process.execPath, [FOTOSKRIPT], { encoding: 'utf8' })

    expect(lauf.status).toBe(2)
    expect(lauf.stderr).toContain('Aufruf:')
  })

  it('P0.3c: fotografiert eine Adresse in allen fünf Geräteklassen in der richtigen Grösse und misst pointer: coarse', { timeout: 120_000 }, () => {
    const ziel = mkdtempSync(join(tmpdir(), 'bildschirmfotos-'))
    try {
      // Mit viewport-Meta-Tag wie index.html; ohne legt Chromium die Seite 980 px breit aus (nächster Test).
      const adresse = `data:text/html,${VIEWPORT_META}<title>Probe</title><h1>Probe</h1>`
      const lauf = spawnSync(process.execPath, [FOTOSKRIPT, adresse, '--name', 'probe', '--ziel', ziel], {
        encoding: 'utf8',
      })

      expect(lauf.status, `bildschirmfotos.mjs: Exit ${lauf.status}\n${lauf.stdout}\n${lauf.stderr}`).toBe(0)
      for (const { name, breite, hoehe, touch } of ERWARTETE_KLASSEN) {
        const datei = join(ziel, `probe-${name}.png`)
        expect(existsSync(datei), `${datei} fehlt`).toBe(true)
        expect(pngGroesse(readFileSync(datei)), `${name}: falsche Bildgrösse`).toEqual({ breite, hoehe })
        // Die Zeile des Skripts zu diesem Bild nennt, ob der Browser (pointer: coarse) gemeldet hat.
        const zeile = lauf.stdout.split('\n').find((text) => text.includes(`probe-${name}.png`))
        expect(zeile, `${name}: keine Ausgabezeile`).toBeDefined()
        expect(zeile, `${name}: pointer: coarse`).toContain(`pointer: coarse ${touch ? 'ja' : 'nein'}`)
      }
    } finally {
      rmSync(ziel, { recursive: true, force: true })
    }
  })

  it('P0.3c: eine Seite ohne viewport-Meta-Tag bricht mit Exit 1 und Hinweis ab, statt ein verkleinertes Bild abzulegen', { timeout: 120_000 }, () => {
    const ziel = mkdtempSync(join(tmpdir(), 'bildschirmfotos-'))
    try {
      const adresse = 'data:text/html,<title>Probe</title><h1>Probe</h1>'
      const lauf = spawnSync(process.execPath, [FOTOSKRIPT, adresse, '--name', 'probe', '--ziel', ziel], {
        encoding: 'utf8',
      })

      expect(lauf.status, `bildschirmfotos.mjs: Exit ${lauf.status}\n${lauf.stdout}\n${lauf.stderr}`).toBe(1)
      expect(lauf.stderr).toContain('980 px breit')
      expect(lauf.stderr).toContain('viewport')
    } finally {
      rmSync(ziel, { recursive: true, force: true })
    }
  })
})

describe('P0.3b: Anleitungen für Prüfer und Umsetzer decken die Stolpersteine ab', () => {
  const anleitungen = ['docs/abnahme/PRUEFER_ANLEITUNG.md', 'docs/abnahme/UMSETZER_ANLEITUNG.md']
  const pflicht: Array<[string, string]> = [
    ['lauschender Socket englisch', 'LISTENING'],
    ['lauschender Socket deutsch', 'ABHÖREN'],
    ['TIME_WAIT ignorieren', 'TIME_WAIT'],
    ['WARTEND ignorieren', 'WARTEND'],
    ['Befehlszeile des Prozesses prüfen', 'CommandLine'],
    ['eigener Unterordner im Scratchpad', 'Unterordner'],
    ['Logs beim Lauf mitschreiben', 'tee'],
    ['Breite mit Playwright messen', 'setViewportSize'],
    ['waagrechtes Scrollen', 'scrollWidth > clientWidth'],
    ['verkettete git-Befehle einzeln', 'einzeln aus'],
  ]

  it.each(anleitungen.flatMap((datei) => pflicht.map(([was, text]) => [datei, was, text])))('P0.3b: %s nennt %s', (datei, _, text) => {
    expect(lies(datei)).toContain(text)
  })

  it('P0.3b: Urteile heissen überall ABGENOMMEN oder ABGELEHNT', () => {
    for (const datei of ['docs/abnahme/PRUEFER_ANLEITUNG.md', 'docs/abnahme/VORLAGE.md']) {
      expect(lies(datei), datei).toContain('ABGELEHNT')
      expect(lies(datei), datei).not.toContain('NICHT ABGENOMMEN')
    }
  })

  it('P0.3b: die Prüferanleitung erklärt Testregister, Probe ohne PR und Eszett in Zitaten', () => {
    const text = lies('docs/abnahme/PRUEFER_ANLEITUNG.md')

    for (const teil of ['Block „Testregister“', 'rules/testregister.md', '--eintrag', 'Humanizer', '.txt', 'ohne Bereich', 'ohne PR', 'Eszett']) {
      expect(text, `PRUEFER_ANLEITUNG.md: „${teil}“ fehlt`).toContain(teil)
    }
  })
})

describe('P0.3c: Anleitungen und Befehle nennen fünf Geräteklassen', () => {
  const ALLE = ['docs/abnahme/PRUEFER_ANLEITUNG.md', 'docs/abnahme/UMSETZER_ANLEITUNG.md', 'docs/abnahme/VORLAGE.md', 'docs/WORKFLOW.md', 'AGENTS.md']
  /** Wer mit Projekten arbeitet, braucht die Namen; wer Fotos beschreibt, Fenster und Dateinamen. */
  const MIT_PROJEKTNAMEN = ['docs/abnahme/UMSETZER_ANLEITUNG.md', 'docs/WORKFLOW.md', 'AGENTS.md']
  const MIT_FENSTERN = ['docs/abnahme/PRUEFER_ANLEITUNG.md', 'docs/abnahme/VORLAGE.md']

  /** In AGENTS.md zählt nur der Abschnitt „Befehle“; der Rest ist Baseline-Kern. */
  const text = (datei: string) => (datei === 'AGENTS.md' ? (lies(datei).split('## Befehle')[1] ?? '').split('\n## ')[0] : lies(datei))

  it.each(ALLE)('P0.3c: %s spricht nirgends mehr von drei Geräteklassen', (datei) => {
    expect(text(datei)).not.toMatch(/drei (Geräte)?klassen/i)
  })

  it.each(MIT_PROJEKTNAMEN)('P0.3c: %s nennt die fünf Projektnamen', (datei) => {
    for (const { name } of ERWARTETE_KLASSEN) expect(text(datei), `${datei}: \`${name}\` fehlt`).toContain(`\`${name}\``)
  })

  it.each(MIT_FENSTERN)('P0.3c: %s nennt die fünf Fenster und Bilddateien', (datei) => {
    for (const { name, breite, hoehe } of ERWARTETE_KLASSEN) {
      expect(text(datei), `${datei}: ${breite}×${hoehe} fehlt`).toContain(`${breite}×${hoehe}`)
      expect(text(datei), `${datei}: -${name}.png fehlt`).toContain(`-${name}.png`)
    }
  })
})
