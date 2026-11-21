// Die Importgrenze der Strategien (U5, P0.3d, Mangel 1 der Schlussprüfung 2): Ausserhalb von
// src/ki/strategien/ erreicht Code die Strategien nur über die Registry index.ts und über die
// Typen aus strategie.ts. Eine Fabrik, die nicht in der Registry steht, gleich in welcher Form
// sie exportiert ist, kommt so bei keinem Rahmen, keiner App und keinem Messlauf an; geprüft
// wird der Import-Graph, aufgelöst wie im Build, nicht der Wortlaut der Pfade.
//
// Ausgenommen sind genau Testdateien `*.test.ts(x)` und alles unter tests/: Tests prüfen eine
// Strategie gezielt, auch an der Registry vorbei. Das ist bewusst enger als `istTestdatei`
// (architektur_pruefung.ts): Helfer unter `__tests__/` und `.spec`-Dateien unter src/ gelten
// hier als Code. Erreicht Code, für den die Grenze gilt, eine Strategie über eine Testdatei,
// wird er trotzdem gemeldet.

import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { dirname, extname, join, posix, relative } from 'node:path'
import ts from 'typescript'
import { CODE_ENDUNGEN, parse, sammleDateien as sammleAlle, zeileVon, zuPosix } from '../scripts/pruefung/quelldateien.mjs'
import { besucheAlle, geholteWerte, istDynamischerImport, optionenFuer, sammleDateien, type Verstoss } from './architektur_pruefung'
import { REGISTRY_DATEI } from './architektur_ki_registry'

const ORDNER = posix.dirname(REGISTRY_DATEI)
const SCHNITTSTELLE = `${ORDNER}/strategie.ts`
const GRUND = `ausserhalb von ${ORDNER}/ nur index.ts und Typen aus strategie.ts`
/** Wo die Grenze gilt: aller Code unter diesen Ordnern und im Wurzelordner. */
const BEREICHE = ['src', 'scripts']

/** Genau Testdateien `*.test.ts(x)` und alles unter tests/. */
export const istAusgenommen = (pfad: string) => /\.test\.tsx?$/.test(pfad) || pfad.startsWith('tests/')

/** Was ein Ziel unter src/ki/strategien ist; Pfad relativ zur Wurzel, ohne Rücksicht auf Gross- und Kleinschreibung. */
function artDesZiels(pfad: string): 'registry' | 'schnittstelle' | 'strategie' | null {
  const kern = pfad.toLowerCase().replace(/\/+$/, '').replace(/(\.d)?\.[cm]?[jt]sx?$/, '')
  if (kern === ORDNER || kern === `${ORDNER}/index`) return 'registry'
  if (kern === `${ORDNER}/strategie`) return 'schnittstelle'
  return kern.startsWith(`${ORDNER}/`) ? 'strategie' : null
}

/** Die Dateien, für die die Grenze gilt, relativ zur Wurzel. */
export function grenzDateien(wurzel: string): string[] {
  const imWurzelordner = readdirSync(wurzel, { withFileTypes: true })
    .filter((eintrag) => eintrag.isFile() && CODE_ENDUNGEN.has(extname(eintrag.name)))
    .map((eintrag) => eintrag.name)
  return [...imWurzelordner, ...BEREICHE.flatMap((bereich) => sammleDateien(wurzel, bereich))]
    .filter((pfad) => !istAusgenommen(pfad) && artDesZiels(pfad) === null)
}

/** Die Namen der Werte, die strategie.ts exportiert; Typen zählen nicht. */
function werteDerSchnittstelle(wurzel: string, optionen: ts.CompilerOptions): Set<string> {
  const datei = join(wurzel, SCHNITTSTELLE)
  if (!existsSync(datei)) return new Set()
  // Für Exporte und ihre Art braucht es keine Standardbibliothek; ohne sie geht es viel schneller.
  const programm = ts.createProgram([datei], { ...optionen, noLib: true, types: [] })
  const pruefer = programm.getTypeChecker()
  const quelle = programm.getSourceFile(datei)
  const modul = quelle && pruefer.getSymbolAtLocation(quelle)
  if (!modul) throw new Error(`werteDerSchnittstelle: ${SCHNITTSTELLE} ist kein Modul`)
  const echt = (symbol: ts.Symbol) => (symbol.flags & ts.SymbolFlags.Alias ? pruefer.getAliasedSymbol(symbol) : symbol)
  return new Set(pruefer.getExportsOfModule(modul).filter((symbol) => echt(symbol).flags & ts.SymbolFlags.Value).map((symbol) => symbol.name))
}

type Verweis = { knoten: ts.Node; angabe: string | null; wie: string; deklaration?: ts.ImportDeclaration | ts.ExportDeclaration; nurTyp?: boolean; muster?: boolean }

const anImportMeta = (knoten: ts.Expression, name: (text: string) => boolean) =>
  ts.isPropertyAccessExpression(knoten) && ts.isMetaProperty(knoten.expression) && knoten.expression.keywordToken === ts.SyntaxKind.ImportKeyword && name(knoten.name.text)
/** `import(…)`, `require(…)` und `import.meta.resolve(…)`. */
const istLader = (aufruf: ts.CallExpression): boolean => anImportMeta(aufruf.expression, (name) => name === 'resolve') || istDynamischerImport(aufruf)

/**
 * Jeder Weg, auf dem eine Datei ein Modul nennt: import, export … from, `import x = require`,
 * `import('…')` als Typ und als Aufruf, require, import.meta.glob und import.meta.resolve,
 * `new URL(…, import.meta.url)`, dazu jeder andere Text, der wie ein Pfad beginnt. `angabe`
 * ist null, wenn ein Lader einen berechneten Namen bekommt.
 */
function verweise(quelle: ts.SourceFile): Verweis[] {
  const gefunden: Verweis[] = []
  const verbraucht = new Set<ts.Node>()
  const nimm = (knoten: ts.Node, text: ts.Node | undefined, wie: string, mehr: Partial<Verweis> = {}) => {
    if (text) verbraucht.add(text)
    gefunden.push({ knoten, angabe: text && ts.isStringLiteralLike(text) ? text.text : null, wie, ...mehr })
  }
  besucheAlle(quelle, (knoten) => {
    if ((ts.isImportDeclaration(knoten) || ts.isExportDeclaration(knoten)) && knoten.moduleSpecifier) {
      nimm(knoten, knoten.moduleSpecifier, ts.isImportDeclaration(knoten) ? 'importiert' : 'exportiert weiter', { deklaration: knoten })
    } else if (ts.isImportEqualsDeclaration(knoten) && ts.isExternalModuleReference(knoten.moduleReference)) {
      nimm(knoten, knoten.moduleReference.expression, 'importiert')
    } else if (ts.isImportTypeNode(knoten) && ts.isLiteralTypeNode(knoten.argument)) {
      nimm(knoten, knoten.argument.literal, 'nennt den Typ', { nurTyp: true })
    } else if (ts.isCallExpression(knoten) && anImportMeta(knoten.expression, (name) => name.startsWith('glob'))) {
      const erstes = knoten.arguments[0]
      const liste = erstes && ts.isArrayLiteralExpression(erstes) ? [...erstes.elements] : [erstes]
      for (const muster of liste) nimm(knoten, muster, 'lädt mit import.meta.glob', { muster: true })
    } else if (ts.isCallExpression(knoten) && istLader(knoten)) {
      nimm(knoten, knoten.arguments[0], `lädt mit ${knoten.expression.getText()}()`)
    } else if (ts.isNewExpression(knoten) && ts.isIdentifier(knoten.expression) && knoten.expression.text === 'URL' && knoten.arguments?.[1]?.getText() === 'import.meta.url') {
      nimm(knoten, knoten.arguments[0], 'nennt mit new URL(…, import.meta.url)')
    } else if (ts.isStringLiteralLike(knoten) && !verbraucht.has(knoten) && /^(\.{1,2}(\/|$)|\/)/.test(knoten.text)) {
      nimm(knoten, knoten, 'nennt den Pfad')
    }
  })
  return gefunden
}

/**
 * U5, Importgrenze: Code ausserhalb von src/ki/strategien/ (ohne Testdateien und tests/)
 * importiert von dort nur index.ts und strategie.ts, aus strategie.ts nur Typen, sobald die
 * Datei Werte hat. Ein Lader mit berechnetem Namen ist ein Verstoss, weil sich sein Ziel nicht
 * prüfen lässt.
 */
export function pruefeImportgrenze(wurzel: string): Verstoss[] {
  const optionen = optionenFuer(wurzel)
  const aufloesung = ts.createModuleResolutionCache(wurzel, (name) => name.toLowerCase(), optionen)
  const echteWurzel = realpathSync.native(wurzel)
  const werte = werteDerSchnittstelle(wurzel, optionen)
  const grenze = grenzDateien(wurzel)
  const geprueft = new Set(grenze.map((pfad) => pfad.toLowerCase()))
  const strategieDateien = sammleAlle(wurzel, ORDNER)
  /** Pfad relativ zur Wurzel; eine vorhandene Datei über ihren echten Pfad (Gross- und Kleinschreibung, Verknüpfungen). */
  const bezug = (absolut: string) =>
    zuPosix(existsSync(absolut) ? relative(echteWurzel, realpathSync.native(absolut)) : relative(wurzel, absolut))

  /** Mögliche Ziele einer Angabe: so, wie TypeScript sie auflöst, und als Pfad ohne `?…` und `#…`, mit und ohne Endung. */
  const ziele = (datei: string, angabe: string): string[] => {
    const kern = angabe.replace(/[?#].*$/, '')
    const absolut = join(wurzel, datei)
    const aufgeloest = ts.resolveModuleName(kern, absolut, optionen, ts.sys, aufloesung).resolvedModule?.resolvedFileName
    const basen = kern.startsWith('/') ? [join(wurzel, kern), kern] : /^\.{1,2}(\/|$)/.test(kern) ? [join(dirname(absolut), kern)] : []
    // Hat TypeScript nicht aufgelöst, die erste vorhandene Datei mit Endung oder als index.
    const vorhanden = aufgeloest ?? basen
      .flatMap((basis) => [...CODE_ENDUNGEN].flatMap((endung) => [basis + endung, join(basis, `index${endung}`)]))
      .find((pfad) => existsSync(pfad) && statSync(pfad).isFile())
    return [...new Set([...(vorhanden ? [vorhanden] : []), ...basen].map(bezug))]
  }

  /** Ob ein Verweis auf `ziel` die Grenze verletzt. */
  const verletzt = (verweis: Verweis, ziel: string): boolean => {
    const art = artDesZiels(ziel)
    if (art === 'strategie') return true
    if (art !== 'schnittstelle' || verweis.nurTyp || werte.size === 0) return false
    if (!verweis.deklaration) return true
    return geholteWerte(verweis.deklaration).some((name) => name === '*' || werte.has(name))
  }

  /** Code im Repo, für den die Grenze nicht gilt (Testdateien, tests/), wird bis zu einer Strategie weiterverfolgt. */
  const weiterverfolgen = (ziel: string) =>
    artDesZiels(ziel) === null && !geprueft.has(ziel.toLowerCase()) && !ziel.startsWith('../') && !ziel.split('/').includes('node_modules') &&
    CODE_ENDUNGEN.has(extname(ziel)) && existsSync(join(wurzel, ziel))

  /** Höchstens ein Verstoss je Verweis. */
  const pruefeVerweis = (datei: string, verweis: Verweis, besucht: Set<string>): string | null => {
    if (verweis.angabe === null) return `${verweis.wie} mit berechnetem Namen; die Importgrenze lässt sich dann nicht prüfen`
    if (verweis.muster) {
      if (verweis.angabe.startsWith('!')) return null
      const muster = [posix.join(posix.dirname(datei), verweis.angabe), posix.normalize(verweis.angabe.replace(/^\//, ''))].map((m) => m.toLowerCase())
      const treffer = strategieDateien.find((pfad) => muster.some((m) => posix.matchesGlob(pfad.toLowerCase(), m)) && verletzt(verweis, pfad))
      return treffer ? `${verweis.wie} „${verweis.angabe}“ (trifft ${treffer}); ${GRUND}` : null
    }
    for (const ziel of ziele(datei, verweis.angabe)) {
      if (verletzt(verweis, ziel)) return `${verweis.wie} „${verweis.angabe}“ (${ziel}); ${GRUND}`
      if (!weiterverfolgen(ziel) || besucht.has(ziel)) continue
      besucht.add(ziel)
      for (const naechster of verweise(parse(ziel, readFileSync(join(wurzel, ziel), 'utf8')))) {
        const ueber = pruefeVerweis(ziel, naechster, besucht)
        if (ueber) return `${verweis.wie} „${verweis.angabe}“ und erreicht über ${ziel}: ${ueber}`
      }
    }
    return null
  }

  return grenze.flatMap((datei) =>
    verweise(parse(datei, readFileSync(join(wurzel, datei), 'utf8'))).flatMap((verweis) => {
      const was = pruefeVerweis(datei, verweis, new Set())
      return was ? [{ regel: 'U5' as const, datei, zeile: zeileVon(verweis.knoten), was }] : []
    }),
  )
}
