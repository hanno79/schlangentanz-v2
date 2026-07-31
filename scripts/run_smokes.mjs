/*
Author: Claude Code (AP-4)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Runner fuer die Live-Smoke-Ketten (AP-4, Onboarding-Finding 13).

Vorher war `smoke:production` eine Kette aus 83 mit `&&` verbundenen node-Aufrufen
in einer einzigen package.json-Zeile. Zwei Kosten:

- **Fail-fast.** Faellt Smoke 3 um, laufen 74 weitere nie. Nach jeder Korrektur
  musste die ganze Kette neu gestartet werden, um den naechsten Fehler zu sehen.
- **Unlesbar.** Die Reihenfolge-Vertraege der Wiring-Tests mussten einen
  8000 Zeichen langen String zerlegen.

Dieser Runner faehrt alle Smokes einer Liste, sammelt die Ergebnisse und meldet am
Ende **alle** Fehlschlaege. Der Exit-Code bleibt 1, sobald einer scheitert — die
Gate-Semantik aendert sich also nicht.

Aufruf:
  node scripts/run_smokes.mjs production
  SMOKE_BASE_URL=<preview-url> node scripts/run_smokes.mjs preview

Die Listen stehen in `scripts/smoke_listen.mjs` und sind damit auch fuer die
Wiring-Tests lesbar, ohne einen Kettenstring zu parsen.
*/

import { spawn } from 'node:child_process'
import { SMOKE_LISTEN } from './smoke_listen.mjs'

const kette = process.argv[2] ?? 'production'
const skripte = SMOKE_LISTEN[kette]

if (!skripte) {
  console.error(`Unbekannte Smoke-Kette "${kette}". Bekannt: ${Object.keys(SMOKE_LISTEN).join(', ')}`)
  process.exit(2)
}

function fuehreAus(skript) {
  return new Promise((aufloesen) => {
    const beginn = Date.now()
    const kind = spawn('node', [skript], { stdio: ['ignore', 'pipe', 'pipe'] })
    let ausgabe = ''
    kind.stdout.on('data', (teil) => { ausgabe += teil })
    kind.stderr.on('data', (teil) => { ausgabe += teil })
    kind.on('close', (code) => {
      aufloesen({ skript, code, ausgabe, dauerMs: Date.now() - beginn })
    })
  })
}

const ergebnisse = []
console.log(`Smoke-Kette "${kette}": ${skripte.length} Skripte\n`)

for (const [index, skript] of skripte.entries()) {
  const ergebnis = await fuehreAus(skript)
  ergebnisse.push(ergebnis)
  const zeichen = ergebnis.code === 0 ? 'OK  ' : 'FEHL'
  const nummer = String(index + 1).padStart(2, ' ')
  console.log(`${zeichen} ${nummer}/${skripte.length}  ${skript}  (${(ergebnis.dauerMs / 1000).toFixed(1)}s)`)
}

const fehlschlaege = ergebnisse.filter((ergebnis) => ergebnis.code !== 0)

console.log(`\n${ergebnisse.length - fehlschlaege.length}/${ergebnisse.length} Smokes bestanden.`)

if (fehlschlaege.length > 0) {
  console.log(`\n${fehlschlaege.length} Fehlschlag/Fehlschlaege:\n`)
  for (const fehlschlag of fehlschlaege) {
    console.log(`--- ${fehlschlag.skript} (Exit ${fehlschlag.code})`)
    // Nur den Schluss ausgeben: dort steht die Fehlermeldung, davor Fortschrittslogs.
    const zeilen = fehlschlag.ausgabe.trimEnd().split('\n')
    console.log(zeilen.slice(-12).map((zeile) => `    ${zeile}`).join('\n'))
    console.log('')
  }
  process.exit(1)
}
