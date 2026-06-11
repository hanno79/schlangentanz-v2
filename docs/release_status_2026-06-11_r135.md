# R135 Release-Nachweis — Aktionenquelle spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R135 — der Aktionenbereich zeigt keinen internen Engine-Funktionsnamen mehr als sichtbare Quelle, sondern einen spielerfreundlichen Regelprüfhinweis.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `2ef5ed3`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R134 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-/A11y-Slice begonnen.

## Scope

R135 ist ein enger UI-/Copy-Härtungsslice:

- Bereich: `Aktionen` → `Weitere Aktionen`.
- Änderung: Die sichtbare Diagnose-/Implementierungszeile `Quelle: engine.ermittleLegaleAktionen` wurde durch `Spielregeln prüfen jede Aktion vor dem Ausführen.` ersetzt.
- Erhalten: Anzahl und konkrete Aktionsbuttons, empfohlene Aktion, weitere Aktionen und Phasenaktion bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, kein Layout-Umbau, keine neue Interaktion.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r135_aktionenquelle_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r135_aktionenquelle_copy.test.tsx` schlug erwartungsgemäß fehl, weil die neue Spieler-Copy fehlte und noch `Quelle: engine.ermittleLegaleAktionen` gerendert wurde.

GREEN:

- `src/components/AktionenPanel.tsx` rendert in `Weitere Aktionen` jetzt `Spielregeln prüfen jede Aktion vor dem Ausführen.`.
- `src/App.f6_aktionenbereich.test.tsx` wurde auf die neue Copy sowie negative `Quelle:`-/`engine.ermittleLegaleAktionen`-Assertions aktualisiert, behält aber die Struktur- und Button-Coverage.
- `src/App.test.tsx` wurde nach einem Full-Suite-Fund ebenfalls von der stale positiven Quelle-Assertion auf die neue Copy und negative Absicherung umgestellt.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R135 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Eine echte Claude-`/simplify`-Vorprüfung wurde vor und nach dem `App.test.tsx`-Nachzug versucht und scheiterte am selben Auth-Blocker. Danach wurden Diff, fokussierte Tests, Codex-Review, Full Gates und Live-Smokes objektiv geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked Dateien:

1. Erstes Review:
   - `BLOCKERS: Keine.`
   - `NON-BLOCKERS: Keine.`
   - Verifikation durch Codex: `npm test -- --run src/App.f6_aktionenbereich.test.tsx src/App.r135_aktionenquelle_copy.test.tsx` → 2 Testdateien / 3 Tests grün.
2. Nach Full-Suite-Fund in `src/App.test.tsx`:
   - Re-Review Scope inklusive `src/App.test.tsx`.
   - `BLOCKERS: Keine.`
   - `NON-BLOCKERS: Keine.`
   - Verifikation durch Codex: `npm test -- --run src/App.test.tsx src/App.f6_aktionenbereich.test.tsx src/App.r135_aktionenquelle_copy.test.tsx` → 3 Testdateien / 29 Tests grün.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r135_aktionenquelle_copy.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen alter Quelle-Copy.
- Nach Fix: `npm test -- --run src/App.r135_aktionenquelle_copy.test.tsx src/App.f6_aktionenbereich.test.tsx` → 2 Testdateien / 3 Tests grün.
- Nach stale Broad-Test-Fix: `npm test -- --run src/App.test.tsx src/App.r135_aktionenquelle_copy.test.tsx src/App.f6_aktionenbereich.test.tsx` → 3 Testdateien / 29 Tests grün.

Full Gates:

- `npm test -- --run` → 141 Testdateien / 623 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-CGbKi-Kb.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 485 Zeilen.
  - `src/App.test.tsx`: 494 Zeilen.
  - `src/components/AktionenPanel.tsx`: 262 Zeilen.
  - `src/App.f6_aktionenbereich.test.tsx`: 47 Zeilen.
  - `src/App.r135_aktionenquelle_copy.test.tsx`: 28 Zeilen.

## Git / GitHub

Feature-Commit:

- `4f0cd8f R135: Aktionenquelle spielerfreundlich benennen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

R107 Production-Smoke:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Kernregionen sichtbar:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- Ergebnis: `R107 Production-Smoke bestanden`.

R135 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/game`: HTTP 200.
- Sichtbar: `Spielregeln prüfen jede Aktion vor dem Ausführen.`.
- Negative Live-Prüfung: `Quelle:` und `engine.ermittleLegaleAktionen` sind im Bereich `Weitere Aktionen` nicht sichtbar.
- Weitere-Aktionen-Buttons bleiben sichtbar (`1` Button im erreichten Startzustand).
- Keine Console-/Page-Errors.

## Finaler Status

R135 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R135

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
