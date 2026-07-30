/*
Author: Claude Code (AP-2)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Ratchet-Guard fuer CSS-Quelltext-Assertions in Testdateien
              (AP-2, Onboarding-Finding 2).

Problem: 177 Testdateien lesen `src/App.css` als Text und pruefen mit
selbstgebauten Klammer-Parsern auf exakte `clamp()`-Werte — rund 723 solcher
Assertions. Jede Layout-Aenderung erzwingt dadurch eine Migration fremder
Testdateien ("Pitfall #48 Cascade-Contract-Migration").

Der Umbau auf gemessene Layout-Vertraege unter `tests/layout/` laeuft ueber
mehrere Slices. Dieser Guard sorgt dafuer, dass der Bestand dabei nur schrumpft:
er zaehlt die verbliebenen CSS-Quelltext-Assertions und schlaegt fehl, sobald die
Zahl ueber die eingecheckte Baseline steigt.

Damit gilt:
- Neue Slices koennen keine neuen CSS-Regex-Vertraege einschleusen.
- Ein Abbruch der Migration friert den erreichten Stand ein, statt ihn
  zurueckrollen zu lassen.
- Sinkt die Zahl, meldet der Guard das und fordert die neue Baseline ein.

Baseline liegt in `scripts/css_source_asserts_baseline.json`.
Aufruf: `npm run check:css-asserts`.
*/

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SUCHWURZELN = ['src', 'tests']
const TEST_DATEI_REGEX = /\.(test|spec)\.[jt]sx?$/
const BASELINE_PFAD = 'scripts/css_source_asserts_baseline.json'

// Ein Treffer ist jede Zeile, die den eingelesenen CSS-Quelltext als Variable
// benutzt. Bewusst konservativ: gezaehlt wird nur, was tatsaechlich auf dem
// CSS-Text arbeitet, nicht jede Erwaehnung von "App.css".
const CSS_QUELLTEXT_MUSTER = [
  /\bappCss\b/,
  /readFileSync\([^)]*App\.css/,
]

function sammleTestdateien(verzeichnis) {
  const dateien = []
  for (const eintrag of readdirSync(verzeichnis, { withFileTypes: true })) {
    const pfad = join(verzeichnis, eintrag.name)
    if (eintrag.isDirectory()) {
      dateien.push(...sammleTestdateien(pfad))
      continue
    }
    if (eintrag.isFile() && TEST_DATEI_REGEX.test(pfad)) {
      dateien.push(pfad)
    }
  }
  return dateien
}

function zaehleTreffer(pfad) {
  const zeilen = readFileSync(pfad, 'utf8').split('\n')
  return zeilen.filter((zeile) => CSS_QUELLTEXT_MUSTER.some((muster) => muster.test(zeile))).length
}

const befunde = SUCHWURZELN.flatMap((wurzel) => sammleTestdateien(wurzel))
  .map((pfad) => ({ pfad, treffer: zaehleTreffer(pfad) }))
  .filter(({ treffer }) => treffer > 0)
  .sort((links, rechts) => rechts.treffer - links.treffer)

const gesamt = befunde.reduce((summe, { treffer }) => summe + treffer, 0)
const dateien = befunde.length

if (process.argv.includes('--update-baseline')) {
  writeFileSync(
    BASELINE_PFAD,
    `${JSON.stringify({ assertions: gesamt, dateien, stand: 'siehe git log' }, null, 2)}\n`,
  )
  console.log(`Baseline neu geschrieben: ${gesamt} Assertions in ${dateien} Dateien.`)
  process.exit(0)
}

const baseline = JSON.parse(readFileSync(BASELINE_PFAD, 'utf8'))

if (gesamt > baseline.assertions) {
  console.error(
    `CSS-Quelltext-Assertions gestiegen: ${gesamt} (Baseline ${baseline.assertions}).\n` +
      'Layout-Vertraege gehoeren als Messung nach tests/layout/, nicht als Regex auf src/App.css.\n' +
      'Siehe docs/WORKFLOW.md, Abschnitt "Layout-Vertraege".\n\n' +
      'Groesste Bestaende:',
  )
  for (const { pfad, treffer } of befunde.slice(0, 10)) {
    console.error(`- ${pfad}: ${treffer}`)
  }
  process.exit(1)
}

if (gesamt < baseline.assertions) {
  console.error(
    `CSS-Quelltext-Assertions gesunken: ${gesamt} (Baseline ${baseline.assertions}). Gute Richtung.\n` +
      'Bitte die Baseline mitziehen, damit der erreichte Stand eingefroren wird:\n' +
      '  npm run check:css-asserts -- --update-baseline',
  )
  process.exit(1)
}

console.log(`CSS-Quelltext-Assertions: ${gesamt} in ${dateien} Dateien (Baseline gehalten).`)
