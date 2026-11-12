// Gemeinsame Bausteine für scripts/check_regeln.mjs und den Architekturtest
// (tests/architektur_pruefung.ts): was eine Code- oder Testdatei ist, Dateien
// sammeln, mit dem TypeScript-Parser lesen.

import { existsSync, readdirSync } from 'node:fs'
import { join, sep } from 'node:path'
import ts from 'typescript'

export const CODE_ENDUNGEN = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'])
export const TESTDATEI = /\.(test|spec)\.[cm]?[jt]sx?$/
const UEBERSPRUNGEN = new Set(['node_modules', 'dist', 'dist-testhooks', '__snapshots__'])

export function zuPosix(pfad) {
  return pfad.split(sep).join('/')
}

/** Alle Dateien unter `ordner` als Pfade relativ zu `wurzel`, sortiert; fehlt der Ordner, eine leere Liste. */
export function sammleDateien(wurzel, ordner) {
  const treffer = []
  const sammle = (unterordner) => {
    for (const eintrag of readdirSync(join(wurzel, unterordner), { withFileTypes: true })) {
      if (UEBERSPRUNGEN.has(eintrag.name)) continue
      const pfad = join(unterordner, eintrag.name)
      if (eintrag.isDirectory()) sammle(pfad)
      else if (eintrag.isFile()) treffer.push(zuPosix(pfad))
    }
  }
  if (existsSync(join(wurzel, ordner))) sammle(ordner)
  return treffer.sort()
}

function skriptArt(pfad) {
  if (pfad.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (pfad.endsWith('.jsx')) return ts.ScriptKind.JSX
  if (/\.[cm]?js$/.test(pfad)) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

/** Syntaxbaum mit Elternverweisen; die Sprache folgt der Endung. */
export function parse(pfad, quelltext) {
  return ts.createSourceFile(pfad, quelltext, ts.ScriptTarget.Latest, true, skriptArt(pfad))
}

/** Zeile (ab 1), in der der Knoten beginnt; mit `pos` die Zeile dieser Position. */
export function zeileVon(knoten, pos = knoten.getStart()) {
  return knoten.getSourceFile().getLineAndCharacterOfPosition(pos).line + 1
}
