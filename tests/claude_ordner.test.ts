// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MIT_PROZESSEN, WURZEL, fuehreAus, git, legeAn, pruefeRegeln, raeumeAuf, schreibe } from './probebaum'

// Im Hauptordner liegen unter .claude/worktrees/ vollständige Kopien des Repos
// (Worktrees der Agenten). Kein Prüfwerkzeug darf sie mitprüfen: Ein Gate im
// Hauptordner würde sonst fremde, halbfertige Stände melden oder mitzählen.

const SAUBER = {
  'src/a.ts': 'export const a = 1\n',
  'tests/sauber.test.ts': "it('P0.3b: sauber', () => {})\n",
  'scripts/css_source_asserts_baseline.json': '{ "assertions": 0, "dateien": 0 }\n',
}
const KOPIE = '.claude/worktrees/agent-probe'
const VERSTOESSE = {
  [`${KOPIE}/src/engine/__tests__/alt.test.ts`]: "it('ohne Abschnitt', () => {})\n",
  [`${KOPIE}/tests/lang.test.ts`]: "it.skip('x', () => { const y: any = 1 })\n".repeat(600),
  // Zusammengesetzt, damit check:css-asserts diese Datei hier nicht selbst mitzählt.
  [`${KOPIE}/tests/css.test.ts`]: `const ${'app'}Css = 1\nexport { ${'app'}Css }\n`,
  [`${KOPIE}/src/ui/Gross.tsx`]: 'export {}\n'.repeat(400),
  '.claude/werkzeug.test.ts': "it.only('x', () => {})\n",
}
const PYTHON = process.platform === 'win32' ? 'python' : 'python3'

afterEach(raeumeAuf)

describe('P0.3b: Agenten-Worktrees unter .claude/ erfasst kein Prüfwerkzeug', MIT_PROZESSEN, () => {
  it('P0.3b: npm test (Vitest) sammelt keine Testdatei unter .claude/', { timeout: 60_000 }, () => {
    const wurzel = legeAn({ ...SAUBER, ...VERSTOESSE })
    const vitest = join(WURZEL, 'node_modules', 'vitest', 'vitest.mjs')

    const { code, ausgabe } = fuehreAus(process.execPath, [vitest, 'list', '--filesOnly', '--root', wurzel, '--config', join(WURZEL, 'vite.config.ts')])

    expect(code, `vitest list: erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
    expect(ausgabe, 'Gegenprobe: die eigene Testdatei muss gefunden werden').toContain('tests/sauber.test.ts')
    expect(ausgabe).not.toContain('.claude')
  })

  it('P0.3b: npx eslint . ignoriert .claude/', async () => {
    const eslint = new ESLint({ cwd: WURZEL })

    expect(await eslint.isPathIgnored(join(WURZEL, KOPIE, 'src', 'main.tsx'))).toBe(true)
    expect(await eslint.isPathIgnored(join(WURZEL, '.claude', 'werkzeug.ts'))).toBe(true)
    expect(await eslint.isPathIgnored(join(WURZEL, 'src', 'main.tsx')), 'Gegenprobe: src/ wird geprüft').toBe(false)
  })

  it('P0.3b: check:regeln meldet nichts unter .claude/', () => {
    const { code, ausgabe } = pruefeRegeln(legeAn({ ...SAUBER, ...VERSTOESSE }))

    expect(code, `check:regeln: erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
    expect(ausgabe).not.toContain('.claude')
  })

  it('P0.3b: check:test-lines zählt nichts unter .claude/', () => {
    const wurzel = legeAn({ ...SAUBER, ...VERSTOESSE })

    const { code, ausgabe } = fuehreAus(process.execPath, [join(WURZEL, 'scripts', 'check_test_file_lines.mjs')], wurzel)

    expect(code, `check:test-lines: erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
    expect(ausgabe).not.toContain('.claude')
  })

  it('P0.3b: check:css-asserts zählt nichts unter .claude/', () => {
    const wurzel = legeAn({ ...SAUBER, ...VERSTOESSE })

    const { code, ausgabe } = fuehreAus(process.execPath, [join(WURZEL, 'scripts', 'check_css_source_asserts.mjs')], wurzel)

    expect(code, `check:css-asserts: erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
    expect(ausgabe).toContain('0 in 0 Dateien')
  })

  it('P0.3b: regelcheck.py prüft nichts unter .claude/, auch nicht in einem echten Worktree', { timeout: 60_000 }, () => {
    const wurzel = legeAn({ ...SAUBER, 'README.md': '# Probe\n' })
    git(wurzel, 'init', '-q', '-b', 'haupt')
    git(wurzel, 'add', '-A')
    git(wurzel, 'commit', '-q', '-m', 'probe')
    git(wurzel, 'worktree', 'add', '-q', '-b', 'agent-probe', KOPIE)
    schreibe(wurzel, { ...VERSTOESSE, [`${KOPIE}/.env.production`]: 'GEHEIM=1\n', '.claude/notiz.md': `Stra${String.fromCharCode(0xdf)}e\n` })

    const { ausgabe } = fuehreAus(PYTHON, [join(WURZEL, 'scripts', 'regelcheck.py'), '--wurzel', wurzel], wurzel)

    expect(ausgabe, 'regelcheck.py lief nicht').toMatch(/Warnungen|Fehler|Beanstandungen/)
    expect(ausgabe).not.toContain('.claude/')
  })

  it('P0.3b: .gitignore schliesst .claude/worktrees/ aus, damit niemand die Kopien eincheckt', () => {
    const zeilen = readFileSync(join(WURZEL, '.gitignore'), 'utf8').split('\n').map((zeile) => zeile.trim())
    const ausgeschlossen = zeilen.some((zeile) => /^\/?\.claude\/(worktrees\/)?$/.test(zeile))

    expect(ausgeschlossen, '.gitignore: Zeile „.claude/worktrees/“ fehlt').toBe(true)
  })
})
