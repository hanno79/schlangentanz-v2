/*
Author: Claude Code (Etappe 5)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Guard — Sentry bleibt aus, solange keine `VITE_SENTRY_DSN` gesetzt ist,
              und `Sentry.init` steht an genau einer Stelle.

Zwei Sorgen, beide nicht theoretisch:

1. **Ein Testlauf, der echte Fehlerberichte erzeugt.** Die Suite läuft bei jedem
   Commit, und `Fehlerfang.fehlerfall.test.tsx` wirft absichtlich. Wäre der Dienst
   ohne DSN-Prüfung scharf, stünden diese Würfe im Dashboard neben echten Fehlern
   von Spielern — und niemand könnte sie unterscheiden. Dasselbe Argument wie bei
   `VITE_TEST_HOOKS`: Die Umgebung entscheidet, nicht der Code.

2. **Sentry, verteilt über die Codebasis.** Solange `init` und `captureException`
   nur in `fehlerdienst.ts` vorkommen, ist die DSN-Bedingung an *einer* Stelle
   prüfbar. Ein zweiter `Sentry.init(...)` irgendwo — etwa in einem Hook — hätte
   seine eigene, womöglich fehlende Bedingung. Der Guard liest deshalb die
   Quelltexte, statt sich auf eine gepflegte Liste zu verlassen; genau wie
   `App.hooks_production_guard.test.ts`.
*/
/// <reference types="node" />

import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fehlerdienstAktiv } from './fehlerdienst'

/**
 * Alle **Produktions**-Quelldateien unter `src/`, rekursiv.
 *
 * Testdateien sind ausgenommen, und das ist nicht Bequemlichkeit: Dieser Guard hat
 * beim ersten Lauf **sich selbst** gemeldet, weil sein Suchmuster den gesuchten
 * String enthält. Ein Quelltext-Guard läuft über seinen eigenen Quelltext mit.
 *
 * Der Ausschluss kostet nichts: Ein `Sentry.init` in einer Testdatei kann nichts
 * senden, weil im Testlauf keine DSN gesetzt ist — genau das prüft die erste
 * Zusicherung unten.
 */
function produktionsDateien(verzeichnis = 'src'): string[] {
  return readdirSync(verzeichnis, { withFileTypes: true }).flatMap((eintrag) => {
    const pfad = `${verzeichnis}/${eintrag.name}`
    if (eintrag.isDirectory()) return produktionsDateien(pfad)
    if (!/\.(ts|tsx)$/.test(eintrag.name)) return []
    return /\.test\.(ts|tsx)$/.test(eintrag.name) ? [] : [pfad]
  })
}

describe('Sentry ist ohne DSN aus', () => {
  it('der Fehlerdienst ist im Testlauf nicht scharf', () => {
    /* Hier läuft keine `VITE_SENTRY_DSN`. Wäre diese Zusicherung falsch, würde die
       Suite selbst Fehlerberichte senden — und der Test, der das prüft, wäre der
       erste Absender. */
    expect(fehlerdienstAktiv()).toBe(false)
  })

  it('`sentry.init` steht nur in `fehlerdienst.ts`', () => {
    const mitInit = produktionsDateien().filter((pfad) => /\bsentry\.init\s*\(/.test(readFileSync(pfad, 'utf8')))
    expect(
      mitInit,
      'Sentry darf nur in `src/fehlerdienst.ts` initialisiert werden — sonst hat die ' +
        `DSN-Bedingung mehr als eine Stelle: ${mitInit.join(', ')}`,
    ).toEqual(['src/fehlerdienst.ts'])
  })

  it('`captureException` steht nur in `fehlerdienst.ts`', () => {
    const mitCapture = produktionsDateien().filter((pfad) =>
      /\bsentry\?\.captureException\s*\(/.test(readFileSync(pfad, 'utf8')),
    )
    expect(
      mitCapture,
      `Fehler werden über \`meldeFehler\` gemeldet, nicht direkt: ${mitCapture.join(', ')}`,
    ).toEqual(['src/fehlerdienst.ts'])
  })

  it('die Initialisierung hängt an der DSN-Prüfung', () => {
    /* Die Reihenfolge im Quelltext ist der Punkt: Der Rückgabe-Wächter muss
       **vor** `Sentry.init` stehen. Ein `init` davor wäre unbedingt scharf. */
    const quelltext = readFileSync('src/fehlerdienst.ts', 'utf8')
    const wachePos = quelltext.indexOf('if (!fehlerdienstAktiv()) return')
    const initPos = quelltext.indexOf('sentry.init(')
    expect(wachePos, 'Der DSN-Wächter fehlt in `starteFehlerdienst`.').toBeGreaterThan(0)
    expect(initPos, '`sentry.init` fehlt.').toBeGreaterThan(0)
    expect(wachePos, 'Der DSN-Wächter steht hinter `sentry.init` — dann greift er nicht.').toBeLessThan(initPos)
  })

  it('Sentry wird nachgeladen, nicht statisch importiert', () => {
    /* Der Grund ist gemessen: Ein statischer Import kostete +32,6 % gzip im
       Haupt-Chunk, für ein Werkzeug, das im Normalfall nichts tut. Ein
       versehentliches `import * as Sentry from '@sentry/browser'` würde den Chunk
       wieder in den kritischen Pfad ziehen, ohne dass etwas rot wird. */
    const quelltext = readFileSync('src/fehlerdienst.ts', 'utf8')
    expect(quelltext).toContain("await import('@sentry/browser')")
    expect(
      /^import .*'@sentry\/browser'/m.test(quelltext),
      'Statischer Sentry-Import in `fehlerdienst.ts` — das Paket gehört nachgeladen.',
    ).toBe(false)
  })

  it('das Bundle bekommt kein Performance-Tracing', () => {
    /* `tracesSampleRate: 0` ist nicht nur eine Datenschutz-Entscheidung: Es geht
       um Fehler, nicht um Telemetrie, und Tracing kostet Bundle. */
    expect(readFileSync('src/fehlerdienst.ts', 'utf8')).toContain('tracesSampleRate: 0')
    expect(readFileSync('src/fehlerdienst.ts', 'utf8')).toContain('sendDefaultPii: false')
  })
})
