# R76 — Sonderkarten-Regelstatus abgesichert

Datum: 02.06.2026

## Ziel

Der nächste kleine Schritt war bewusst keine neue, geratene Kartenmechanik. Stattdessen wird die Spezifikation gehärtet, damit implementierte Sonderkartenwirkungen klar von noch offenen normalen Sonderkartenregeln getrennt sind.

## Ergebnis

- `docs/GAME_SPEC.md` enthält jetzt `R7.1 Umgesetzte Sonderkartenwirkungen` für:
  - Schlangengrube
  - Farbenschutz als Schutzmarker mit offener konkreter Schutzwirkung
  - Regenbogenschlange als 0-Punkte-Wildcard in der Wertungslogik
- `docs/GAME_SPEC.md` enthält jetzt `R7.2 Offene normale Sonderkartenwirkungen` für:
  - Schlangenfrass
  - Schlangenblockade
  - Farbendieb
  - Farbenfusion
  - Verdoppler
- Offene Sonderkartenwirkungen sind ausdrücklich nicht zu implementieren, solange kein User-Signoff oder keine verlässliche Normquelle vorliegt.
- `tests/spec_documentation.test.ts` erzwingt diesen Regelstatus, damit keine Wirkung aus dem Kartennamen geraten wird.

## Verifikation

- RED: `npm test -- --run tests/spec_documentation.test.ts` → zunächst 2 erwartete Fehlschläge wegen fehlendem R7.1/R7.2-Regelstatus.
- GREEN: `npm test -- --run tests/spec_documentation.test.ts` → 12 Tests bestanden.
- `/simplify`: keine weiteren Dateiänderungen nötig.
- Codex Review: keine Blocker; Non-Blocker zur engeren Negativabsicherung wurde umgesetzt.
- Codex Re-Review: keine Blocker und keine handlungsrelevanten Non-Blocker.
- Full tests: `npm test -- --run` → 51 Testfiles, 315 Tests bestanden.
- Typecheck: `npm run typecheck` bestanden.
- Lint: `npm run lint` bestanden.
- Build: `npm run build` bestanden.

## Noch auszuführen

- Commit / Push / Deploy / Smoke
