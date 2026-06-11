# R130 Release-Nachweis — Punkteübersicht-Copy spielerfreundlicher

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R130 — die Entwicklungsdaten-Punkteübersicht zeigt Spielernamen statt roher Spieler-IDs.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `945b651`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer Claude-/Codex-/Vercel-/Testprozess.
- Keine offene tentative Release-Doku; R129 war final synchronisiert.

Daher wurde der nächste kleine sichere UI-/Copy-Slice begonnen.

## Scope

R130 ist ein kleiner UI-/Copy-Slice:

- Bereich: `Wertung` → Entwicklungsdaten-Gruppe `Punkteübersicht`.
- Änderung: `Punktestand von …` und `Punktequellen von …` nutzen sichtbare Spielernamen (`Spieler 1`, `Spieler 2`) statt roher `spieler-*`-IDs.
- Erhalten: Engine-Wertung, Scoring, Scoreboard, Gewinner-/Ergebnis-Copy, Spielerübersicht, Layout/CSS und Interaktionen.

## TDD / Regressionen

RED:

- Neue Testdatei `src/App.r130_punkteuebersicht_spielernamen.test.tsx` fiel zunächst erwartungsgemäß fehl:
  - `Punktestand von Spieler 1: 0 Punkte` wurde nicht gefunden.
  - Live gerendert wurde noch `Punktestand von spieler-1: 0 Punkte` und `Punktequellen von spieler-1: …`.

GREEN:

- `src/App.tsx` nutzt für die Punkteübersicht den bestehenden `spielerNameFuerId(...)`-Mapper.
- `src/App.r130_punkteuebersicht_spielernamen.test.tsx` prüft Spieler 1 und 2 positiv sowie stale raw-ID-Copy negativ.
- Bestehende UI-/Regressionstests wurden auf die neue Spielername-Copy nachgezogen:
  - `src/App.test.tsx`
  - `src/App.f8_scoreboard.test.tsx`
  - `src/App.f10_debuggruppen.test.tsx`
  - `src/App.r35.test.tsx`
  - `src/App.r48.test.tsx`
  - `src/App.r66.test.tsx`
  - `src/App.r119_entwicklungsdaten_inhalte.test.tsx`
  - `src/App.r124_punkteuebersicht_copy.test.tsx`

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass und mehrere separate `/simplify`-Vorprüfungen wurden über das `claudeuser`-Pattern versucht.
- Blocker: Claude Code Auth antwortete jeweils mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R130 ein enger mechanischer UI-Copy-Slice war und der RED-Test eindeutig war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Nach jedem fehlgeschlagenen `/simplify`-Versuch wurden fokussierte Tests/Lint erneut durch Hermes verifiziert.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R130-Testdatei:

- Initialer Codex-Blocker: bestehende Tests erwarteten noch stale `Punktestand/Punktequellen von spieler-1`.
- Blocker wurde testseitig behoben; zusätzlich wurden Full-Gate-Funde in `App.r35.test.tsx` und `App.r66.test.tsx` nachgezogen.
- Finaler Codex-Re-Review:
  - `BLOCKERS: Keine.`
  - `NON-BLOCKERS:` keine stale positive Punkteübersicht-raw-ID-Erwartung gefunden; R130 bleibt scope-konform.
  - Codex-Verifikation: 9 betroffene App-Testdateien / 35 Tests bestanden.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r130_punkteuebersicht_spielernamen.test.tsx` → 1 Test fehlgeschlagen wegen raw `spieler-*`-Copy.
- Nach Fix und Testnachzug: `npm test -- --run src/App.r35.test.tsx src/App.r66.test.tsx src/App.r130_punkteuebersicht_spielernamen.test.tsx src/App.r124_punkteuebersicht_copy.test.tsx src/App.f10_debuggruppen.test.tsx src/App.f8_scoreboard.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx src/App.r48.test.tsx src/App.test.tsx` → 9 Testdateien / 35 Tests grün.

Full Gates:

- `npm test -- --run` → 137 Testdateien / 618 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-BGto4uyk.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 484 Zeilen.
  - `src/App.test.tsx`: 488 Zeilen.
  - `src/App.r130_punkteuebersicht_spielernamen.test.tsx`: 31 Zeilen.

## Git / GitHub

Feature-Commit:

- `af6d38a R130: Punkteübersicht-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY`.
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

R130 Browser-Smoke:

- Playwright lud den stabilen Production-Alias `/game` im echten Browser.
- `/` und `/game` lieferten HTTP 200.
- Die Region `Wertung` und die `Entwicklungsdaten: Punkteübersicht` waren sichtbar.
- Sichtbar verifiziert:
  - `Punktestand von Spieler 1: 0 Punkte`
  - `Punktequellen von Spieler 1: Farbgruppen 0 Punkte, Aufgaben 0 Punkte`
- Negative Live-Prüfung: keine stale Copy `Punktestand von spieler-*` oder `Punktequellen von spieler-*` im erreichten Live-DOM.
- Ergebnis: `R130 Production-Smoke bestanden`.

## Finaler Status

R130 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias live verifiziert.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R130

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
