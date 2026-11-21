// Prüfungen für den Architekturtest (tests/architektur.test.ts), Regeln U3 und U4
// aus docs/UMSETZUNGSPLAN.md, Abschnitt 3.7, dazu Bausteine für die Grenze der KI (U5,
// tests/architektur_ki_pruefung.ts). Gelesen wird mit dem TypeScript-Parser: Ein Wort
// in einer Zeichenkette oder in einem Kommentar ist kein Verstoss.

import { existsSync, readFileSync } from 'node:fs'
import { extname, join, posix } from 'node:path'
import ts from 'typescript'
import { CODE_ENDUNGEN, TESTDATEI, parse, sammleDateien as sammleAlle, zeileVon } from '../scripts/pruefung/quelldateien.mjs'
import { AUSNAHMEN_DATEI, pruefeFormat } from '../scripts/pruefung/ausnahmen.mjs'

export type Verstoss = { regel: 'U3' | 'U4' | 'U5'; datei: string; zeile: number; was: string }

/** Verstösse als Text, eine Zeile je Verstoss, für die Meldungen der Tests. */
export const beschreibe = (verstoesse: Verstoss[]) =>
  verstoesse.map(({ regel, datei, zeile, was }) => `${regel} ${datei}:${zeile} ${was}`).join('\n')

/** Name des vollen Spielzustands, wie ihn src/engine/index.ts exportiert (U5). */
export const VOLLER_ZUSTAND_TYP = 'Spielzustand'

/**
 * Altbestand zu U4 aus derselben Ausnahmeliste wie check:regeln: je Datei die
 * Merkmale (Zeileninhalt) der Verstösse, die dort noch stehen dürfen. Darf nur
 * schrumpfen; der Architekturtest meldet auch ein veraltetes Merkmal. Ein Eintrag
 * ohne Merkmale (etwa eine Zahl) bricht schon beim Laden ab.
 */
export const AUSNAHMEN_U4: Record<string, string[]> = (() => {
  const daten = JSON.parse(readFileSync(join(__dirname, '..', AUSNAHMEN_DATEI), 'utf8'))
  pruefeFormat({ U4: daten.U4 ?? {} })
  return daten.U4 ?? {}
})()

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
/** Zeitquellen; Zeit gehört weder in die Engine noch in die KI. */
export const ZEIT = new Set(['Date', 'performance'])
/** Objekte, über die man jedes Global erreicht: `globalThis.Math`, `window.Date` … */
export const GLOBALE_WURZELN = new Set(['globalThis', 'window', 'self', 'global'])

/** Testdateien und alles unter `__tests__/` (dort liegen auch Testhelfer ohne `.test`). */
export function istTestdatei(pfad: string): boolean {
  return TESTDATEI.test(pfad) || pfad.includes('/__tests__/')
}

/** Codedateien unter `ordner` als Pfade relativ zu `wurzel`; fehlt der Ordner, eine leere Liste. */
export function sammleDateien(wurzel: string, ordner: string): string[] {
  return sammleAlle(wurzel, ordner).filter((pfad) => CODE_ENDUNGEN.has(extname(pfad)))
}

export function besucheAlle(knoten: ts.Node, besucher: (knoten: ts.Node) => void): void {
  besucher(knoten)
  ts.forEachChild(knoten, (kind) => besucheAlle(kind, besucher))
}

/** `import(…)` oder `require(…)`, gleich mit welchem Argument. */
export function istDynamischerImport(knoten: ts.Node): knoten is ts.CallExpression {
  if (!ts.isCallExpression(knoten)) return false
  return knoten.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(knoten.expression) && knoten.expression.text === 'require')
}

/** Modulangaben aus import, export … from, import() und require(), sofern sie ein fester Text sind. */
function modulangabe(knoten: ts.Node): string | null {
  if ((ts.isImportDeclaration(knoten) || ts.isExportDeclaration(knoten)) && knoten.moduleSpecifier) {
    return ts.isStringLiteral(knoten.moduleSpecifier) ? knoten.moduleSpecifier.text : null
  }
  if (istDynamischerImport(knoten) && knoten.arguments.length > 0 && ts.isStringLiteral(knoten.arguments[0])) {
    return knoten.arguments[0].text
  }
  return null
}

/** Ein Bezeichner, der einen Wert aus dem umgebenden Gültigkeitsbereich liest, auch in `{ x }`; kein Name an einer Deklaration, keine Sprungmarke. */
export function istFreierWert(bezeichner: ts.Identifier): boolean {
  const eltern = bezeichner.parent
  if (ts.isPropertyAccessExpression(eltern)) return eltern.expression === bezeichner
  if (ts.isShorthandPropertyAssignment(eltern)) return eltern.name === bezeichner
  if (ts.isLabeledStatement(eltern) || ts.isBreakOrContinueStatement(eltern)) return false
  if (ts.isQualifiedName(eltern) || ts.isTypeReferenceNode(eltern) || ts.isTypeQueryNode(eltern)) return false
  // `interface A extends B` und `class A implements B` nennen nur Typen; `class A extends B` liest einen Wert.
  if (ts.isExpressionWithTypeArguments(eltern) && ts.isHeritageClause(eltern.parent)) {
    return eltern.parent.token === ts.SyntaxKind.ExtendsKeyword && !ts.isInterfaceDeclaration(eltern.parent.parent)
  }
  if (ts.isBindingElement(eltern)) return eltern.initializer === bezeichner
  const deklaration = eltern as ts.Node & { name?: ts.Node }
  if (deklaration.name === bezeichner) return false
  return !ts.isImportSpecifier(eltern) && !ts.isExportSpecifier(eltern) && !ts.isTypeElement(eltern)
}

/** Objekt und Schlüssel eines Zugriffs `a.b` oder `a['b']`; Schlüssel `undefined`, wenn er berechnet wird. */
export function zugriff(knoten: ts.Node): { objekt: ts.Expression; schluessel: string | undefined } | null {
  if (ts.isPropertyAccessExpression(knoten)) return { objekt: knoten.expression, schluessel: knoten.name.text }
  if (ts.isElementAccessExpression(knoten)) {
    const argument = knoten.argumentExpression
    return { objekt: knoten.expression, schluessel: ts.isStringLiteralLike(argument) ? argument.text : undefined }
  }
  return null
}

export const ohneKlammern = (ausdruck: ts.Expression): ts.Expression =>
  ts.isParenthesizedExpression(ausdruck) || ts.isNonNullExpression(ausdruck) ? ohneKlammern(ausdruck.expression) : ausdruck

/** Das Global, das ein Bezeichner oder Zugriff meint: `Math`, `(Math)`, `globalThis.Math`, `window['Math']`; sonst null. */
function globalerName(knoten: ts.Node): string | null {
  if (!ts.isExpression(knoten)) return null
  const kern = ohneKlammern(knoten)
  if (ts.isIdentifier(kern)) return istFreierWert(kern) ? kern.text : null
  const teile = zugriff(kern)
  if (teile?.schluessel && GLOBALE_WURZELN.has(globalerName(teile.objekt) ?? '')) return teile.schluessel
  return null
}

/** Der äusserste Knoten um `knoten`, der nur Klammern oder `!` hinzufügt. */
export function aeusserer(knoten: ts.Node): ts.Node {
  return ts.isParenthesizedExpression(knoten.parent) || ts.isNonNullExpression(knoten.parent) ? aeusserer(knoten.parent) : knoten
}

/** Ein Ziel ohne Klammern, `!` und Casts: `(globalThis as T).x` schreibt in globalThis. */
export function ohneHuellen(ausdruck: ts.Expression): ts.Expression {
  const kern = ohneKlammern(ausdruck)
  if (ts.isAsExpression(kern) || ts.isTypeAssertionExpression(kern) || ts.isSatisfiesExpression(kern)) return ohneHuellen(kern.expression)
  return kern
}

/** Die Ziele einer Zuweisung, auch beim Zerlegen: `[a.b] = …`, `({ x: a.b } = …)`. */
function zuweisungsziele(links: ts.Expression): ts.Expression[] {
  const kern = ohneHuellen(links)
  const ohneVorgabe = (ziel: ts.Expression) =>
    ts.isBinaryExpression(ziel) && ziel.operatorToken.kind === ts.SyntaxKind.EqualsToken ? ziel.left : ziel
  if (ts.isArrayLiteralExpression(kern)) {
    return kern.elements.flatMap((element) =>
      ts.isOmittedExpression(element) ? [] : zuweisungsziele(ohneVorgabe(ts.isSpreadElement(element) ? element.expression : element)),
    )
  }
  if (ts.isObjectLiteralExpression(kern)) {
    return kern.properties.flatMap((eigenschaft) => {
      if (ts.isPropertyAssignment(eigenschaft)) return zuweisungsziele(ohneVorgabe(eigenschaft.initializer))
      if (ts.isSpreadAssignment(eigenschaft)) return zuweisungsziele(eigenschaft.expression)
      return ts.isShorthandPropertyAssignment(eigenschaft) ? [eigenschaft.name] : []
    })
  }
  return [kern]
}

/** Die Ziele, in die ein Knoten schreibt: Zuweisung, `++`, `--`, `delete`, Kopf von `for … in` und `for … of`. */
export function geschriebeneZiele(knoten: ts.Node): ts.Expression[] {
  if (ts.isBinaryExpression(knoten) && knoten.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && knoten.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
    return zuweisungsziele(knoten.left)
  }
  if ((ts.isPrefixUnaryExpression(knoten) || ts.isPostfixUnaryExpression(knoten)) &&
    (knoten.operator === ts.SyntaxKind.PlusPlusToken || knoten.operator === ts.SyntaxKind.MinusMinusToken)) {
    return zuweisungsziele(knoten.operand)
  }
  if (ts.isDeleteExpression(knoten)) return zuweisungsziele(knoten.expression)
  if ((ts.isForInStatement(knoten) || ts.isForOfStatement(knoten)) && !ts.isVariableDeclarationList(knoten.initializer)) {
    return zuweisungsziele(knoten.initializer)
  }
  return []
}

/**
 * Math oder crypto, das nicht das Objekt eines Zugriffs ist: zerlegt
 * (`const { random } = Math`, gemeldet nur bei verbotenen Schlüsseln) oder als
 * Wert weitergereicht (`const M = Math`, immer gemeldet).
 */
function zufallsobjektAlsWert(knoten: ts.Node, name: string, verboten: Set<string>, melde: (knoten: ts.Node, wie: string) => void) {
  const eltern = aeusserer(knoten).parent
  const teile = zugriff(eltern)
  if (teile && ohneKlammern(teile.objekt) === knoten) return
  if (!ts.isVariableDeclaration(eltern) || !ts.isObjectBindingPattern(eltern.name)) return melde(knoten, `gibt ${name} als Wert weiter`)
  for (const element of eltern.name.elements) {
    const schluessel = element.propertyName ?? element.name
    const eigenschaft = ts.isIdentifier(schluessel) || ts.isStringLiteralLike(schluessel) ? schluessel.text : undefined
    if (element.dotDotDotToken || eigenschaft === undefined || verboten.has(eigenschaft)) melde(element, `zerlegt ${name} in ${element.getText()}`)
  }
}

/**
 * U4 für src/engine und src/ki (P0.3d, H7): kein React, kein DOM, kein Math.random
 * oder crypto-Zufall, kein Date und kein performance. Auch die Umwege: `Math['random']`, `globalThis.Math.random`, `const { random } = Math`,
 * ein berechneter Schlüssel an Math oder globalThis, Math als weitergereichter Wert
 * und `import()` mit berechnetem Modulnamen.
 */
export function pruefeReinheit(datei: string, quelltext: string): Verstoss[] {
  const verstoesse: Verstoss[] = []
  const melde = (knoten: ts.Node, was: string) => verstoesse.push({ regel: 'U4', datei, zeile: zeileVon(knoten), was })
  const meldeZufall = (knoten: ts.Node, wie: string) => melde(knoten, `${wie}; Zufall kommt als Parameter`)

  besucheAlle(parse(datei, quelltext), (knoten) => {
    const modul = modulangabe(knoten)
    if (modul !== null && REACT_MODUL.test(modul)) melde(knoten, `importiert „${modul}“`)
    if (modul === null && istDynamischerImport(knoten)) melde(knoten, 'importiert ein Modul mit berechnetem Namen; erlaubt ist nur ein fester Text')

    const teile = zugriff(knoten)
    if (teile) {
      const objekt = globalerName(teile.objekt) ?? ''
      const verboten = ZUFALL.get(objekt)
      if (verboten && (teile.schluessel === undefined || verboten.has(teile.schluessel))) meldeZufall(knoten, `nutzt ${knoten.getText()}`)
      if (GLOBALE_WURZELN.has(objekt) && teile.schluessel === undefined) meldeZufall(knoten, `liest ${objekt} mit berechnetem Schlüssel`)
    }

    const name = globalerName(knoten)
    if (name === null) return
    if (ZEIT.has(name)) melde(knoten, `nutzt ${knoten.getText()}; Zeit gehört nicht in Engine und KI`)
    if (DOM_GLOBALE.has(name)) melde(knoten, `nutzt das DOM (${knoten.getText()})`)
    const verboten = ZUFALL.get(name)
    if (verboten) zufallsobjektAlsWert(knoten, name, verboten, meldeZufall)
  })
  return verstoesse
}

const werteNamen = (elemente: ts.NodeArray<ts.ImportSpecifier | ts.ExportSpecifier>) =>
  elemente.filter((e) => !e.isTypeOnly).map((e) => (e.propertyName ?? e.name).text)

/** Die Namen der Werte, die ein Import oder `export … from` holt; `*` für einen Namensraum, `default` für den Standardexport. */
export function geholteWerte(knoten: ts.ImportDeclaration | ts.ExportDeclaration): string[] {
  if (ts.isExportDeclaration(knoten)) {
    if (knoten.isTypeOnly) return []
    return knoten.exportClause && ts.isNamedExports(knoten.exportClause) ? werteNamen(knoten.exportClause.elements) : ['*']
  }
  const klausel = knoten.importClause
  if (klausel === undefined) return ['*']
  if (klausel.isTypeOnly) return []
  const gebunden = klausel.namedBindings
  const benannt = gebunden === undefined ? [] : ts.isNamedImports(gebunden) ? werteNamen(gebunden.elements) : ['*']
  return klausel.name ? ['default', ...benannt] : benannt
}

function inTypposition(knoten: ts.Node): boolean {
  for (let eltern = knoten.parent; eltern; eltern = eltern.parent) if (ts.isTypeNode(eltern)) return true
  return false
}

/** Ausdrücke, die zur Laufzeit einen Wert haben; Klammern, `!` und `...` zählen zum Ausdruck darin, Modulnamen nicht. */
export function istWertausdruck(knoten: ts.Node): knoten is ts.Expression {
  if (!ts.isExpression(knoten) || ts.isParenthesizedExpression(knoten) || ts.isNonNullExpression(knoten)) return false
  if (ts.isSpreadElement(knoten) || ts.isOmittedExpression(knoten)) return false
  if (ts.isImportDeclaration(knoten.parent) || ts.isExportDeclaration(knoten.parent)) return false
  if (ts.isIdentifier(knoten) && !istFreierWert(knoten)) return false
  return !inTypposition(knoten)
}

/** Die Funktion hinter einem Namen, der sich nicht umhängen lässt: `function f` oder `const f = (…) => …`. */
export function festeFunktion(symbol: ts.Symbol | undefined): { funktion: ts.FunctionLikeDeclaration; name: string } | null {
  const deklaration = symbol?.valueDeclaration
  if (deklaration && ts.isFunctionDeclaration(deklaration) && deklaration.name) return { funktion: deklaration, name: deklaration.name.text }
  if (!deklaration || !ts.isVariableDeclaration(deklaration) || !ts.isIdentifier(deklaration.name)) return null
  if (!(ts.getCombinedNodeFlags(deklaration) & ts.NodeFlags.Const) || !deklaration.initializer) return null
  const wert = ohneKlammern(deklaration.initializer)
  return ts.isArrowFunction(wert) || ts.isFunctionExpression(wert) ? { funktion: wert, name: deklaration.name.text } : null
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
export function optionenFuer(wurzel: string): ts.CompilerOptions {
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

/** Die Namen aller Exporte von src/engine/index.ts unter `wurzel`. */
export function engineExporte(wurzel: string): Set<string> {
  const einstieg = join(wurzel, 'src', 'engine', 'index.ts')
  const programm = ts.createProgram([einstieg], optionenFuer(wurzel))
  const pruefer = programm.getTypeChecker()
  const quelle = programm.getSourceFile(einstieg)
  const modul = quelle && pruefer.getSymbolAtLocation(quelle)
  if (!modul) throw new Error(`engineExporte: ${einstieg} fehlt oder ist kein Modul`)
  return new Set(pruefer.getExportsOfModule(modul).map((symbol) => symbol.name))
}
