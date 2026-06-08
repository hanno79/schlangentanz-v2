# R121 Release-Nachweis — Spielerstatus-Copy spielerfreundlicher

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-08

## Ziel

R121 setzt den nächsten kleinen UI-Copy-Slice nach R120 um:

- Der Entwicklungsdaten-Bereich `Spielerstatus` bleibt technisch als einklappbarer Nebenbereich erhalten.
- Sichtbare Spielerstatus-Zeilen verwenden spielerfreundlichere Bezeichnungen statt interner Übersichts-/Zustands-Copy.
- Keine Engine-, Regel-, CSS-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - `Spielerübersicht {id}:` → `Spieler {id}:`.
  - `Schlangenübersicht {id}:` → `Schlangen von {id}:`.
  - `Schlangenzustand {spieler}/{schlange}:` → `Status von Schlange {spieler}/{schlange}:`.
  - `Schlangen gesamt:` → `Schlangen insgesamt:`.
  - `Handkarten gesamt:` → `Handkarten insgesamt:`.
- `src/App.r121_spielerstatus_copy.test.tsx`
  - neuer R121-Regressionstest.
  - prüft die neuen Spielerstatus-Zeilen positiv im Landmark `Entwicklungsdaten: Spielerstatus`.
  - prüft die alten internen Spielerstatus-Begriffe negativ.
- Bestehende UI-Regressionstests wurden nur konsistent an die neue Copy angepasst; ihre Engine- und UI-Verantwortung bleibt erhalten.

## RED/GREEN

- RED:
  - neuer Test `src/App.r121_spielerstatus_copy.test.tsx` geschrieben.
  - Erwarteter Fehlschlag: alte Spielerstatus-Copy war noch sichtbar.
- GREEN:
  - Copy in `src/App.tsx` minimal geändert.
  - `/simplify` wurde ausgeführt.
  - Full Gate fand stale Test-Erwartungen; diese wurden auf die neue Copy aktualisiert.

## Review

- Codex Review-only auf aktuellem uncommitted Worktree inklusive untracked R121-Test:
  - erster Befund: Blocker durch stale Assertions in bestehenden Tests.
- Codex Recheck nach Test-Fix:
  - `BLOCKERS: keine`.
  - `NON-BLOCKERS: keine`.
  - Keine stale Copy, kein Scope Creep, keine Accessibility-/Name-Regression und keine Test-Abschwächung gefunden.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run
npm run lint
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- Full Suite grün: 128 Testdateien / 607 Tests.
- Lint grün.
- Build grün.
- Testdateilängencheck grün: Alle Testdateien bleiben unter 500 Zeilen.
- `git diff --check` grün.

## Geänderte Dateien

- `src/App.tsx`
- `src/App.r121_spielerstatus_copy.test.tsx`
- `src/App.test.tsx`
- `src/App.f10_debuggruppen.test.tsx`
- `src/App.r35.test.tsx`
- `src/App.r36.test.tsx`
- `src/App.r45.test.tsx`
- `src/App.r46.test.tsx`
- `src/App.r48.test.tsx`
- `src/App.r57.test.tsx`
- `src/App.r75.test.tsx`
- `src/App.r100_schlangenhaeutung_umkehren.test.tsx`
- `src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx`
- `src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx`
- `src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx`
- `docs/release_status_2026-06-08_r121.md`

## Release

Feature-Commit:

- `e79f84a R121: Spielerstatus-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

Vercel Production-Deploy:

- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Status: `READY` und auf den stabilen Production-Alias gesetzt.
- Ephemere Deploy-URL: `https://schlangentanz-v2-axnqxv2h8-alfreds-projects-7e9df1b4.vercel.app`

Production-Smoke:

```bash
npm run smoke:production
node .tmp_r121_live_smoke.mjs
```

Ergebnis:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Sichtbare Browser-Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- R121-spezifischer Browser-Smoke:
  - `Entwicklungsdaten: Spielerstatus` sichtbar.
  - neue Spielerstatus-Copy sichtbar: `Spieler spieler-1:`, `Schlangen von spieler-1:`, `Schlangen insgesamt:`, `Handkarten insgesamt:`.
  - alte Spielerstatus-Copy nicht sichtbar: `Spielerübersicht spieler-1:`, `Schlangenübersicht spieler-1:`, `Schlangenzustand spieler-1/`, `Schlangen gesamt:`, `Handkarten gesamt:`.
  - First-turn E2E klickte eine echte Aktion: `Neue Schlange starten mit Karte blau-03`.
  - `Schlangenbereich` änderte sich sichtbar.
  - `consoleErrors: []`.
  - `pageErrors: []`.
- `R107 Production-Smoke bestanden`.
- `R121 Production-Smoke bestanden`.

## Finalisierung

- Release-Dokumentation nach Feature-Deploy und Smoke erstellt.
- Diese Dokumentation ist Teil des finalen Doku-Sync-Commits.
- Nach Doku-Synchronisierung wird erneut gepusht, Production deployed und live gesmoked, damit `origin/main`, `HEAD` und Production denselben finalen Stand abbilden.

## Nächster kleiner Schritt nach R121

Weiterhin autonom in kleinen sicheren UI-/Copy-Slices fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
