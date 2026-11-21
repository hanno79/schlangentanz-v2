// Die Importgrenze der Strategien (U5, P0.3d, Mangel 1 der Schlussprüfung 2): Ausserhalb von
// src/ki/strategien/ erreicht Code die Strategien nur über die Registry index.ts und über die
// Typen aus strategie.ts. Eine Fabrik, die nicht in der Registry steht, gleich in welcher Form
// sie exportiert ist, kommt so bei keinem Rahmen, keiner App und keinem Skript an; geprüft
// wird der Import-Graph, aufgelöst wie im Build, nicht der Wortlaut der Pfade.
//
// Ausgenommen sind genau Testdateien `*.test.ts(x)` und alles unter tests/: Tests prüfen eine
// Strategie gezielt, auch an der Registry vorbei. Das ist bewusst enger als `istTestdatei`
// (architektur_pruefung.ts): Helfer unter `__tests__/` und `.spec`-Dateien unter src/ gelten
// hier als Code. Erreicht Code, für den die Grenze gilt, eine Strategie über eine Testdatei,
// wird er trotzdem gemeldet.

import { existsSync, globSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, join, posix, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { CODE_ENDUNGEN, parse, zeileVon, zuPosix } from '../scripts/pruefung/quelldateien.mjs'
import { besucheAlle, geholteWerte, istDynamischerImport, optionenFuer, type Verstoss } from './architektur_pruefung'
import { REGISTRY_DATEI } from './architektur_ki_registry'

const ORDNER = posix.dirname(REGISTRY_DATEI)
const SCHNITTSTELLE = `${ORDNER}/strategie.ts`
const GRUND = `ausserhalb von ${ORDNER}/ nur index.ts und Typen aus strategie.ts`
/** Wo die Grenze gilt: alle Dateien unter diesen Ordnern, ohne Ausnahme für Unterordner, und im Wurzelordner. */
const BEREICHE = ['src', 'scripts']
/** Was Module lädt: Code, HTML mit Modulskripten und package.json mit `imports` und `exports`. */
const laedt = (pfad: string) => CODE_ENDUNGEN.has(extname(pfad)) || extname(pfad) === '.html' || posix.basename(pfad) === 'package.json'
/** Endungen, unter denen Vite und Node eine Datei ohne Endung finden; `.d.ts` steht nur für Typen. */
const ENDUNGEN = [...CODE_ENDUNGEN, '.json']

/** Genau Testdateien `*.test.ts(x)` und alles unter tests/. */
export const istAusgenommen = (pfad: string) => /\.test\.tsx?$/.test(pfad) || pfad.startsWith('tests/')
const imOrdner = (pfad: string) => pfad.toLowerCase().startsWith(`${ORDNER}/`)

/**
 * Was ein Ziel ist; erlaubt sind genau index.ts und strategie.ts, nicht dieselben Namen mit
 * anderer Endung. Bei einem Pfad ohne Endung (der Ordner, `…/index`, `…/strategie`) entscheidet
 * die Datei, die dahinter gefunden wird.
 */
function artDesZiels(pfad: string): 'registry' | 'schnittstelle' | 'strategie' | null {
  const klein = pfad.toLowerCase().replace(/\/+$/, '')
  if (klein === REGISTRY_DATEI.toLowerCase()) return 'registry'
  if (klein === SCHNITTSTELLE.toLowerCase()) return 'schnittstelle'
  if ([ORDNER, `${ORDNER}/index`, `${ORDNER}/strategie`].includes(klein)) return null
  return imOrdner(klein) ? 'strategie' : null
}

/** Alle Dateien unter `ordner`, relativ zur Wurzel; anders als `sammleDateien` ohne übersprungene Ordner. */
function alleDateien(wurzel: string, ordner: string): string[] {
  const start = join(wurzel, ordner)
  if (!existsSync(start)) return []
  return readdirSync(start, { recursive: true, withFileTypes: true })
    .filter((eintrag) => eintrag.isFile())
    .map((eintrag) => zuPosix(relative(wurzel, join(eintrag.parentPath, eintrag.name))))
}

/** Die Dateien, für die die Grenze gilt, relativ zur Wurzel. */
export function grenzDateien(wurzel: string): string[] {
  const imWurzelordner = readdirSync(wurzel, { withFileTypes: true }).filter((eintrag) => eintrag.isFile()).map((eintrag) => eintrag.name)
  return [...imWurzelordner, ...BEREICHE.flatMap((bereich) => alleDateien(wurzel, bereich))]
    .filter((pfad) => laedt(pfad) && !istAusgenommen(pfad) && !imOrdner(pfad))
    .sort()
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

type Verweis = {
  zeile: number
  /** Die Modulangabe; null, wenn ein Lader einen berechneten Namen oder berechnete Optionen bekommt. */
  angabe: string | null
  wie: string
  deklaration?: ts.ImportDeclaration | ts.ExportDeclaration
  nurTyp?: boolean
  /** Bei `import.meta.glob` und Mustern in package.json: alle Muster, Ausschlüsse mit `!`, und die Option `base`. */
  glob?: { muster: string[]; basis?: string }
}

const anImportMeta = (knoten: ts.Expression, name: (text: string) => boolean) =>
  ts.isPropertyAccessExpression(knoten) && ts.isMetaProperty(knoten.expression) && knoten.expression.keywordToken === ts.SyntaxKind.ImportKeyword && name(knoten.name.text)
/** `import(…)`, `require(…)` und `import.meta.resolve(…)`. */
const istLader = (aufruf: ts.CallExpression): boolean => anImportMeta(aufruf.expression, (name) => name === 'resolve') || istDynamischerImport(aufruf)
const text = (knoten: ts.Node | undefined) => (knoten && ts.isStringLiteralLike(knoten) ? knoten.text : null)

/** Muster und `base` eines `import.meta.glob`-Aufrufs; null, wenn eines davon berechnet wird. */
function globAngaben(aufruf: ts.CallExpression): Verweis['glob'] | null {
  const [erstes, optionen] = aufruf.arguments
  const roh = (erstes && ts.isArrayLiteralExpression(erstes) ? [...erstes.elements] : [erstes]).map(text)
  const muster = roh.filter((eintrag) => eintrag !== null)
  if (muster.length !== roh.length) return null
  if (optionen === undefined) return { muster }
  if (!ts.isObjectLiteralExpression(optionen)) return null
  // Der Schlüssel zählt mit seinem Wert, nicht mit seiner Schreibweise: `'b\u0061se'` ist `base`.
  const schluessel = (name: ts.PropertyName) => (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name) ? name.text : null)
  const eintraege = optionen.properties.map((eintrag) => (ts.isPropertyAssignment(eintrag) ? { name: schluessel(eintrag.name), wert: eintrag.initializer } : null))
  if (eintraege.some((eintrag) => eintrag === null || eintrag.name === null)) return null
  // Mehrere Schlüssel base: Vite nimmt den letzten; die Prüfung nimmt keinen und meldet den Aufruf.
  const basen = eintraege.filter((eintrag) => eintrag?.name === 'base')
  if (basen.length === 0) return { muster }
  const wert = basen.length === 1 ? text(basen[0]?.wert) : null
  return wert === null ? null : { muster, basis: wert }
}

/**
 * Jeder Weg, auf dem Code ein Modul nennt: import, export … from, `import x = require`,
 * `import('…')` als Typ und als Aufruf, require, import.meta.glob und import.meta.resolve,
 * `new URL(…, import.meta.url)`, dazu jeder andere Text, der wie ein Pfad oder eine
 * file://-URL beginnt. `versatz` verschiebt die Zeilen, etwa für Skripte in HTML.
 */
function codeVerweise(quelle: ts.SourceFile, versatz = 0): Verweis[] {
  const gefunden: Verweis[] = []
  const verbraucht = new Set<ts.Node>()
  const nimm = (knoten: ts.Node, angabe: ts.Node | undefined, wie: string, mehr: Partial<Verweis> = {}) => {
    if (angabe) verbraucht.add(angabe)
    gefunden.push({ zeile: zeileVon(knoten) + versatz, angabe: text(angabe), wie, ...mehr })
  }
  besucheAlle(quelle, (knoten) => {
    if ((ts.isImportDeclaration(knoten) || ts.isExportDeclaration(knoten)) && knoten.moduleSpecifier) {
      nimm(knoten, knoten.moduleSpecifier, ts.isImportDeclaration(knoten) ? 'importiert' : 'exportiert weiter', { deklaration: knoten })
    } else if (ts.isImportEqualsDeclaration(knoten) && ts.isExternalModuleReference(knoten.moduleReference)) {
      nimm(knoten, knoten.moduleReference.expression, 'importiert', { nurTyp: knoten.isTypeOnly })
    } else if (ts.isImportTypeNode(knoten) && ts.isLiteralTypeNode(knoten.argument)) {
      nimm(knoten, knoten.argument.literal, 'nennt den Typ', { nurTyp: true })
    } else if (ts.isCallExpression(knoten) && anImportMeta(knoten.expression, (name) => name.startsWith('glob'))) {
      besucheAlle(knoten, (kind) => verbraucht.add(kind))
      const glob = globAngaben(knoten)
      gefunden.push({ zeile: zeileVon(knoten) + versatz, angabe: glob ? glob.muster.join(', ') : null, wie: 'lädt mit import.meta.glob', glob: glob ?? undefined })
    } else if (ts.isCallExpression(knoten) && istLader(knoten)) {
      nimm(knoten, knoten.arguments[0], `lädt mit ${knoten.expression.getText()}()`)
    } else if (ts.isNewExpression(knoten) && ts.isIdentifier(knoten.expression) && knoten.expression.text === 'URL' && knoten.arguments?.[1]?.getText() === 'import.meta.url') {
      nimm(knoten, knoten.arguments[0], 'nennt mit new URL(…, import.meta.url)')
    } else if (ts.isStringLiteralLike(knoten) && !verbraucht.has(knoten) && /^(\.{1,2}(\/|$)|\/|file:)/i.test(knoten.text)) {
      nimm(knoten, knoten, 'nennt den Pfad')
    }
  })
  return gefunden
}

/** Benannte Zeichenreferenzen, die in einem Pfad vorkommen können; jede andere macht den Wert unprüfbar. */
const BENANNT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", sol: '/', bsol: '\\', period: '.', colon: ':', num: '#', quest: '?', percnt: '%' }

/** Ein Attributwert in HTML mit aufgelösten Zeichenreferenzen; null, wenn eine Referenz unbekannt ist. */
function htmlWert(roh: string): string | null {
  let unbekannt = false
  const wert = roh.replace(/&(?:#(x[0-9a-f]+|\d+);?|([a-z][a-z0-9]*);)/gi, (ganz, zahl: string | undefined, name: string | undefined) => {
    if (zahl !== undefined) return String.fromCodePoint(zahl[0].toLowerCase() === 'x' ? parseInt(zahl.slice(1), 16) : parseInt(zahl, 10))
    const bekannt = BENANNT[name ?? '']
    if (bekannt === undefined) unbekannt = true
    return bekannt ?? ganz
  })
  return unbekannt ? null : wert
}

/** HTML: `src` an `<script>`, `href` an `<link>` und der Inhalt jedes Skripts als Code. */
function htmlVerweise(html: string): Verweis[] {
  const gefunden: Verweis[] = []
  for (const tag of html.matchAll(/<(script|link)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)) {
    const zeile = html.slice(0, tag.index).split('\n').length
    const art = tag[1].toLowerCase()
    for (const attribut of tag[2].matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      if (attribut[1].toLowerCase() !== (art === 'script' ? 'src' : 'href')) continue
      gefunden.push({ zeile, angabe: htmlWert(attribut[2] ?? attribut[3] ?? attribut[4] ?? ''), wie: `lädt mit <${art}>` })
    }
    if (art !== 'script') continue
    const start = tag.index + tag[0].length
    const ende = html.slice(start).search(/<\/script\s*>/i)
    gefunden.push(...codeVerweise(parse('skript.ts', html.slice(start, ende < 0 ? undefined : start + ende)), zeile - 1))
  }
  return gefunden
}

/** Jeder Text unter `imports`, `exports`, `main`, `module` und `browser` einer package.json. */
function paketEinstiege(json: string): string[] {
  const paket: Record<string, unknown> = JSON.parse(json)
  const texte: string[] = []
  const sammle = (wert: unknown): void => {
    if (typeof wert === 'string') texte.push(wert)
    else if (wert && typeof wert === 'object') Object.values(wert).forEach(sammle)
  }
  for (const feld of ['imports', 'exports', 'main', 'module', 'browser']) sammle(paket[feld])
  return texte
}

/** package.json als geprüfte Datei: jeder Einstieg ein Verweis, Muster mit `*` als Glob. */
function paketVerweise(json: string): Verweis[] {
  return paketEinstiege(json).map((angabe) => ({ zeile: 1, angabe, wie: 'nennt in package.json', ...(angabe.includes('*') ? { glob: { muster: [angabe] } } : {}) }))
}

function verweiseVon(datei: string, inhalt: string): Verweis[] {
  if (posix.basename(datei) === 'package.json') return paketVerweise(inhalt)
  if (extname(datei) === '.html') return htmlVerweise(inhalt)
  return codeVerweise(parse(datei, inhalt))
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
  const strategieDateien = alleDateien(wurzel, ORDNER)
  const merke = <T>(berechne: (pfad: string) => T) => {
    const gemerkt = new Map<string, T>()
    return (pfad: string): T => {
      const bekannt = gemerkt.get(pfad)
      if (bekannt !== undefined) return bekannt
      const neu = berechne(pfad)
      gemerkt.set(pfad, neu)
      return neu
    }
  }
  const istDatei = merke((pfad) => existsSync(pfad) && statSync(pfad).isFile())
  /** Pfad relativ zur Wurzel; eine vorhandene Datei über ihren echten Pfad (Gross- und Kleinschreibung, Verknüpfungen). */
  const bezug = merke((absolut) =>
    zuPosix(existsSync(absolut) ? relative(echteWurzel, realpathSync.native(absolut)) : relative(wurzel, absolut)))
  /** Jede vorhandene Datei, die für `basis` stehen kann: mit Endung, als index oder als Einstieg eines Pakets in diesem Ordner. */
  const kandidaten = (basis: string): string[] => {
    const paket = join(basis, 'package.json')
    const einstiege = istDatei(paket) ? paketEinstiege(readFileSync(paket, 'utf8')).map((eintrag) => join(basis, eintrag)) : []
    return [basis, ...einstiege, ...[basis, ...einstiege].flatMap((pfad) => ENDUNGEN.flatMap((endung) => [pfad + endung, join(pfad, `index${endung}`)]))].filter(istDatei)
  }

  /**
   * Mögliche Ziele einer Angabe: so, wie sie dasteht, und so, wie ein Browser sie als URL liest
   * (ohne Tabulator und Zeilenumbruch, Prozentkodierung aufgelöst). Je Fassung so, wie TypeScript
   * sie auflöst, und als Pfad ohne Vite-Zusatz `?…` oder `#…`.
   */
  const ziele = (datei: string, angabe: string): string[] => {
    const alsUrl = angabe.replace(/[\t\n\r]/g, '').trim().replace(/%([0-9a-f]{2})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    return [...new Set([angabe, alsUrl].flatMap((fassung) => zieleEinerFassung(datei, fassung)))]
  }
  const zieleEinerFassung = (datei: string, angabe: string): string[] => {
    const absolut = join(wurzel, datei)
    const ohneZusatz = angabe.startsWith('#') ? angabe.replace(/\?.*$/, '') : angabe.replace(/[?#].*$/, '')
    // Vites Entwicklungsserver lädt unter /@fs/ jede Datei über ihren absoluten Pfad.
    const ohneFs = /^\/@fs\//.test(ohneZusatz) ? ohneZusatz.slice(4).replace(/^\/([a-z]:)/i, '$1') : ohneZusatz
    const kern = /^file:/i.test(ohneFs) ? fileURLToPath(ohneFs) : ohneFs
    const aufgeloest = ts.resolveModuleName(kern, absolut, optionen, ts.sys, aufloesung).resolvedModule?.resolvedFileName
    const basen = kern.startsWith('/') ? [join(wurzel, kern), kern] : isAbsolute(kern) ? [kern] : /^\.{1,2}(\/|$)/.test(kern) ? [join(dirname(absolut), kern)] : []
    const laufzeit = aufgeloest && /\.d\.[cm]?ts$/.test(aufgeloest) ? [aufgeloest.replace(/\.d\.[cm]?ts$/, ''), dirname(aufgeloest)] : []
    const gefunden = [...basen, ...laufzeit].flatMap(kandidaten)
    return [...new Set([...(aufgeloest ? [aufgeloest] : []), ...basen, ...gefunden].map(bezug))]
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
    !imOrdner(ziel) && !geprueft.has(ziel.toLowerCase()) && !ziel.startsWith('../') && !ziel.split('/').includes('node_modules') &&
    laedt(ziel) && istDatei(join(wurzel, ziel))

  /** Die Dateien, die ein Glob trifft: Positivmuster ohne Rücksicht auf Gross- und Kleinschreibung, Ausschlüsse genau. */
  const globTreffer = (datei: string, { muster, basis }: NonNullable<Verweis['glob']>): string[] => {
    const ordner = basis === undefined ? posix.dirname(datei) : basis.startsWith('/') ? basis.slice(1) : posix.join(posix.dirname(datei), basis)
    const absolut = (eintrag: string) => (eintrag.startsWith('/') ? posix.normalize(eintrag.slice(1)) : posix.join(ordner, eintrag))
    const positiv = muster.filter((eintrag) => !eintrag.startsWith('!')).map(absolut)
    const negativ = muster.filter((eintrag) => eintrag.startsWith('!')).map((eintrag) => absolut(eintrag.slice(1)))
    const trifft = (pfad: string) =>
      positiv.some((eintrag) => posix.matchesGlob(pfad.toLowerCase(), eintrag.toLowerCase())) && !negativ.some((eintrag) => posix.matchesGlob(pfad, eintrag))
    const imDateisystem = positiv.flatMap((eintrag) => globSync(eintrag, { cwd: wurzel, exclude: (name) => /(^|[\\/])(node_modules|\.git)$/.test(String(name)) }))
    return [...new Set([...strategieDateien, ...imDateisystem.map(zuPosix)])].filter(trifft)
  }

  /** Höchstens ein Verstoss je Verweis. */
  const pruefeVerweis = (datei: string, verweis: Verweis, besucht: Set<string>): string | null => {
    if (verweis.angabe === null) return `${verweis.wie} mit berechnetem Namen oder berechneten Optionen; die Importgrenze lässt sich dann nicht prüfen`
    for (const ziel of verweis.glob ? globTreffer(datei, verweis.glob) : ziele(datei, verweis.angabe)) {
      if (verletzt(verweis, ziel)) return `${verweis.wie} „${verweis.angabe}“ (${ziel}); ${GRUND}`
      if (!weiterverfolgen(ziel) || besucht.has(ziel)) continue
      besucht.add(ziel)
      for (const naechster of verweiseVon(ziel, readFileSync(join(wurzel, ziel), 'utf8'))) {
        const ueber = pruefeVerweis(ziel, naechster, besucht)
        if (ueber) return `${verweis.wie} „${verweis.angabe}“ und erreicht über ${ziel}: ${ueber}`
      }
    }
    return null
  }

  return grenze.flatMap((datei) =>
    verweiseVon(datei, readFileSync(join(wurzel, datei), 'utf8')).flatMap((verweis) => {
      const was = pruefeVerweis(datei, verweis, new Set())
      return was ? [{ regel: 'U5' as const, datei, zeile: verweis.zeile, was }] : []
    }),
  )
}
