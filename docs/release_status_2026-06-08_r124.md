# R124 Release-Nachweis — Punkteübersicht-Copy spielerfreundlicher

Status: abgeschlossen, deployed und live verifiziert.
Datum: 2026-06-08

## Ziel

R124 setzt den nächsten kleinen sicheren UI-Copy-Slice nach R123 um:

- Der Entwicklungsdaten-Bereich `Punkteübersicht` bleibt als einklappbarer Nebenbereich erhalten.
- Sichtbare Wertungszeilen verwenden spielerfreundlichere Punktebegriffe statt technischer Wertungs-/Aufteilungs-Copy.
- Keine Engine-, Regel-, CSS-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - `Wertung {spielerId}: ...` → `Punktestand von {spielerId}: ...`.
  - `Punkteaufteilung {spielerId}: ...` → `Punktequellen von {spielerId}: ...`.
- `src/App.r124_punkteuebersicht_copy.test.tsx`
  - neuer R124-Regressionstest.
  - prüft neue Labels im Landmark `Entwicklungsdaten: Punkteübersicht`.
  - prüft alte Label-Anfänge im Zielbereich negativ.
- Bestehende UI-Regressionstests wurden nur an die neue sichtbare Copy angepasst.

## RED/GREEN/Simplify

- RED:
  - Neuer Test `src/App.r124_punkteuebersicht_copy.test.tsx` schlug erwartungsgemäß fehl, weil die neuen Punkte-Labels noch nicht sichtbar waren.
- GREEN:
  - Copy in `src/App.tsx` minimal geändert.
  - Stale UI-Test-Erwartungen konsistent aktualisiert.
- `/simplify`:
  - Claude Code `opusplan` lief über `claudeuser` erfolgreich.
  - Eine Testvereinfachung wurde übernommen: negative Labelprüfung nutzt Testing-Library-Query statt manueller `querySelectorAll('p')`-Auswertung.
  - Root-Claude-OAuth war 401, `claudeuser`-OAuth war funktionsfähig.

## Review

- Codex Review auf aktuellem uncommitted Worktree inklusive untracked R124-Test:
  - `BLOCKERS: keine`
  - `NON-BLOCKERS: keine`
- Review bestätigte: kein Scope Creep, keine Engine-/CSS-/Layout-/Interaktionsänderung, Header vorhanden, `App.tsx` unter 500 Zeilen.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r124_punkteuebersicht_copy.test.tsx
npm test -- --run src/App.r124_punkteuebersicht_copy.test.tsx src/App.test.tsx src/App.f8_scoreboard.test.tsx src/App.f10_debuggruppen.test.tsx src/App.r48.test.tsx src/App.r66.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx
npm test -- --run
npm run lint
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- R124-Zieltest grün: 1 Test.
- Fokussierte UI-/Copy-Regression grün: 7 Testdateien / 32 Tests.
- Full Suite grün: 131 Testdateien / 610 Tests.
- Lint grün.
- Build grün.
- Testdateilängencheck grün: Alle Testdateien bleiben unter 500 Zeilen.
- `git diff --check` grün.
- Relevante Dateigrößen: `src/App.tsx` 487 Zeilen, `src/App.test.tsx` 488 Zeilen, neuer R124-Test 41 Zeilen.

## Release

Feature-Commit:

- `c5454d5 R124: Punkteübersicht-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

Vercel Production-Deploy nach Feature-Commit:

- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Ephemere Deploy-URL: `https://schlangentanz-v2-8uctt5cuo-alfreds-projects-7e9df1b4.vercel.app`
- Status: `READY` und auf den stabilen Production-Alias gesetzt.

Production-Smoke nach Feature-Commit:

```bash
npm run smoke:production
node .tmp_r124_live_smoke.mjs
```

Ergebnis:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Sichtbare Browser-Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
  - `Wertung`
- R124-spezifischer Browser-Smoke:
  - `Entwicklungsdaten: Punkteübersicht` sichtbar.
  - 4 neue Punkte-Labels sichtbar.
  - 0 veraltete Punkte-Label-Anfänge gefunden.
  - First-turn E2E klickte eine echte Aktion: `Neue Schlange starten mit Karte gelb-12`.
  - `Schlangenbereich` änderte sich sichtbar.
  - `consoleErrors: []`.
  - `pageErrors: []`.
- `R107 Production-Smoke bestanden`.
- `R124 Production-Smoke bestanden`.

## Doku-Sync

Dieser Release-Nachweis wird nach dem Feature-Deploy als Doku-Sync-Commit auf `main` übernommen. Danach wird der aktuelle `main` erneut nach Production deployed und final live gesmoked, damit GitHub, Doku und Production synchron sind.

## Nächster kleiner Schritt nach R124

Autonom mit dem nächsten kleinen sicheren UI-/Copy-Slice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
