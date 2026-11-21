// Die Grenze der KI für den Architekturtest, Regel U5 aus docs/UMSETZUNGSPLAN.md,
// Abschnitt 3.7 (P0.3d). KI-Code ausserhalb von src/ki/sicht.ts gilt als nicht
// vertrauenswürdig. Mit dem Typprüfer wird jeder Ausdruck gefunden, der den vollen
// Zustand ist oder enthält; er darf nur unverändert weitergereicht werden. Dazu darf
// kein KI-Code, auch sicht.ts nicht, globale Objekte verändern: Eine KI, die etwa
// `structuredClone` ersetzt, bekäme beim nächsten Zug der Engine den vollen Zustand.
// Strategien unter src/ki/strategien sehen nur die Sicht: Sie erwähnen den vollen
// Zustand nicht einmal als Typ und importieren nur aus einer Positivliste.

import { join } from 'node:path'
import ts from 'typescript'
import { zeileVon, zuPosix } from '../scripts/pruefung/quelldateien.mjs'
import {
  GLOBALE_WURZELN,
  VOLLER_ZUSTAND_TYP,
  ZEIT,
  aeusserer,
  besucheAlle,
  geholteWerte,
  geschriebeneZiele,
  festeFunktion,
  istDynamischerImport,
  istFreierWert,
  istWertausdruck,
  ohneHuellen,
  ohneKlammern,
  optionenFuer,
  zugriff,
  type Verstoss,
} from './architektur_pruefung'
import { ausBibliothek, zustandstypen } from './architektur_ki_typen'
import { aufModulebene, pruefeModulebene, thisIstKlasse } from './architektur_ki_modulebene'
import {
  ERLAUBTE_ENGINE_EMPFAENGER,
  GEERBT_VON_OBJECT,
  POSITIVLISTE_ENGINE_FUER_STRATEGIEN,
  POSITIVLISTE_GLOBALE,
  PROTOTYP_SCHLUESSEL,
  RUECKRUF_METHODEN,
  VERBOTEN_AN_OBJECT,
  ZUFALL_UND_ZEIT,
} from './architektur_ki_listen'

/** Die einzige Datei, die den vollen Zustand lesen darf. */
const SICHT_DATEI = 'src/ki/sicht.ts'
/** Strategien: sehen nur die Sicht; alles andere unter src/ki ist Rahmen. */
const STRATEGIEN = 'src/ki/strategien/'

/**
 * U5 für KI-Code: Ausser in src/ki/sicht.ts darf ein Wert, der den vollen Zustand ist
 * oder enthält, nur unverändert weitergereicht werden: an eine Funktion unter
 * `dateien` mit einem Parameter dieses Typs, an eine der ERLAUBTE_ENGINE_EMPFAENGER,
 * in eine Variable dieses Typs; einen Behälter wie das Ergebnis von `anwendeAktion`
 * darf man öffnen. Alles andere ist ein Verstoss.
 * In allen `dateien`, auch in sicht.ts: keine Casts ausser `as const`, keine
 * Ausdrücke vom Typ `any`, kein `arguments`, denn die Prüfung glaubt den Typen; keine
 * Änderung globaler Objekte (H1), nur globale Werte aus POSITIVLISTE_GLOBALE, Werte nur
 * aus src/engine/index.ts und aus `dateien` importiert, U4 nach Typ.
 * Unter src/ki/strategien zudem: kein Name, dessen Typ den vollen Zustand erwähnt, und
 * Importe nur aus sicht.ts, anderen Strategien und POSITIVLISTE_ENGINE_FUER_STRATEGIEN.
 */
export function pruefeSichtZugriff(wurzel: string, dateien: string[]): Verstoss[] {
  if (dateien.length === 0) return []

  const programm = ts.createProgram(dateien.map((datei) => join(wurzel, datei)), optionenFuer(wurzel))
  const pruefer = programm.getTypeChecker()
  const engineOrdner = `${zuPosix(join(wurzel, 'src', 'engine'))}/`
  const kiPfade = new Set(dateien.map((datei) => zuPosix(join(wurzel, datei))))
  const strategieErwaehnt = new Map<ts.Symbol, boolean>()
  const typ = (knoten: ts.Node) => pruefer.getTypeAtLocation(knoten)
  const symbolVon = (knoten: ts.Node): ts.Symbol | undefined => {
    const gefunden = pruefer.getSymbolAtLocation(knoten)
    return gefunden && gefunden.flags & ts.SymbolFlags.Alias ? pruefer.getAliasedSymbol(gefunden) : gefunden
  }

  const { istVollerZustand, traegtZustand, erwaehntZustand } = zustandstypen(pruefer, engineOrdner)
  const absolut = (pfad: string) => zuPosix(join(wurzel, pfad))
  const engineEinstieg = absolut('src/engine/index.ts')
  const sichtPfad = absolut(SICHT_DATEI)
  const strategienOrdner = absolut(STRATEGIEN)
  /** Ob eine Strategie aus `zielpfad` holen darf: Engine-Schnittstelle, sicht.ts, andere Strategien. */
  const strategieDarf = (zielpfad: string) =>
    zielpfad === engineEinstieg || zielpfad === sichtPfad || (kiPfade.has(zielpfad) && zielpfad.startsWith(strategienOrdner))
  /** Die Datei, auf die eine Modulangabe zeigt, wie der Typprüfer sie aufgelöst hat; leer, wenn nicht aufgelöst. */
  const zielpfadVon = (modulangabe: ts.Node) => {
    const ziel = pruefer.getSymbolAtLocation(modulangabe)?.declarations?.find(ts.isSourceFile)
    return ziel ? zuPosix(ziel.fileName) : ''
  }
  /** Ob ein Teil des Typs (bei Vereinigung und Schnitt jeder Teil) eines der `flags` trägt. */
  const hatTeilMit = (wert: ts.Type, flags: ts.TypeFlags) => (wert.isUnionOrIntersection() ? wert.types : [wert]).some((teil) => teil.flags & flags)

  /**
   * Ob ein Wert vom Typ `quelle` in einen Platz vom Typ `ziel` darf: der Zustand nur
   * in einen Platz, der selbst der Zustand ist; ein Behälter nur in einen gleichwertigen.
   * Sonst tarnte `{ stapel: …; reserve?: Spielzustand }` den Zustand als Behälter.
   */
  const nimmtAuf = (ziel: ts.Type, quelle: ts.Type): boolean => {
    if (istVollerZustand(quelle)) return istVollerZustand(ziel)
    return traegtZustand(ziel) && pruefer.isTypeAssignableTo(ziel, quelle) && pruefer.isTypeAssignableTo(quelle, ziel)
  }

  /**
   * Ob die aufgerufene Funktion den Zustand an Stelle `stelle` bekommen darf. Sie
   * wird mit ihrem Namen aufgerufen, nicht als Methode: Eine Methode lässt sich
   * umhängen, etwa auf JSON.stringify, und der Typprüfer sähe weiter die alte.
   */
  const erlaubterEmpfaenger = (aufruf: ts.CallExpression, stelle: number, quelle: ts.Type): boolean => {
    const aufgerufen = ohneKlammern(aufruf.expression)
    const fest = festeFunktion(ts.isIdentifier(aufgerufen) ? symbolVon(aufgerufen) : undefined)
    if (stelle < 0 || !fest || pruefer.getResolvedSignature(aufruf)?.declaration !== fest.funktion) return false
    const herkunft = zuPosix(fest.funktion.getSourceFile().fileName)
    if (herkunft.startsWith(engineOrdner)) return ERLAUBTE_ENGINE_EMPFAENGER.has(fest.name)
    // Ein `this`-Parameter steht nur im Typ, nicht unter den Argumenten.
    const parameter = fest.funktion.parameters.filter((p) => !(ts.isIdentifier(p.name) && p.name.text === 'this'))[stelle]
    return kiPfade.has(herkunft) && fest.funktion.body !== undefined && parameter !== undefined && !parameter.dotDotDotToken && nimmtAuf(typ(parameter), quelle)
  }

  /** Ob `ausdruck` vom Typ, der den Zustand trägt, an seiner Stelle nur weitergereicht wird. */
  const wirdWeitergereicht = (ausdruck: ts.Expression): boolean => {
    const aussen = aeusserer(ausdruck)
    const eltern = aussen.parent
    // `zustand = …` als Anweisung: Der Wert der Zuweisung selbst geht nirgends hin.
    const istZuweisung = ts.isBinaryExpression(ausdruck) && ausdruck.operatorToken.kind === ts.SyntaxKind.EqualsToken
    if (istZuweisung && ts.isExpressionStatement(eltern)) return true
    if (ts.isCallExpression(eltern) && eltern.expression !== aussen) {
      return erlaubterEmpfaenger(eltern, eltern.arguments.indexOf(aussen as ts.Expression), typ(ausdruck))
    }
    if (ts.isVariableDeclaration(eltern) && eltern.initializer === aussen) return ts.isIdentifier(eltern.name) && nimmtAuf(typ(eltern.name), typ(ausdruck))
    if (ts.isBinaryExpression(eltern) && eltern.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      if (eltern.left === aussen) return ts.isIdentifier(ausdruck)
      return ts.isIdentifier(ohneKlammern(eltern.left)) && nimmtAuf(typ(eltern.left), typ(ausdruck))
    }
    // Einen Behälter darf man öffnen; was herauskommt, wird für sich geprüft. Den Zustand selbst nicht.
    const teile = zugriff(eltern)
    return teile !== null && teile.objekt === aussen && !istVollerZustand(typ(ausdruck))
  }

  /** Die Texte, die ein Schlüsselausdruck annehmen kann; `null`, wenn jeder Text. Zahlen gelten als harmlos. */
  const schluesselwerte = (schluessel: ts.Expression): string[] | null => {
    const schluesseltyp = typ(schluessel)
    const werte: string[] = []
    for (const teil of schluesseltyp.isUnion() ? schluesseltyp.types : [schluesseltyp]) {
      if (teil.isStringLiteral()) werte.push(teil.value)
      else if (!(teil.flags & ts.TypeFlags.NumberLike)) return null
    }
    return werte
  }
  /** Die Schlüssel eines Zugriffs; `null`, wenn er jeder Text sein kann. */
  const schluesselVon = (knoten: ts.PropertyAccessExpression | ts.ElementAccessExpression): string[] | null =>
    ts.isPropertyAccessExpression(knoten) ? [knoten.name.text] : schluesselwerte(knoten.argumentExpression)

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
  /** Ein Mitglied eines globalen Objekts wie `JSON.stringify`; dann `JSON.stringify`. */
  const globalesMitglied = (knoten: ts.Node): string | null => {
    const teile = zugriff(knoten)
    const objekt = teile && globalerWert(ohneKlammern(teile.objekt))
    return objekt && teile.schluessel ? `${objekt}.${teile.schluessel}` : null
  }
  /** Ein Mitglied aus der Bibliothek an einem beliebigen Wert, etwa `[].map`: gemeinsam für alle, also wie ein Globales. */
  const bibliotheksMitglied = (knoten: ts.Node): string | null => {
    const name = ts.isPropertyAccessExpression(knoten) ? knoten.name : ts.isElementAccessExpression(knoten) ? knoten.argumentExpression : undefined
    return name !== undefined && ausBibliothek(symbolVon(name)) ? knoten.getText() : null
  }

  /** Schlüssel beim Zerlegen und in Objekten: `{ constructor: k } = …`, `{ __proto__: … }`. */
  const schluesselImMuster = (knoten: ts.Node): string[] | null | undefined => {
    const name = ts.isBindingElement(knoten) && ts.isObjectBindingPattern(knoten.parent)
      ? knoten.propertyName ?? knoten.name
      : ts.isPropertyAssignment(knoten) || ts.isShorthandPropertyAssignment(knoten) ? knoten.name : undefined
    if (name === undefined) return undefined
    if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return [name.text]
    return ts.isComputedPropertyName(name) ? schluesselwerte(name.expression) : []
  }

  const verstoesse: Verstoss[] = []
  for (const datei of dateien) {
    const quelle = programm.getSourceFile(join(wurzel, datei))
    if (!quelle) throw new Error(`pruefeSichtZugriff: ${datei} liess sich nicht laden`)
    const melde = (knoten: ts.Node, was: string) => verstoesse.push({ regel: 'U5', datei, zeile: zeileVon(knoten), was })
    const geschrieben = new Set<ts.Node>()
    const istStrategie = datei.startsWith(STRATEGIEN)

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
      if (wurzelobjekt.kind === ts.SyntaxKind.ThisKeyword) {
        if (istStrategie && thisIstKlasse(wurzelobjekt)) melde(ziel, `verändert die Klasse über this: ${ziel.getText()}; alle Instanzen der Strategie teilen sie`)
        return
      }
      const symbol = ts.isIdentifier(wurzelobjekt) ? pruefer.getSymbolAtLocation(wurzelobjekt) : undefined
      const ausDieserDatei = symbol !== undefined && !(symbol.flags & ts.SymbolFlags.Alias) &&
        (symbol.declarations ?? []).some((d) => d.getSourceFile() === quelle)
      if (!ausDieserDatei || globalerWert(wurzelobjekt) !== null) {
        melde(ziel, `verändert ${wurzelobjekt.getText()}, das nicht in dieser Datei entsteht: ${ziel.getText()}`)
      } else if (istStrategie && aufModulebene(symbol)) {
        melde(ziel, `verändert ${wurzelobjekt.getText()} auf Modulebene; alle Instanzen der Strategie teilen es: ${ziel.getText()}`)
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
      const zeitGlobal = ZEIT.has(symbol.name) && symbol.flags & ts.SymbolFlags.Variable
      const gehoertZu = (symbol.declarations ?? []).some((d) => {
        if (!ts.isInterfaceDeclaration(d.parent)) return false
        const mitglieder = ZUFALL_UND_ZEIT[d.parent.name.text]
        return mitglieder === 'alle' || (mitglieder?.has(symbol.name) ?? false)
      })
      if (zeitGlobal || gehoertZu) {
        verstoesse.push({ regel: 'U4', datei, zeile: zeileVon(knoten), was: `nutzt ${knoten.getText()}; Zufall kommt als Parameter, Zeit gehört nicht in die KI` })
      }
    }

    /**
     * Importe (Prüfung P0.3d, Mangel 3): Werte nur aus src/engine/index.ts und aus `dateien`,
     * Typen im Rahmen frei; Strategien nur aus sicht.ts, Strategien und der Positivliste.
     */
    const pruefeImport = (knoten: ts.Node) => {
      if (istDynamischerImport(knoten)) return melde(knoten, 'importiert mit import() oder require(); unter src/ki nur statisch')
      if (ts.isMetaProperty(knoten) && knoten.keywordToken === ts.SyntaxKind.ImportKeyword) {
        return melde(knoten, `nutzt ${knoten.getText()}; import.meta.glob lädt jedes Modul an der Importregel vorbei`)
      }
      if (ts.isImportTypeNode(knoten) && istStrategie) {
        const argument = knoten.argument
        const zielpfad = ts.isLiteralTypeNode(argument) ? zielpfadVon(argument.literal) : ''
        if (!strategieDarf(zielpfad)) melde(knoten, `Strategie holt einen Typ aus ${argument.getText()}; erlaubt sind sicht.ts, Strategien und die Engine`)
        return
      }
      if (!(ts.isImportDeclaration(knoten) || ts.isExportDeclaration(knoten)) || !knoten.moduleSpecifier) return
      const zielpfad = zielpfadVon(knoten.moduleSpecifier)
      const namen = geholteWerte(knoten)
      const ausEngine = zielpfad === engineEinstieg
      if (istStrategie) {
        if (!strategieDarf(zielpfad)) return melde(knoten, `Strategie importiert aus ${knoten.moduleSpecifier.getText()}; erlaubt sind sicht.ts, Strategien und die Engine`)
        const fremd = ausEngine ? namen.filter((name) => !POSITIVLISTE_ENGINE_FUER_STRATEGIEN.has(name)) : []
        if (fremd.length > 0) melde(knoten, `Strategie importiert ${fremd.join(', ')} aus der Engine; nicht auf POSITIVLISTE_ENGINE_FUER_STRATEGIEN`)
        return
      }
      if (namen.length > 0 && !ausEngine && !kiPfade.has(zielpfad)) {
        melde(knoten, `importiert Werte aus ${knoten.moduleSpecifier.getText()}; erlaubt sind src/engine/index.ts und geprüfte Dateien unter src/ki`)
      }
    }

    /**
     * Ein Objekt der Modulebene, auch eine Funktion oder Klasse, teilen alle Instanzen einer
     * Strategie. Eine Strategie ruft es auf, erzeugt daraus mit `new`, liest an ihm oder gibt
     * es einer Funktion der Bibliothek (etwa `[…].map(f)`); als Wert weitergegeben liesse es
     * sich über einen Alias beschreiben.
     */
    const pruefeGeteiltenWert = (knoten: ts.Identifier, symbol: ts.Symbol) => {
      if (!istFreierWert(knoten) || ausBibliothek(symbol) || !aufModulebene(symbol)) return
      const wert = typ(knoten)
      if (!hatTeilMit(wert, ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive)) return
      const aussen = aeusserer(knoten)
      const eltern = aussen.parent
      if ((ts.isCallExpression(eltern) || ts.isNewExpression(eltern)) && eltern.expression === aussen) return
      if ((ts.isPropertyAccessExpression(eltern) || ts.isElementAccessExpression(eltern)) && eltern.expression === aussen) return
      const istListe = pruefer.isArrayType(wert) || pruefer.isTupleType(wert)
      // Eine Liste darf kopiert werden: `[...LISTE]`, `Array.from(LISTE)`, `new Set(LISTE)`.
      if (istListe && ts.isSpreadElement(eltern)) return
      // Nur an erster Stelle einer Funktion der Bibliothek: eine Liste zum Kopieren, eine Funktion als Rückruf.
      const erstesArgument = (ts.isCallExpression(eltern) || ts.isNewExpression(eltern)) && eltern.arguments?.[0] === aussen
      const ausBibliothekAufgerufen = erstesArgument && zuPosix(pruefer.getResolvedSignature(eltern)?.declaration?.getSourceFile().fileName ?? '').includes('/node_modules/')
      if (ausBibliothekAufgerufen) {
        const aufgerufen = ohneHuellen(eltern.expression)
        const methode = ts.isPropertyAccessExpression(aufgerufen) ? aufgerufen.name.text : ''
        const kopiert = ts.isNewExpression(eltern) ? globalerWert(aufgerufen) === 'Set' : globalesMitglied(aufgerufen) === 'Array.from'
        const ohneThisArg = (eltern.arguments?.length ?? 0) <= (methode.startsWith('reduce') ? 2 : 1)
        const rueckruf = ts.isCallExpression(eltern) && RUECKRUF_METHODEN.has(methode) && ohneThisArg
        if (istListe ? kopiert : rueckruf) return
      }
      melde(knoten, `gibt ${knoten.text} von der Modulebene weiter; alle Instanzen der Strategie teilen es`)
    }

    /** Eine exportierte Funktion, die eine KI liefert, heisst `erstelle…`; sonst fände sie der Isolationstest nicht. */
    const pruefeFabrikname = (knoten: ts.Node) => {
      const exportiert = ts.isFunctionDeclaration(knoten) || ts.isVariableDeclaration(knoten)
      if (!exportiert || !knoten.name || !ts.isIdentifier(knoten.name) || !aufModulebene(pruefer.getSymbolAtLocation(knoten.name))) return
      const signaturen = pruefer.getSignaturesOfType(typ(knoten.name), ts.SignatureKind.Call)
      const liefertKi = signaturen.some((signatur) => signatur.getReturnType().getProperty('waehle') !== undefined)
      if (liefertKi && !knoten.name.text.startsWith('erstelle')) melde(knoten.name, `${knoten.name.text} liefert eine KI; Fabriken einer Strategie heissen erstelle…, damit der Isolationstest sie findet`)
    }

    /** Strategien erwähnen den vollen Zustand nicht, auch nicht über einen Typ, der ihn enthält oder nimmt. */
    const pruefeStrategie = (knoten: ts.Node) => {
      if (ts.isMetaProperty(knoten) && knoten.keywordToken === ts.SyntaxKind.NewKeyword) return melde(knoten, 'new.target gibt die Klasse der Modulebene als Wert heraus')
      if (ts.isParameter(knoten) && ts.isIdentifier(knoten.name) && knoten.name.text === 'this') return melde(knoten, 'this-Parameter: damit liesse sich eine Funktion mit geteiltem this aufrufen')
      if (!ts.isIdentifier(knoten)) return
      const symbol = symbolVon(knoten)
      if (symbol === undefined) return
      // Je Symbol einmal: Einengen an einer Stelle macht den Typ nur kleiner.
      let erwaehnt = strategieErwaehnt.get(symbol)
      if (erwaehnt === undefined) {
        const typen = [
          ...(symbol.flags & (ts.SymbolFlags.Type | ts.SymbolFlags.TypeParameter) ? [pruefer.getDeclaredTypeOfSymbol(symbol)] : []),
          ...(symbol.flags & ts.SymbolFlags.Value ? [pruefer.getTypeOfSymbol(symbol)] : []),
        ]
        erwaehnt = typen.some(erwaehntZustand)
        strategieErwaehnt.set(symbol, erwaehnt)
      }
      if (erwaehnt) melde(knoten, `Strategie erwähnt ${VOLLER_ZUSTAND_TYP}: ${knoten.text}`)
      pruefeGeteiltenWert(knoten, symbol)
    }

    /** H1: kein Weg zu einem Prototyp; globale Objekte nur aufrufen oder an ihnen lesen, nie weitergeben. */
    const pruefeGlobales = (knoten: ts.Node) => {
      const schluessel = ts.isPropertyAccessExpression(knoten) || ts.isElementAccessExpression(knoten) ? schluesselVon(knoten) : schluesselImMuster(knoten)
      if (schluessel === null) melde(knoten, `greift mit einem Schlüssel zu, der jeder Text sein kann: ${knoten.getText()}`)
      else if (schluessel?.some((wert) => PROTOTYP_SCHLUESSEL.has(wert))) melde(knoten, `greift auf ${knoten.getText()} zu`)
      const name = globalerWert(knoten) ?? globalesMitglied(knoten) ?? bibliotheksMitglied(knoten)
      if (name === null || geschrieben.has(knoten)) return
      if (ts.isIdentifier(knoten) && !POSITIVLISTE_GLOBALE.has(name)) return melde(knoten, `nutzt das globale ${name}; unter src/ki gilt POSITIVLISTE_GLOBALE`)
      if (!hatTeilMit(typ(knoten), ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive)) return
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

    /** Die Prüfung glaubt den Typen: keine Casts ausser `as const`, keine Typprädikate, kein `declare`, kein `any`, kein `arguments`. */
    const pruefeTypen = (knoten: ts.Node) => {
      // Ein Typprädikat und eine Ambient-Deklaration lügen dem Typprüfer wie ein Cast.
      if (ts.isTypePredicateNode(knoten)) return melde(knoten, `Typprädikat: ${knoten.getText()}; es verdeckt den Typ wie ein Cast`)
      if (ts.isModuleDeclaration(knoten)) return melde(knoten, `deklariert ${knoten.name.getText()}; unter src/ki keine Namensräume und kein declare global`)
      const modifikatoren = ts.canHaveModifiers(knoten) ? ts.getModifiers(knoten) : undefined
      if (modifikatoren?.some((m) => m.kind === ts.SyntaxKind.DeclareKeyword)) return melde(knoten, 'declare: eine Ambient-Deklaration tarnt einen fremden Wert als eigenen')
      if (!istWertausdruck(knoten)) return
      if (ts.isIdentifier(knoten) && knoten.text === 'arguments') melde(knoten, 'liest arguments')
      if (typ(knoten).flags & ts.TypeFlags.Any) melde(knoten, `Ausdruck vom Typ any: ${knoten.getText()}`)
      const istCast = ts.isTypeAssertionExpression(knoten) || (ts.isAsExpression(knoten) && !ts.isConstTypeReference(knoten.type))
      if (istCast) melde(knoten, `Cast: ${knoten.getText()}; ein Cast verdeckt den Typ, an dem die Prüfung hängt`)
    }

    /** U5: den vollen Zustand nur weiterreichen. */
    const pruefeZustand = (knoten: ts.Node) => {
      if ((ts.isObjectBindingPattern(knoten) || ts.isArrayBindingPattern(knoten)) && (ts.isParameter(knoten.parent) || ts.isBindingElement(knoten.parent))) {
        if (traegtZustand(typ(knoten.parent))) melde(knoten, `zerlegt ${VOLLER_ZUSTAND_TYP}: ${knoten.getText()}`)
        return
      }
      if (istWertausdruck(knoten) && traegtZustand(typ(knoten)) && !wirdWeitergereicht(knoten)) {
        melde(knoten, `verwendet ${VOLLER_ZUSTAND_TYP}, statt ihn weiterzureichen: ${knoten.getText()}`)
      }
    }

    if (istStrategie) {
      const istPrimitiv = (knoten: ts.Node) =>
        !hatTeilMit(typ(knoten), ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive | ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      pruefeModulebene(quelle, istPrimitiv, melde)
    }
    besucheAlle(quelle, (knoten) => {
      for (const ziel of geschriebeneZiele(knoten)) pruefeSchreiben(ziel)
      pruefeGlobales(knoten)
      pruefeZufallUndZeit(knoten)
      pruefeTypen(knoten)
      pruefeImport(knoten)
      if (istStrategie) {
        pruefeStrategie(knoten)
        pruefeFabrikname(knoten)
      }
      if (datei !== SICHT_DATEI) pruefeZustand(knoten)
    })
  }
  return verstoesse
}
