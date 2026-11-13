// Welche Layout-Verträge es in welchem Playwright-Projekt gibt, und welche Einträge der
// Ausnahmeliste tests/layout/geraeteklassen_ausnahmen.json keinen davon treffen (P0.3c).
//
// Ein Eintrag, der keinen Vertrag trifft (etwa ein Tippfehler im Testnamen), greift nie:
// Playwright erwartet für ihn kein Scheitern und meldet auch nicht, wenn der Vertrag
// grün ist. Er bliebe in der Liste, die nur schrumpfen soll.

import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const TESTVERZEICHNIS = 'tests/layout'
const TESTHOOK_ENDUNG = /-testhooks$/

/**
 * Alle Verträge aus `playwright test --list --reporter=json` als
 * `{ projekt, datei, vertrag }`; `vertrag` ist „Gruppe › Test“ wie im Bericht, `datei`
 * die Spec relativ zur Wurzel (auch wenn der Test in einer Hilfsdatei wie waechter.ts steht).
 */
export function vertraegeAusBericht(bericht) {
  const vertraege = []
  const besuche = (suite, spec, titel) => {
    for (const unter of suite.suites ?? []) besuche(unter, spec, [...titel, unter.title])
    for (const eintrag of suite.specs ?? []) {
      const vertrag = [...titel, eintrag.title].join(' › ')
      for (const { projectName } of eintrag.tests) vertraege.push({ projekt: projectName, datei: spec, vertrag })
    }
  }
  for (const datei of bericht.suites ?? []) besuche(datei, `${TESTVERZEICHNIS}/${datei.title.replaceAll('\\', '/')}`, [])
  return vertraege
}

/** Ruft Playwright im Listenmodus auf (kein Server, kein Browser) und liest den Bericht. */
export function playwrightVertraege(wurzel) {
  const lauf = spawnSync(process.execPath, [join(wurzel, 'node_modules/@playwright/test/cli.js'), 'test', '--list', '--reporter=json'], {
    cwd: wurzel,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (lauf.status !== 0) throw new Error(`playwright test --list endete mit ${lauf.status}: ${lauf.stderr}`)
  return vertraegeAusBericht(JSON.parse(lauf.stdout))
}

/** Einträge, zu denen es in ihrer Klasse (Produktions- oder Testhook-Projekt) keinen Vertrag mit genau diesem Titel gibt. */
export function unbekannteAusnahmen(ausnahmen, vertraege) {
  const bekannt = new Set(vertraege.map(({ projekt, datei, vertrag }) => `${projekt.replace(TESTHOOK_ENDUNG, '')}|${datei}|${vertrag}`))
  return ausnahmen.filter(({ klasse, datei, vertrag }) => !bekannt.has(`${klasse}|${datei}|${vertrag}`))
}
