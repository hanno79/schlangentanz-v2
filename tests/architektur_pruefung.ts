// Prüfungen für den Architekturtest (tests/architektur.test.ts), Regeln U3, U4 und U5
// aus docs/UMSETZUNGSPLAN.md, Abschnitt 3.7. Gelesen wird mit dem TypeScript-Parser,
// für U5 zusätzlich mit dem Typprüfer: Ein Wort in einer Zeichenkette oder in einem
// Kommentar ist kein Verstoss.

import { existsSync, readFileSync } from 'node:fs'
import { extname, join, posix } from 'node:path'
import ts from 'typescript'
import { CODE_ENDUNGEN, TESTDATEI, parse, sammleDateien as sammleAlle, zeileVon, zuPosix } from '../scripts/pruefung/quelldateien.mjs'

export type Verstoss = { regel: 'U3' | 'U4' | 'U5'; datei: string; zeile: number; was: string }

/** Name des vollen Spielzustands, wie ihn src/engine/index.ts exportiert (U5). */
export const VOLLER_ZUSTAND_TYP = 'Spielzustand'

/**
 * Altbestand zu U4 aus derselben Ausnahmeliste wie check:regeln: Datei und Zahl der
 * Verstösse, die dort noch stehen dürfen. Darf nur schrumpfen; der Architekturtest
 * meldet auch einen veralteten Eintrag.
 */
export const AUSNAHMEN_U4: Record<string, number> = JSON.parse(
  readFileSync(join(__dirname, '..', 'scripts', 'check_regeln_ausnahmen.json'), 'utf8'),
).U4

const REACT_MODUL = /^react(-dom)?(\/|$)/
const DOM_GLOBALE = new Set([
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'location',
  'history',
  'HTMLElement',
  'requestAnimationFrame',
  'getComputedStyle',
  'matchMedia',
])
const ZUFALL = new Map([
  ['Math', new Set(['random'])],
  ['crypto', new Set(['getRandomValues', 'randomUUID'])],
])

/** Testdateien und alles unter `__tests__/` (dort liegen auch Testhelfer ohne `.test`). */
export function istTestdatei(pfad: string): boolean {
  return TESTDATEI.test(pfad) || pfad.includes('/__tests__/')
}

/** Codedateien unter `ordner` als Pfade relativ zu `wurzel`; fehlt der Ordner, eine leere Liste. */
export function sammleDateien(wurzel: string, ordner: string): string[] {
  return sammleAlle(wurzel, ordner).filter((pfad) => CODE_ENDUNGEN.has(extname(pfad)))
}

function besucheAlle(knoten: ts.Node, besucher: (knoten: ts.Node) => void): void {
  besucher(knoten)
  ts.forEachChild(knoten, (kind) => besucheAlle(kind, besucher))
}

/** Modulangaben aus import, export … from, import() und require(). */
function modulangabe(knoten: ts.Node): string | null {
  if ((ts.isImportDeclaration(knoten) || ts.isExportDeclaration(knoten)) && knoten.moduleSpecifier) {
    return ts.isStringLiteral(knoten.moduleSpecifier) ? knoten.moduleSpecifier.text : null
  }
  if (ts.isCallExpression(knoten) && knoten.arguments.length > 0 && ts.isStringLiteral(knoten.arguments[0])) {
    const dynamisch = knoten.expression.kind === ts.SyntaxKind.ImportKeyword
    const require = ts.isIdentifier(knoten.expression) && knoten.expression.text === 'require'
    if (dynamisch || require) return knoten.arguments[0].text
  }
  return null
}

/** Ein Bezeichner, der einen Wert aus dem umgebenden Gültigkeitsbereich liest, kein Name an einer Deklaration. */
function istFreierWert(bezeichner: ts.Identifier): boolean {
  const eltern = bezeichner.parent
  if (ts.isPropertyAccessExpression(eltern)) return eltern.expression === bezeichner
  if (ts.isQualifiedName(eltern) || ts.isTypeReferenceNode(eltern) || ts.isTypeQueryNode(eltern)) return false
  if (ts.isBindingElement(eltern)) return eltern.initializer === bezeichner
  const deklaration = eltern as ts.Node & { name?: ts.Node }
  if (deklaration.name === bezeichner) return false
  return !ts.isImportSpecifier(eltern) && !ts.isExportSpecifier(eltern) && !ts.isTypeElement(eltern)
}

/** U4: kein React, kein DOM, kein Math.random oder crypto-Zufall, kein Date. */
export function pruefeEngineReinheit(datei: string, quelltext: string): Verstoss[] {
  const verstoesse: Verstoss[] = []
  const melde = (knoten: ts.Node, was: string) => verstoesse.push({ regel: 'U4', datei, zeile: zeileVon(knoten), was })

  besucheAlle(parse(datei, quelltext), (knoten) => {
    const modul = modulangabe(knoten)
    if (modul !== null && REACT_MODUL.test(modul)) melde(knoten, `importiert „${modul}“`)

    if (ts.isPropertyAccessExpression(knoten) && ts.isIdentifier(knoten.expression)) {
      if (ZUFALL.get(knoten.expression.text)?.has(knoten.name.text)) melde(knoten, `nutzt ${knoten.getText()}; Zufall kommt als Parameter`)
    }
    if (ts.isIdentifier(knoten) && istFreierWert(knoten)) {
      if (knoten.text === 'Date') melde(knoten, 'nutzt Date; Zeit gehört nicht in die Engine')
      if (DOM_GLOBALE.has(knoten.text)) melde(knoten, `nutzt das DOM (${knoten.text})`)
    }
  })
  return verstoesse
}

/** U3: Importe aus src/engine nur über src/engine/index.ts. `datei` ist relativ zur Projektwurzel. */
export function pruefeEngineZugang(datei: string, quelltext: string): Verstoss[] {
  const verstoesse: Verstoss[] = []
  besucheAlle(parse(datei, quelltext), (knoten) => {
    const modul = modulangabe(knoten)
    if (modul === null || !(modul.startsWith('.') || modul.startsWith('/'))) return
    const ziel = (modul.startsWith('/') ? posix.normalize(modul.slice(1)) : posix.join(posix.dirname(datei), modul))
      .replace(/\.(ts|tsx|js)$/, '')
    if (ziel === 'src/engine' || ziel === 'src/engine/index') return
    if (ziel.startsWith('src/engine/')) {
      verstoesse.push({ regel: 'U3', datei, zeile: zeileVon(knoten), was: `importiert „${modul}“ an src/engine/index.ts vorbei` })
    }
  })
  return verstoesse
}

const STANDARD_OPTIONEN: ts.CompilerOptions = {
  strict: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  allowImportingTsExtensions: true,
  noEmit: true,
  skipLibCheck: true,
  types: [],
}

/**
 * Compiler-Optionen von tsconfig.app.json, damit Importe so aufgelöst werden wie in
 * `tsc -b`; die Probe-Bäume der Gegenproben haben keine und nehmen feste Optionen.
 */
function optionenFuer(wurzel: string): ts.CompilerOptions {
  const tsconfig = join(wurzel, 'tsconfig.app.json')
  if (!existsSync(tsconfig)) return STANDARD_OPTIONEN
  const gelesen = ts.getParsedCommandLineOfConfigFile(tsconfig, {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnose) => {
      throw new Error(`optionenFuer: ${tsconfig}: ${ts.flattenDiagnosticMessageText(diagnose.messageText, ' ')}`)
    },
  })
  if (!gelesen) throw new Error(`optionenFuer: ${tsconfig} liess sich nicht lesen`)
  return { ...gelesen.options, noEmit: true }
}

/** U5: Ausser src/ki/sicht.ts liest keine Datei den vollen Zustand (Eigenschaft, Index, Zerlegen, Spreizen). */
export function pruefeSichtZugriff(wurzel: string, dateien: string[]): Verstoss[] {
  const zuPruefen = dateien.filter((datei) => datei !== 'src/ki/sicht.ts')
  if (zuPruefen.length === 0) return []

  const programm = ts.createProgram(zuPruefen.map((datei) => join(wurzel, datei)), optionenFuer(wurzel))
  const pruefer = programm.getTypeChecker()
  const engineOrdner = `${zuPosix(join(wurzel, 'src', 'engine'))}/`

  const istVollerZustand = (typ: ts.Type): boolean =>
    (typ.isUnion() ? typ.types : [typ]).some((teil) => {
      const symbol = teil.aliasSymbol ?? teil.getSymbol()
      return (
        symbol?.name === VOLLER_ZUSTAND_TYP &&
        (symbol.declarations ?? []).some((d) => zuPosix(d.getSourceFile().fileName).startsWith(engineOrdner))
      )
    })
  const gelesenesObjekt = (knoten: ts.Node): ts.Node | null => {
    if (ts.isPropertyAccessExpression(knoten) || ts.isElementAccessExpression(knoten)) return knoten.expression
    if (ts.isSpreadAssignment(knoten) || ts.isSpreadElement(knoten)) return knoten.expression
    if (ts.isObjectBindingPattern(knoten) && ts.isVariableDeclaration(knoten.parent)) return knoten.parent.initializer ?? null
    if (ts.isObjectBindingPattern(knoten) && ts.isParameter(knoten.parent)) return knoten.parent
    return null
  }

  const verstoesse: Verstoss[] = []
  for (const datei of zuPruefen) {
    const quelle = programm.getSourceFile(join(wurzel, datei))
    if (!quelle) throw new Error(`pruefeSichtZugriff: ${datei} liess sich nicht laden`)
    besucheAlle(quelle, (knoten) => {
      const objekt = gelesenesObjekt(knoten)
      if (objekt && istVollerZustand(pruefer.getTypeAtLocation(objekt))) {
        verstoesse.push({ regel: 'U5', datei, zeile: zeileVon(knoten), was: `liest ${VOLLER_ZUSTAND_TYP}: ${knoten.getText()}` })
      }
    })
  }
  return verstoesse
}

/** Ob src/engine/index.ts unter `wurzel` einen Export dieses Namens hat. */
export function exportiertEngine(wurzel: string, name: string): boolean {
  const einstieg = join(wurzel, 'src', 'engine', 'index.ts')
  const programm = ts.createProgram([einstieg], optionenFuer(wurzel))
  const pruefer = programm.getTypeChecker()
  const quelle = programm.getSourceFile(einstieg)
  const modul = quelle && pruefer.getSymbolAtLocation(quelle)
  if (!modul) throw new Error(`exportiertEngine: ${einstieg} fehlt oder ist kein Modul`)
  return pruefer.getExportsOfModule(modul).some((symbol) => symbol.name === name)
}
