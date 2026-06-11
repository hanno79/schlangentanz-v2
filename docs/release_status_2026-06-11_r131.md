# R131 Release-Nachweis — Endrunden-Copy spielerfreundlicher

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R131 — der Endrunden-Spielstatus zeigt Spielernamen statt roher `spieler-*`-IDs.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `e4039e4`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer Claude-/Codex-/Vercel-/Testprozess.
- Keine offene tentative Release-Doku; R130 war final synchronisiert.

Daher wurde der nächste kleine sichere UI-/Copy-Slice begonnen.

## Scope

R131 ist ein kleiner UI-/Copy-Slice:

- Bereich: `Spielstatus` → Entwicklungsdaten-Gruppe `Spielphase`.
- Änderung: `Endrunde ausgelöst durch …` und `Verbleibende Endrunde …` nutzen Spielernamen (`Spieler 1`, `Spieler 2`, `Spieler 3`) statt roher `spieler-*`-IDs.
- Erhalten: Engine-Endrundenlogik, No-Draw-Regel, Spielphasen, Layout/CSS und Interaktionen.

## TDD / Regressionen

RED:

- Neue Testdatei `src/App.r131_endrunde_spielernamen.test.tsx` fiel zunächst erwartungsgemäß fehl:
  - Erwartet: `Endrunde ausgelöst durch: Spieler 2`.
  - Live gerendert wurde noch `Endrunde ausgelöst durch: spieler-2` und `Verbleibende Endrunde: spieler-1`.

GREEN:

- `src/App.tsx` rendert Endrunden-Auslöser und verbleibende Endrunden-Spieler über `zustand.spieler[index].name` statt `.id`.
- `src/App.r131_endrunde_spielernamen.test.tsx` prüft den Mehrspieler-Listenfall `Spieler 3, Spieler 1` und eine negative `spieler-*`-Assertion im `Spielstatus`.
- Bestehende Endrunden-Regressionen wurden auf die neue Copy nachgezogen:
  - `src/App.f21_endspurt_status.test.tsx`
  - `src/App.r63.test.tsx`
  - `src/App.test.tsx`

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass und mehrere separate `/simplify`-Vorprüfungen wurden über das `claudeuser`-Pattern versucht.
- Blocker: Claude Code Auth antwortete jeweils mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R131 ein enger mechanischer UI-Copy-Slice war und der RED-Test eindeutig war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Nach jedem fehlgeschlagenen `/simplify`-Versuch wurden fokussierte Tests erneut durch Hermes verifiziert.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R131-Testdatei:

- Initiale Codex-Non-Blocker: zusätzliche negative Assertions in `App.test.tsx` und ein pluraler Verbleibende-Endrunde-Fall im R131-Test.
- Beide Findings wurden testseitig nachgezogen.
- Full-Gate-Fund: `src/App.r63.test.tsx` enthielt noch stale positive raw-ID-Erwartungen; diese Regression wurde ebenfalls nachgezogen.
- Finaler Codex-Re-Review:
  - `BLOCKERS: Keine.`
  - `NON-BLOCKERS: Keine.`
  - Codex-Verifikation: 4 betroffene App-Testdateien / 31 Tests bestanden.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r131_endrunde_spielernamen.test.tsx` → 1 Test fehlgeschlagen wegen raw `spieler-*`-Copy.
- Nach Fix und Testnachzug: `npm test -- --run src/App.r63.test.tsx src/App.r131_endrunde_spielernamen.test.tsx src/App.f21_endspurt_status.test.tsx src/App.test.tsx` → 4 Testdateien / 31 Tests grün.

Full Gates:

- `npm test -- --run` → 138 Testdateien / 619 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-BMHzvpZG.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 484 Zeilen.
  - `src/App.test.tsx`: 492 Zeilen.
  - `src/App.r131_endrunde_spielernamen.test.tsx`: 37 Zeilen.

## Git / GitHub

Feature-Commit:

- `1dea7eb R131: Endrunden-Copy spielerfreundlicher machen`

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

R131 Slice-Smoke-Einordnung:

- Der Endrunden-Zielzustand ist in der Production-App nicht über eine kurze, stabile Smoke-Sequenz deterministisch erreichbar, ohne eine komplette oder künstlich präparierte Partie zu erzwingen.
- Deshalb wird die R131-Endrunden-Copy nicht als vollständig live-erreichte Endzustandsprüfung behauptet.
- Die sichtbare Endrunden-Copy ist lokal/regressiv über DOM-Tests gegen gezielte Endspurt-Zustände verifiziert.
- Production-Gesundheit des finalen Builds wurde über den stabilen Alias, `/game`, Kernregionen und Console-/Page-Error-Sauberkeit geprüft.

## Finaler Status

R131 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheitsgesmoked. Die slice-spezifische Endrunden-Copy ist lokal per DOM-Regression verifiziert; ein vollständiger Live-Endrunden-Endzustand wurde in diesem Lauf nicht erzwungen.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R131

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
