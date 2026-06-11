# R136 Release-Nachweis — Schlangenstatus am Spieltisch spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R136 — Schlangenkarten im Spieltisch zeigen ihren Zustand als spielerfreundlichen Status statt roher Engine-Zustandswerte.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `ef5f6c6`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R135 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-/A11y-Slice begonnen.

## Scope

R136 ist ein enger UI-/Copy-Härtungsslice:

- Bereich: `Spieltisch` → `Schlangenbereich` → eigene und gegnerische Schlangenkarten.
- Änderung: Sichtbare `Zustand: aktiv|blockiert|geschuetzt`-Copy wurde durch `Status: spielbereit|gerade blockiert|geschützt` ersetzt.
- Erhalten: Kartenreihen, Startzone, Anlege-/Drag&Drop-Interaktionen, Schlangen- und Karten-IDs sowie Engine-Regeln bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, kein Layout-Umbau, keine neue Interaktion, keine breite ID-/Kartennamen-Bereinigung.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r136_spieltisch_schlangenstatus_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r136_spieltisch_schlangenstatus_copy.test.tsx` schlug erwartungsgemäß fehl, weil im `Spieltisch` noch keine `Status: spielbereit`-Copy sichtbar war und rohe `Zustand:`-Werte gerendert wurden.

GREEN:

- `src/components/Schlangenbereich.tsx` nutzt jetzt `schlangenStatusLabel(...)` für eigene und gegnerische Schlangenkarten.
- Der Test prüft die konkrete `Spieltisch`-Region, deckt eigene und gegnerische Schlangen ab und enthält eine negative stale-copy Assertion gegen `Zustand: aktiv|blockiert|geschuetzt`.
- Nach Codex-Review wurde das Mapping als exhaustiver `switch` mit `never`-Absicherung gehärtet.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R136 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Eine echte Claude-`/simplify`-Vorprüfung wurde vor und nach dem Codex-Finding-Fix versucht und scheiterte am selben Auth-Blocker. Danach wurden Diff, fokussierte Tests, Codex-Review, Full Gates und Live-Smokes objektiv geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked Dateien:

1. Erstes Review:
   - `BLOCKERS: keine`.
   - `NON-BLOCKERS`: Test deckte gegnerische Schlangen noch nicht direkt ab; Mapping hatte impliziten Fallback.
2. Nach Test-/Mapping-Härtung:
   - Re-Review Scope: `src/components/Schlangenbereich.tsx`, `src/App.r136_spieltisch_schlangenstatus_copy.test.tsx`.
   - `BLOCKERS: keine`.
   - `NON-BLOCKERS: keine`.
   - Verifikation durch Codex: `npm test -- src/App.r136_spieltisch_schlangenstatus_copy.test.tsx --run` → 1 Testdatei / 1 Test grün.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r136_spieltisch_schlangenstatus_copy.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen fehlender neuer Status-Copy.
- Nach Fix: `npm test -- --run src/App.r136_spieltisch_schlangenstatus_copy.test.tsx src/App.r126_schlangenstatus_copy.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 3 Testdateien / 3 Tests grün.
- Nach Review-Findings: gleicher fokussierter Gate plus `npm run typecheck` → grün.

Full Gates:

- `npm test -- --run` → 142 Testdateien / 624 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-D_QTDrce.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/components/Schlangenbereich.tsx`: 383 Zeilen.
  - `src/App.r136_spieltisch_schlangenstatus_copy.test.tsx`: 43 Zeilen.

## Git / GitHub

Feature-Commit:

- `c308608 R136: Schlangenstatus am Spieltisch spielerfreundlich benennen`

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

R136 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- Smoke führte im Live-Browser eine `Neue Schlange starten`-Aktion aus.
- Sichtbar im `Spieltisch`: `Status: spielbereit`.
- Negative Live-Prüfung: keine sichtbare stale Copy `Zustand: aktiv|blockiert|geschuetzt` im `Spieltisch`.
- Keine Console-/Page-Errors.

## Finaler Status

R136 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R136

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
