# Release Status 2026-06-03 R82 — Fusionsexperte-Aufgabenprüfung

Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: Release-Status für den R82-Slice zur ersten engine-seitigen Aufgabenprüfung für Fusionsexperte.

## Scope

- Engine-seitiger Aufgabenprüfungs-Durchstich für die offene Aufgabe `Fusionsexperte`.
- `Fusionsexperte` wird erfüllt, wenn der aktive Spieler eine eigene Schlange mit mindestens zwei echten `Farbenfusion`-Sonderkarten in `schlange.karten` besitzt.
- Verwaiste `farbenfusionen`-Metadaten ohne passende Karten erfüllen die Aufgabe nicht.
- Bei Erfüllung wird die Aufgabe aus der offenen Auslage entfernt, dem aktiven Spieler gutgeschrieben und bei vorhandenem `aufgabenStapel` ersetzt.

## Geänderte Dateien

- `src/engine/turnState.ts`
- `src/engine/__tests__/turn_state_r82_aufgaben.test.ts`

## Verifikation

- Targeted: `npm test -- --run src/engine/__tests__/turn_state_r82_aufgaben.test.ts src/engine/__tests__/farbenfusion.test.ts src/engine/__tests__/turn_state.test.ts` → 3 Testfiles / 74 Tests bestanden.
- Full Test: `npm test -- --run` → 57 Testfiles / 401 Tests bestanden.
- Typecheck: `npm run typecheck` → grün.
- Lint: `npm run lint` → grün.
- Build: `npm run build` → grün.
- Diff-Check: `git diff --check` → grün.
- Codex-Re-Review: `BLOCKERS: keine`, `NON-BLOCKERS: keine`.

## Release-Status

- Bereit für Commit, Push, Production-Deploy und Live-Smoke.
