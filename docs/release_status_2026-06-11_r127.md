# R127 Release-Nachweis — Spielerübersicht-Copy spielerfreundlicher

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R127 — die Spielerübersicht zeigt Namen und verständliche Status-/Aufgaben-Copy statt roher Spieler- und Schlangen-IDs.

## Resume-Befund

Der Cron-Lauf fand einen halbfertigen, dirty Worktree auf `main` bei `b46a26b` / `origin/main`:

- geänderte UI-/Copy-Tests und `src/App.tsx`
- neue untracked Testdatei `src/App.r127_spieleruebersicht_copy.test.tsx`
- kein laufender projektspezifischer Claude-/Codex-/Vercel-/Testprozess

Daher wurde kein neuer Slice begonnen, sondern der angefangene R127-Slice fertiggestellt.

## Scope

R127 ist ein kleiner UI-/Copy-Slice:

- Bereich: `Spielerübersicht` / Debuggruppe `Spielerstatus`.
- Änderung: Spielerzeilen zeigen `Spieler 1: ...` statt `Spieler spieler-1: Spieler 1 (Mensch) ...`.
- Änderung: die alte Roh-ID-Zeile `Schlangen von spieler-X: schlange-id (...)` entfällt.
- Änderung: erfüllte Aufgaben werden als `{Spielername} — erfüllte Aufgaben: ...` angezeigt.
- Erhalten: spielerfreundliche Schlangenstatus-Zeilen `Schlange N von Spieler M: ...`.
- Bewusst nicht geändert: Engine-Regeln, Scoring, Aktionslogik, Drag-and-Drop, Layout-/CSS-Struktur, produktive Schlangenbereich-Roh-IDs außerhalb des Zielbereichs.

## TDD / Regressionen

RED/Resume-Härtung:

- Neue Testdatei `src/App.r127_spieleruebersicht_copy.test.tsx` schützt die Spielerübersicht gegen rohe `spieler-*`-IDs, interne `(Mensch)/(KI)`-Steuerungs-Copy, rohe R127-Schlangen-IDs und alte Aufgaben-/Schlangen-Copy.
- R121/R35/R39/R48/R57/R69/App-Basistests wurden auf die neue spielerfreundliche Copy angepasst.
- Codex fand, dass R100/R102/R103/R104 durch die Copy-Anpassung ihre konkrete Schlangenhäutung-Reihenfolge-Coverage verloren hatten; die Tests prüfen nun zusätzlich die Kartenreihenfolge im sichtbaren `Schlangenbereich`.

GREEN:

- `src/App.tsx` rendert im Spielerstatus Namen, verständliche Schlangenanzahl und Aufgaben-Copy statt roher Spieler-/Schlangen-IDs.
- Die bestehenden Schlangenstatus-Zeilen bleiben sichtbar und verwenden laufende Nummern pro Spieler.

## Claude Code / Simplify

- Vorgeschriebener `/simplify`-Pass wurde über das `claudeuser`-Pattern versucht.
- Blocker: Claude Code Auth antwortete mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da der Slice bereits als kleiner mechanischer UI-Copy-Worktree vorlag, wurde gemäß Fallback-Regel objektiv verifiziert, manuell minimal entstört und vollständig durch Codex Review sowie lokale/Production-Gates abgesichert.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R127-Testdatei:

- Erstes Review fand Blocker: verlorene Schlangenhäutung-Reihenfolge-Coverage in R100/R102/R103/R104.
- Nach Fix: Re-Review fand Blocker zu zu enger negativer ID-Coverage und R69-Dateikopf.
- Finales Re-Review:
  - `BLOCKERS: Keine.`
  - `NON-BLOCKERS`: bestätigte ID-Coverage in R121/R127, bereinigten R69-Dateikopf und grüne Fokustests.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r127_spieleruebersicht_copy.test.tsx src/App.r121_spielerstatus_copy.test.tsx src/App.test.tsx src/App.r35.test.tsx src/App.r39.test.tsx src/App.r48.test.tsx src/App.r57.test.tsx src/App.r69.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.f10_debuggruppen.test.tsx`
- Ergebnis: 13 Testdateien / 41 Tests grün.

Full Gates:

- `npm test -- --run`
  - 134 Testdateien grün.
  - 615 Tests grün.
- `npm run typecheck`
  - grün.
- `npm run lint`
  - grün.
- `npm run check:test-lines`
  - `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build`
  - `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-D2NQ8a1f.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check`
  - grün.

## Git / GitHub

Feature-Commit:

- `f5ec53c R127: Spielerübersicht-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy:

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

R127-spezifischer Browser-Smoke:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- `Spielerübersicht` sichtbar.
- `Spieler 1:` und `Spieler 2:` sichtbar.
- Keine alte `spieler-*`-ID-Copy im Zielbereich.
- Keine alte `Schlangen von spieler-*`-Copy im Zielbereich.
- Keine alte `Erfüllte Aufgaben spieler-*`-Copy im Zielbereich.
- Keine interne `(Mensch)`-/`(KI)`-Steuerungs-Copy im Zielbereich.
- `consoleErrors: []`.
- `pageErrors: []`.
- Ergebnis: `R127 Production-Smoke bestanden`.

## Finaler Status

R127 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gegen den stabilen Production-Alias verifiziert.

Der nächste Resume-Lauf prüft vor einem neuen Slice wieder zuerst Hänger, lokale Änderungen, Push-/Deploy-Stand und Smoke-Evidenz.

## Nächster kleiner Schritt nach R127

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
