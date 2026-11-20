// Typfragen der KI-Grenze (tests/architektur_ki_pruefung.ts, P0.3d): Ist ein Typ der
// volle Spielzustand, enthält er ihn, oder erwähnt er ihn auch nur in einer Signatur?

import ts from 'typescript'
import { zuPosix } from '../scripts/pruefung/quelldateien.mjs'
import { VOLLER_ZUSTAND_TYP } from './architektur_pruefung'

/** Ob ein Symbol nur in Bibliotheksdateien (lib.*.d.ts, @types) deklariert ist. */
export function ausBibliothek(symbol: ts.Symbol | undefined): boolean {
  const deklarationen = symbol?.declarations ?? []
  return deklarationen.length > 0 && deklarationen.every((d) => zuPosix(d.getSourceFile().fileName).includes('/node_modules/'))
}

export function zustandstypen(pruefer: ts.TypeChecker, engineOrdner: string) {
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

  /**
   * Sucht den vollen Zustand in Eigenschaften, Elementen, Indexsignaturen und, mit
   * `mitSignaturen`, in Parametern und Rückgaben von Funktionstypen.
   */
  const durchsuche = (mitSignaturen: boolean) => {
    const gemerkt = new Map<ts.Type, boolean>()
    return (geprueft: ts.Type): boolean => {
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
        const signaturen = mitSignaturen
          ? [...pruefer.getSignaturesOfType(teil, ts.SignatureKind.Call), ...pruefer.getSignaturesOfType(teil, ts.SignatureKind.Construct)]
          : []
        return (
          pruefer.getPropertiesOfType(teil).some((eigenschaft) => suche(pruefer.getTypeOfSymbol(eigenschaft))) ||
          pruefer.getIndexInfosOfType(teil).some((index) => suche(index.type)) ||
          signaturen.some((signatur) => suche(signatur.getReturnType()) || signatur.parameters.some((p) => suche(pruefer.getTypeOfSymbol(p))))
        )
      }
      const ergebnis = suche(geprueft)
      gemerkt.set(geprueft, ergebnis)
      return ergebnis
    }
  }

  return {
    istVollerZustand,
    /** Ob ein Wert dieses Typs den vollen Zustand ist oder in einer Eigenschaft, einem Element enthält. */
    traegtZustand: durchsuche(false),
    /** Wie `traegtZustand`, zählt aber auch Funktionstypen, die ihn nehmen oder liefern (Strategien). */
    erwaehntZustand: durchsuche(true),
  }
}
