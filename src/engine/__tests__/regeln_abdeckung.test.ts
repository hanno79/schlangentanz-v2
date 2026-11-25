// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/*
E11, Kriterium 2: Für jeden Regelabschnitt der Basis-Engine gibt es unter
`regeln/` eine Regeltestdatei, deren Name mit dem Abschnitt beginnt, etwa
`A7.4_schlangenfrass.test.ts`. Ein Abschnitt mit vielen Regeln hat mehrere
Dateien, weil eine Testdatei höchstens 499 Zeilen hat (U7).

Welche Abschnitte es gibt, liest der Test aus Teil A der Spec. Bekommt Teil A
einen neuen Abschnitt, wird er rot, bis der Abschnitt eine Datei hat oder hier
mit Grund ausgenommen ist.

X7: Für die Erweiterung (A7.10, A8 mit A8.1 und A8.2, A9) gibt es zusätzlich die
Satz-für-Satz-Tabelle `docs/abnahme/X7_satz_fuer_satz.md`. Der Test zerlegt die
Abschnitte aus Teil A in Sätze und verlangt, dass die Tabelle jeden Satz genau
einmal führt, entweder mit den Tests, die ihn belegen, oder mit dem Grund, warum
er keine eigene Regel enthält. Jeder genannte Test muss in seiner Datei stehen.
*/

const REGELN = 'src/engine/__tests__/regeln'
const TESTS = 'src/engine/__tests__'

/** Abschnitte aus Teil A ohne eigene Regeltestdatei der Basis-Engine, je mit Grund. */
const AUSGENOMMEN: Readonly<Record<string, string>> = {
  A1: 'Spielmaterial; die Stückzahlen prüft A4_material.test.ts beim Aufbau',
  A2: 'Spielerzahl; geprüft in A4_material.test.ts beim Aufbau',
  A3: 'Spielziel ohne eigene Regel; die Wertung steht unter A11',
  A7: 'Überschrift der Sonderkarten; die Regeln stehen in A7.1 bis A7.10',
  A8: 'Überschrift der Erweiterung mit drei einleitenden Sätzen; die Regeln stehen in A8.1 und A8.2, die Sätze belegt die Tabelle zu X7',
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

const SATZTABELLE = 'docs/abnahme/X7_satz_fuer_satz.md'
const ERWEITERUNG = ['A7.10', 'A8', 'A8.1', 'A8.2', 'A9']

/** Der Text eines Abschnitts aus Teil A ohne seine Unterabschnitte. */
function abschnittText(abschnitt: string): string {
  const zeilen = readFileSync('docs/GAME_SPEC.md', 'utf8').split('\n')
  const start = zeilen.findIndex((zeile) => new RegExp(`^#{3,4} ${abschnitt.replace('.', '\\.')} `).test(zeile))
  const ende = zeilen.findIndex((zeile, index) => index > start && /^#{2,4} (A\d|Teil )/.test(zeile))
  return zeilen.slice(start + 1, ende).join('\n')
}

/**
 * Die Sätze eines Abschnitts aus Teil A, jeder einmal: Zeilen ohne Überschrift,
 * Spiegelstrich und Fettdruck, an Satzenden getrennt (nicht nach „min.“,
 * „versch.“), aus der Aufgabentabelle die Bedingung. Reine Kartenbilder wie
 * „[Blau] [Blau]“ sind keine Sätze.
 */
function saetzeIn(text: string): string[] {
  const saetze: string[] = []
  for (const roh of text.split('\n')) {
    const zeile = roh.trim()
    if (zeile === '' || zeile.startsWith('#') || /^\|[-| ]+\|$/.test(zeile) || zeile.startsWith('| Nr.')) continue
    const inhalt = zeile.startsWith('|') ? zeile.split('|')[4].trim() : zeile.replace(/^- /, '').replaceAll('**', '')
    for (const satz of inhalt.split(/(?<=(?<!\b(?:min|versch|Nr|bzw))[.!?])\s+(?=[A-ZÄÖÜ„"[#])/)) {
      if (!/^(?:\[[^\]]+\]|#+|Vorher:|Nachher:|\s)+$/.test(satz)) saetze.push(satz.trim())
    }
  }
  return [...new Set(saetze)]
}

interface Tabellenzeile {
  abschnitt: string
  satz: string
  /** Bei Regelaussagen die Tests, sonst der Grund. */
  rest: string
}

/** Die Zeilen der Tabelle unter `## <ueberschrift>`; die erste Spalte beginnt mit dem Abschnitt, etwa „A9 Nr. 3“. */
function tabelle(ueberschrift: string): Tabellenzeile[] {
  if (!existsSync(SATZTABELLE)) throw new Error(`tabelle: ${SATZTABELLE} fehlt; X7 verlangt die Satz-für-Satz-Tabelle der Erweiterung`)
  const text = readFileSync(SATZTABELLE, 'utf8')
  const teil = text.split(/^## /m).find((abschnitt) => abschnitt.startsWith(`${ueberschrift}\n`)) ?? ''
  return teil
    .split('\n')
    .filter((zeile) => /^\| A\d/.test(zeile))
    .map((zeile) => {
      const [abschnitt, satz, rest] = zeile.replace(/^\| /, '').replace(/ \|$/, '').split(' | ')
      return { abschnitt: /^A\d+(?:\.\d+)?/.exec(abschnitt)?.[0] ?? abschnitt, satz, rest: rest ?? '' }
    })
}

/** Die Tests einer Regelaussage: `Datei › Name`, der Name endet mit „…“, wenn nur sein Anfang zitiert ist. */
function verweise(zelle: string): Array<{ datei: string; name: string }> {
  return [...zelle.matchAll(/`([^`›]+?) › ([^`]+)`/g)].map((treffer) => ({ datei: treffer[1], name: treffer[2] }))
}

/** Testnamen und Einträge von Testtabellen einer Datei: jedes Zeichenkettenliteral. */
function literale(quelltext: string): string[] {
  return [...quelltext.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)].map((treffer) => treffer[2])
}

function gefunden(name: string, kandidaten: readonly string[]): boolean {
  const anfang = name.endsWith(' …') ? name.slice(0, -2) : null
  return kandidaten.some((kandidat) => (anfang === null ? kandidat === name : kandidat.startsWith(anfang)))
}

describe('X7: Regeltestdateien und Satz-für-Satz-Tabelle der Erweiterung (A7.10, A8, A9)', () => {
  it('X7: A7.10, A8 über A8.1 und A8.2, und A9 haben je eine Regeltestdatei unter regeln/', () => {
    const unterA8 = abschnitteInTeilA().filter((abschnitt) => abschnitt.startsWith('A8.'))
    expect(unterA8, 'abschnitteInTeilA: die Unterabschnitte von A8').toEqual(['A8.1', 'A8.2'])
    for (const abschnitt of ['A7.10', ...unterA8, 'A9']) {
      expect(dateien.filter((datei) => abschnittVon(datei) === abschnitt), `keine Datei regeln/${abschnitt}_*.test.ts`).not.toEqual([])
    }
  })

  it('X7: die Zerlegung in Sätze trennt an Satzenden, nicht nach Abkürzungen, und lässt Kartenbilder weg', () => {
    const text = ['#### Überschrift', '- **Erfolg:** Erster Satz. Zweiter Satz!', '| 5 | Name | 9 | Habe min. 4 versch. Farben. |', 'Ein Satz. [Blau] [Rot]']
    expect(saetzeIn(text.join('\n'))).toEqual(['Erfolg: Erster Satz.', 'Zweiter Satz!', 'Habe min. 4 versch. Farben.', 'Ein Satz.'])
  })

  it.each(ERWEITERUNG)('X7: die Tabelle führt jeden Satz aus %s genau einmal, mit Tests oder mit Grund', (abschnitt) => {
    const zeilen = [...tabelle('Regelaussagen'), ...tabelle('Sätze ohne eigene Regelaussage')].filter((zeile) => zeile.abschnitt === abschnitt)
    const saetze = saetzeIn(abschnittText(abschnitt))
    expect(saetze.length, `abschnittText: ${abschnitt} ohne Sätze gelesen`).toBeGreaterThan(2)
    expect(zeilen.map((zeile) => zeile.satz).filter((satz, index, alle) => alle.indexOf(satz) !== index), `${SATZTABELLE}: doppelt geführt`).toEqual([])
    expect(saetze.filter((satz) => !zeilen.some((zeile) => zeile.satz === satz)), `${SATZTABELLE}: Sätze aus ${abschnitt} ohne Zeile`).toEqual([])
    expect(zeilen.filter((zeile) => !saetze.includes(zeile.satz)).map((zeile) => zeile.satz), `${SATZTABELLE}: Zeilen, die nicht wörtlich in ${abschnitt} stehen`).toEqual([])
  })

  it('X7: jede Regelaussage nennt mindestens einen Test, und jeder genannte Test steht in seiner Datei unter regeln/', () => {
    const regelaussagen = tabelle('Regelaussagen')
    expect(regelaussagen.length, `${SATZTABELLE}: Regelaussagen gelesen`).toBeGreaterThan(80)
    expect(regelaussagen.filter((zeile) => verweise(zeile.rest).length === 0).map((zeile) => zeile.satz), 'Regelaussagen ohne Test').toEqual([])
    const fehlend = regelaussagen.flatMap((zeile) =>
      verweise(zeile.rest)
        .filter(({ datei, name }) => !dateien.includes(`${datei}.test.ts`) || !gefunden(name, literale(readFileSync(`${REGELN}/${datei}.test.ts`, 'utf8'))))
        .map(({ datei, name }) => `${datei} › ${name}`),
    )
    expect(fehlend, 'genannte Tests, die es in der Datei nicht gibt').toEqual([])
    const ohneGrund = tabelle('Sätze ohne eigene Regelaussage').filter((zeile) => zeile.rest.trim().length < 10)
    expect(ohneGrund.map((zeile) => zeile.satz), 'Sätze ohne Regelaussage, aber ohne Grund').toEqual([])
  })
})
