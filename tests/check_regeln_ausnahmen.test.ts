// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { AUSNAHMEN_DATEI, abgleich, merkmalDerZeile, zuwachs, type Ausnahmen as Liste } from '../scripts/pruefung/ausnahmen.mjs'
import { git, legeAn, leseJson, pruefeRegeln, raeumeAuf, schreibe } from './probebaum'

const ALT = 'src/engine/__tests__/alt.test.ts'
const ALTTEST = "it('zählt', () => {})\nit('zählt mehr', () => {})\n"

const liste = (eintraege: Liste) => `${JSON.stringify({ U1: {}, U4: {}, U6: {}, U7: {}, ...eintraege }, null, 2)}\n`

/** Probe-Baum ohne git; die Wachstumsprüfung wird ausdrücklich übersprungen. */
function ohneGit(dateien: Record<string, string>, eintraege: Liste) {
  return legeAn({ ...dateien, [AUSNAHMEN_DATEI]: liste(eintraege) })
}

/**
 * Probe-Repo: Die Dateien und `basis` liegen im ersten Commit, auf den auch
 * `origin/neuaufbau` zeigt. Danach steht `aktuell` als Ausnahmeliste im Arbeitsbaum.
 */
function mitBasis(dateien: Record<string, string>, basis: Liste, aktuell: Liste) {
  const wurzel = legeAn({ ...dateien, [AUSNAHMEN_DATEI]: liste(basis) })
  git(wurzel, 'init', '-q', '-b', 'arbeit')
  git(wurzel, 'add', '-A')
  git(wurzel, 'commit', '-q', '-m', 'basis')
  git(wurzel, 'update-ref', 'refs/remotes/origin/neuaufbau', 'HEAD')
  schreibe(wurzel, { [AUSNAHMEN_DATEI]: liste(aktuell) })
  return wurzel
}

afterEach(raeumeAuf)

describe('P0.3b: Ausnahmen gelten je Verstoss mit Merkmal, nicht je Anzahl', () => {
  it('P0.3b: ein Altbestand mit genau den gelisteten Merkmalen bleibt grün', () => {
    const wurzel = ohneGit({ [ALT]: ALTTEST }, { U1: { [ALT]: ['zählt', 'zählt mehr'] } })

    const { code, ausgabe } = pruefeRegeln(wurzel, '--ohne-vergleich')

    expect(code, `erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
    expect(ausgabe, 'das Überspringen der Wachstumsprüfung muss sichtbar sein').toContain('Wachstumsprüfung übersprungen')
  })

  it('P0.3b: ein weiterer Verstoss in einer gelisteten Datei schlägt fehl und nennt sein Merkmal', () => {
    const wurzel = ohneGit({ [ALT]: `${ALTTEST}it('noch einer', () => {})\n` }, { U1: { [ALT]: ['zählt', 'zählt mehr'] } })

    const { code, ausgabe } = pruefeRegeln(wurzel, '--ohne-vergleich')

    expect(code, `erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain(`${ALT}:3`)
    expect(ausgabe).toContain('„noch einer“')
  })

  it('P0.3b: Tausch U1 – ein alter Test wird umbenannt, bleibt aber ohne Abschnitt: Exit 1', () => {
    const wurzel = ohneGit({ [ALT]: "it('zählt', () => {})\nit('zählt anders', () => {})\n" }, { U1: { [ALT]: ['zählt', 'zählt mehr'] } })

    const { code, ausgabe } = pruefeRegeln(wurzel, '--ohne-vergleich')

    expect(code, `Tausch muss auffallen, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('„zählt anders“')
  })

  it('P0.3b: Tausch U6 – altes eslint-disable begründet, dafür ein any: Exit 1', () => {
    const vorher = '// eslint-disable-next-line no-console\nconsole.log(1)\n'
    const nachher = '// eslint-disable-next-line no-console -- Ausgabe gewollt\nconsole.log(1)\nexport const x: any = 1\n'
    const eintraege = { U6: { 'src/haken.ts': [merkmalDerZeile(vorher, 1)] } }

    const alt = pruefeRegeln(ohneGit({ 'src/haken.ts': vorher }, eintraege), '--ohne-vergleich')
    const neu = pruefeRegeln(ohneGit({ 'src/haken.ts': nachher }, eintraege), '--ohne-vergleich')

    expect(alt.code, `Altbestand muss grün sein:\n${alt.ausgabe}`).toBe(0)
    expect(neu.code, `Tausch muss auffallen:\n${neu.ausgabe}`).toBe(1)
    expect(neu.ausgabe).toContain('src/haken.ts:3')
  })

  it('P0.3b: derselbe Verstoss bleibt erlaubt, wenn er nur in eine andere Zeile rutscht', () => {
    const eintraege = { U6: { 'src/haken.ts': ['export const x: any = 1'] } }
    const wurzel = ohneGit({ 'src/haken.ts': '\n\n// neu davor\nexport   const x: any = 1\n' }, eintraege)

    const { code, ausgabe } = pruefeRegeln(wurzel, '--ohne-vergleich')

    expect(code, `erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
  })

  it('P0.3b: gleichlautende Verstösse zählen einzeln', () => {
    const wurzel = ohneGit({ 'src/haken.ts': 'let x: any\nlet x: any\n' }, { U6: { 'src/haken.ts': ['let x: any'] } })

    const { code, ausgabe } = pruefeRegeln(wurzel, '--ohne-vergleich')

    expect(code, `der zweite gleiche Verstoss ist neu:\n${ausgabe}`).toBe(1)
  })

  it('P0.3b: eine veraltete Ausnahme schlägt fehl und nennt den Befehl zum Schrumpfen', () => {
    const wurzel = ohneGit(
      { [ALT]: "it('zählt', () => {})\n" },
      { U1: { [ALT]: ['zählt', 'zählt mehr'], 'src/engine/__tests__/geloescht.test.ts': ['x'] } },
    )

    const { code, ausgabe } = pruefeRegeln(wurzel, '--ohne-vergleich')

    expect(code, `erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('npm run check:regeln -- --ausnahmen-schrumpfen')
    expect(ausgabe).toContain('„zählt mehr“')
    expect(ausgabe).toContain('src/engine/__tests__/geloescht.test.ts')
  })

  it('P0.3b: --ausnahmen-schrumpfen entfernt nur Merkmale ohne Verstoss und fügt nie etwas hinzu', () => {
    const wurzel = ohneGit(
      { [ALT]: "it('zählt', () => {})\n", 'src/engine/neu.test.ts': "it('ohne Abschnitt', () => {})\n" },
      {
        U1: { [ALT]: ['zählt', 'zählt mehr'], 'src/engine/__tests__/geloescht.test.ts': ['x'] },
        U4: { 'src/engine/state.ts': ['rng = () => Math.random()'] },
      },
    )

    const { code } = pruefeRegeln(wurzel, '--ausnahmen-schrumpfen', '--ohne-vergleich')
    const danach = leseJson<Liste>(wurzel, AUSNAHMEN_DATEI)

    expect(code, 'Schrumpfen: der neue Verstoss bleibt ein Fehler').toBe(1)
    expect(danach.U1).toEqual({ [ALT]: ['zählt'] })
    expect(danach.U4, 'U4 pflegt der Architekturtest, check:regeln lässt es stehen').toEqual({ 'src/engine/state.ts': ['rng = () => Math.random()'] })
  })

  it('P0.3b: eine Ausnahmeliste mit Zahlen statt Merkmalen wird abgelehnt', () => {
    const wurzel = ohneGit({ [ALT]: ALTTEST }, { U1: { [ALT]: 2 } })

    const { code, ausgabe } = pruefeRegeln(wurzel, '--ohne-vergleich')

    expect(code, `erwartet Exit 2, Ausgabe:\n${ausgabe}`).toBe(2)
    expect(ausgabe).toContain('Merkmal')
  })

  it('P0.3b: abgleich zählt Merkmale als Multimenge', () => {
    expect(abgleich(['a', 'b', 'a'], ['a', 'c'])).toEqual({ neu: [1, 2], veraltet: ['c'] })
    expect(abgleich([], [])).toEqual({ neu: [], veraltet: [] })
    expect(merkmalDerZeile('x\n  const   a = 1 \ny', 2)).toBe('const a = 1')
  })
})

describe('P0.3b: Die Ausnahmeliste wächst nicht gegenüber origin/neuaufbau', () => {
  const DATEIEN = { [ALT]: ALTTEST, 'src/engine/__tests__/neu.test.ts': "it('ohne Abschnitt', () => {})\n" }
  const BASIS: Liste = { U1: { [ALT]: ['zählt', 'zählt mehr'], 'src/engine/__tests__/neu.test.ts': ['ohne Abschnitt'] } }

  it('P0.3b: unverändert gegenüber der Basis: Exit 0, der Vergleichsstand wird genannt', () => {
    const { code, ausgabe } = pruefeRegeln(mitBasis(DATEIEN, BASIS, BASIS))

    expect(code, `erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
    expect(ausgabe).toContain('origin/neuaufbau')
  })

  // Die Fälle prüfen zuwachs direkt; dass check:regeln es aufruft und mit 1 endet,
  // zeigen die Läufe darunter.
  const gewachsen: Array<[string, Liste, Liste, string]> = [
    ['neue Datei', { U1: { [ALT]: ['zählt', 'zählt mehr'] } }, BASIS, 'ohne Abschnitt'],
    ['neue Regel', BASIS, { ...BASIS, U6: { 'src/haken.ts': ['export const x: any = 1'] } }, 'export const x: any = 1'],
    ['zusätzliches Merkmal', { U1: { [ALT]: ['zählt'], 'src/engine/__tests__/neu.test.ts': ['ohne Abschnitt'] } }, BASIS, 'zählt mehr'],
    ['U4 wächst', { ...BASIS, U4: { 'src/engine/state.ts': ['a'] } }, { ...BASIS, U4: { 'src/engine/state.ts': ['a', 'b'] } }, 'b'],
    ['Merkmal getauscht', { U1: { [ALT]: ['zählt', 'zählt nicht'], 'src/engine/__tests__/neu.test.ts': ['ohne Abschnitt'] } }, BASIS, 'zählt mehr'],
    ['mehr Merkmale als die Zahl im alten Format', { U1: { [ALT]: 1, 'src/engine/__tests__/neu.test.ts': 1 } }, BASIS, 'zählt mehr'],
  ]

  it.each(gewachsen)('P0.3b: %s gilt als Wachstum', (_, basis, aktuell, merkmal) => {
    expect(zuwachs(basis, aktuell).map((eintrag) => eintrag.merkmal)).toEqual([merkmal])
  })

  it('P0.3b: gleich viele oder weniger Merkmale sind kein Wachstum, auch gegen Zahlen', () => {
    expect(zuwachs(BASIS, BASIS)).toEqual([])
    expect(zuwachs(BASIS, { U1: { [ALT]: ['zählt'] } })).toEqual([])
    expect(zuwachs({ U1: { [ALT]: 2, 'src/engine/__tests__/neu.test.ts': 1 } }, BASIS)).toEqual([])
  })

  it('P0.3b: auch committet fällt das Wachstum auf (Vergleich mit der Merge-Basis)', () => {
    const wurzel = mitBasis(DATEIEN, { U1: { [ALT]: ['zählt', 'zählt mehr'] } }, BASIS)
    git(wurzel, 'commit', '-q', '-am', 'Liste erweitert')

    const { code, ausgabe } = pruefeRegeln(wurzel)

    expect(code, `erwartet Exit 1, Ausgabe:\n${ausgabe}`).toBe(1)
    expect(ausgabe).toContain('wächst gegenüber')
    expect(ausgabe).toContain('src/engine/__tests__/neu.test.ts')
  })

  it('P0.3b: Schrumpfen gegenüber der Basis ist erlaubt', () => {
    const wurzel = mitBasis({ [ALT]: "it('zählt', () => {})\n" }, BASIS, { U1: { [ALT]: ['zählt'] } })

    const { code, ausgabe } = pruefeRegeln(wurzel)

    expect(code, `erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
  })

  it('P0.3b: eine Basis im alten Format (Zahlen) wird gelesen; gleich viele Merkmale sind grün', () => {
    const { code, ausgabe } = pruefeRegeln(mitBasis(DATEIEN, { U1: { [ALT]: 2, 'src/engine/__tests__/neu.test.ts': 1 } }, BASIS))

    expect(code, `gleich viele Merkmale wie die Zahl:\n${ausgabe}`).toBe(0)
  })

  it('P0.3b: --vergleich <ref> nimmt einen anderen Stand als origin/neuaufbau', () => {
    const wurzel = mitBasis(DATEIEN, BASIS, BASIS)
    git(wurzel, 'update-ref', '-d', 'refs/remotes/origin/neuaufbau')
    git(wurzel, 'branch', 'basis')

    const { code, ausgabe } = pruefeRegeln(wurzel, '--vergleich', 'basis')

    expect(code, `erwartet Exit 0, Ausgabe:\n${ausgabe}`).toBe(0)
  })

  it('P0.3b: ohne Vergleichsstand bricht check:regeln mit Exit 2 und einer Erklärung ab', () => {
    const ohneRepo = pruefeRegeln(ohneGit(DATEIEN, BASIS))
    const ohneRef = mitBasis(DATEIEN, BASIS, BASIS)
    git(ohneRef, 'update-ref', '-d', 'refs/remotes/origin/neuaufbau')
    const ohneRemote = pruefeRegeln(ohneRef)

    for (const { code, ausgabe } of [ohneRepo, ohneRemote]) {
      expect(code, `erwartet Exit 2, Ausgabe:\n${ausgabe}`).toBe(2)
      expect(ausgabe).toContain('git fetch origin')
      expect(ausgabe).toContain('--vergleich')
      expect(ausgabe).toContain('--ohne-vergleich')
    }
  })
})
