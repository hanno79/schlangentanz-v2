// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/*
E11, Kriterium 2: Für jeden Regelabschnitt der Basis-Engine gibt es unter
`regeln/` eine Regeltestdatei, deren Name mit dem Abschnitt beginnt, etwa
`A7.4_schlangenfrass.test.ts`. Ein Abschnitt mit vielen Regeln hat mehrere
Dateien, weil eine Testdatei höchstens 499 Zeilen hat (U7).

Welche Abschnitte es gibt, liest der Test aus Teil A der Spec. Bekommt Teil A
einen neuen Abschnitt, wird er rot, bis der Abschnitt eine Datei hat oder hier
mit Grund ausgenommen ist.
*/

const REGELN = 'src/engine/__tests__/regeln'
const TESTS = 'src/engine/__tests__'

/** Abschnitte aus Teil A ohne eigene Regeltestdatei der Basis-Engine, je mit Grund. */
const AUSGENOMMEN: Readonly<Record<string, string>> = {
  A1: 'Spielmaterial; die Stückzahlen prüft A4_material.test.ts beim Aufbau',
  A2: 'Spielerzahl; geprüft in A4_material.test.ts beim Aufbau',
  A3: 'Spielziel ohne eigene Regel; die Wertung steht unter A11',
  A7: 'Überschrift der Sonderkarten; die Regeln stehen in A7.1 bis A7.10',
  A8: 'Comeback und Risiko-Belohnung, Erweiterung (X4, X5)',
}

/** Alle Abschnitte mit Regeltestdatei in der Reihenfolge von Teil A: die aus E11, Kriterium 2, A9 seit X1, A8.1 seit X4, A8.2 seit X5 und A7.10 seit X6 (X7 verlangt auch A8). */
const MIT_DATEI = ['A4', 'A5', 'A6', 'A7.1', 'A7.2', 'A7.3', 'A7.4', 'A7.5', 'A7.6', 'A7.7', 'A7.8', 'A7.9', 'A7.10', 'A8.1', 'A8.2', 'A9', 'A10', 'A11']

/** Die Nummern aller Abschnitte in Teil A, in ihrer Reihenfolge. */
function abschnitteInTeilA(): string[] {
  const spec = readFileSync('docs/GAME_SPEC.md', 'utf8')
  const teilA = spec.slice(spec.indexOf('## Teil A '), spec.indexOf('## Teil B '))
  return [...teilA.matchAll(/^#{3,4} (A\d+(?:\.\d+)?) /gm)].map((treffer) => treffer[1])
}

/** Der Abschnitt, mit dem ein Dateiname beginnt, oder `null`. */
function abschnittVon(datei: string): string | null {
  return /^(A\d+(?:\.\d+)?)_[a-z0-9_]+\.test\.ts$/.exec(datei)?.[1] ?? null
}

/** Die Namen der `describe`-, `it`- und `test`-Aufrufe einer Datei. */
function testnamen(quelltext: string): string[] {
  return [...quelltext.matchAll(/\b(?:describe|it|test)(?:\.each\([^)]*\))?\(\s*(['"`])(.*?)\1/g)].map((treffer) => treffer[2])
}

/** Nennt der Text genau diesen Abschnitt, nicht nur einen, der so beginnt (A7.1, nicht A7.10)? */
function nennt(text: string, abschnitt: string): boolean {
  return new RegExp(`(^|[^\\w.])${abschnitt.replace('.', '\\.')}(?![\\d]|\\.\\d)`).test(text)
}

const dateien = readdirSync(REGELN)

describe('E11 Kriterium 2: je Abschnitt eine Regeltestdatei unter regeln/ (A4 bis A11)', () => {
  it('E11/X1: die Abschnitte aus Teil A sind genau die des Plans, die der Erweiterung mit Datei und die begründet ausgenommenen', () => {
    const inTeilA = abschnitteInTeilA()
    expect(inTeilA.length, 'Teil A ohne Abschnitte gelesen').toBeGreaterThan(20)
    const ohneDatei = inTeilA.filter((abschnitt) => !(abschnitt in AUSGENOMMEN))
    expect(ohneDatei, 'abschnitteInTeilA: Abschnitte, die weder der Plan nennt noch ausgenommen sind').toEqual(MIT_DATEI)
    expect(Object.keys(AUSGENOMMEN).filter((abschnitt) => !inTeilA.includes(abschnitt)), 'ausgenommen, aber nicht in Teil A').toEqual([])
  })

  it.each(MIT_DATEI)('E11: %s hat eine Regeltestdatei unter regeln/', (abschnitt) => {
    const eigene = dateien.filter((datei) => abschnittVon(datei) === abschnitt)
    expect(eigene, `keine Datei regeln/${abschnitt}_*.test.ts`).not.toEqual([])
  })

  it('E11: jede Datei unter regeln/ heisst <Abschnitt>_<thema>.test.ts, mit einem Abschnitt des Plans oder der Erweiterung', () => {
    const falsch = dateien.filter((datei) => !MIT_DATEI.includes(abschnittVon(datei) ?? ''))
    expect(falsch, 'Dateien unter regeln/ ohne Abschnitt des Plans im Namen').toEqual([])
  })

  it('U1: jede Regeltestdatei nennt ihren Abschnitt in mindestens einem Testnamen', () => {
    const ohneNennung = dateien.filter((datei) => {
      const abschnitt = abschnittVon(datei)
      const namen = testnamen(readFileSync(`${REGELN}/${datei}`, 'utf8'))
      return abschnitt === null || !namen.some((name) => nennt(name, abschnitt))
    })
    expect(ohneNennung, 'Dateien, deren Tests ihren Abschnitt nicht nennen').toEqual([])
  })

  it('E11: neben regeln/ liegen unter __tests__ nur Tests der Engine selbst, keine Regeltests', () => {
    // Aktionsschicht, Invarianten, Speicherformat, Baukasten, Ereignisse, Schlangenhilfen (R1), Entscheidungsablauf (X3), die Dauerläufe, Umfang, Golden Master und dieser Test.
    const erlaubt = [
      'aktionen.test.ts',
      'dauerlauf.test.ts',
      'entscheidung.test.ts',
      'golden_master.test.ts',
      'invarianten.test.ts',
      'invarianten_grenzfaelle.test.ts',
      'kartenversetzt.test.ts',
      'legal_actions_umfang.test.ts',
      'regeln_abdeckung.test.ts',
      'schlangen.test.ts',
      'speicherformat.test.ts',
      'szenario.test.ts',
      'zugablauf_ereignisse.test.ts',
      'zustand_format.test.ts',
    ]
    // Die Teile des langen Dauerlaufs (`*.dauerlauf.test.ts`) prüft `dauerlauf.test.ts`.
    const tests = readdirSync(TESTS).filter((datei) => datei.endsWith('.test.ts') && !datei.endsWith('.dauerlauf.test.ts'))
    expect(tests.filter((datei) => !erlaubt.includes(datei)), 'Regeltests ausserhalb von regeln/').toEqual([])
  })

  it('E11: die Nennung unterscheidet A7.1 von A7.10 und A1 von A11', () => {
    expect(nennt('A7.1: Farbendieb', 'A7.1')).toBe(true)
    expect(nennt('A7.10: Schlangenkorb', 'A7.1')).toBe(false)
    expect(nennt('A6/A7.1 Beispiel', 'A7.1')).toBe(true)
    expect(nennt('A11: Wertung', 'A1')).toBe(false)
    expect(nennt('A7.4/A11', 'A11')).toBe(true)
  })
})
