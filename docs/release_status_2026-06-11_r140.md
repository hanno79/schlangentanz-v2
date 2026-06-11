# R140 Release-Nachweis — Empfohlene Aktion spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R140 — die Aktiver-Spieler-Entwicklungsdaten zeigen die nächste spielbare Aktion als `Empfohlene Aktion` statt als technische Legalitätsdiagnose `Nächste legale Aktion`.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `eb72bfb`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R139 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-Härtungsslice begonnen.

## Scope

R140 ist ein enger UI-/Copy-Slice:

- Bereich: `Aktiver Spieler` → Entwicklungsdaten-Gruppe `Aktiver Spieler`.
- Änderung: `Nächste legale Aktion: ...` wird zu `Empfohlene Aktion: ...`.
- Erhalten: Engine-State, Regeln, Aktionslabels, Spielerführung, Aktionenpanel, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine Änderung an der Reihenfolge legaler Aktionen, kein neuer Interaktionsfluss.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r140_empfohlene_aktion_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r140_empfohlene_aktion_copy.test.tsx` schlug erwartungsgemäß fehl: erwartet war `Empfohlene Aktion: Neue Schlange starten mit Karte blau-01`, gerendert wurde noch die alte `Nächste legale Aktion`-Copy.

GREEN:

- `src/App.tsx` rendert die Aktiver-Spieler-Zeile jetzt als `Empfohlene Aktion: {empfohleneAktionLabel}`.
- `src/App.r52.test.tsx`, `src/App.r54.test.tsx` und nach Codex-Fund `src/App.f14_spielerfuehrung.test.tsx` wurden auf die neue Copy nachgezogen und sichern die alte Copy negativ ab.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Separate Claude-`/simplify`-Vorprüfungen vor und nach dem Codex-Fix wurden versucht und scheiterten am selben Auth-Blocker.
- Da R140 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R140-Testdatei:

- Initialer `BLOCKERS`-Fund: `src/App.f14_spielerfuehrung.test.tsx` enthielt noch eine stale positive Erwartung `Nächste legale Aktion: Neue Schlange starten mit Karte blau-01`.
- Der Blocker wurde als reproduzierender failing Test bestätigt (`npm test -- --run src/App.f14_spielerfuehrung.test.tsx` → 1 Test fehlgeschlagen), dann im selben Slice korrigiert.
- Finaler Codex Re-Review: `BLOCKERS: Keine.`; `NON-BLOCKERS` nur Verifikationsnotizen zum behobenen stale Test, minimalem Scope und untracked R140-Test.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r140_empfohlene_aktion_copy.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen alter Copy.
- Review-RED: `npm test -- --run src/App.f14_spielerfuehrung.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen stale positiver Test-Copy.
- Nach Fix: `npm test -- --run src/App.r140_empfohlene_aktion_copy.test.tsx src/App.r52.test.tsx src/App.r54.test.tsx src/App.f14_spielerfuehrung.test.tsx` → 4 Testdateien / 6 Tests grün.

Full Gates:

- `npm test -- --run` → 146 Testdateien / 634 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-ClkB14IV.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Dateien:
  - `src/App.tsx`: 496 Zeilen.
  - `src/App.r140_empfohlene_aktion_copy.test.tsx`: 26 Zeilen.
  - `src/App.r52.test.tsx`: 37 Zeilen.
  - `src/App.r54.test.tsx`: 53 Zeilen.
  - `src/App.f14_spielerfuehrung.test.tsx`: 71 Zeilen.

## Git / GitHub

Feature-Commit:

- `629b2f2 R140: Empfohlene Aktion spielerfreundlich benennen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

R140 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Slice-spezifisch sichtbar im Bereich `Aktiver Spieler`: `Empfohlene Aktion: Neue Schlange starten mit Karte ...`.
- Negative Live-Prüfung: keine sichtbare stale Copy `Nächste legale Aktion:` im Bereich `Aktiver Spieler`.
- Keine Console-/Page-Errors.
- Ein erster zu enger Smoke auf `... Karte blau-01` wurde nach DOM-Inspektion korrigiert, weil die Production-Startkarten zufällig variieren; der finale Smoke prüft deshalb die stabile semantische Copy unabhängig von der konkreten Karten-ID.

## Finaler Status

R140 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R140

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
