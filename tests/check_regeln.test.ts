// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { legeAn, pruefeRegeln as pruefe, raeumeAuf } from './probebaum'

const SAUBERER_REGELTEST = [
  "describe('A5: Spielablauf', () => {",
  "  it('füllt am Zugende auf 5 auf', () => {})",
  '})',
  "it('A11: Dreiergruppe zählt', () => {})",
  "it.each([1, 2])('D12: höchstens %i Karten', () => {})",
  '',
].join('\n')

afterEach(raeumeAuf)

describe('P0.3: check:regeln ist ohne Verstoss grün', () => {
  it('P0.3: ein sauberer Baum endet mit 0 und nennt, wie viele Dateien geprüft wurden', () => {
    const wurzel = legeAn({
      'src/engine/__tests__/ablauf.test.ts': SAUBERER_REGELTEST,
      'src/engine/zug.ts': 'export const zahl: number = 1\n',
      'tests/irgendwas.test.ts': "it('P0.3: ohne Spec-Abschnitt erlaubt, weil kein Regeltest', () => {})\n",
      'src/ui/Knopf.tsx': 'export const Knopf = () => null\n'.repeat(300),
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(ausgabe, 'check:regeln: Zusammenfassung fehlt').toMatch(/4 Dateien geprüft/)
    expect(ausgabe, 'check:regeln: Zahl der Regeltests fehlt').toContain('Regeltestdateien unter src/engine: 1')
    expect(code, `check:regeln: erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
  })

  it('P0.3: Texte in Zeichenketten zählen nicht als Verstoss', () => {
    const wurzel = legeAn({
      'tests/texte.test.ts': [
        "const a = 'it.skip(\"x\") und describe.only'",
        "const b = '// @ts-ignore'",
        'const c = `/* eslint-disable */ und : any`',
        "it('P0.3: Texte', () => { void [a, b, c] })",
        '',
      ].join('\n'),
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `check:regeln: Zeichenketten fälschlich gemeldet:\n${ausgabe}`).toBe(0)
  })
})

describe('U1: Regeltests nennen ihren Spec-Abschnitt', () => {
  it('U1: ein Regeltest unter src/engine ohne Abschnitt im Namen schlägt fehl', () => {
    const wurzel = legeAn({
      'src/engine/__tests__/wertung.test.ts': "describe('Wertung', () => {\n  it('zählt Punkte', () => {})\n})\n",
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `U1: erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('U1')
    expect(ausgabe).toContain('src/engine/__tests__/wertung.test.ts:2')
    expect(ausgabe).toContain('Wertung › zählt Punkte')
  })

  it('U1: ein Abschnitt im umgebenden describe genügt, auch A7.4 und B2', () => {
    const wurzel = legeAn({
      'src/engine/karten/frass.test.ts': [
        "describe('A7.4 Schlangenfrass', () => { it('frisst eine Karte', () => {}) })",
        "describe('B2', () => { describe('Startspieler', () => { test('Mensch beginnt', () => {}) }) })",
        '',
      ].join('\n'),
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `U1: erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
  })

  it('U1: ein Name, der nicht als Text im Quelltext steht, gilt als Verstoss', () => {
    const wurzel = legeAn({
      'src/engine/x.test.ts': "const name = 'A5: x'\nit(name, () => {})\n",
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `U1: erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('src/engine/x.test.ts:2')
  })
})

describe('U6: kein any, kein @ts-ignore, kein unbegründetes eslint-disable, kein skip/only', () => {
  const faelle: Array<[string, string]> = [
    ['any als Typ', 'export const x: any = 1\n'],
    ['any in einem Generikum', 'export const x: Array<any> = []\n'],
    ['@ts-ignore', '// @ts-ignore\nexport const x = 1\n'],
    ['@ts-nocheck', '/* @ts-nocheck */\nexport const x = 1\n'],
    ['eslint-disable ohne Begründung', '// eslint-disable-next-line no-console\nconsole.log(1)\n'],
    ['eslint-disable mit leerer Begründung', '/* eslint-disable no-console -- */\nconsole.log(1)\n'],
    ['it.skip', "it.skip('P0.3: x', () => {})\n"],
    ['it.only', "it.only('P0.3: x', () => {})\n"],
    ['describe.skip', "describe.skip('P0.3: x', () => {})\n"],
    ['test.skip als Wert', "const t = true ? test.skip : test\nt('P0.3: x', () => {})\n"],
    ['it.todo', "it.todo('P0.3: x')\n"],
  ]

  it.each(faelle)('U6: %s schlägt fehl', (_, inhalt) => {
    const wurzel = legeAn({ 'tests/verstoss.test.ts': inhalt })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `U6: erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('U6')
    expect(ausgabe).toContain('tests/verstoss.test.ts:')
  })

  it('U6: eslint-disable mit Begründung in derselben Zeile ist erlaubt', () => {
    const wurzel = legeAn({
      'src/a.ts': '// eslint-disable-next-line no-console -- Ausgabe für den Entwickler gewollt\nconsole.log(1)\n',
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `U6: erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
  })

  it('U6: gilt auch für Skripte und Konfigurationen im Wurzelordner', () => {
    const wurzel = legeAn({
      'scripts/werkzeug.mjs': '/* eslint-disable */\nexport {}\n',
      'vite.config.ts': 'export default {} as any\n',
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `U6: erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('scripts/werkzeug.mjs:1')
    expect(ausgabe).toContain('vite.config.ts:1')
  })
})

describe('U7: Dateigrössen', () => {
  it('U7: eine Testdatei mit 500 Zeilen schlägt fehl, 499 sind erlaubt', () => {
    const zeile = "it('P0.3: x', () => {})\n"
    const zuLang = legeAn({ 'tests/lang.test.ts': zeile.repeat(500) })
    const gerade = legeAn({ 'tests/lang.test.ts': zeile.repeat(499) })

    const lang = pruefe(zuLang)
    const passend = pruefe(gerade)

    expect(lang.code, 'U7: 500 Zeilen müssen fehlschlagen').toBe(1)
    expect(lang.ausgabe).toContain('tests/lang.test.ts: 500 Zeilen')
    expect(passend.code, `U7: 499 Zeilen sind erlaubt:\n${passend.ausgabe}`).toBe(0)
  })

  it('U7: eine Datei unter src/ui oder src/ki mit 301 Zeilen schlägt fehl', () => {
    const wurzel = legeAn({
      'src/ui/Tisch.tsx': 'export {}\n'.repeat(301),
      'src/ki/bewertung.ts': 'export {}\n'.repeat(301),
      'src/ui/tisch.css': '.a {}\n'.repeat(301),
      'src/engine/gross.ts': 'export {}\n'.repeat(900),
    })

    const { code, ausgabe } = pruefe(wurzel)

    expect(code, `U7: erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('src/ui/Tisch.tsx: 301 Zeilen')
    expect(ausgabe).toContain('src/ki/bewertung.ts: 301 Zeilen')
    expect(ausgabe).toContain('src/ui/tisch.css: 301 Zeilen')
    expect(ausgabe, 'U7: src/engine fällt nicht unter die 300-Zeilen-Grenze').not.toContain('gross.ts')
  })
})
