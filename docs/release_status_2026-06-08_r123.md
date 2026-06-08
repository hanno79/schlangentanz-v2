# R123 Release-Nachweis — Spielphase-Copy spielerfreundlicher

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-08

## Ziel

R123 setzt den nächsten kleinen sicheren UI-Copy-Slice nach R122 um:

- Der Entwicklungsdaten-Bereich `Spielphase` bleibt technisch als einklappbarer Nebenbereich erhalten.
- Sichtbare Spielphasen-Zeilen verwenden spielerfreundlichere Bezeichnungen statt interner Engine-/State-Copy.
- Keine Engine-, Regel-, CSS-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - `Zugphase:` → `Spielschritt im Zug:`.
  - `Spielphase:` → `Partiestatus:`.
  - `Spieler am Zug: X/Y` → `Am Zug: Spieler X von Y`.
  - `Aktueller Spielschritt:` bleibt sichtbar.
- `src/App.r123_spielphase_copy.test.tsx`
  - neuer R123-Regressionstest.
  - prüft die neuen Labels positiv im Landmark `Entwicklungsdaten: Spielphase`.
  - prüft alte Label-Anfänge negativ pro Spielphase-Zeile.
- Bestehende UI-Regressionstests wurden nur an die neue sichtbare Copy angepasst; Domain-State-Properties `zugphase` und `spielphase` bleiben unverändert.

## RED/GREEN

- RED:
  - neuer Test `src/App.r123_spielphase_copy.test.tsx` geschrieben.
  - Erwarteter Fehlschlag: neue spielerfreundliche Spielphase-Labels waren noch nicht sichtbar.
- GREEN:
  - Copy in `src/App.tsx` minimal geändert.
  - Stale Test-Erwartungen in bestehenden UI-Regressionen auf die neue Copy aktualisiert.
- `/simplify`:
  - Claude-Code-Simplify-Pass ausgeführt; keine zusätzliche Vereinfachung erforderlich.

## Review

- Unabhängiger Codex-Review auf aktuellem uncommitted Worktree inklusive untracked R123-Test:
  - Erster Review meldete nur, dass die Full Suite wegen alter `src/App.test.tsx`-Copy-Erwartungen noch nicht vollständig grün war.
  - Nach gezielter Testaktualisierung erneuter Review: `BLOCKERS: keine`, `NON-BLOCKERS: keine`.
  - Bestätigt: kein Scope Creep, keine versehentliche Fixture-Property-Umbenennung, keine alten sichtbaren Label-Anfänge außerhalb der Negativliste.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r123_spielphase_copy.test.tsx
npm test -- --run src/App.r123_spielphase_copy.test.tsx src/App.test.tsx src/App.f10_debuggruppen.test.tsx src/App.f22_spielende_status.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.r44.test.tsx src/App.r48.test.tsx src/App.r120_entwicklungsdaten_summary_titel.test.tsx src/App.r121_spielerstatus_copy.test.tsx src/App.r122_material_aufgaben_copy.test.tsx
npm test -- --run
npm run lint
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- R123-Zieltest grün: 1 Test.
- Fokussierte UI-/Copy-Regression grün: 10 Testdateien / 40 Tests.
- Full Suite grün: 130 Testdateien / 609 Tests.
- Lint grün.
- Build grün.
- Testdateilängencheck grün: Alle Testdateien bleiben unter 500 Zeilen.
- `git diff --check` grün.
- Relevante Dateigrößen: `src/App.tsx` 487 Zeilen, `src/App.test.tsx` 488 Zeilen, neuer R123-Test 47 Zeilen.

## Geänderte Dateien

- `src/App.tsx`
- `src/App.r123_spielphase_copy.test.tsx`
- `src/App.test.tsx`
- `src/App.f10_debuggruppen.test.tsx`
- `src/App.f22_spielende_status.test.tsx`
- `src/App.f9_zugfortschritt.test.tsx`
- `src/App.r44.test.tsx`
- `src/App.r48.test.tsx`
- `docs/release_status_2026-06-08_r123.md`

## Release

Feature-Commit:

- `cbf43b8 R123: Spielphase-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

Vercel Production-Deploy nach Feature-Commit:

- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Status: `READY` und auf den stabilen Production-Alias gesetzt.
- Ephemere Deploy-URL: `https://schlangentanz-v2-gcy99sh7f-alfreds-projects-7e9df1b4.vercel.app`

Production-Smoke nach Feature-Commit:

```bash
npm run smoke:production
node .tmp_r123_live_smoke.mjs
```

Ergebnis:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Sichtbare Browser-Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- R123-spezifischer Browser-Smoke:
  - `Entwicklungsdaten: Spielphase` sichtbar.
  - 4 neue Spielphase-Labels sichtbar.
  - 0 veraltete Spielphase-Label-Anfänge gefunden.
  - First-turn E2E klickte eine echte Aktion: `Neue Schlange starten mit Karte blau-04`.
  - `Schlangenbereich` änderte sich sichtbar.
  - `consoleErrors: []`.
  - `pageErrors: []`.
- `R107 Production-Smoke bestanden`.
- `R123 Production-Smoke bestanden`.

## Finalisierung

- Release-Dokumentation nach Feature-Deploy und Smoke erstellt.
- Diese Dokumentation ist Teil des finalen Doku-Sync-Commits auf `main`.
- Der aktuelle `main` wird danach erneut deployed und final live gesmoked, damit `origin/main`, Dokumentation und Production denselben Stand abbilden.

## Nächster kleiner Schritt nach R123

Autonom mit dem nächsten kleinen sicheren UI-/Copy-Slice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
