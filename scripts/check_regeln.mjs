// Prüft die Umsetzungsregeln U1, U6 und U7 aus docs/UMSETZUNGSPLAN.md, Abschnitt 3.7.
//
// U1  Jeder Regeltest nennt seinen Spec-Abschnitt (A…, B…, D…) im Namen. Regeltests
//     sind die Testdateien unter src/engine/. Es genügt, wenn ein umgebendes
//     describe den Abschnitt nennt, denn der volle Testname enthält es.
// U6  Kein `any`, keine Direktive @ts-ignore oder @ts-nocheck, kein eslint-disable
//     ohne Begründung (`-- Grund`) in derselben Zeile, kein skip, only, todo oder
//     fixme an it, test, describe oder suite.
// U7  Testdateien höchstens 499 Zeilen; Dateien unter src/ui und src/ki, die keine
//     Tests sind, höchstens 300 Zeilen.
//
// Gelesen wird mit dem TypeScript-Parser, nicht mit Regex über den Text: Ein
// `it.skip` oder `any` in einer Zeichenkette ist kein Verstoss, ein Kommentar, der
// mit der Direktive beginnt, ist einer.
//
// Altbestand: scripts/check_regeln_ausnahmen.json nennt je Regel und Datei, wie
// viele Verstösse dort noch erlaubt sind. Die Liste darf nur schrumpfen. Mehr
// Verstösse als erlaubt sind ein Fehler, weniger auch: Dann ist die Ausnahme
// veraltet und wird mit `--ausnahmen-schrumpfen` nachgezogen. Dieser Schalter senkt
// Zahlen und löscht Einträge, er fügt nie etwas hinzu.
//
// Aufruf: npm run check:regeln [-- --ausnahmen-schrumpfen] [-- --wurzel <ordner>]
// Exit 0: keine Verstösse. Exit 1: Verstösse oder veraltete Ausnahmen. Exit 2: Aufruf falsch.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import ts from 'typescript'

const SUCHORDNER = ['src', 'tests', 'scripts']
const UEBERSPRUNGEN = new Set(['node_modules', 'dist', 'dist-testhooks', '__snapshots__'])
const CODE_ENDUNGEN = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'])
const U7_ENDUNGEN = new Set([...CODE_ENDUNGEN, '.css'])
const TESTDATEI = /\.(test|spec)\.[cm]?[jt]sx?$/
const AUSNAHMEN_DATEI = 'scripts/check_regeln_ausnahmen.json'
const REGELN = ['U1', 'U6', 'U7']

const MAX_ZEILEN_TEST = 499
const MAX_ZEILEN_UI_KI = 300

const SPEC_ABSCHNITT = /(?<![A-Za-z0-9])[ABD]\d+(?:\.\d+)?(?![0-9])/
const TESTFUNKTIONEN = new Set(['it', 'test', 'describe', 'suite'])
const VERBOTENE_MODIFIKATOREN = new Set(['skip', 'skipIf', 'runIf', 'only', 'todo', 'fixme'])
const NAMENSLOSE_AUFRUFE = new Set(['each', 'for', 'skipIf', 'runIf'])
const ERLAUBTE_KETTENGLIEDER = new Set(['concurrent', 'sequential', 'fails', 'describe', 'serial', 'parallel', 'skip', 'only', 'todo', 'fixme'])

function leseArgumente(argumente) {
  const optionen = { wurzel: process.cwd(), schrumpfen: false }
  for (let i = 0; i < argumente.length; i += 1) {
    const argument = argumente[i]
    if (argument === '--ausnahmen-schrumpfen') optionen.schrumpfen = true
    else if (argument === '--wurzel' && argumente[i + 1]) optionen.wurzel = argumente[(i += 1)]
    else {
      console.error(`check:regeln: unbekanntes Argument „${argument}“.\nAufruf: node scripts/check_regeln.mjs [--wurzel <ordner>] [--ausnahmen-schrumpfen]`)
      process.exit(2)
    }
  }
  return optionen
}

function posix(pfad) {
  return pfad.split(sep).join('/')
}

function sammle(wurzel, ordner, treffer) {
  const absolut = join(wurzel, ordner)
  if (!existsSync(absolut)) return
  for (const eintrag of readdirSync(absolut, { withFileTypes: true })) {
    if (UEBERSPRUNGEN.has(eintrag.name)) continue
    const pfad = join(ordner, eintrag.name)
    if (eintrag.isDirectory()) sammle(wurzel, pfad, treffer)
    else if (eintrag.isFile()) treffer.push(posix(pfad))
  }
}

function sammleDateien(wurzel) {
  const dateien = []
  for (const ordner of SUCHORDNER) sammle(wurzel, ordner, dateien)
  for (const eintrag of readdirSync(wurzel, { withFileTypes: true })) {
    if (eintrag.isFile()) dateien.push(eintrag.name)
  }
  return dateien.sort()
}

function zaehleZeilen(text) {
  if (text.length === 0) return 0
  return text.replace(/\n$/, '').split('\n').length
}

function skriptArt(pfad) {
  if (pfad.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (pfad.endsWith('.jsx')) return ts.ScriptKind.JSX
  if (/\.[cm]?js$/.test(pfad)) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

/** Alle Kommentare der Datei, auch die zwischen Token, je genau einmal. */
function kommentare(quelle) {
  const text = quelle.getFullText()
  const gefunden = new Map()
  const merke = (bereiche) => {
    for (const bereich of bereiche ?? []) gefunden.set(bereich.pos, text.slice(bereich.pos, bereich.end))
  }
  const besuche = (knoten) => {
    merke(ts.getLeadingCommentRanges(text, knoten.pos))
    merke(ts.getTrailingCommentRanges(text, knoten.end))
    for (const kind of knoten.getChildren(quelle)) besuche(kind)
  }
  besuche(quelle)
  return [...gefunden.entries()].map(([pos, inhalt]) => ({ pos, inhalt }))
}

function zeileVon(quelle, pos) {
  return quelle.getLineAndCharacterOfPosition(pos).line + 1
}

function pruefeKommentare(quelle, melde) {
  for (const { pos, inhalt } of kommentare(quelle)) {
    const ersteZeile = inhalt.split('\n')[0]
    const kern = ersteZeile.replace(/^\/[/*]\s*\**\s*/, '').replace(/\*\/\s*$/, '')
    if (/^@ts-(ignore|nocheck)\b/.test(kern)) {
      melde('U6', pos, `${kern.match(/^@ts-\w+/)[0]} ist verboten`)
    }
    if (/^eslint-disable(-next-line|-line)?\b/.test(kern) && !/\s--\s*\S/.test(kern)) {
      melde('U6', pos, 'eslint-disable ohne Begründung in derselben Zeile (Schreibweise: „-- Grund“)')
    }
  }
}

/** Glieder einer Aufrufkette wie `it.each(tabelle)` oder `test.describe.skip` von links nach rechts. */
function kettenglieder(ausdruck) {
  if (ts.isIdentifier(ausdruck)) return [ausdruck.text]
  if (ts.isPropertyAccessExpression(ausdruck)) {
    const links = kettenglieder(ausdruck.expression)
    return links && [...links, ausdruck.name.text]
  }
  if (ts.isCallExpression(ausdruck) && ts.isPropertyAccessExpression(ausdruck.expression)) {
    if (NAMENSLOSE_AUFRUFE.has(ausdruck.expression.name.text)) return kettenglieder(ausdruck.expression)
  }
  return null
}

/** Liefert 'describe' oder 'test', wenn der Aufruf einen Test oder eine Gruppe mit Namen anlegt. */
function testaufrufArt(aufruf) {
  const aufgerufen = aufruf.expression
  if (ts.isPropertyAccessExpression(aufgerufen) && NAMENSLOSE_AUFRUFE.has(aufgerufen.name.text)) return null
  const glieder = kettenglieder(aufgerufen)
  if (!glieder || !TESTFUNKTIONEN.has(glieder[0])) return null
  const rest = glieder.slice(1).filter((glied) => !NAMENSLOSE_AUFRUFE.has(glied))
  if (!rest.every((glied) => ERLAUBTE_KETTENGLIEDER.has(glied))) return null
  return glieder.includes('describe') || glieder[0] === 'suite' ? 'describe' : 'test'
}

function statischerName(argument) {
  if (!argument) return null
  if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) return argument.text
  if (ts.isTemplateExpression(argument)) return argument.getText()
  return null
}

function pruefeAst(quelle, istRegeltest, melde, zaehleTestname) {
  const besuche = (knoten, gruppen) => {
    if (knoten.kind === ts.SyntaxKind.AnyKeyword) melde('U6', knoten.getStart(quelle), '`any` ist verboten')

    if (ts.isPropertyAccessExpression(knoten) && VERBOTENE_MODIFIKATOREN.has(knoten.name.text)) {
      const glieder = kettenglieder(knoten.expression)
      if (glieder && TESTFUNKTIONEN.has(glieder[0])) {
        melde('U6', knoten.getStart(quelle), `${knoten.getText(quelle)} ist verboten`)
      }
    }

    if (ts.isCallExpression(knoten)) {
      const art = testaufrufArt(knoten)
      if (art) {
        const name = statischerName(knoten.arguments[0])
        if (art === 'describe') {
          for (const argument of knoten.arguments.slice(1)) besuche(argument, [...gruppen, name ?? ''])
          besuche(knoten.expression, gruppen)
          return
        }
        if (istRegeltest) {
          zaehleTestname()
          const kette = [...gruppen, name ?? '']
          if (name === null) {
            melde('U1', knoten.getStart(quelle), 'Testname steht nicht als Text im Quelltext; der Spec-Abschnitt lässt sich nicht prüfen')
          } else if (!kette.some((teil) => SPEC_ABSCHNITT.test(teil))) {
            melde('U1', knoten.getStart(quelle), `„${kette.filter(Boolean).join(' › ')}“ nennt keinen Spec-Abschnitt (z. B. „A5: …“)`)
          }
        }
      }
    }

    ts.forEachChild(knoten, (kind) => besuche(kind, gruppen))
  }
  besuche(quelle, [])
}

function pruefeDatei(wurzel, pfad, statistik) {
  const befunde = []
  const endung = extname(pfad)
  const istTest = TESTDATEI.test(pfad)
  const text = CODE_ENDUNGEN.has(endung) || U7_ENDUNGEN.has(endung) ? readFileSync(join(wurzel, pfad), 'utf8') : null
  if (text === null) return befunde

  const zeilen = zaehleZeilen(text)
  if (istTest) {
    statistik.testdateien += 1
    if (zeilen > MAX_ZEILEN_TEST) befunde.push({ regel: 'U7', pfad, zeile: 0, was: `${pfad}: ${zeilen} Zeilen, erlaubt sind ${MAX_ZEILEN_TEST}` })
  }
  if (/^src\/(ui|ki)\//.test(pfad) && !istTest && U7_ENDUNGEN.has(endung)) {
    statistik.uiKi += 1
    if (zeilen > MAX_ZEILEN_UI_KI) befunde.push({ regel: 'U7', pfad, zeile: 0, was: `${pfad}: ${zeilen} Zeilen, erlaubt sind ${MAX_ZEILEN_UI_KI}` })
  }

  if (!CODE_ENDUNGEN.has(endung)) return befunde
  statistik.code += 1
  const istRegeltest = istTest && pfad.startsWith('src/engine/')
  if (istRegeltest) statistik.regeltests += 1

  const quelle = ts.createSourceFile(pfad, text, ts.ScriptTarget.Latest, true, skriptArt(pfad))
  const melde = (regel, pos, was) => befunde.push({ regel, pfad, zeile: zeileVon(quelle, pos), was })
  pruefeKommentare(quelle, melde)
  pruefeAst(quelle, istRegeltest, melde, () => (statistik.testnamen += 1))
  return befunde
}

function leseAusnahmen(wurzel) {
  const pfad = join(wurzel, AUSNAHMEN_DATEI)
  if (!existsSync(pfad)) return { daten: { U1: {}, U6: {}, U7: {} }, vorhanden: false }
  const daten = JSON.parse(readFileSync(pfad, 'utf8'))
  for (const regel of REGELN) daten[regel] ??= {}
  return { daten, vorhanden: true }
}

function vergleiche(befunde, ausnahmen) {
  const ist = Object.fromEntries(REGELN.map((regel) => [regel, {}]))
  for (const { regel, pfad } of befunde) ist[regel][pfad] = (ist[regel][pfad] ?? 0) + 1

  const verstoesse = []
  const veraltet = []
  for (const regel of REGELN) {
    for (const [pfad, anzahl] of Object.entries(ist[regel])) {
      const erlaubt = ausnahmen[regel][pfad] ?? 0
      if (anzahl > erlaubt) {
        const eigene = befunde.filter((befund) => befund.regel === regel && befund.pfad === pfad)
        verstoesse.push({ regel, pfad, anzahl, erlaubt, eigene })
      }
    }
    for (const [pfad, erlaubt] of Object.entries(ausnahmen[regel])) {
      const anzahl = ist[regel][pfad] ?? 0
      if (anzahl < erlaubt) veraltet.push({ regel, pfad, anzahl, erlaubt })
    }
  }
  return { ist, verstoesse, veraltet }
}

function schrumpfe(wurzel, daten, ist) {
  for (const regel of REGELN) {
    const neu = {}
    for (const [pfad, erlaubt] of Object.entries(daten[regel])) {
      const behalten = Math.min(erlaubt, ist[regel][pfad] ?? 0)
      if (behalten > 0) neu[pfad] = behalten
    }
    daten[regel] = neu
  }
  writeFileSync(join(wurzel, AUSNAHMEN_DATEI), `${JSON.stringify(daten, null, 2)}\n`)
}

function summeAusnahmen(daten, regel) {
  const eintraege = Object.values(daten[regel])
  return `${regel} ${eintraege.length} Dateien/${eintraege.reduce((summe, zahl) => summe + zahl, 0)}`
}

const optionen = leseArgumente(process.argv.slice(2))
const statistik = { code: 0, testdateien: 0, regeltests: 0, testnamen: 0, uiKi: 0 }
const dateien = sammleDateien(optionen.wurzel)
const befunde = dateien.flatMap((pfad) => pruefeDatei(optionen.wurzel, pfad, statistik))
const { daten, vorhanden } = leseAusnahmen(optionen.wurzel)
let { ist, verstoesse, veraltet } = vergleiche(befunde, daten)

if (optionen.schrumpfen && vorhanden) {
  schrumpfe(optionen.wurzel, daten, ist)
  console.log(`check:regeln: ${AUSNAHMEN_DATEI} geschrumpft (${veraltet.length} Einträge gesenkt oder gelöscht).`)
  veraltet = []
}

console.log(
  [
    `check:regeln: ${statistik.code} Dateien geprüft (U6).`,
    `  U1: Regeltestdateien unter src/engine: ${statistik.regeltests}, Testnamen darin: ${statistik.testnamen}`,
    `  U7: Testdateien: ${statistik.testdateien}, Dateien unter src/ui und src/ki ohne Tests: ${statistik.uiKi}`,
    `  Ausnahmen für den Altbestand (dürfen nur schrumpfen): ${REGELN.map((regel) => summeAusnahmen(daten, regel)).join(', ')}`,
  ].join('\n'),
)

for (const { regel, pfad, anzahl, erlaubt, eigene } of verstoesse) {
  const kopf = erlaubt > 0 ? `${regel} ${pfad}: ${anzahl} statt höchstens ${erlaubt} Verstösse (Ausnahmeliste)` : `${regel} ${pfad}:`
  console.error(kopf)
  for (const { zeile, was } of eigene) console.error(zeile > 0 ? `  ${pfad}:${zeile} ${was}` : `  ${was}`)
}

if (veraltet.length > 0) {
  console.error(`Veraltete Ausnahmen in ${AUSNAHMEN_DATEI} (es gibt weniger Verstösse als erlaubt):`)
  for (const { regel, pfad, anzahl, erlaubt } of veraltet) console.error(`  ${regel} ${pfad}: erlaubt ${erlaubt}, gefunden ${anzahl}`)
  console.error('Nachziehen mit: npm run check:regeln -- --ausnahmen-schrumpfen')
}

if (verstoesse.length > 0 || veraltet.length > 0) {
  console.error(`check:regeln: ${verstoesse.length} Dateien mit Verstössen, ${veraltet.length} veraltete Ausnahmen. Regeln: docs/UMSETZUNGSPLAN.md, Abschnitt 3.7.`)
  process.exit(1)
}
console.log('check:regeln: keine Verstösse.')
