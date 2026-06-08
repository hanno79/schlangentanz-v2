# R122 Release-Nachweis — Karten-und-Aufgaben-Copy spielerfreundlicher

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-08

## Ziel

R122 setzt den nächsten kleinen UI-Copy-Slice nach R121 um:

- Der Entwicklungsdaten-Bereich `Karten und Aufgaben` bleibt technisch als einklappbarer Nebenbereich erhalten.
- Sichtbare Material- und Aufgaben-Zeilen verwenden spielerfreundlichere Bezeichnungen statt interner Stapel-/Status-Copy.
- Keine Engine-, Regel-, CSS-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - `Ablagestapelgröße:` → `Karten im Ablagestapel:`.
  - `Ablagestapel:` → `Karten auf dem Ablagestapel:`.
  - `Nachziehstapel:` → `Karten im Nachziehstapel:`.
  - `Materialstapel gesamt:` → `Spielmaterial insgesamt:`.
  - `Sonderkarten:` → `Basis-Sonderkarten:`.
  - `Erweiterungssonderkarten:` → `Erweiterungs-Sonderkarten:`.
  - `Aufgabenstapel:` → `Aufgaben im Stapel:`.
  - `Offene Aufgaben:` → `Aktuelle Aufgaben:`.
- `src/App.r122_material_aufgaben_copy.test.tsx`
  - neuer R122-Regressionstest.
  - prüft alle neuen Labels positiv im Landmark `Entwicklungsdaten: Karten und Aufgaben`.
  - prüft alte Label-Anfänge negativ pro Material-Zeile, ohne neue zusammengesetzte Labels falsch zu blockieren.
- Bestehende Regressionstests wurden nur konsistent an die neue Copy angepasst; ihre Engine- und UI-Verantwortung bleibt erhalten.

## RED/GREEN

- RED:
  - neuer Test `src/App.r122_material_aufgaben_copy.test.tsx` geschrieben.
  - Erwarteter Fehlschlag: neue spielerfreundliche Material-Labels waren noch nicht sichtbar.
- GREEN:
  - Copy in `src/App.tsx` minimal geändert.
  - Stale Test-Erwartungen in bestehenden UI-Regressionen auf die neue Copy aktualisiert.
  - Hinweis aus unabhängigem Review zur Negativprüfung aufgenommen und Testintegrität gestärkt.
- `/simplify`:
  - Externer Claude-Helper konnte wegen Repo-/Node-Temp-Rechten von `claudeuser` nicht schreiben/testen.
  - Umsetzung blieb bewusst minimal; unabhängiger Review bestätigte keinen Scope Creep.

## Review

- Unabhängiger Pre-Commit-Review auf aktuellem uncommitted Worktree inklusive untracked R122-Test:
  - Verdict: `BESTANDEN`.
  - Keine Security-Probleme.
  - Keine Logikfehler.
  - Keine versehentlichen Regel-, Engine- oder Interaktionsänderungen.
  - Nicht-blockierender Hinweis zur Negativ-RegEx-Prüfung wurde umgesetzt und erneut verifiziert.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r122_material_aufgaben_copy.test.tsx
npm test -- --run
npm run lint
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- R122-Zieltest grün: 1 Test.
- Full Suite grün: 129 Testdateien / 608 Tests.
- Lint grün.
- Build grün.
- Testdateilängencheck grün: Alle Testdateien bleiben unter 500 Zeilen.
- `git diff --check` grün.
- Relevante Dateigrößen: `src/App.tsx` 487 Zeilen, `src/App.test.tsx` 488 Zeilen, neuer R122-Test 55 Zeilen.

## Geänderte Dateien

- `src/App.tsx`
- `src/App.r122_material_aufgaben_copy.test.tsx`
- `src/App.test.tsx`
- `src/App.f10_debuggruppen.test.tsx`
- `src/App.f7_aufgabenkarten.test.tsx`
- `src/App.r38.test.tsx`
- `src/App.r40.test.tsx`
- `src/App.r47.test.tsx`
- `src/App.r48.test.tsx`
- `src/App.r49.test.tsx`
- `src/App.r65.test.tsx`
- `src/App.r67.test.tsx`
- `src/App.r72.test.tsx`
- `src/App.r100_schlangenhaeutung_umkehren.test.tsx`
- `src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx`
- `src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx`
- `src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx`
- `docs/release_status_2026-06-08_r122.md`

## Release

Feature-Commit:

- `81bb72f R122: Karten-und-Aufgaben-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

Vercel Production-Deploy nach Feature-Commit:

- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Status: `READY` und auf den stabilen Production-Alias gesetzt.
- Ephemere Deploy-URL: `https://schlangentanz-v2-decmpl1ci-alfreds-projects-7e9df1b4.vercel.app`

Production-Smoke nach Feature-Commit:

```bash
npm run smoke:production
node .tmp_r122_live_smoke.mjs
```

Ergebnis:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Sichtbare Browser-Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- R122-spezifischer Browser-Smoke:
  - `Entwicklungsdaten: Karten und Aufgaben` sichtbar.
  - 9 neue Material-/Aufgaben-Labels sichtbar.
  - 0 veraltete Material-/Aufgaben-Label-Anfänge gefunden.
  - First-turn E2E klickte eine echte Aktion: `Neue Schlange starten mit Karte gelb-01`.
  - `Schlangenbereich` änderte sich sichtbar.
  - `consoleErrors: []`.
  - `pageErrors: []`.
- `R107 Production-Smoke bestanden`.
- `R122 Production-Smoke bestanden`.

## Finalisierung

- Release-Dokumentation nach Feature-Deploy und Smoke erstellt.
- Diese Dokumentation ist Teil des finalen Doku-Sync-Commits auf `main`.
- Der aktuelle `main` wird danach erneut deployed und final live gesmoked, damit `origin/main`, Dokumentation und Production denselben Stand abbilden.

## Nächster kleiner Schritt nach R122

Autonom mit dem nächsten kleinen sicheren UI-/Copy-Slice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
