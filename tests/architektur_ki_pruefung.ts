// Die Grenze der KI für den Architekturtest, Regel U5 aus docs/UMSETZUNGSPLAN.md,
// Abschnitt 3.7 (P0.3d). KI-Code ausserhalb von src/ki/sicht.ts gilt als nicht
// vertrauenswürdig. Mit dem Typprüfer wird jeder Ausdruck gefunden, der den vollen
// Zustand ist oder enthält; er darf nur unverändert weitergereicht werden. Dazu darf
// kein KI-Code, auch sicht.ts nicht, globale Objekte verändern: Eine KI, die etwa
// `structuredClone` ersetzt, bekäme beim nächsten Zug der Engine den vollen Zustand.

import { join } from 'node:path'
import ts from 'typescript'
import { zeileVon, zuPosix } from '../scripts/pruefung/quelldateien.mjs'
import {
  GLOBALE_WURZELN,
  VOLLER_ZUSTAND_TYP,
  aeusserer,
  besucheAlle,
  istFreierWert,
  ohneKlammern,
  optionenFuer,
  zugriff,
  type Verstoss,
} from './architektur_pruefung'

/** Die einzige Datei, die den vollen Zustand lesen darf. */
const SICHT_DATEI = 'src/ki/sicht.ts'

/**
 * Engine-Funktionen, denen KI-Code den vollen Zustand geben darf. Was sie
 * zurückgeben, ist nicht der Zustand selbst; `serialisiere` etwa fehlt mit Absicht.
 */
export const ERLAUBTE_ENGINE_EMPFAENGER = new Set([
  'anwendeAktion',
  'berechneEndwertung',
  'ermittleAktionen',
  'ermittleEntscheider',
  'pruefeAktion',
  'pruefeInvarianten',
])

/** Globale Werte, mit denen KI-Code Text als Code ausführt oder Objekte beliebig umbaut. */
const VERBOTENE_GLOBALE = new Set(['eval', 'Function', 'Reflect'])
/** Funktionen von `Object`, die Eigenschaften oder Prototypen anderer Objekte ändern oder herausgeben. */
const VERBOTEN_AN_OBJECT = new Set([
  'defineProperty',
  'defineProperties',
  'getOwnPropertyDescriptor',
  'getOwnPropertyDescriptors',
  'getPrototypeOf',
  'setPrototypeOf',
])
/** Schlüssel, über die man an den Prototyp eingebauter Objekte kommt. */
const PROTOTYP_SCHLUESSEL = new Set(['prototype', '__proto__', 'constructor'])
/** Von Object.prototype geerbt; `globalThis.valueOf()` etwa gibt das globale Objekt ohne seinen Namen heraus. */
const GEERBT_VON_OBJECT = new Set(['valueOf', 'toString', 'toLocaleString', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'])
/** U4 nach Typ: Zeitquellen als globale Variable, Zufall und Zeit als Mitglied einer Schnittstelle der Bibliothek. */
const ZEIT_GLOBAL = new Set(['Date', 'performance'])
const ZUFALL_UND_ZEIT: Record<string, Set<string> | 'alle'> = {
  Math: new Set(['random']),
  Crypto: new Set(['getRandomValues', 'randomUUID']),
  DateConstructor: 'alle',
  Performance: 'alle',
}

function inTypposition(knoten: ts.Node): boolean {
  for (let eltern = knoten.parent; eltern; eltern = eltern.parent) if (ts.isTypeNode(eltern)) return true
  return false
}

/** Ausdrücke, die zur Laufzeit einen Wert haben; Klammern, `!` und `...` zählen zum Ausdruck darin, Modulnamen nicht. */
function istWertausdruck(knoten: ts.Node): knoten is ts.Expression {
  if (!ts.isExpression(knoten) || ts.isParenthesizedExpression(knoten) || ts.isNonNullExpression(knoten)) return false
  if (ts.isSpreadElement(knoten) || ts.isOmittedExpression(knoten)) return false
  if (ts.isImportDeclaration(knoten.parent) || ts.isExportDeclaration(knoten.parent)) return false
  if (ts.isIdentifier(knoten) && !istFreierWert(knoten)) return false
  return !inTypposition(knoten)
}

/** Ein Ziel ohne Klammern, `!` und Casts: `(globalThis as T).x` schreibt in globalThis. */
function ohneHuellen(ausdruck: ts.Expression): ts.Expression {
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
function geschriebeneZiele(knoten: ts.Node): ts.Expression[] {
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

/** Die Funktion hinter einem Namen, der sich nicht umhängen lässt: `function f` oder `const f = (…) => …`. */
function festeFunktion(symbol: ts.Symbol | undefined): { funktion: ts.FunctionLikeDeclaration; name: string } | null {
  const deklaration = symbol?.valueDeclaration
  if (deklaration && ts.isFunctionDeclaration(deklaration) && deklaration.name) return { funktion: deklaration, name: deklaration.name.text }
  if (!deklaration || !ts.isVariableDeclaration(deklaration) || !ts.isIdentifier(deklaration.name)) return null
  if (!(ts.getCombinedNodeFlags(deklaration) & ts.NodeFlags.Const) || !deklaration.initializer) return null
  const wert = ohneKlammern(deklaration.initializer)
  return ts.isArrowFunction(wert) || ts.isFunctionExpression(wert) ? { funktion: wert, name: deklaration.name.text } : null
}

/**
 * U5 für KI-Code: Ausser in src/ki/sicht.ts darf ein Wert, der den vollen Zustand ist
 * oder enthält, nur unverändert weitergereicht werden: an eine Funktion unter
 * `dateien` mit einem Parameter dieses Typs, an eine der ERLAUBTE_ENGINE_EMPFAENGER,
 * in eine Variable dieses Typs; einen Behälter wie das Ergebnis von `anwendeAktion`
 * darf man öffnen. Alles andere ist ein Verstoss, ebenso Casts von oder zu diesem
 * Typ, Casts nach `any` oder `unknown`, Ausdrücke vom Typ `any` und `arguments`.
 * In allen `dateien`, auch in sicht.ts: keine Änderung globaler Objekte (H1) und
 * U4 nach Typ, damit `(Math.valueOf() as Math).random()` nicht durchrutscht.
 */
export function pruefeSichtZugriff(wurzel: string, dateien: string[]): Verstoss[] {
  if (dateien.length === 0) return []

  const programm = ts.createProgram(dateien.map((datei) => join(wurzel, datei)), optionenFuer(wurzel))
  const pruefer = programm.getTypeChecker()
  const engineOrdner = `${zuPosix(join(wurzel, 'src', 'engine'))}/`
  const kiPfade = new Set(dateien.map((datei) => zuPosix(join(wurzel, datei))))
  const typ = (knoten: ts.Node) => pruefer.getTypeAtLocation(knoten)
  const symbolVon = (knoten: ts.Node): ts.Symbol | undefined => {
    const gefunden = pruefer.getSymbolAtLocation(knoten)
    return gefunden && gefunden.flags & ts.SymbolFlags.Alias ? pruefer.getAliasedSymbol(gefunden) : gefunden
  }

  const istZustandsdeklaration = (deklaration: ts.Node | undefined): boolean =>
    deklaration !== undefined &&
    (ts.isInterfaceDeclaration(deklaration) || ts.isTypeAliasDeclaration(deklaration)) &&
    deklaration.name.text === VOLLER_ZUSTAND_TYP &&
    zuPosix(deklaration.getSourceFile().fileName).startsWith(engineOrdner)
  /**
   * Der volle Zustand beim Namen oder abgeleitet: `Readonly<Spielzustand>` und
   * `Pick<Spielzustand, …>` tragen Felder, die in Spielzustand deklariert sind.
   */
  const istVollerZustand = (geprueft: ts.Type): boolean => {
    if (geprueft.isUnionOrIntersection()) return geprueft.types.some(istVollerZustand)
    if (geprueft.flags & ts.TypeFlags.TypeParameter) {
      const grenze = pruefer.getBaseConstraintOfType(geprueft)
      return grenze !== undefined && grenze !== geprueft && istVollerZustand(grenze)
    }
    const symbol = geprueft.aliasSymbol ?? geprueft.getSymbol()
    if (symbol?.name === VOLLER_ZUSTAND_TYP && (symbol.declarations ?? []).some(istZustandsdeklaration)) return true
    if (!(geprueft.flags & ts.TypeFlags.Object)) return false
    return pruefer.getPropertiesOfType(geprueft).some((feld) => (feld.declarations ?? []).some((d) => istZustandsdeklaration(d.parent)))
  }
  /** Ob ein Symbol nur in Bibliotheksdateien (lib.*.d.ts, @types) deklariert ist. */
  const ausBibliothek = (symbol: ts.Symbol | undefined): boolean => {
    const deklarationen = symbol?.declarations ?? []
    return deklarationen.length > 0 && deklarationen.every((d) => zuPosix(d.getSourceFile().fileName).includes('/node_modules/'))
  }
  const gemerkt = new Map<ts.Type, boolean>()
  /** Ob ein Wert dieses Typs den vollen Zustand ist oder in einer Eigenschaft, einem Element enthält. */
  const traegtZustand = (geprueft: ts.Type): boolean => {
    const bekannt = gemerkt.get(geprueft)
    if (bekannt !== undefined) return bekannt
    const besucht = new Set<ts.Type>()
    const suche = (teil: ts.Type): boolean => {
      if (istVollerZustand(teil)) return true
      if (besucht.has(teil)) return false
      besucht.add(teil)
      if (teil.isUnionOrIntersection()) return teil.types.some(suche)
      if (pruefer.isArrayType(teil) || pruefer.isTupleType(teil)) return pruefer.getTypeArguments(teil as ts.TypeReference).some(suche)
      if (!(teil.flags & ts.TypeFlags.Object)) return false
      // Schnittstellen und Klassen der Bibliothek (DOM, Map …) enthalten den Zustand höchstens über ihre Typargumente.
      const symbol = teil.getSymbol()
      if (symbol && symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.Class) && ausBibliothek(symbol)) {
        const referenz = (teil as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference
        return referenz !== 0 && pruefer.getTypeArguments(teil as ts.TypeReference).some(suche)
      }
      return (
        pruefer.getPropertiesOfType(teil).some((eigenschaft) => suche(pruefer.getTypeOfSymbol(eigenschaft))) ||
        pruefer.getIndexInfosOfType(teil).some((index) => suche(index.type))
      )
    }
    const ergebnis = suche(geprueft)
    gemerkt.set(geprueft, ergebnis)
    return ergebnis
  }

  /**
   * Ob die aufgerufene Funktion den Zustand an Stelle `stelle` bekommen darf. Sie
   * wird mit ihrem Namen aufgerufen, nicht als Methode: Eine Methode lässt sich
   * umhängen, etwa auf JSON.stringify, und der Typprüfer sähe weiter die alte.
   */
  const erlaubterEmpfaenger = (aufruf: ts.CallExpression, stelle: number): boolean => {
    const aufgerufen = ohneKlammern(aufruf.expression)
    const fest = festeFunktion(ts.isIdentifier(aufgerufen) ? symbolVon(aufgerufen) : undefined)
    if (stelle < 0 || !fest || pruefer.getResolvedSignature(aufruf)?.declaration !== fest.funktion) return false
    const herkunft = zuPosix(fest.funktion.getSourceFile().fileName)
    if (herkunft.startsWith(engineOrdner)) return ERLAUBTE_ENGINE_EMPFAENGER.has(fest.name)
    const parameter = fest.funktion.parameters[stelle]
    return kiPfade.has(herkunft) && fest.funktion.body !== undefined && parameter !== undefined && !parameter.dotDotDotToken && traegtZustand(typ(parameter))
  }

  /** Ob `ausdruck` vom Typ, der den Zustand trägt, an seiner Stelle nur weitergereicht wird. */
  const wirdWeitergereicht = (ausdruck: ts.Expression): boolean => {
    const aussen = aeusserer(ausdruck)
    const eltern = aussen.parent
    // `zustand = …` als Anweisung: Der Wert der Zuweisung selbst geht nirgends hin.
    const istZuweisung = ts.isBinaryExpression(ausdruck) && ausdruck.operatorToken.kind === ts.SyntaxKind.EqualsToken
    if (istZuweisung && ts.isExpressionStatement(eltern)) return true
    if (ts.isCallExpression(eltern) && eltern.expression !== aussen) {
      return erlaubterEmpfaenger(eltern, eltern.arguments.indexOf(aussen as ts.Expression))
    }
    if (ts.isVariableDeclaration(eltern) && eltern.initializer === aussen) return ts.isIdentifier(eltern.name) && traegtZustand(typ(eltern.name))
    if (ts.isBinaryExpression(eltern) && eltern.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      if (eltern.left === aussen) return ts.isIdentifier(ausdruck)
      return ts.isIdentifier(ohneKlammern(eltern.left)) && traegtZustand(typ(eltern.left))
    }
    // Einen Behälter darf man öffnen; was herauskommt, wird für sich geprüft. Den Zustand selbst nicht.
    const teile = zugriff(eltern)
    return teile !== null && teile.objekt === aussen && !istVollerZustand(typ(ausdruck))
  }

  /** Die Schlüssel eines Zugriffs; `null`, wenn er jeder Text sein kann. Zahlen gelten als harmlos. */
  const schluesselVon = (knoten: ts.PropertyAccessExpression | ts.ElementAccessExpression): string[] | null => {
    if (ts.isPropertyAccessExpression(knoten)) return [knoten.name.text]
    const schluesseltyp = typ(knoten.argumentExpression)
    const werte: string[] = []
    for (const teil of schluesseltyp.isUnion() ? schluesseltyp.types : [schluesseltyp]) {
      if (teil.isStringLiteral()) werte.push(teil.value)
      else if (!(teil.flags & ts.TypeFlags.NumberLike)) return null
    }
    return werte
  }

  /** Ob ein Bezeichner oder ein Zugriff wie `globalThis.Math` eine globale Variable meint; dann ihr Name. */
  const globalerWert = (knoten: ts.Node): string | null => {
    if (ts.isIdentifier(knoten)) {
      if (!istFreierWert(knoten)) return null
      const symbol = symbolVon(knoten)
      if (symbol === undefined) return knoten.text
      if ((symbol.declarations ?? []).length === 0) return symbol.name === 'globalThis' ? 'globalThis' : null
      return ausBibliothek(symbol) && symbol.flags & ts.SymbolFlags.Value ? knoten.text : null
    }
    const teile = zugriff(knoten)
    if (!teile?.schluessel || !GLOBALE_WURZELN.has(globalerWert(ohneKlammern(teile.objekt)) ?? '')) return null
    return teile.schluessel
  }

  const verstoesse: Verstoss[] = []
  for (const datei of dateien) {
    const quelle = programm.getSourceFile(join(wurzel, datei))
    if (!quelle) throw new Error(`pruefeSichtZugriff: ${datei} liess sich nicht laden`)
    const melde = (knoten: ts.Node, was: string) => verstoesse.push({ regel: 'U5', datei, zeile: zeileVon(knoten), was })
    const geschrieben = new Set<ts.Node>()

    /** H1: geschrieben wird nur in Variablen und Objekte dieser Datei; die Schlüssel prüft `pruefeGlobales`. */
    const pruefeSchreiben = (ziel: ts.Expression) => {
      geschrieben.add(ziel)
      if (ts.isIdentifier(ziel)) {
        const umgehaengt = (pruefer.getSymbolAtLocation(ziel)?.flags ?? 0) & (ts.SymbolFlags.Function | ts.SymbolFlags.Alias)
        if (globalerWert(ziel) !== null || umgehaengt) melde(ziel, `überschreibt ${ziel.text}, eine globale Variable, einen Import oder eine Funktion`)
        return
      }
      let wurzelobjekt = ziel
      for (let teile = zugriff(wurzelobjekt); teile; teile = zugriff(wurzelobjekt)) wurzelobjekt = ohneHuellen(teile.objekt)
      if (wurzelobjekt.kind === ts.SyntaxKind.ThisKeyword) return
      const symbol = ts.isIdentifier(wurzelobjekt) ? pruefer.getSymbolAtLocation(wurzelobjekt) : undefined
      const ausDieserDatei = symbol !== undefined && !(symbol.flags & ts.SymbolFlags.Alias) &&
        (symbol.declarations ?? []).some((d) => d.getSourceFile() === quelle)
      if (!ausDieserDatei || globalerWert(wurzelobjekt) !== null) {
        melde(ziel, `verändert ${wurzelobjekt.getText()}, das nicht in dieser Datei entsteht: ${ziel.getText()}`)
      }
    }

    /** H1: `Object.assign` schreibt in sein erstes Argument; erlaubt ist nur ein neues Objekt `{ … }`. */
    const pruefeZielVonAssign = (funktion: ts.Expression) => {
      const aufruf = aeusserer(funktion).parent
      if (!ts.isCallExpression(aufruf) || aufruf.expression !== aeusserer(funktion)) return melde(funktion, `gibt ${funktion.getText()} als Wert weiter`)
      const ziel = aufruf.arguments[0]
      if (ziel === undefined || !ts.isObjectLiteralExpression(ohneKlammern(ziel))) melde(aufruf, `Object.assign schreibt in ein bestehendes Objekt: ${aufruf.getText()}`)
    }

    /** U4 nach Typ: Zufall und Zeit, auch über `valueOf()`, Casts oder Variablen erreicht. */
    const pruefeZufallUndZeit = (knoten: ts.Node) => {
      const name = ts.isIdentifier(knoten) ? knoten : ts.isPropertyAccessExpression(knoten) ? knoten.name : undefined
      if (name === undefined || (ts.isIdentifier(knoten) && !istFreierWert(knoten))) return
      const symbol = symbolVon(name)
      if (symbol === undefined || !ausBibliothek(symbol)) return
      const zeitGlobal = ZEIT_GLOBAL.has(symbol.name) && symbol.flags & ts.SymbolFlags.Variable
      const gehoertZu = (symbol.declarations ?? []).some((d) => {
        if (!ts.isInterfaceDeclaration(d.parent)) return false
        const mitglieder = ZUFALL_UND_ZEIT[d.parent.name.text]
        return mitglieder === 'alle' || (mitglieder?.has(symbol.name) ?? false)
      })
      if (zeitGlobal || gehoertZu) {
        verstoesse.push({ regel: 'U4', datei, zeile: zeileVon(knoten), was: `nutzt ${knoten.getText()}; Zufall kommt als Parameter, Zeit gehört nicht in die KI` })
      }
    }

    /** H1: kein Weg zu einem Prototyp; globale Objekte nur aufrufen oder an ihnen lesen, nie weitergeben. */
    const pruefeGlobales = (knoten: ts.Node) => {
      if (ts.isPropertyAccessExpression(knoten) || ts.isElementAccessExpression(knoten)) {
        const schluessel = schluesselVon(knoten)
        if (schluessel === null) melde(knoten, `greift mit einem Schlüssel zu, der jeder Text sein kann: ${knoten.getText()}`)
        else if (schluessel.some((wert) => PROTOTYP_SCHLUESSEL.has(wert))) melde(knoten, `greift auf ${knoten.getText()} zu`)
      }
      const name = globalerWert(knoten)
      if (name === null || geschrieben.has(knoten)) return
      if (VERBOTENE_GLOBALE.has(name)) return melde(knoten, `nutzt ${name}`)
      if (!(typ(knoten).flags & (ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive))) return
      const aussen = aeusserer(knoten)
      const eltern = aussen.parent
      if ((ts.isPropertyAccessExpression(eltern) || ts.isElementAccessExpression(eltern)) && eltern.expression === aussen) {
        const schluessel = schluesselVon(eltern) ?? []
        if (schluessel.some((wert) => GEERBT_VON_OBJECT.has(wert))) melde(eltern, `nutzt die geerbte Methode ${eltern.getText()}`)
        if (name === 'Object' && schluessel.some((wert) => VERBOTEN_AN_OBJECT.has(wert))) melde(eltern, `nutzt ${eltern.getText()}`)
        if (name === 'Object' && schluessel.includes('assign')) pruefeZielVonAssign(eltern)
        return
      }
      if ((ts.isCallExpression(eltern) || ts.isNewExpression(eltern)) && eltern.expression === aussen) return
      if (ts.isBinaryExpression(eltern) && eltern.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && eltern.right === aussen) return
      melde(knoten, `gibt das globale ${name} als Wert weiter`)
    }

    /** U5: den vollen Zustand nur weiterreichen, keine Casts, die ihn verstecken. */
    const pruefeZustand = (knoten: ts.Node) => {
      if ((ts.isObjectBindingPattern(knoten) || ts.isArrayBindingPattern(knoten)) && (ts.isParameter(knoten.parent) || ts.isBindingElement(knoten.parent))) {
        if (traegtZustand(typ(knoten.parent))) melde(knoten, `zerlegt ${VOLLER_ZUSTAND_TYP}: ${knoten.getText()}`)
        return
      }
      if (!istWertausdruck(knoten)) return
      const eigener = typ(knoten)
      if (ts.isIdentifier(knoten) && knoten.text === 'arguments') melde(knoten, 'liest arguments')
      if (eigener.flags & ts.TypeFlags.Any) melde(knoten, `Ausdruck vom Typ any: ${knoten.getText()}`)
      if (ts.isAsExpression(knoten) || ts.isTypeAssertionExpression(knoten)) {
        const verdeckt = eigener.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)
        if (verdeckt || traegtZustand(eigener) || traegtZustand(typ(knoten.expression))) melde(knoten, `Cast: ${knoten.getText()}`)
      }
      if (traegtZustand(eigener) && !wirdWeitergereicht(knoten)) melde(knoten, `verwendet ${VOLLER_ZUSTAND_TYP}, statt ihn weiterzureichen: ${knoten.getText()}`)
    }

    besucheAlle(quelle, (knoten) => {
      for (const ziel of geschriebeneZiele(knoten)) pruefeSchreiben(ziel)
      pruefeGlobales(knoten)
      pruefeZufallUndZeit(knoten)
      if (datei !== SICHT_DATEI) pruefeZustand(knoten)
    })
  }
  return verstoesse
}
