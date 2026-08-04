#!/usr/bin/env node
/*
Author: Claude Code (Etappe 7)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Prüft vor einem Merge, was `gh pr checks` allein nicht prüft.

Dieses Skript ist die Antwort auf drei Fehler, die in einer einzigen Sitzung am
04.08.2026 wirklich passiert sind — keine ausgedachten Fälle:

1. **Der Merge nahm nur den halben Branch.** `gh pr merge` merged den **PR-HEAD**,
   nicht den lokalen Stand. Bei PR #2 lag der zweite Commit vier Minuten daneben und
   fiel heraus. `gh pr checks` meldete weiter grün, weil es den geschlossenen PR
   nicht kennt — der Fehler fiel erst eine Stunde später auf.

2. **„Alles grün" hieß „noch nichts angetreten".** Bei PR #8 zeigte `gh pr checks`
   nur die beiden Vercel-Einträge und damit `all green`, weil Kilo und CodeRabbit
   ihre Checks noch nicht angelegt hatten. Eine Wartebedingung darauf war sofort
   erfüllt. Fehlende Prüfung ist nicht bestandene Prüfung.

3. **Checks vom Vorgänger-Commit wurden als aktuell gelesen.** Nach einem Push
   zeigte `gh pr checks` die Ergebnisse des vorigen Commits (gleicher Kilo-Link,
   gleicher Vercel-Deployment) und `mergeStateStatus: UNKNOWN`. Gefragt werden muss
   commit-bezogen: `commits/<sha>/check-runs` **und** `commits/<sha>/status` — denn
   CodeRabbit ist ein Status-Context, kein Check-Run, und tauchte in der einen
   Abfrage gar nicht auf.

Aufruf: `npm run check:merge-bereit [PR-Nummer]`. Ohne Nummer wird der PR zum
aktuellen Branch gesucht. Exit 1, sobald etwas nicht stimmt.
*/

import { execFileSync } from 'node:child_process'

/** Erwartete Prüfer. Fehlt einer, ist der PR nicht fertig geprüft. */
const ERWARTETE_PRUEFER = ['Kilo Code Review', 'CodeRabbit', 'Vercel']

function lauf(befehl, argumente) {
  return execFileSync(befehl, argumente, { encoding: 'utf8' }).trim()
}

function ghJson(pfad, jq) {
  return lauf('gh', ['api', pfad, '--jq', jq])
}

const befunde = []
function melde(bedingung, text) {
  if (!bedingung) befunde.push(text)
  console.log(`${bedingung ? '  OK  ' : '  !!  '} ${text}`)
}

const branch = lauf('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
if (branch === 'main') {
  console.error('Auf `main` gibt es nichts zu mergen.')
  process.exit(1)
}

const prNummer =
  process.argv[2] ?? lauf('gh', ['pr', 'view', '--json', 'number', '--jq', '.number'])
const repo = lauf('gh', ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'])
console.log(`\nMerge-Bereitschaft für PR #${prNummer} (${repo}, Branch ${branch})\n`)

// 1) Nichts Ungepushtes.
const ungepusht = lauf('git', ['rev-list', '--count', `origin/${branch}..HEAD`])
melde(ungepusht === '0', `keine ungepushten Commits (${ungepusht} lokal voraus)`)

// 2) Der PR kennt meinen letzten Commit.
const lokal = lauf('git', ['rev-parse', 'HEAD'])
const prHead = lauf('gh', ['pr', 'view', prNummer, '--json', 'headRefOid', '--jq', '.headRefOid'])
melde(
  prHead === lokal,
  `PR-HEAD ist mein letzter Commit (PR ${prHead.slice(0, 7)}, lokal ${lokal.slice(0, 7)})`,
)

// 3) Alle erwarteten Prüfer sind angetreten — und fertig.
const checkRuns = JSON.parse(
  ghJson(`repos/${repo}/commits/${lokal}/check-runs`, '[.check_runs[] | {name, status, conclusion}]'),
)
const statuses = JSON.parse(
  ghJson(`repos/${repo}/commits/${lokal}/status`, '[.statuses[] | {name: .context, state}]'),
)

for (const pruefer of ERWARTETE_PRUEFER) {
  const run = checkRuns.find((eintrag) => eintrag.name === pruefer)
  const status = statuses.find((eintrag) => eintrag.name === pruefer)
  if (run === undefined && status === undefined) {
    melde(false, `${pruefer}: nicht angetreten für ${lokal.slice(0, 7)} — fehlt, nicht bestanden`)
    continue
  }
  if (run !== undefined) {
    melde(
      run.status === 'completed' && run.conclusion === 'success',
      `${pruefer}: ${run.status}/${run.conclusion ?? '—'}`,
    )
    continue
  }
  melde(status.state === 'success', `${pruefer}: ${status.state}`)
}

// 4) GitHub hält den PR für mergebar — `UNKNOWN` heißt „noch nicht entschieden“.
const zustand = JSON.parse(
  lauf('gh', ['pr', 'view', prNummer, '--json', 'mergeable,mergeStateStatus']),
)
melde(zustand.mergeable === 'MERGEABLE', `mergeable: ${zustand.mergeable}`)
melde(
  ['CLEAN', 'UNSTABLE'].includes(zustand.mergeStateStatus),
  `mergeStateStatus: ${zustand.mergeStateStatus} (UNKNOWN = GitHub rechnet noch)`,
)

/* 5) Hat sich `main` bewegt? Kein Fehler, aber der Grund, warum PR #5 nicht
      mergebar war: Ein Rebase-Merge auf `main` schrieb denselben Inhalt als neuen
      Commit, und der Branch trug ihn danach doppelt. */
lauf('git', ['fetch', 'origin', '--quiet'])
const mainVoraus = lauf('git', ['rev-list', '--count', `HEAD..origin/main`])
if (mainVoraus !== '0') {
  console.log(`  ..    origin/main ist ${mainVoraus} Commit(s) voraus — Rebase kann nötig sein`)
}

console.log('')
if (befunde.length > 0) {
  console.error(`Nicht merge-bereit (${befunde.length} Punkt(e)):`)
  for (const befund of befunde) console.error(`  - ${befund}`)
  process.exit(1)
}
console.log('Merge-bereit.')
