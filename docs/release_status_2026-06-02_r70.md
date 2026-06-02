# Release-Status R70 — Regenbogenschlange als Wildcard in der Farbgruppenwertung

- Datum: 02.06.2026
- Ziel: Die Regenbogenschlange als erste Sonderkarte schrittweise in der Wertungslogik abbilden.
- Ergebnis: `src/engine/scoring.ts` wertet Regenbogenschlangen als Wildcard mit 0 Punkten und ermittelt die bestmögliche Farbzuordnung pro Schlange.
- Dokumentation: `docs/GAME_SPEC.md` präzisiert die Ausnahme für Sonderkarten bei Farbgruppen.
- Verifikation:
  - `npm test -- --run src/engine/__tests__/player_scoring.test.ts` ✅
  - `npm test -- --run` ✅ — 49 Testfiles, 293 Tests
  - `npm run typecheck` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
- Hinweis: Andere Sonderkarten unterbrechen Farbgruppen weiterhin normal; die Regenbogenschlange ist die erste explizit ausgenommene Sonderregel.
