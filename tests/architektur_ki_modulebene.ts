// Modulebene einer Strategie (tests/architektur_ki_pruefung.ts, P0.3d, Iteration 3):
// Instanzen derselben Strategie teilen sich ein Modul. Was dort veränderlich liegt,
// etwa eine Map, trüge Wissen von einer Instanz zur anderen, im Turnier sogar zum
// Spiegelgegner. Deshalb liegt auf Modulebene nur Unveränderliches; Zustand lebt in
// der Closure, die eine Strategie je Instanz baut.

import ts from 'typescript'
import { ohneKlammern } from './architektur_pruefung'

/** Ein Literal ohne veränderlichen Behälter darin: Text, Zahl, Wahrheitswert, null, Listen und Objekte daraus. */
function istReinesLiteral(ausdruck: ts.Expression): boolean {
  const kern = ohneKlammern(ausdruck)
  if (ts.isStringLiteral(kern) || ts.isNumericLiteral(kern) || ts.isNoSubstitutionTemplateLiteral(kern)) return true
  if (kern.kind === ts.SyntaxKind.TrueKeyword || kern.kind === ts.SyntaxKind.FalseKeyword || kern.kind === ts.SyntaxKind.NullKeyword) return true
  if (ts.isPrefixUnaryExpression(kern)) return kern.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(kern.operand)
  if (ts.isArrayLiteralExpression(kern)) return kern.elements.every((element) => !ts.isSpreadElement(element) && istReinesLiteral(element))
  if (ts.isObjectLiteralExpression(kern)) {
    return kern.properties.every((eigenschaft) =>
      ts.isPropertyAssignment(eigenschaft) && !ts.isComputedPropertyName(eigenschaft.name) && istReinesLiteral(eigenschaft.initializer),
    )
  }
  return false
}

/** Was eine `const` auf Modulebene halten darf: eine Funktion, einen Wert mit primitivem Typ oder ein Literal mit `as const`. */
function istUnveraenderlich(wert: ts.Expression, istPrimitiv: (knoten: ts.Node) => boolean): boolean {
  const kern = ohneKlammern(wert)
  if (ts.isArrowFunction(kern) || ts.isFunctionExpression(kern)) return true
  if (ts.isAsExpression(kern) && ts.isConstTypeReference(kern.type)) return istReinesLiteral(kern.expression)
  return istPrimitiv(kern)
}

/**
 * Meldet auf Modulebene einer Strategie alles ausser Importen, Exporten, Typen,
 * Funktionen, Klassen ohne `static`-Felder und `const` mit unveränderlichem Wert.
 */
export function pruefeModulebene(
  quelle: ts.SourceFile,
  istPrimitiv: (knoten: ts.Node) => boolean,
  melde: (knoten: ts.Node, was: string) => void,
): void {
  const grund = 'auf Modulebene einer Strategie liegt nur Unveränderliches; Zustand gehört in die Closure je Instanz'
  for (const anweisung of quelle.statements) {
    if (ts.isImportDeclaration(anweisung) || ts.isExportDeclaration(anweisung)) continue
    if (ts.isInterfaceDeclaration(anweisung) || ts.isTypeAliasDeclaration(anweisung) || ts.isFunctionDeclaration(anweisung)) continue
    if (ts.isClassDeclaration(anweisung)) {
      for (const mitglied of anweisung.members) {
        const statisch = ts.canHaveModifiers(mitglied) && ts.getModifiers(mitglied)?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword)
        if (ts.isClassStaticBlockDeclaration(mitglied) || (statisch && ts.isPropertyDeclaration(mitglied))) melde(mitglied, `static in ${anweisung.name?.text ?? 'einer Klasse'}: ${grund}`)
      }
      continue
    }
    if (ts.isVariableStatement(anweisung) && anweisung.declarationList.flags & ts.NodeFlags.Const) {
      for (const deklaration of anweisung.declarationList.declarations) {
        const wert = deklaration.initializer
        if (wert === undefined || !istUnveraenderlich(wert, istPrimitiv)) melde(deklaration, `${deklaration.name.getText()}: ${grund}`)
      }
      continue
    }
    melde(anweisung, `${anweisung.getText().split('\n')[0]}: ${grund}`)
  }
}

/** Ob ein Symbol auf Modulebene deklariert ist; in Strategien wird dorthin nicht geschrieben (`f.cache = …`). */
export function aufModulebene(symbol: ts.Symbol | undefined): boolean {
  return (symbol?.declarations ?? []).some((d) => {
    const anweisung = ts.isVariableDeclaration(d) ? d.parent.parent : d
    return anweisung.parent !== undefined && ts.isSourceFile(anweisung.parent)
  })
}
