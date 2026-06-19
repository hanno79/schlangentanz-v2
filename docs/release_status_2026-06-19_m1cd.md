# Release-Status — 19.06.2026 — M1cd Waldtanz-Startgarten

## Status

Release vollständig auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cd ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die leere eigene Schlangenlichtung auf `/game` ist jetzt ein körperlicher `Startgarten` links neben dem Startkreis/den Startfährten, statt als nackte Textzeile unter einem runden Button zu wirken. Engine-Regeln, Aktionsausführung, Drag-and-drop, Handkarten und Startkreis-Interaktion bleiben unverändert.

## Verifikation

- RED-Proof gegen clean `HEAD` in temporärem Worktree: neuer M1cd-Test schlug erwartungsgemäß fehl (`Leerer Startgarten` fehlte; alte Grid-Spalten `7.5rem/0.38fr`).
- Targeted/Adjacent: `npm test -- --run src/App.m1cd_waldtanz_startgarten.test.tsx src/App.m1ca_waldtanz_schlangenlichtung.test.tsx src/App.m1cb_waldtanz_zielranken.test.tsx` → 3 Testdateien / 7 Tests bestanden.
- Browser lokal: `SMOKE_BASE_URL=http://127.0.0.1:5173 node scripts/m1cd_startgarten_smoke.mjs` → 900px und 1280px bestanden; Startgarten/Startzone getrennt, Startkreis und Handkarte hit-testbar.
- Smoke-Blocker nach Feature-Deploy: `npm run smoke:production` fand eine M1cb-Zielranken/Handbank-Überlappung. Fix `358849b` erhöhte den route-scoped Zielranken-Abstand auf `1.75rem`; M1cb- und M1cd-Smokes danach lokal grün.
- Full Gates nach Smoke-Fix: `npm test -- --run` → 294 Testdateien / 895 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Codex Review/Re-Review: Initial `BLOCKERS: None`; CSS-Duplizierungs-Non-Blocker behoben. Smoke-Fix-Re-Review: `BLOCKERS: None`, Fix als eng und route-scoped bestätigt.
- Production Deploy/Smoke: Feature-Commit `2d796d5` und Smoke-Fix `358849b` wurden nach `origin/main` gepusht und per Vercel Production bereitgestellt. Finaler Alias-Smoke bestätigt `/` und `/game` HTTP 200, `R107 Production-Smoke bestanden`, M1bx/M1by/M1bz/M1ca/M1cb/M1cc und neu `M1cd Startgarten 900px/1280px`; keine Console-/Page-Errors.

## Abweichung vom Standard-Agentenfluss

Claude Code mit `--model opusplan` blieb in dieser Cron-Session durch `401 Invalid authentication credentials` blockiert; der Slice wurde als enger manueller Fallback fertiggestellt, mit RED-Proof, Codex Review/Re-Review, Full Gates, Deploy und Live-Smoke.

## Nächste mittlere Lücke

Als nächster M1-Vertical bietet sich an, den ersten tatsächlichen Startzug nach dem Startgarten weiter zu verdichten: Startkarte → entstehende eigene Schlange → Zielranken/Startkreis sollten als eine zusammenhängende Brettentscheidung lesbar werden, ohne neue Engine-Regeln einzuführen.
