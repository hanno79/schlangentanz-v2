# R128 Release-Nachweis — Scoreboard-Copy spielerfreundlicher

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R128 — das sichtbare Scoreboard zeigt Spielernamen und Punkte ohne rohe Spieler-IDs.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `7036dfd`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer Claude-/Codex-/Vercel-/Testprozess.
- Keine tentative Release-Doku mit „lokal fertig“, „releasebereit“, „Smoke offen“ oder ähnlicher offener Sprache.

Daher wurde der nächste kleine sichere UI-/Copy-Slice begonnen.

## Scope

R128 ist ein kleiner UI-/Copy-Slice:

- Bereich: `Wertung` → sichtbares `Scoreboard`.
- Änderung: Scoreboard-Karten zeigen nur noch Spielernamen (`Spieler 1`, `Spieler 2`) statt `Spieler N (spieler-N)`.
- Erhalten: Gesamtpunkte, Farbgruppenpunkte und Aufgabenpunkte pro Spieler.
- Bewusst nicht geändert: Engine-Regeln, Scoring, Aktionslogik, CSS/Layout, Interaktionen, Debug-/Entwicklungsdaten im `Punkteübersicht`-Bereich, Gewinner-Copy.

## TDD / Regressionen

RED:

- Neue Testdatei `src/App.r128_scoreboard_copy.test.tsx` fiel zunächst erwartungsgemäß fehl:
  - erhaltenes Scoreboard enthielt `Spieler 1 (spieler-1)` und `Spieler 2 (spieler-2)`.

GREEN:

- `src/App.tsx` rendert im Scoreboard `spieler?.name ?? eintrag.spielerId` statt Name plus ID-Klammer.
- `src/App.f8_scoreboard.test.tsx` schützt weiterhin die bestehende F8-Abdeckung für Eintragsanzahl, `scoreboard-karte`, Gesamt-, Farbgruppen- und Aufgabenpunkte und ergänzt eine negative ID-Assertion pro Scoreboard-Eintrag.
- `src/App.r128_scoreboard_copy.test.tsx` schützt den sichtbaren Scoreboard-Bereich gegen rohe `spieler-*`-IDs und alte Klammer-Copy.

## Claude Code / Simplify

- Vorgeschriebener Claude-Code-GREEN-Pass und `/simplify`-Pass wurden über das `claudeuser`-Pattern versucht.
- Blocker: Claude Code Auth antwortete jeweils mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R128 ein enger mechanischer UI-Copy-Slice war und der RED-Test eindeutig war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und durch fokussierte Tests, Codex Review und Full Gates abgesichert.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R128-Testdatei:

- `BLOCKERS: Keine.`
- `NON-BLOCKERS: Keine.`
- Codex prüfte direkt `src/App.tsx`, `src/App.f8_scoreboard.test.tsx` und `src/App.r128_scoreboard_copy.test.tsx`; die Review bestätigte Scope, Scoreboard-Region-Scoping und erhaltene F8-Abdeckung.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r128_scoreboard_copy.test.tsx`
  - RED vor Fix: 1 Test fehlgeschlagen wegen roher `spieler-*`-IDs im Scoreboard.
- `npm test -- --run src/App.r128_scoreboard_copy.test.tsx src/App.f8_scoreboard.test.tsx src/App.r124_punkteuebersicht_copy.test.tsx src/App.test.tsx`
  - Ergebnis nach Fix: 4 Testdateien / 29 Tests grün.
- Nach fehlgeschlagenem `/simplify`-Auth-Versuch erneut:
  - `npm test -- --run src/App.r128_scoreboard_copy.test.tsx src/App.f8_scoreboard.test.tsx src/App.r124_punkteuebersicht_copy.test.tsx src/App.test.tsx`
  - `npm run lint -- --max-warnings=0`
  - Ergebnis: 4 Testdateien / 29 Tests grün; Lint grün.

Codex-Fokusverifikation:

- `npm test -- --run src/App.f8_scoreboard.test.tsx src/App.r128_scoreboard_copy.test.tsx`
  - Ergebnis: 2 Testdateien / 2 Tests grün.

Full Gates:

- `npm test -- --run`
  - 135 Testdateien grün.
  - 616 Tests grün.
- `npm run typecheck`
  - grün.
- `npm run lint`
  - grün.
- `npm run check:test-lines`
  - `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build`
  - `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-DLLt4Vpk.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check`
  - grün.
- Zeilenbudget:
  - `src/App.tsx`: 483 Zeilen.
  - `src/App.f8_scoreboard.test.tsx`: 66 Zeilen.
  - `src/App.r128_scoreboard_copy.test.tsx`: 33 Zeilen.

## Git / GitHub

Feature-Commit:

- `558291f R128: Scoreboard-Copy spielerfreundlicher machen`

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

R128-spezifischer Browser-Smoke:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- `Wertung` und `Scoreboard` sichtbar.
- Scoreboard enthält:
  - `Spieler 1`
  - `Spieler 2`
  - `Gesamt:`
  - `Farbgruppen:`
  - `Aufgaben:`
- Keine rohe `spieler-*`-ID-Copy im Scoreboard.
- Keine alte `Spieler N (spieler-N)`-Klammer-Copy im Scoreboard.
- `consoleErrors: []`.
- `pageErrors: []`.
- Ergebnis: `R128 Production-Smoke bestanden`.

## Finaler Status

R128 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gegen den stabilen Production-Alias verifiziert.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R128

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
