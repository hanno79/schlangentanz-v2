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
export const HOOK_ABHAENGIGE_SMOKES: readonly string[] = [
  'm1e_waldtanz_spieluhr_smoke.mjs',
  'm1dh_waldtanz_spielhandlung_smoke.mjs',
  'm1dp_waldtanz_gegnerlichtung_smoke.mjs',
  'm1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs',
  'm2a_waldtanz_sonderkarten_brettziel_highlight_smoke.mjs',
  'm2d_schlangentanz_fixture_helper_smoke.mjs',
]

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

/**
 * Die Production-Kette in der frueheren Textform `node a.mjs && node b.mjs`.
 *
 * ÄNDERUNG [30.07.2026]: AP-4 — seit dem Runner steht in package.json nur noch
 * `node scripts/run_smokes.mjs production`. Etliche Wiring-Tests pruefen
 * Mitgliedschaft und Reihenfolge auf einer solchen Zeichenkette. Diese Ansicht
 * bedient sie weiterhin, liest die Werte aber aus derselben Liste, die auch der
 * Runner ausfuehrt — es kann also nichts mehr auseinanderlaufen.
 */
export function produktionsKette(): string {
  return produktionsSchritte().map((schritt) => `node ${schritt}`).join(' && ')
}

/** Die Preview-Kette in derselben Textform. */
export function previewKette(): string {
  return previewSchritte().map((schritt) => `node ${schritt}`).join(' && ')
}

/** Alle Smoke-Schritte beider Ketten. */
export function alleSchritte(): string[] {
  return [...produktionsSchritte(), ...previewSchritte()]
}

/**
 * Ist das Skript in *einer* der beiden Ketten verdrahtet?
 * Ersetzt das frühere `chain.toContain(...)` der Wiring-Tests: ein Slice gilt als
 * verdrahtet, egal in welcher Kette er läuft.
 */
export function istVerdrahtet(skriptDateiname: string): boolean {
  return alleSchritte().some((schritt) => schritt.includes(skriptDateiname))
}

/** Position innerhalb der Production-Kette, oder -1. Für Reihenfolge-Asserts. */
export function produktionsPosition(skriptDateiname: string): number {
  return produktionsSchritte().findIndex((schritt) => schritt.includes(skriptDateiname))
}

/** Nutzt das Smoke-Skript einen Test-Hook (Fixture-Objekt oder `?phase=`-URL)? */
export function nutztTestHook(skriptPfad: string): boolean {
  const quelle = readFileSync(skriptPfad, 'utf8')
  return quelle.includes('__schlangentanzFixture') || /\?phase=/.test(quelle)
}
