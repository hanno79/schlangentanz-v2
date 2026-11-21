// Die Registry der Strategien (tests/architektur_ki_pruefung.ts, P0.3d, Abschluss 2): Jede
// Fabrik steht ausdrücklich in src/ki/strategien/index.ts, und genau diese Einträge prüft der
// Isolationstest. Dass keine Fabrik daran vorbei einen Verbraucher erreicht, sichert die
// Importgrenze (tests/architektur_ki_importgrenze.ts): Ausserhalb der Strategien gibt es nur
// index.ts und die Typen aus strategie.ts. Die Prüfung hier ist eine zusätzliche Hilfe in den
// Strategien selbst: Default-Exporte, umbenennende Exporte, Weiterexporte und exportierte
// Klassen gibt es dort nicht, und `liefertKi` meldet viele, aber nicht alle Fabriken, die nicht
// in der Registry stehen (Grenzen dort).

import ts from 'typescript'
import { zuPosix } from '../scripts/pruefung/quelldateien.mjs'

export const REGISTRY_DATEI = 'src/ki/strategien/index.ts'

/** Je Datei (absoluter Pfad) die Namen, die die Registry daraus importiert. */
export function registrierteNamen(registry: ts.SourceFile | undefined, pruefer: ts.TypeChecker): Map<string, Set<string>> {
  const namen = new Map<string, Set<string>>()
  for (const anweisung of registry?.statements ?? []) {
    if (!ts.isImportDeclaration(anweisung)) continue
    const gebunden = anweisung.importClause?.namedBindings
    const ziel = pruefer.getSymbolAtLocation(anweisung.moduleSpecifier)?.declarations?.find(ts.isSourceFile)
    if (!ziel || !gebunden || !ts.isNamedImports(gebunden) || anweisung.importClause?.isTypeOnly) continue
    const pfad = zuPosix(ziel.fileName)
    const bekannt = namen.get(pfad) ?? new Set<string>()
    for (const element of gebunden.elements) if (!element.isTypeOnly) bekannt.add((element.propertyName ?? element.name).text)
    namen.set(pfad, bekannt)
  }
  return namen
}

/**
 * Ob ein Wert dieses Typs eine KI ist oder, auch über bis zu drei Aufrufe oder `new`, eine liefert.
 * Nur eine Hilfe, nicht die Sicherung: Eine KI in einer Vereinigung (`Ki | undefined`,
 * `Ki | null`), in einer Liste (`Ki[]`), in einem `Promise<Ki>`, in einem Objekt (`{ ki: Ki }`)
 * oder hinter mehr als drei Aufrufen erkennt sie nicht (Schlussprüfung 2, Mangel 1).
 */
function liefertKi(typ: ts.Type, pruefer: ts.TypeChecker, tiefe = 0): boolean {
  if (typ.getProperty('waehle') !== undefined) return true
  if (tiefe >= 3) return false
  const signaturen = [...pruefer.getSignaturesOfType(typ, ts.SignatureKind.Call), ...pruefer.getSignaturesOfType(typ, ts.SignatureKind.Construct)]
  return signaturen.some((signatur) => liefertKi(signatur.getReturnType(), pruefer, tiefe + 1))
}

const hatModifikator = (knoten: ts.Node, art: ts.SyntaxKind) =>
  ts.canHaveModifiers(knoten) && (ts.getModifiers(knoten)?.some((m) => m.kind === art) ?? false)

/** Meldet in einer Strategie jeden Export, an dem eine Fabrik an der Registry vorbeikäme. */
export function pruefeExporte(
  quelle: ts.SourceFile,
  registriert: ReadonlySet<string>,
  pruefer: ts.TypeChecker,
  melde: (knoten: ts.Node, was: string) => void,
): void {
  const pruefeName = (name: ts.Identifier) => {
    if (liefertKi(pruefer.getTypeAtLocation(name), pruefer) && !registriert.has(name.text)) {
      melde(name, `${name.text} liefert eine KI, steht aber nicht in der Registry ${REGISTRY_DATEI}; der Isolationstest prüft nur deren Einträge`)
    }
  }
  for (const anweisung of quelle.statements) {
    if (ts.isExportAssignment(anweisung)) {
      melde(anweisung, 'Default-Export in einer Strategie; Fabriken stehen mit Namen in der Registry')
      continue
    }
    if (ts.isExportDeclaration(anweisung)) {
      if (anweisung.isTypeOnly) continue
      if (anweisung.moduleSpecifier || !anweisung.exportClause || !ts.isNamedExports(anweisung.exportClause)) {
        melde(anweisung, 'Strategie exportiert weiter; jede Datei exportiert nur, was sie selbst deklariert')
        continue
      }
      for (const element of anweisung.exportClause.elements) {
        if (element.isTypeOnly) continue
        if (element.propertyName || !ts.isIdentifier(element.name)) melde(element, `umbenennender Export ${element.getText()} in einer Strategie`)
        else pruefeName(element.name)
      }
      continue
    }
    if (!hatModifikator(anweisung, ts.SyntaxKind.ExportKeyword)) continue
    if (hatModifikator(anweisung, ts.SyntaxKind.DefaultKeyword)) melde(anweisung, 'Default-Export in einer Strategie; Fabriken stehen mit Namen in der Registry')
    else if (ts.isClassDeclaration(anweisung)) melde(anweisung, `exportierte Klasse ${anweisung.name?.text ?? ''} in einer Strategie; eine Fabrik in der Registry erzeugt die Instanzen`)
    else if (ts.isFunctionDeclaration(anweisung) && anweisung.name) pruefeName(anweisung.name)
    else if (ts.isVariableStatement(anweisung)) {
      for (const deklaration of anweisung.declarationList.declarations) if (ts.isIdentifier(deklaration.name)) pruefeName(deklaration.name)
    }
  }
}

/** Die Registry selbst: Importe und genau `export const STRATEGIEN = { name: fabrik, … }` mit importierten Fabriken. */
export function pruefeRegistry(quelle: ts.SourceFile, melde: (knoten: ts.Node, was: string) => void): void {
  for (const anweisung of quelle.statements) {
    if (ts.isImportDeclaration(anweisung)) continue
    const deklaration = ts.isVariableStatement(anweisung) && anweisung.declarationList.flags & ts.NodeFlags.Const && hatModifikator(anweisung, ts.SyntaxKind.ExportKeyword)
      ? anweisung.declarationList.declarations[0]
      : undefined
    const wert = deklaration?.initializer
    const nurFabriken = wert !== undefined && ts.isObjectLiteralExpression(wert) && wert.properties.every((eintrag) =>
      ts.isShorthandPropertyAssignment(eintrag) || (ts.isPropertyAssignment(eintrag) && ts.isIdentifier(eintrag.initializer)))
    const einzig = deklaration !== undefined && ts.isVariableStatement(anweisung) && anweisung.declarationList.declarations.length === 1
    if (!einzig || !deklaration || deklaration.name.getText() !== 'STRATEGIEN' || !nurFabriken) {
      melde(anweisung, `${REGISTRY_DATEI} enthält nur Importe und export const STRATEGIEN = { name: fabrik, … }`)
    }
  }
}
