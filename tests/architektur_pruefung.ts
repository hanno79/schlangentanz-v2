// Prüfungen für den Architekturtest (tests/architektur.test.ts), Regeln U3, U4 und U5
// aus docs/UMSETZUNGSPLAN.md, Abschnitt 3.7. Gelesen wird mit dem TypeScript-Parser,
// für U5 zusätzlich mit dem Typprüfer: Ein Wort in einer Zeichenkette oder in einem
// Kommentar ist kein Verstoss.

import { existsSync, readFileSync } from 'node:fs'
import { extname, join, posix } from 'node:path'
import ts from 'typescript'
import { CODE_ENDUNGEN, TESTDATEI, parse, sammleDateien as sammleAlle, zeileVon, zuPosix } from '../scripts/pruefung/quelldateien.mjs'
import { AUSNAHMEN_DATEI, pruefeFormat } from '../scripts/pruefung/ausnahmen.mjs'

export type Verstoss = { regel: 'U3' | 'U4' | 'U5'; datei: string; zeile: number; was: string }

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
/** Objekte, über die man jedes Global erreicht: `globalThis.Math`, `window.Date` … */
const GLOBALE_WURZELN = new Set(['globalThis', 'window', 'self', 'global'])

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

/** `import(…)` oder `require(…)`, gleich mit welchem Argument. */
function istDynamischerImport(knoten: ts.Node): knoten is ts.CallExpression {
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

/** Objekt und Schlüssel eines Zugriffs `a.b` oder `a['b']`; Schlüssel `undefined`, wenn er berechnet wird. */
function zugriff(knoten: ts.Node): { objekt: ts.Expression; schluessel: string | undefined } | null {
  if (ts.isPropertyAccessExpression(knoten)) return { objekt: knoten.expression, schluessel: knoten.name.text }
  if (ts.isElementAccessExpression(knoten)) {
    const argument = knoten.argumentExpression
    return { objekt: knoten.expression, schluessel: ts.isStringLiteralLike(argument) ? argument.text : undefined }
  }
  return null
}

const ohneKlammern = (ausdruck: ts.Expression): ts.Expression =>
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

/** Der Knoten, der einen Ausdruck umschliesst, ohne Klammern und `!` dazwischen. */
function umschliessend(knoten: ts.Node): ts.Node {
  const eltern = knoten.parent
  return ts.isParenthesizedExpression(eltern) || ts.isNonNullExpression(eltern) ? umschliessend(eltern) : eltern
}

/**
 * Math oder crypto, das nicht das Objekt eines Zugriffs ist: zerlegt
 * (`const { random } = Math`, gemeldet nur bei verbotenen Schlüsseln) oder als
 * Wert weitergereicht (`const M = Math`, immer gemeldet).
 */
function zufallsobjektAlsWert(knoten: ts.Node, name: string, verboten: Set<string>, melde: (knoten: ts.Node, wie: string) => void) {
  const eltern = umschliessend(knoten)
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
 * U4: kein React, kein DOM, kein Math.random oder crypto-Zufall, kein Date. Auch
 * die Umwege: `Math['random']`, `globalThis.Math.random`, `const { random } = Math`,
 * ein berechneter Schlüssel an Math oder globalThis, Math als weitergereichter Wert
 * und `import()` mit berechnetem Modulnamen.
 */
export function pruefeEngineReinheit(datei: string, quelltext: string): Verstoss[] {
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
    if (name === 'Date') melde(knoten, `nutzt ${knoten.getText()}; Zeit gehört nicht in die Engine`)
    if (DOM_GLOBALE.has(name)) melde(knoten, `nutzt das DOM (${knoten.getText()})`)
    const verboten = ZUFALL.get(name)
    if (verboten) zufallsobjektAlsWert(knoten, name, verboten, meldeZufall)
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
