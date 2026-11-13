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
// Altbestand: scripts/check_regeln_ausnahmen.json nennt je Regel und Datei jeden
// geduldeten Verstoss mit einem Merkmal (scripts/pruefung/ausnahmen.mjs): bei U1 der
// volle Testname, bei U6 der Inhalt der Zeile, bei U7 die Art der Grenze. Ein
// Verstoss ohne passendes Merkmal ist ein Fehler, auch wenn dafür ein alter
// verschwunden ist. Ein Merkmal ohne Verstoss ist veraltet und wird mit
// `--ausnahmen-schrumpfen` gelöscht; dieser Schalter fügt nie etwas hinzu.
//
// Die Liste darf nur schrumpfen: Sie wird mit ihrer Fassung auf der Merge-Basis
// von HEAD und origin/neuaufbau verglichen (`--vergleich <ref>` für einen anderen
// Stand). Neue Dateien, neue Regeln und neue Merkmale sind ein Fehler. Ohne
// Repository oder Vergleichsstand bricht das Skript mit Exit 2 ab;
// `--ohne-vergleich` überspringt den Vergleich sichtbar (für Probe-Bäume).
//
// Aufruf: npm run check:regeln [-- --ausnahmen-schrumpfen] [-- --vergleich <ref> | --ohne-vergleich] [-- --wurzel <ordner>]
// Exit 0: keine Verstösse. Exit 1: Verstösse, veraltete oder gewachsene Ausnahmen.
// Exit 2: Aufruf falsch, Ausnahmeliste unlesbar oder kein Vergleichsstand.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import ts from 'typescript'
import { CODE_ENDUNGEN, TESTDATEI, parse, sammleDateien as sammleOrdner, zeileVon } from './pruefung/quelldateien.mjs'
import {
  AUSNAHMEN_DATEI,
  VERGLEICH_VORGABE,
  abgleich,
  basisAusnahmen,
  merkmalDerZeile,
  pruefeFormat,
  zuwachs,
} from './pruefung/ausnahmen.mjs'

const SUCHORDNER = ['src', 'tests', 'scripts']
const U7_ENDUNGEN = new Set([...CODE_ENDUNGEN, '.css'])
const REGELN = ['U1', 'U6', 'U7']
const AUFRUF = 'node scripts/check_regeln.mjs [--wurzel <ordner>] [--ausnahmen-schrumpfen] [--vergleich <ref> | --ohne-vergleich]'

const MAX_ZEILEN_TEST = 499
const MAX_ZEILEN_UI_KI = 300

const SPEC_ABSCHNITT = /(?<![A-Za-z0-9])[ABD]\d+(?:\.\d+)?(?![0-9])/
const TESTFUNKTIONEN = new Set(['it', 'test', 'describe', 'suite'])
const VERBOTENE_MODIFIKATOREN = new Set(['skip', 'skipIf', 'runIf', 'only', 'todo', 'fixme'])
const NAMENSLOSE_AUFRUFE = new Set(['each', 'for', 'skipIf', 'runIf'])
const ERLAUBTE_KETTENGLIEDER = new Set(['concurrent', 'sequential', 'fails', 'describe', 'serial', 'parallel', 'skip', 'only', 'todo', 'fixme'])

function leseArgumente(argumente) {
  const optionen = { wurzel: process.cwd(), schrumpfen: false, vergleich: VERGLEICH_VORGABE }
  for (let i = 0; i < argumente.length; i += 1) {
    const argument = argumente[i]
    if (argument === '--ausnahmen-schrumpfen') optionen.schrumpfen = true
    else if (argument === '--ohne-vergleich') optionen.vergleich = null
    else if (argument === '--wurzel' && argumente[i + 1]) optionen.wurzel = argumente[(i += 1)]
    else if (argument === '--vergleich' && argumente[i + 1]) optionen.vergleich = argumente[(i += 1)]
    else {
      console.error(`check:regeln: unbekanntes Argument „${argument}“.\nAufruf: ${AUFRUF}`)
      process.exit(2)
    }
  }
  return optionen
}

function sammleDateien(wurzel) {
  const dateien = SUCHORDNER.flatMap((ordner) => sammleOrdner(wurzel, ordner))
  for (const eintrag of readdirSync(wurzel, { withFileTypes: true })) {
    if (eintrag.isFile()) dateien.push(eintrag.name)
  }
  return dateien.sort()
}

function zaehleZeilen(text) {
  if (text.length === 0) return 0
  return text.replace(/\n$/, '').split('\n').length
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

function pruefeKommentare(quelle, melde) {
  // Jeder Kommentar, den U6 meldet, enthält eines der beiden Wörter; der Gang über
  // alle Token lohnt sich nur dann.
  if (!/@ts-|eslint-disable/.test(quelle.getFullText())) return
  for (const { pos, inhalt } of kommentare(quelle)) {
    const ersteZeile = inhalt.split('\n')[0]
    const kern = ersteZeile.replace(/^\/[/*]\s*\**\s*/, '').replace(/\*\/\s*$/, '')
    const direktive = kern.match(/^@ts-(ignore|nocheck)\b/)
    if (direktive) melde('U6', pos, `${direktive[0]} ist verboten`)
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
            const voll = kette.filter(Boolean).join(' › ')
            melde('U1', knoten.getStart(quelle), `„${voll}“ nennt keinen Spec-Abschnitt (z. B. „A5: …“)`, voll)
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
  if (!U7_ENDUNGEN.has(endung)) return befunde
  const text = readFileSync(join(wurzel, pfad), 'utf8')

  const zeilen = zaehleZeilen(text)
  const zuLang = (grenze, merkmal) =>
    befunde.push({ regel: 'U7', pfad, zeile: 0, was: `${pfad}: ${zeilen} Zeilen, erlaubt sind ${grenze}`, merkmal })
  if (istTest) {
    statistik.testdateien += 1
    if (zeilen > MAX_ZEILEN_TEST) zuLang(MAX_ZEILEN_TEST, `Testdatei länger als ${MAX_ZEILEN_TEST} Zeilen`)
  }
  if (/^src\/(ui|ki)\//.test(pfad) && !istTest) {
    statistik.uiKi += 1
    if (zeilen > MAX_ZEILEN_UI_KI) zuLang(MAX_ZEILEN_UI_KI, `Datei unter src/ui oder src/ki länger als ${MAX_ZEILEN_UI_KI} Zeilen`)
  }

  if (!CODE_ENDUNGEN.has(endung)) return befunde
  statistik.code += 1
  const istRegeltest = istTest && pfad.startsWith('src/engine/')
  if (istRegeltest) statistik.regeltests += 1

  const quelle = parse(pfad, text)
  const melde = (regel, pos, was, merkmal) => {
    const zeile = zeileVon(quelle, pos)
    befunde.push({ regel, pfad, zeile, was, merkmal: merkmal ?? merkmalDerZeile(text, zeile) })
  }
  pruefeKommentare(quelle, melde)
  pruefeAst(quelle, istRegeltest, melde, () => (statistik.testnamen += 1))
  return befunde
}

function brichAb(meldung) {
  console.error(`check:regeln: ${meldung}`)
  process.exit(2)
}

function leseAusnahmen(wurzel) {
  const pfad = join(wurzel, AUSNAHMEN_DATEI)
  if (!existsSync(pfad)) return { daten: { U1: {}, U6: {}, U7: {} }, vorhanden: false }
  try {
    const daten = JSON.parse(readFileSync(pfad, 'utf8'))
    pruefeFormat(daten)
    for (const regel of REGELN) daten[regel] ??= {}
    return { daten, vorhanden: true }
  } catch (fehler) {
    return brichAb(`${AUSNAHMEN_DATEI} ist unlesbar: ${fehler.message}`)
  }
}

/** Je Regel und Datei: Verstösse ohne passendes Merkmal und Merkmale ohne Verstoss. */
function vergleiche(befunde, ausnahmen) {
  const ist = Object.fromEntries(REGELN.map((regel) => [regel, {}]))
  for (const befund of befunde) (ist[befund.regel][befund.pfad] ??= []).push(befund)

  const verstoesse = []
  const veraltet = []
  for (const regel of REGELN) {
    const pfade = new Set([...Object.keys(ist[regel]), ...Object.keys(ausnahmen[regel])])
    for (const pfad of pfade) {
      const eigene = ist[regel][pfad] ?? []
      const erlaubt = ausnahmen[regel][pfad] ?? []
      const { neu, veraltet: ohneVerstoss } = abgleich(eigene.map(({ merkmal }) => merkmal), erlaubt)
      if (neu.length > 0) verstoesse.push({ regel, pfad, gelistet: erlaubt.length, eigene: neu.map((stelle) => eigene[stelle]) })
      if (ohneVerstoss.length > 0) veraltet.push({ regel, pfad, merkmale: ohneVerstoss })
    }
  }
  return { verstoesse, veraltet }
}

/** Löscht die veralteten Merkmale; Einträge ohne Merkmal fallen weg. U4 pflegt der Architekturtest. */
function schrumpfe(wurzel, daten, veraltet) {
  for (const { regel, pfad, merkmale } of veraltet) {
    const behalten = abgleich(daten[regel][pfad], merkmale).neu.map((stelle) => daten[regel][pfad][stelle])
    if (behalten.length > 0) daten[regel][pfad] = behalten
    else delete daten[regel][pfad]
  }
  writeFileSync(join(wurzel, AUSNAHMEN_DATEI), `${JSON.stringify(daten, null, 2)}\n`)
}

/** Vergleich mit der Fassung auf der Merge-Basis: Zeilen für die Ausgabe und die gewachsenen Merkmale. */
function pruefeWachstum(wurzel, daten, vorhanden, vergleich) {
  if (!vorhanden) return { zeile: '  Keine Ausnahmeliste, nichts zu vergleichen.', gewachsen: [] }
  if (vergleich === null) {
    return { zeile: '  Wachstumsprüfung übersprungen (--ohne-vergleich): ob die Ausnahmeliste gewachsen ist, prüft dieser Lauf nicht.', gewachsen: [] }
  }
  let basis
  try {
    basis = basisAusnahmen(wurzel, vergleich)
  } catch (fehler) {
    return brichAb(
      [
        `Die Ausnahmeliste lässt sich nicht mit ${vergleich} vergleichen: ${fehler.message}.`,
        '  Abhilfe: git fetch origin; oder mit --vergleich <ref> einen anderen Stand nennen (etwa origin/main).',
        '  Nur für Probe-Bäume ohne git: --ohne-vergleich (dann entfällt die Prüfung, ob die Liste wächst).',
      ].join('\n'),
    )
  }
  const stand = `${vergleich} (Merge-Basis ${basis.basis.slice(0, 7)})`
  return { stand, zeile: `  Ausnahmeliste verglichen mit ${stand}.`, gewachsen: zuwachs(basis.daten, daten) }
}

function summeAusnahmen(daten, regel) {
  const eintraege = Object.values(daten[regel])
  return `${regel} ${eintraege.length} Dateien/${eintraege.reduce((summe, merkmale) => summe + merkmale.length, 0)}`
}

const optionen = leseArgumente(process.argv.slice(2))
const statistik = { code: 0, testdateien: 0, regeltests: 0, testnamen: 0, uiKi: 0 }
const dateien = sammleDateien(optionen.wurzel)
const befunde = dateien.flatMap((pfad) => pruefeDatei(optionen.wurzel, pfad, statistik))
const { daten, vorhanden } = leseAusnahmen(optionen.wurzel)
let { verstoesse, veraltet } = vergleiche(befunde, daten)

if (optionen.schrumpfen && vorhanden) {
  schrumpfe(optionen.wurzel, daten, veraltet)
  console.log(`check:regeln: ${AUSNAHMEN_DATEI} geschrumpft (${veraltet.length} Einträge gekürzt oder gelöscht).`)
  veraltet = []
}

const wachstum = pruefeWachstum(optionen.wurzel, daten, vorhanden, optionen.vergleich)

console.log(
  [
    `check:regeln: ${statistik.code} Dateien geprüft (U6).`,
    `  U1: Regeltestdateien unter src/engine: ${statistik.regeltests}, Testnamen darin: ${statistik.testnamen}`,
    `  U7: Testdateien: ${statistik.testdateien}, Dateien unter src/ui und src/ki ohne Tests: ${statistik.uiKi}`,
    `  Ausnahmen für den Altbestand (dürfen nur schrumpfen): ${REGELN.map((regel) => summeAusnahmen(daten, regel)).join(', ')}`,
    wachstum.zeile,
  ].join('\n'),
)

for (const { regel, pfad, gelistet, eigene } of verstoesse) {
  console.error(gelistet > 0 ? `${regel} ${pfad}: ${eigene.length} Verstösse ohne passendes Merkmal in der Ausnahmeliste` : `${regel} ${pfad}:`)
  for (const { zeile, was } of eigene) console.error(zeile > 0 ? `  ${pfad}:${zeile} ${was}` : `  ${was}`)
}

if (veraltet.length > 0) {
  console.error(`Veraltete Ausnahmen in ${AUSNAHMEN_DATEI} (Merkmal ohne Verstoss):`)
  for (const { regel, pfad, merkmale } of veraltet) {
    for (const merkmal of merkmale) console.error(`  ${regel} ${pfad}: „${merkmal}“`)
  }
  console.error('Nachziehen mit: npm run check:regeln -- --ausnahmen-schrumpfen')
}

if (wachstum.gewachsen.length > 0) {
  console.error(`Die Ausnahmeliste wächst gegenüber ${wachstum.stand}; sie darf nur schrumpfen. Neu sind:`)
  for (const { regel, pfad, merkmal } of wachstum.gewachsen) console.error(`  ${regel} ${pfad}: „${merkmal}“`)
  console.error('Den Verstoss beheben, statt ihn in die Liste zu schreiben.')
}

const fehler = verstoesse.length + veraltet.length + wachstum.gewachsen.length
if (fehler > 0) {
  console.error(
    `check:regeln: ${verstoesse.length} Dateien mit Verstössen, ${veraltet.length} veraltete Ausnahmen, ` +
      `${wachstum.gewachsen.length} neue Merkmale in der Ausnahmeliste. Regeln: docs/UMSETZUNGSPLAN.md, Abschnitt 3.7.`,
  )
  process.exit(1)
}
console.log('check:regeln: keine Verstösse.')
