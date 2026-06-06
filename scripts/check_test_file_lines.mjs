/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Prüft rekursiv, dass Testdateien unter der 500-Zeilen-Grenze bleiben.
*/

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const MAXIMALE_ZEILEN = 499
const SUCHWURZELN = ['src', 'tests']
const TEST_DATEI_REGEX = /\.(test|spec)\.[jt]sx?$/

function sammleDateien(verzeichnis) {
  const dateien = []

  for (const eintrag of readdirSync(verzeichnis, { withFileTypes: true })) {
    const pfad = join(verzeichnis, eintrag.name)

    if (eintrag.isDirectory()) {
      dateien.push(...sammleDateien(pfad))
      continue
    }

    if (eintrag.isFile() && TEST_DATEI_REGEX.test(pfad)) {
      dateien.push(pfad)
    }
  }

  return dateien
}

function zaehleZeilen(pfad) {
  const inhalt = readFileSync(pfad, 'utf8')
  if (inhalt.length === 0) return 0
  return inhalt.replace(/\n$/, '').split('\n').length
}

const verletzungen = SUCHWURZELN.flatMap((wurzel) => sammleDateien(wurzel))
  .map((pfad) => ({ pfad, zeilen: zaehleZeilen(pfad) }))
  .filter(({ zeilen }) => zeilen > MAXIMALE_ZEILEN)
  .sort((links, rechts) => rechts.zeilen - links.zeilen)

if (verletzungen.length > 0) {
  console.error('Testdateien überschreiten die 500-Zeilen-Regel:')
  for (const { pfad, zeilen } of verletzungen) {
    console.error(`- ${pfad}: ${zeilen} Zeilen`)
  }
  process.exit(1)
}

console.log('Alle Testdateien bleiben unter 500 Zeilen.')
