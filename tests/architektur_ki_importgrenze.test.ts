// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest'
import { beschreibe } from './architektur_pruefung'
import { grenzDateien, istAusgenommen, pruefeImportgrenze } from './architektur_ki_importgrenze'
import { WURZEL, legeAn, raeumeAuf } from './probebaum'

/*
Die Importgrenze der Strategien (U5, P0.3d, Weg (b) aus Mangel 1 der Schlussprüfung 2):
Ausserhalb von src/ki/strategien/ importiert Code von dort nur die Registry index.ts und
Typen aus strategie.ts. So erreicht kein Rahmen, keine App und kein Skript eine Fabrik,
die nicht in der Registry steht, gleich in welcher Form sie exportiert ist; der
Isolationstest prüft jeden Eintrag der Registry. Ausgenommen sind genau `*.test.ts(x)`
und tests/.
*/

afterAll(raeumeAuf)

const STRATEGIEN = {
  'src/ki/strategien/strategie.ts': 'export interface Ki { name: string }\nexport type Fabrik = (zufall: () => number) => Ki\n',
  'src/ki/strategien/zufallsKi.ts': "import type { Ki } from './strategie'\nexport function erstelleZufallsKi(_zufall: () => number): Ki { return { name: 'z' } }\n",
  'src/ki/strategien/hilfe.ts': "import { erstelleZufallsKi } from './zufallsKi'\nexport const auchHier = erstelleZufallsKi\n",
  'src/ki/strategien/index.ts': "import { erstelleZufallsKi } from './zufallsKi'\nexport const STRATEGIEN = { zufallsKi: erstelleZufallsKi }\n",
}
/** Eine Datei, die die Zufalls-KI aus `pfad` holt; die Gegenproben unterscheiden sich nur im Pfad. */
const importiere = (pfad: string) => `import { erstelleZufallsKi } from '${pfad}'\nexport const k = erstelleZufallsKi\n`
const ZUFALLS_KI = importiere('../ki/strategien/zufallsKi')

/** Erlaubt: Registry, Typen aus strategie.ts, Strategien unter sich, Tests. */
const ERLAUBT: Record<string, string> = {
  'src/entwicklung/erlaubt.tsx': [
    "import { STRATEGIEN } from '../ki/strategien'",
    "import { STRATEGIEN as auchDie } from '../ki/strategien/index'",
    "import type { Ki } from '../ki/strategien/strategie'",
    "import { type Fabrik } from '../ki/strategien/strategie.ts'",
    "import * as schnittstelle from '../ki/strategien/strategie'",
    "export type T = Ki | Fabrik | typeof schnittstelle | typeof import('../ki/strategien/strategie').Ki",
    "export const lade = () => import('../ki/strategien/index.ts')",
    "export const k = [STRATEGIEN.zufallsKi, auchDie, '/spiel', './anderes']",
    '',
  ].join('\n'),
  'src/entwicklung/tisch.test.tsx': ZUFALLS_KI,
  'src/entwicklung/zweiter.test.ts': ZUFALLS_KI,
  'tests/messlauf.ts': importiere('../src/ki/strategien/zufallsKi'),
  'src/entwicklung/nutzer.ts': importiere('./weiter'),
  'src/entwicklung/bruecke_hilfe.test.ts': ZUFALLS_KI,
  'tests/bruecke.ts': importiere('../src/ki/strategien/zufallsKi'),
}

/** Gegenproben: jede Datei muss gemeldet werden. */
const GEGENPROBEN: Array<[string, string, string]> = [
  ['statischer Import aus src/entwicklung', 'src/entwicklung/statisch.tsx', ZUFALLS_KI],
  ['import() aus src/entwicklung', 'src/entwicklung/dynamisch.ts', "export const lade = () => import('../ki/strategien/zufallsKi')\n"],
  ['Weiterexport über eine Hilfsdatei ausserhalb von strategien/', 'src/entwicklung/weiter.ts', "export { erstelleZufallsKi } from '../ki/strategien/zufallsKi'\n"],
  ['relativer Umweg über ./', 'src/entwicklung/umweg.ts', importiere('../ki/strategien/./zufallsKi')],
  ['relativer Umweg über ../', 'src/entwicklung/umweg2.ts', importiere('../ki/../ki/strategien/zufallsKi')],
  ['mit Endung .ts', 'src/entwicklung/endung.ts', importiere('../ki/strategien/zufallsKi.ts')],
  ['vom Projektordner aus mit /src', 'src/entwicklung/absolut.ts', importiere('/src/ki/strategien/zufallsKi')],
  ['mit anderer Gross- und Kleinschreibung', 'src/entwicklung/schreibung.ts', importiere('../ki/Strategien/ZufallsKi')],
  ['mit Vite-Zusatz ?raw', 'src/entwicklung/roh.ts', "import quelle from '../ki/strategien/zufallsKi.ts?raw'\nexport const k = quelle\n"],
  ['require', 'src/entwicklung/erfordert.ts', "export const k = require('../ki/strategien/zufallsKi')\n"],
  ['export * from', 'src/entwicklung/alles.ts', "export * from '../ki/strategien/zufallsKi'\n"],
  ['import type aus einer Strategie', 'src/entwicklung/typ.ts', "import type { erstelleZufallsKi } from '../ki/strategien/zufallsKi'\nexport type T = typeof erstelleZufallsKi\n"],
  ['typeof import()', 'src/entwicklung/typ2.ts', "export type T = typeof import('../ki/strategien/zufallsKi')\n"],
  ['import.meta.glob auf die Strategien', 'src/entwicklung/glob.ts', "export const alle = import.meta.glob('../ki/strategien/*.ts', { eager: true })\n"],
  ['import.meta.glob über den ganzen Baum', 'src/entwicklung/glob2.ts', "export const alle = import.meta.glob(['../**/*.ts', '!**/index.ts'])\n"],
  ['import.meta.resolve', 'src/entwicklung/aufloesen.ts', "export const pfad = import.meta.resolve('../ki/strategien/zufallsKi.ts')\n"],
  ['new URL mit import.meta.url', 'src/entwicklung/arbeiter.ts', "export const w = new Worker(new URL('../ki/strategien/zufallsKi.ts', import.meta.url))\n"],
  ['import() mit berechnetem Namen', 'src/entwicklung/berechnet.ts', "export const lade = (name: string) => import(`../ki/strategien/${name}`)\n"],
  ['require mit berechnetem Namen', 'src/entwicklung/berechnet2.ts', "export const lade = (name: string) => require('../ki/' + name)\n"],
  ['umbenannter Lader aus createRequire', 'src/entwicklung/lader.ts', "import { createRequire } from 'node:module'\nconst laden = createRequire(import.meta.url)\nexport const k = laden('../ki/strategien/zufallsKi')\n"],
  ['eine Hilfsdatei unter strategien/', 'src/entwicklung/hilfe.ts', "import { auchHier } from '../ki/strategien/hilfe'\nexport const k = auchHier\n"],
  ['über eine Testdatei', 'src/entwicklung/bruecke.ts', "import { k } from './bruecke_hilfe.test'\nexport const auch = k\n"],
  ['über eine Datei unter tests/', 'src/entwicklung/bruecke2.ts', "import { k } from '../../tests/bruecke'\nexport const auch = k\n"],
  ['aus dem Rahmen unter src/ki', 'src/ki/rahmen.ts', importiere('./strategien/zufallsKi')],
  ['aus einem Helfer unter __tests__', 'src/ui/__tests__/helfer.ts', importiere('../../ki/strategien/zufallsKi')],
  ['aus scripts/', 'scripts/messlauf.mjs', importiere('../src/ki/strategien/zufallsKi.ts')],
  ['aus dem Wurzelordner', 'messlauf.config.ts', importiere('./src/ki/strategien/zufallsKi')],
]

const probe = legeAn({
  ...STRATEGIEN,
  ...ERLAUBT,
  ...Object.fromEntries(GEGENPROBEN.map(([, datei, inhalt]) => [datei, inhalt])),
})
const befunde = pruefeImportgrenze(probe)
const befundeIn = (datei: string) => befunde.filter((verstoss) => verstoss.datei === datei)

describe('P0.3d: U5 – Importgrenze, ausserhalb von src/ki/strategien nur Registry und Typen aus strategie.ts', () => {
  it('P0.3d: im Repo importiert kein Code ausserhalb der Strategien eine Strategie an der Registry vorbei', () => {
    const dateien = grenzDateien(WURZEL)

    expect(dateien, 'U5: erwartet Tisch, App und Rahmen unter den geprüften Dateien').toEqual(
      expect.arrayContaining(['src/entwicklung/Tisch.tsx', 'src/App.tsx', 'src/ki/schritt.ts', 'vite.config.ts']),
    )
    expect(dateien.filter((pfad) => pfad.startsWith('src/ki/strategien/') || istAusgenommen(pfad)), 'U5: Strategien und Tests gehören nicht dazu').toEqual([])
    expect(beschreibe(pruefeImportgrenze(WURZEL)), 'U5: erwartet keinen Import einer Strategie ausserhalb von src/ki/strategien').toBe('')
  })

  it('P0.3d: die Ausnahme gilt genau für *.test.ts(x) und tests/', () => {
    const ausgenommen = ['src/a.test.ts', 'src/ui/b.test.tsx', 'tests/c.ts', 'tests/layout/d.spec.ts']
    const nicht = ['src/a.spec.ts', 'src/ui/__tests__/b.ts', 'src/a.test.mjs', 'src/tests/c.ts', 'scripts/tests/d.ts', 'src/a.testing.ts']

    expect(ausgenommen.filter((pfad) => !istAusgenommen(pfad)), 'U5: diese Pfade sind Testdateien').toEqual([])
    expect(nicht.filter(istAusgenommen), 'U5: diese Pfade sind keine Ausnahme').toEqual([])
  })

  it('P0.3d: Registry, Typen aus strategie.ts, Strategien unter sich und Tests bleiben erlaubt', () => {
    const erlaubt = [...Object.keys(ERLAUBT), ...Object.keys(STRATEGIEN)]

    expect(beschreibe(befunde.filter(({ datei }) => erlaubt.includes(datei))), 'U5: erwartet keinen Verstoss in den erlaubten Dateien').toBe('')
  })

  it.each(GEGENPROBEN)('P0.3d: Gegenprobe „%s“ wird gemeldet', (name, datei) => {
    expect(befundeIn(datei).length, `U5: erwartet eine Meldung für ${name} in ${datei}, gefunden:\n${beschreibe(befunde)}`).toBeGreaterThan(0)
  })
})

describe('P0.3d: U5 – aus strategie.ts nur Typen, sobald die Datei Werte hat', () => {
  const mitWert = legeAn({
    ...STRATEGIEN,
    'src/ki/strategien/strategie.ts': `${STRATEGIEN['src/ki/strategien/strategie.ts']}export const STANDARD = 1\nexport { erstelleZufallsKi } from './zufallsKi'\n`,
    'src/entwicklung/typen.ts': [
      "import type { Ki } from '../ki/strategien/strategie'",
      "import { type Fabrik, Ki as Auch } from '../ki/strategien/strategie'",
      "import type * as alles from '../ki/strategien/strategie'",
      'export type T = Ki | Fabrik | Auch | typeof alles',
      '',
    ].join('\n'),
    'src/entwicklung/wert.ts': "import { STANDARD } from '../ki/strategien/strategie'\nexport const k = STANDARD\n",
    'src/entwicklung/weitergereicht.ts': importiere('../ki/strategien/strategie'),
    'src/entwicklung/namensraum.ts': "import * as alles from '../ki/strategien/strategie'\nexport const k = alles\n",
    'src/entwicklung/dynamisch.ts': "export const lade = () => import('../ki/strategien/strategie')\n",
    'src/entwicklung/alles.ts': "export * from '../ki/strategien/strategie'\n",
  })
  const gefunden = pruefeImportgrenze(mitWert)
  const gemeldet = [...new Set(gefunden.map(({ datei }) => datei))].sort()

  it('P0.3d: Typen bleiben erlaubt, jeder Wert und jeder Zugriff auf das ganze Modul wird gemeldet', () => {
    expect(gemeldet, `U5: erwartet Meldungen genau für die Wertzugriffe, gefunden:\n${beschreibe(gefunden)}`).toEqual([
      'src/entwicklung/alles.ts',
      'src/entwicklung/dynamisch.ts',
      'src/entwicklung/namensraum.ts',
      'src/entwicklung/weitergereicht.ts',
      'src/entwicklung/wert.ts',
    ])
  })

  it('P0.3d: hat strategie.ts keine Werte, bleibt auch import * as erlaubt', () => {
    expect(beschreibe(befundeIn('src/entwicklung/erlaubt.tsx')), 'U5: import * as aus strategie.ts ohne Werte ist erlaubt').toBe('')
  })
})
