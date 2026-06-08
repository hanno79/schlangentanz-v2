# R119 Release-Nachweis — Entwicklungsdaten-Inhalte spielerfreundlicher

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-08

## Ziel

R119 setzt den nächsten kleinen UI-Copy-Slice nach R118 um:

- Entwicklungsdaten bleiben als technische Nebenbereiche erhalten.
- Interne Demo-/Detail-Labels in den Entwicklungsdaten-Inhalten werden durch verständlichere Spielbegriffe ersetzt.
- Keine Engine-, Regel-, CSS-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - `Engine-Demo:` → `Aktueller Spielschritt:`.
  - `Aktiver Spieler-Details:` → `Spielerprofil:`.
  - `Offene Aufgaben-Details:` → `Aufgabenziele:`.
  - `Wertungsdetails <spieler>:` → `Punkteaufteilung <spieler>:`.
- `src/App.r119_entwicklungsdaten_inhalte.test.tsx`
  - neuer R119-Regressionstest.
  - prüft die neuen spielerfreundlichen Entwicklungsdaten-Labels.
  - prüft, dass die alten internen Begriffe in den Entwicklungsdaten nicht mehr sichtbar sind.
- Bestehende UI-Regressionstests wurden nur auf die neuen Labels aktualisiert; ihre Struktur-/Inhaltsverträge bleiben erhalten.

## RED/GREEN

- RED:
  - neuer Test `src/App.r119_entwicklungsdaten_inhalte.test.tsx` geschrieben.
  - `npm test -- --run src/App.r119_entwicklungsdaten_inhalte.test.tsx`
  - erwarteter Fehlschlag: alte Labels wie `Engine-Demo:` waren noch sichtbar.
- GREEN:
  - Claude Code `opusplan` setzte den Copy-Slice minimal um.
  - angrenzende Tests wurden auf die neuen Labels angepasst.
  - `/simplify` wurde danach ausgeführt.

## Review

- Codex Review-only auf aktuellem uncommitted Worktree inklusive untracked R119-Test:
  - Ergebnis: keine Blocker.
- Nach Anpassung älterer Tests wurde ein Codex Re-Review ausgeführt:
  - `BLOCKERS: keine`.
  - `NON-BLOCKERS: Tests konnten in Codex read-only nicht starten, weil Vite einen Cache schreiben wollte; statische Checks waren grün.`

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r119_entwicklungsdaten_inhalte.test.tsx src/App.f10_debuggruppen.test.tsx src/App.f11_debuggruppen_polish.test.tsx src/App.f16_entwicklungsdaten_debug.test.tsx src/App.r118_entwicklungsdaten_copy.test.tsx
npm test -- --run src/App.test.tsx src/App.r43.test.tsx src/App.r40.test.tsx src/App.r49.test.tsx src/App.r65.test.tsx src/App.f3_status_panels.test.tsx src/App.f31_spieltisch_layout.test.tsx src/App.f7_aufgabenkarten.test.tsx src/App.r66.test.tsx src/App.f8_scoreboard.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx
npm test -- --run
npm run lint
npm run typecheck
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED-Failure wie erwartet verifiziert.
- R119/F10/F11/F16/R118-Fokustests grün: 5 Testdateien / 5 Tests.
- Erweiterter Regressionsfokus grün: 11 Testdateien / 38 Tests.
- Full Suite grün: 126 Testdateien / 605 Tests.
- Lint grün.
- Typecheck grün.
- Build grün.
- Testdateilängencheck grün: Alle Testdateien bleiben unter 500 Zeilen.
- `git diff --check` grün.

## Geänderte Dateien

- `src/App.tsx`
- `src/App.r119_entwicklungsdaten_inhalte.test.tsx`
- `src/App.f10_debuggruppen.test.tsx`
- `src/App.f11_debuggruppen_polish.test.tsx`
- `src/App.f31_spieltisch_layout.test.tsx`
- `src/App.f3_status_panels.test.tsx`
- `src/App.f7_aufgabenkarten.test.tsx`
- `src/App.f8_scoreboard.test.tsx`
- `src/App.r40.test.tsx`
- `src/App.r43.test.tsx`
- `src/App.r49.test.tsx`
- `src/App.r65.test.tsx`
- `src/App.r66.test.tsx`
- `src/App.test.tsx`
- `docs/release_status_2026-06-08_r119.md`

## Release

Feature-Commit:

- `2d06c35 R119: Entwicklungsdaten-Inhalte spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

Vercel Production-Deploy:

- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Status: `READY` und auf den stabilen Production-Alias gesetzt.
- Dauerhaft dokumentiert wird bewusst nur der stabile Alias, keine ephemere Deployment-/Inspect-URL.

Production-Smoke:

```bash
npm run smoke:production
node .tmp_r119_live_smoke.mjs
```

Ergebnis:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Sichtbare Browser-Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- R119-spezifischer Browser-Smoke:
  - `Aktueller Spielschritt:` sichtbar.
  - `Spielerprofil:` sichtbar.
  - `Aufgabenziele:` sichtbar.
  - `Punkteaufteilung spieler-1:` sichtbar.
  - alte interne Begriffe `Engine-Demo:`, `Aktiver Spieler-Details:`, `Offene Aufgaben-Details:` und `Wertungsdetails spieler-1:` nicht mehr sichtbar.
  - First-turn E2E klickte eine echte Aktion und der `Schlangenbereich` änderte sich sichtbar.
  - `consoleErrors: []`.
  - `pageErrors: []`.
  - Im `src`-Code wurde keine Audio-/Analytics-Integration gefunden; Browser-Smoke zeigte keine Audio-/Analytics-Fehler.
- `R107 Production-Smoke bestanden`.
- `R119 Production-Smoke bestanden`.

Finalisierung:

- Finale Doku-Synchronisierung wurde nach Feature-Deploy und Smoke erstellt.
- Finaler Production-Deploy nach Doku-Synchronisierung erfolgreich und auf den stabilen Alias gesetzt.
- Erneuter Production-Smoke nach finalem Doku-Deploy erfolgreich, damit `origin/main`, `HEAD` und Production denselben finalen Stand abbilden.

## Nächster kleiner Schritt nach R119

Weiterhin klein bleiben: nächster sinnvoller Slice ist ein weiterer player-facing Entwicklungsdaten-/UI-Copy-Abgleich in einem klar begrenzten Bereich, ohne Engine-/Regeländerung. Vor jeder Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
