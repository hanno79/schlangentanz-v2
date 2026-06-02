# Release-Status R71 — Benannte Erweiterungssonderkarten als separates Material

- Datum: 02.06.2026
- Ziel: Die benannten Erweiterungssonderkarten für Schlangenhäutung und die übrigen Sondermaterialien als eigenständige Materialquelle bereitstellen, ohne den 32er-Basis-Sonderkartenstapel zu verändern.
- Ergebnis: `src/engine/deck.ts` bietet zusätzlich `erstelleErweiterungsSonderkarten()` an; `erstelleSonderkarten()` bleibt der generische 32er-Basisstapel.
- Tests: `src/engine/__tests__/engine.test.ts` prüft die 17 benannten Erweiterungskarten, und die betroffenen UI-Regressionstests bleiben auf die generischen Basis-Sonderkarten gehärtet.
- Verifikation:
  - `npm test -- --run src/engine/__tests__/engine.test.ts src/App.test.tsx src/App.r51.test.tsx` ✅
  - `npm test -- --run` ✅ — 49 Testfiles, 294 Tests
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
- Hinweis: Die Erweiterungskarten sind aktuell als separate Factory verfügbar; das Hauptdeck und die laufende Spiellogik bleiben unverändert.
