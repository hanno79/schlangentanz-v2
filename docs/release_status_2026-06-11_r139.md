# R139 Release-Nachweis — Gegnerische Schlangen mit Spielernamen benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R139 — gegnerische Schlangenkarten im Spieltisch zeigen die Besitzer-Copy mit Spielernamen statt roher interner Spieler-ID.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `ddf4ce3`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R138 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-Härtungsslice begonnen.

## Scope

R139 ist ein enger UI-/Copy-Slice:

- Bereich: `Spieltisch` → `Schlangenbereich` → `Gegnerische Schlangen`.
- Änderung: gegnerische Schlangenkarten zeigen `Gehört zu: <Spielername>` statt `Spieler: <spieler-id>`.
- Erhalten: Engine-State, Regeln, Drag&Drop, Schlangen-/Karten-IDs, Status-Copy und Layout bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine Umbenennung von fachlichen IDs, kein neuer Interaktionsfluss.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx` schlug erwartungsgemäß fehl: erwartet war `Gehört zu: Spieler 2`, gerendert wurde `Spieler: spieler-2`.

GREEN:

- `src/components/Schlangenbereich.tsx` rendert in gegnerischen Schlangenkarten jetzt `spieler.name` mit der Spieler-Copy `Gehört zu:`.
- Der neue Test prüft die neue Copy und negativ die alte `Spieler: spieler-2`-Copy im konkreten Bereich `Gegnerische Schlangen`.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht und scheiterte am selben Auth-Blocker.
- Da R139 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R139-Testdatei:

- `BLOCKERS: Keine.`
- `NON-BLOCKERS: Keine.`
- Codex verifizierte zusätzlich die neue Testdatei direkt: `npm test -- --run src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx` → 1 Test bestanden.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen roher Spieler-ID-Copy.
- Nach Fix: `npm test -- --run src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx src/App.f13_spielbrett_layout.test.tsx src/App.r136_spieltisch_schlangenstatus_copy.test.tsx` → 3 Testdateien / 3 Tests grün.

Full Gates:

- `npm test -- --run` → 145 Testdateien / 633 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-D8HZ0HlZ.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Dateien:
  - `src/components/Schlangenbereich.tsx`: 383 Zeilen.
  - `src/App.r139_gegnerische_schlangen_spieler_copy.test.tsx`: 32 Zeilen.

Hinweis: Ein zusätzlicher vollständiger `src`-Zeilenscan meldete bestehende, in R139 nicht geänderte Engine-Dateien über 500 Zeilen (`src/engine/legalActions.ts`, `src/engine/serialization.ts`, `src/engine/turnState.ts`). Der projektübliche Gate `npm run check:test-lines` und alle geänderten R139-Dateien sind grün/unter Budget.

## Git / GitHub

Feature-Commit:

- `c1d32a5 R139: Gegnerische Schlangen mit Spielernamen benennen`

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

R139 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- Flow: neue Schlange mit Spieler 1 starten, Ausspielphase beenden, Aufgabenprüfung beenden, Zug beenden, dadurch Spieler 2 aktivieren.
- Sichtbar im `Spieltisch` → `Gegnerische Schlangen`: `Gehört zu: Spieler 1`.
- Negative Live-Prüfung: keine sichtbare stale Copy `Spieler: spieler-1` in `Gegnerische Schlangen`.
- Keine Console-/Page-Errors.

## Finaler Status

R139 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R139

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
