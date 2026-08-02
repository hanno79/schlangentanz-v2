/*
Author: Claude Code (AP-1)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Zentrale Lesehilfe für die beiden Smoke-Ketten aus package.json.

Hintergrund (AP-1, Onboarding-Finding 7): Die Test-Hooks
`window.__schlangentanzFixture` und der `?phase=`-URL-Hook sind seit Audit-Fix C4
hinter `testHooksAktiv()` gesperrt, waren aber faktisch weiter in Production
erreichbar, weil `VITE_TEST_HOOKS=1` dort gesetzt sein musste, damit sechs Smokes
laufen. Seit AP-1 gibt es deshalb zwei Ketten:

- `smoke:production` — läuft gegen die Production-URL, braucht keine Test-Hooks.
- `smoke:preview`    — läuft gegen ein Preview-Deployment mit `VITE_TEST_HOOKS=1`
                       und enthält genau die hook-abhängigen Smokes.

Vorher las jeder Wiring-Test `package.json` selbst und prüfte `chain.toContain(...)`.
Das bricht, sobald ein Skript in die andere Kette wandert. Diese Datei ist die eine
Quelle dafür, analog zur `zielspurKey`-Factory in `src/components/zielspurKey.ts`.
*/
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { SMOKE_LISTEN } from '../../scripts/smoke_listen.mjs'

/**
 * Smokes, die ohne aktiven Test-Hook nicht aussagekräftig laufen können.
 *
 * Hart abhängig (werfen ohne Hook):
 * - `m2d_…` prüft explizit `typeof window.__schlangentanzFixture === 'function'`
 * - `m2a_…` bricht ab, wenn der Hook fehlt
 * - `m1dh_…` und `m1e_…` navigieren nach `/game?phase=…` und asserten auf die
 *   dadurch erzwungene Phase
 *
 * Weich abhängig (degradieren still, prüfen dann aber deutlich weniger):
 * - `m1dp_…` und `m1dq_…` überspringen die Fixture-Injektion, wenn der Hook fehlt
 *
 * Auch die weich abhängigen laufen in der Preview-Kette, damit die
 * fixture-gestützte Abdeckung an genau einer Stelle liegt statt in Production
 * still auf eine Teilprüfung zusammenzufallen.
 */
/* ÄNDERUNG [31.07.2026]: G-8 — die Liste ist leer.

   Die sechs hook-abhängigen Smokes prüften das alte Waldtanz-Brett und sind mit
   ihm entfallen. Die Trennung selbst bleibt bestehen: Sie ist der Kern von AP-1
   („keine Test-Hooks in Production"), und sobald wieder ein Smoke die
   Fixture-Hooks braucht, gehört er hierher und nicht in die Production-Kette. */
export const HOOK_ABHAENGIGE_SMOKES: readonly string[] = []

// ÄNDERUNG [30.07.2026]: AP-4 — Quelle ist jetzt scripts/smoke_listen.mjs statt
// eines 8000 Zeichen langen &&-Strings in package.json. Dieselbe Liste benutzt der
// Runner (scripts/run_smokes.mjs), damit Test und Ausführung nicht auseinanderlaufen.

/** Schritte der Production-Kette in Quellreihenfolge. */
export function produktionsSchritte(): string[] {
  return [...SMOKE_LISTEN.production]
}

/** Schritte der Preview-Kette in Quellreihenfolge. */
export function previewSchritte(): string[] {
  return [...SMOKE_LISTEN.preview]
}

/* ÄNDERUNG [02.08.2026]: Fünf Exporte entfernt — `produktionsKette`,
   `previewKette`, `alleSchritte`, `istVerdrahtet` und `produktionsPosition`.
   Sie waren die Kompatibilitätsschicht aus AP-4 für die rund 20 Wiring-Tests,
   die eine Kette als `node a.mjs && node b.mjs` lasen und darauf Mitgliedschaft
   und Reihenfolge prüften. Diese Tests prüften das alte Waldtanz-Brett und sind
   mit G-8 entfallen; die Schicht bediente danach niemanden mehr.

   Eine Ansicht, die keine Sicht mehr ist, lädt zum Wiederbenutzen ein: Die
   Zeichenkettenform war ein Zugeständnis an Bestandstests, nicht die bessere
   Schnittstelle. Ein neuer Test fragt `produktionsSchritte()` und arbeitet auf
   der Liste. */

/** Nutzt das Smoke-Skript einen Test-Hook (Fixture-Objekt oder `?phase=`-URL)? */
export function nutztTestHook(skriptPfad: string): boolean {
  const quelle = readFileSync(skriptPfad, 'utf8')
  return quelle.includes('__schlangentanzFixture') || /\?phase=/.test(quelle)
}
